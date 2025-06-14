import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import templatePDF from '../assets/templates/csaw/CSAW-PDF-Version.pdf';
import { supabase } from '../lib/supabase';

// Define the coordinates for each section in the PDF
const PDF_COORDINATES = {
  // Personal Information Section
  personalInfo: {
    fullName: { x: 50, y: 700 },
    email: { x: 50, y: 680 },
    // Add other personal info fields as needed
  },
  // Skills Section
  skills: {
    startY: 600, // Starting Y coordinate for skills
    lineHeight: 20, // Height between each skill entry
    leftColumn: { x: 50, width: 250 }, // Left column coordinates
    rightColumn: { x: 320, width: 250 }, // Right column coordinates
  },
  // SAOs Section
  saos: {
    startY: 400, // Starting Y coordinate for SAOs
    lineHeight: 15, // Height between each SAO entry
    title: { x: 50, width: 520 }, // Title coordinates
    description: { x: 50, width: 520 }, // Description coordinates
  }
};

export interface CSAWData {
  profile: {
    full_name: string;
    email: string;
    apega_id?: number;
    eit_id?: string;
    // Add other profile fields as needed
  };
  skills: Array<{
    id: string;
    name: string;
    status: string;
    description?: string;
    validator?: {
      first_name: string;
      last_name: string;
      position?: string;
    };
    // Add other skill fields as needed
  }>;
  experiences: Array<{
    id: string;
    title: string;
    situation: string;
    action: string;
    outcome: string;
    status: string;
    employer: string;
    created_at: string;
    updated_at: string;
    skills: Array<{ id: string; name: string }>;
    validator?: {
      first_name: string;
      last_name: string;
      position?: string;
    };
    // Add other experience fields as needed
  }>;
  saos?: Array<{
    id: string;
    eit_id: string;
    employer?: string;
    // Add other SAO fields as needed
  }>;
  sao_skills?: Array<{
    id: string;
    sao_id: string;
    skill_id: string;
    // Add other sao_skill fields as needed
  }>;
  allValidators?: Array<{
    first_name: string;
    last_name: string;
    skill_id: string;
    updated_at: string;
    eit_id: string;
  }>;
}

// Helper function to wrap text to fit within a specified width
function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper function to draw wrapped text
function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: any,
  color: any
) {
  const lines = wrapText(text, maxWidth, fontSize, font);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - (index * fontSize * 1.2),
      size: fontSize,
      font,
      color,
    });
  });
  return lines.length;
}

export async function generateCSAWPDF(data: CSAWData): Promise<Uint8Array> {
  try {
    // Load the template PDF
    const templateBytes = await fetch(templatePDF).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // --- FILLING FORM FIELDS (AcroForm) ---
    // Log all PDF field names for debugging
    try {
      console.log('PDF fields:', form.getFields().map(f => f.getName()));
    } catch (e) {
      console.log('Could not log PDF fields:', e);
    }

    // Fill the 'Name' field with the user's full name from Supabase
    try {
      const applicantNameField = form.getTextField('ApplicantName');
      applicantNameField.setText(data.profile.full_name || '');
    } catch (e) {
      // Silently handle missing field
    }

    // Fill the 'ApegaID' field with the user's APEGA ID
    try {
      const apegaIdField = form.getTextField('ApegaID');
      apegaIdField.setText(data.profile.apega_id ? String(data.profile.apega_id) : '');
    } catch (e) {
      // Silently handle missing field
    }

    // Find the first SAO for this EIT that is linked to skill 1.1
    const skill1_1_sao = (data.saos || []).find(sao =>
      String(sao.eit_id).trim().toLowerCase() === String(data.profile.eit_id).trim().toLowerCase() &&
      (data.sao_skills || []).some(ss =>
        ss.sao_id === sao.id &&
        String(ss.skill_id).trim().toLowerCase() === 'b5fb4469-5f9a-47da-86c6-9f17864b8070'
      )
    );

    if (skill1_1_sao) {
      try {
        const employerField = form.getTextField('Employer11');
        employerField.setText(skill1_1_sao.employer || '');
      } catch (e) {
        console.log('Error filling Employer11 field:', e);
      }
    }

    // --- VALIDATOR FILL LOGIC (NO DEBUG LOGS) ---
    const skill1_1_validators = (data.allValidators || []).filter(
      v =>
        String(v.skill_id).trim().toLowerCase().includes('b5fb4469-5f9a-47da-86c6-9f17864b8070') &&
        String(v.eit_id).trim().toLowerCase().includes(String(data.profile.eit_id).trim().toLowerCase())
    );
    if (skill1_1_validators.length > 0) {
      // Sort by updated_at descending
      skill1_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const mostRecentValidator = skill1_1_validators[0];
      try {
        const vfNameField = form.getTextField('firstname1');
        const vlNameField = form.getTextField('lastname1');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id
      const skill1_1_candidates = (data.allValidators || []).filter(
        v => String(v.skill_id).trim().toLowerCase() === 'b5fb4469-5f9a-47da-86c6-9f17864b8070'
      );
      if (skill1_1_candidates.length > 0) {
        const fallbackValidator = skill1_1_candidates[0];
        try {
          const vfNameField = form.getTextField('firstname1');
          const vlNameField = form.getTextField('lastname1');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.1 (fallback):', e);
        }
      }
    }

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    throw error;
  }
}

/*
====================
EXPLANATION FOR CUSTOMIZATION
====================
- To fill a form field, use:
    const field = form.getTextField('FieldName');
    field.setText('value');
- 'FieldName' must match the field name in your PDF template (case-sensitive!).
- You can find field names using PDF editors like PDF XChange Editor or Adobe Acrobat (Prepare Form tool).
- Repeat for each field you want to fill (e.g., Email, Employer, etc.).
- If you want to fill checkboxes, use form.getCheckBox('FieldName').check() or .uncheck().
- For dropdowns, use form.getDropdown('FieldName').select('optionValue').
- If you want to fill fields on specific pages, you can do so by page index, but usually form fields are global.
*/

// Helper function to convert the PDF bytes to a blob URL
export function createPDFBlobUrl(pdfBytes: Uint8Array): string {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
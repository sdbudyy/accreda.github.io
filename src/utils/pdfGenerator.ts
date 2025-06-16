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
    situation?: string;
    action?: string;
    outcome?: string;
    created_at?: string;
    updated_at?: string;
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
    position?: string;
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

    // --- EMPLOYER FILL LOGIC FOR SKILL 1.1 SAO (now using saos.skill_id directly) ---
    const SKILL_1_1_ID = 'bf5b4469-51e9-47da-86e6-9f71864b4870'; // Skill 1.1 ID from your skills table
    const EIT_ID = data.profile.eit_id ? String(data.profile.eit_id).trim().toLowerCase() : '';

    // Safe fallback for undefined array
    const saos = data.saos || [];

    // Debug logs for troubleshooting
    console.log('PDFGEN: EIT_ID for matching:', EIT_ID);
    console.log('PDFGEN: SKILL_1_1_ID for matching:', SKILL_1_1_ID);
    console.log('PDFGEN: All SAOs:', saos);

    // Find all SAOs for this EIT and skill 1.1
    let skill1_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_1_ID
    );

    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.1:', skill1_1_saos);

    // Sort by updated_at descending if available
    if (skill1_1_saos.length > 0 && (skill1_1_saos[0] as any).updated_at) {
      skill1_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    // Use the employer from the most recent matching SAO
    if (skill1_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('Employer11');
        employerField.setText(skill1_1_saos[0].employer || '');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('Situation11');
        const actionField = form.getTextField('Action11');
        const outcomeField = form.getTextField('Outcome11');

        situationField.setText(stripHtml(skill1_1_saos[0].situation) || '');
        actionField.setText(stripHtml(skill1_1_saos[0].action) || '');
        outcomeField.setText(stripHtml(skill1_1_saos[0].outcome) || '');
      } catch (e) {
        console.log('Error filling SAO fields:', e);
      }
    }

    // --- DETAILED LOGGING AND ROBUST MATCHING FOR VALIDATOR FIELDS ---
    const FORCE_OVERRIDE = false; // Set to true to always use the first validator for testing

    let skill1_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_1_ID && eitIdStr === EIT_ID;
      }
    );

    // Sort by updated_at descending to get the most recent validator
    skill1_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // --- FORCE OVERRIDE: Use first validator if no match and override is enabled ---
    if (FORCE_OVERRIDE && (!skill1_1_validators || skill1_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match.');
      skill1_1_validators = [data.allValidators![0]];
    }

    if (skill1_1_validators.length > 0) {
      const mostRecentValidator = skill1_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('firstname1');
        const vlNameField = form.getTextField('lastname1');
        const vPosField = form.getTextField('VPos11');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id
      let skill1_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_1_candidates.length > 0) {
        const fallbackValidator = skill1_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('firstname1');
          const vlNameField = form.getTextField('lastname1');
          const vPosField = form.getTextField('VPos11');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
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

function stripHtml(html: string = ''): string {
  // Remove all HTML tags and decode HTML entities
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
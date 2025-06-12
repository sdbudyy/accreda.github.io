import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import templatePDF from '../assets/templates/csaw/CSAW-PDF-Version.pdf';

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
    // Add other profile fields as needed
  };
  skills: Array<{
    id: string;
    name: string;
    status: string;
    description?: string;
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
    // Add other experience fields as needed
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
    console.log('Template bytes:', templateBytes);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    console.log('Form fields:', form.getFields().map(f => f.getName()));
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);

    // --- FILLING FORM FIELDS (AcroForm) ---
    // To fill a form field, you need to know its exact name in the PDF template.
    // Use form.getTextField('FieldName') to get the field, then .setText(value) to fill it.
    // Example: Fill the 'Name' field with the user's full name from Supabase
    try {
      const nameField = form.getTextField('Name');
      nameField.setText(data.profile.full_name || '');
    } catch (e) {
      console.warn('Could not find Name field:', e);
    }
    // To fill more fields, repeat the above pattern:
    // try {
    //   const emailField = form.getTextField('Email');
    //   emailField.setText(data.profile.email || '');
    // } catch (e) { /* ... */ }
    // --- END FILLING FORM FIELDS ---

    // --- FILLING FORM FIELDS FOR SKILL 1.1 (TESTING) ---
    // Find the SAO linked to skill 1.1 (first skill in the array)
    const skill11 = data.skills[0];
    const sao11 = (data.experiences || []).find(
      (sao) => Array.isArray(sao.skills) && sao.skills.some(s => s.id === skill11.id)
    );

    try {
      const nameField = form.getTextField('ApplicantName');
      nameField.setText(data.profile.full_name || '');
    } catch (e) { console.warn('Could not find ApplicantName field:', e); }
    try {
      const employerField = form.getTextField('Employer1');
      employerField.setText((sao11?.employer) || '');
    } catch (e) { console.warn('Could not find Employer1 field:', e); }
    // Only try to set validator fields if they exist
    if (sao11 && Array.isArray((sao11 as any).validators) && (sao11 as any).validators.length > 0) {
      try {
        const vFNameField = form.getTextField('VFName1');
        vFNameField.setText((sao11 as any).validators[0]?.first_name || '');
      } catch (e) { console.warn('Could not find VFName1 field:', e); }
      try {
        const vLNameField = form.getTextField('VLName1');
        vLNameField.setText((sao11 as any).validators[0]?.last_name || '');
      } catch (e) { console.warn('Could not find VLName1 field:', e); }
    }
    try {
      const situationField = form.getTextField('Situation1');
      situationField.setText((sao11?.situation) || '');
    } catch (e) { console.warn('Could not find Situation1 field:', e); }
    try {
      const actionField = form.getTextField('Action1');
      actionField.setText((sao11?.action) || '');
    } catch (e) { console.warn('Could not find Action1 field:', e); }
    try {
      const outcomeField = form.getTextField('Outcome 1');
      outcomeField.setText((sao11?.outcome) || '');
    } catch (e) { console.warn('Could not find Outcome 1 field:', e); }
    // --- END FILLING FORM FIELDS FOR SKILL 1.1 ---

    // --- FILLING SAO FIELDS ON SKILL PAGES (if you want to fill text, not form fields) ---
    // The following code assumes the order of skills matches the order of pages (after intro)
    for (let i = 1; i < pages.length; i++) {
      const page = pages[i];
      const skill = data.skills[i - 1];
      if (!skill) continue;
      const saosForSkill = (data.experiences || []).filter(
        (sao) => Array.isArray(sao.skills) && sao.skills.some(s => s.id === skill.id)
      );
      const sao = saosForSkill[0];
      if (sao) {
        drawWrappedText(page, sao.situation || '', 50, 600, 500, fontSize, font, textColor);
        drawWrappedText(page, sao.action || '', 50, 500, 500, fontSize, font, textColor);
        drawWrappedText(page, sao.outcome || '', 50, 400, 500, fontSize, font, textColor);
      }
    }
    // --- END FILLING SAO FIELDS ---

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
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
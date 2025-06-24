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

    // Set default value for all radio buttons to 'yes'
    // e11-e110 radio buttons
    try {
      const e11Radio = form.getRadioGroup('e11');
      e11Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e11 radio button:', e);
    }
    try {
      const e12Radio = form.getRadioGroup('e12');
      e12Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e12 radio button:', e);
    }
    try {
      const e13Radio = form.getRadioGroup('e13');
      e13Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e13 radio button:', e);
    }
    try {
      const e14Radio = form.getRadioGroup('e14');
      e14Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e14 radio button:', e);
    }
    try {
      const e15Radio = form.getRadioGroup('e15');
      e15Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e15 radio button:', e);
    }
    try {
      const e16Radio = form.getRadioGroup('e16');
      e16Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e16 radio button:', e);
    }
    try {
      const e17Radio = form.getRadioGroup('e17');
      e17Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e17 radio button:', e);
    }
    try {
      const e18Radio = form.getRadioGroup('e18');
      e18Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e18 radio button:', e);
    }
    try {
      const e19Radio = form.getRadioGroup('e19');
      e19Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e19 radio button:', e);
    }
    try {
      const e110Radio = form.getRadioGroup('e110');
      e110Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e110 radio button:', e);
    }

    // e21-e23 radio buttons
    try {
      const e21Radio = form.getRadioGroup('e21');
      e21Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e21 radio button:', e);
    }
    try {
      const e22Radio = form.getRadioGroup('e22');
      e22Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e22 radio button:', e);
    }
    try {
      const e23Radio = form.getRadioGroup('e23');
      e23Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e23 radio button:', e);
    }

    // e31-e32 radio buttons
    try {
      const e31Radio = form.getRadioGroup('e31');
      e31Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e31 radio button:', e);
    }
    try {
      const e32Radio = form.getRadioGroup('e32');
      e32Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e32 radio button:', e);
    }

    // e41 radio button
    try {
      const e41Radio = form.getRadioGroup('e41');
      e41Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e41 radio button:', e);
    }

    // e51 radio button
    try {
      const e51Radio = form.getRadioGroup('e51');
      e51Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e51 radio button:', e);
    }

    // e61-e65 radio buttons
    try {
      const e61Radio = form.getRadioGroup('e61');
      e61Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e61 radio button:', e);
    }
    try {
      const e62Radio = form.getRadioGroup('e62');
      e62Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e62 radio button:', e);
    }
    try {
      const e63Radio = form.getRadioGroup('e63');
      e63Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e63 radio button:', e);
    }
    try {
      const e64Radio = form.getRadioGroup('e64');
      e64Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e64 radio button:', e);
    }
    try {
      const e65Radio = form.getRadioGroup('e65');
      e65Radio.select('yes');
    } catch (e) {
      console.log('Failed to set e65 radio button:', e);
    }

    // --- EMPLOYER FILL LOGIC FOR SKILL 1.1 SAO (now using saos.skill_id directly) ---
    const SKILL_1_1_ID = 'bf5b4469-51e9-47da-86e6-9f71864b4870'; // Skill 1.1 ID from your skills table
    const SKILL_1_2_ID = '81bfb867-5779-49f9-a9c9-55b7ae7068fd'; // Skill 1.2 ID from your skills table
    const SKILL_1_3_ID = '14554af5-a611-4847-9afc-7776a049f3d8'; // Skill 1.3 ID from your skills table
    const SKILL_1_4_ID = '06672ec9-0550-47c1-b755-acd027555ace'; // Skill 1.4 ID from your skills table
    const SKILL_1_5_ID = '1dd433e1-dd14-4dce-a763-2f0529e584d9'; // Skill 1.5 ID from your skills table
    const SKILL_1_6_ID = '706678e6-82a8-4932-bd09-f1952a03b567'; // Skill 1.6 ID from your skills table
    const SKILL_1_7_ID = '643bcd86-653a-42ba-b87a-840ac9d9b31f'; // Skill 1.7 ID from your skills table
    const SKILL_1_8_ID = 'fbc92104-ce56-4b18-9ae3-3f48a0989dc4'; // Skill 1.8 ID from your skills table
    const SKILL_1_9_ID = 'c49a1dd4-f242-4550-b100-d7ccf7ef927c'; // Skill 1.9 ID from your skills table
    const SKILL_1_10_ID = 'a223cba6-0a74-4d63-bbfa-27681224e612'; // Skill 1.10 ID from your skills table
    const SKILL_2_1_ID = '514da53c-6cf1-4cd1-86af-f27a7279fa20'; // Skill 2.1 ID from your skills table
    const SKILL_2_2_ID = '1810df07-e102-4af2-9142-26583a09677c'; // Skill 2.2 ID from your skills table
    const SKILL_2_3_ID = 'de24b84f-9a2f-4844-8ba6-21ef6f832c9a'; // Skill 2.3 ID from your skills table
    const SKILL_3_1_ID = '7b9cc3a1-e766-406d-acd6-c69084d69b63'; // Skill 3.1 ID from your skills table
    const SKILL_3_2_ID = 'b2f689df-4e6e-4e83-9aec-784141e43de1'; // Skill 3.2 ID from your skills table
    const SKILL_4_1_ID = '62e2f673-ca25-49d7-8030-eaa9db0b4283'; // Skill 4.1 ID from your skills table
    const SKILL_5_1_ID = 'b9698b0d-e5a2-41af-bbc5-bb1320b684c5'; // Skill 5.1 ID from your skills table
    const SKILL_6_1_ID = 'cb5e5cbb-20ae-4365-a5dd-9aed56db4ac6'; // Skill 6.1 ID from your skills table
    const SKILL_6_2_ID = 'cf273419-b06e-4b28-9cba-bfec25aab86c'; // Skill 6.2 ID from your skills table
    const SKILL_6_3_ID = 'e7e83e54-a4bf-4bd7-9a1e-4cb64b6b87f7'; // Skill 6.3 ID from your skills table
    const SKILL_6_4_ID = 'd1b2ac9c-9cf5-4aa2-a754-dc0accb36499'; // Skill 6.4 ID from your skills table
    const SKILL_6_5_ID = 'efd2ae4c-36b7-49b6-82b1-9dd975376912'; // Skill 6.5 ID from your skills table
    const EIT_ID = data.profile.eit_id ? String(data.profile.eit_id).trim().toLowerCase() : '';

    // Query the eit_skills table for the most recent rank value for skill 1.1
    const { data: skill1_1_data, error: skill1_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill11');
      if (!skill1_1_error && skill1_1_data && skill1_1_data.length > 0 && skill1_1_data[0].rank !== null && skill1_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill11 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.2
    const { data: skill1_2_data, error: skill1_2_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_2_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill12');
      if (!skill1_2_error && skill1_2_data && skill1_2_data.length > 0 && skill1_2_data[0].rank !== null && skill1_2_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_2_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill12 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.3
    const { data: skill1_3_data, error: skill1_3_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_3_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill13');
      if (!skill1_3_error && skill1_3_data && skill1_3_data.length > 0 && skill1_3_data[0].rank !== null && skill1_3_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_3_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill13 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.4
    const { data: skill1_4_data, error: skill1_4_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_4_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill14');
      if (!skill1_4_error && skill1_4_data && skill1_4_data.length > 0 && skill1_4_data[0].rank !== null && skill1_4_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_4_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill14 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.5
    const { data: skill1_5_data, error: skill1_5_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_5_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill15');
      if (!skill1_5_error && skill1_5_data && skill1_5_data.length > 0 && skill1_5_data[0].rank !== null && skill1_5_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_5_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill15 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.6
    const { data: skill1_6_data, error: skill1_6_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_6_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill16');
      if (!skill1_6_error && skill1_6_data && skill1_6_data.length > 0 && skill1_6_data[0].rank !== null && skill1_6_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_6_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill16 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.7
    const { data: skill1_7_data, error: skill1_7_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_7_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill17');
      if (!skill1_7_error && skill1_7_data && skill1_7_data.length > 0 && skill1_7_data[0].rank !== null && skill1_7_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_7_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill17 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.8
    const { data: skill1_8_data, error: skill1_8_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_8_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill18');
      if (!skill1_8_error && skill1_8_data && skill1_8_data.length > 0 && skill1_8_data[0].rank !== null && skill1_8_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_8_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill18 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.9
    const { data: skill1_9_data, error: skill1_9_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_9_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill19');
      if (!skill1_9_error && skill1_9_data && skill1_9_data.length > 0 && skill1_9_data[0].rank !== null && skill1_9_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_9_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill19 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 1.10
    const { data: skill1_10_data, error: skill1_10_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_1_10_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill110');
      if (!skill1_10_error && skill1_10_data && skill1_10_data.length > 0 && skill1_10_data[0].rank !== null && skill1_10_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill1_10_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill110 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 2.1
    const { data: skill2_1_data, error: skill2_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_2_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill21');
      if (!skill2_1_error && skill2_1_data && skill2_1_data.length > 0 && skill2_1_data[0].rank !== null && skill2_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill2_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill21 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 2.2
    const { data: skill2_2_data, error: skill2_2_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_2_2_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill22');
      if (!skill2_2_error && skill2_2_data && skill2_2_data.length > 0 && skill2_2_data[0].rank !== null && skill2_2_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill2_2_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill22 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 2.3
    const { data: skill2_3_data, error: skill2_3_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_2_3_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill23');
      if (!skill2_3_error && skill2_3_data && skill2_3_data.length > 0 && skill2_3_data[0].rank !== null && skill2_3_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill2_3_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill23 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 3.1
    const { data: skill3_1_data, error: skill3_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_3_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill31');
      if (!skill3_1_error && skill3_1_data && skill3_1_data.length > 0 && skill3_1_data[0].rank !== null && skill3_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill3_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill31 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 3.2
    const { data: skill3_2_data, error: skill3_2_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_3_2_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill32');
      if (!skill3_2_error && skill3_2_data && skill3_2_data.length > 0 && skill3_2_data[0].rank !== null && skill3_2_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill3_2_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill32 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 4.1
    const { data: skill4_1_data, error: skill4_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_4_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill41');
      if (!skill4_1_error && skill4_1_data && skill4_1_data.length > 0 && skill4_1_data[0].rank !== null && skill4_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill4_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill41 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 5.1
    const { data: skill5_1_data, error: skill5_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_5_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill51');
      if (!skill5_1_error && skill5_1_data && skill5_1_data.length > 0 && skill5_1_data[0].rank !== null && skill5_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill5_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill51 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 6.1
    const { data: skill6_1_data, error: skill6_1_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_6_1_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill61');
      if (!skill6_1_error && skill6_1_data && skill6_1_data.length > 0 && skill6_1_data[0].rank !== null && skill6_1_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill6_1_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill61 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 6.2
    const { data: skill6_2_data, error: skill6_2_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_6_2_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill62');
      if (!skill6_2_error && skill6_2_data && skill6_2_data.length > 0 && skill6_2_data[0].rank !== null && skill6_2_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill6_2_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill62 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 6.3
    const { data: skill6_3_data, error: skill6_3_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_6_3_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill63');
      if (!skill6_3_error && skill6_3_data && skill6_3_data.length > 0 && skill6_3_data[0].rank !== null && skill6_3_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill6_3_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill63 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 6.4
    const { data: skill6_4_data, error: skill6_4_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_6_4_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill64');
      if (!skill6_4_error && skill6_4_data && skill6_4_data.length > 0 && skill6_4_data[0].rank !== null && skill6_4_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill6_4_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill64 radio button:', e);
    }

    // Query the eit_skills table for the most recent rank value for skill 6.5
    const { data: skill6_5_data, error: skill6_5_error } = await supabase
      .from('eit_skills')
      .select('rank')
      .eq('eit_id', EIT_ID)
      .eq('skill_id', SKILL_6_5_ID)
      .order('updated_at', { ascending: false })
      .limit(1);

    try {
      const radioField = form.getRadioGroup('skill65');
      if (!skill6_5_error && skill6_5_data && skill6_5_data.length > 0 && skill6_5_data[0].rank !== null && skill6_5_data[0].rank !== undefined) {
        // Set the corresponding radio button based on the rank value (0-5)
        radioField.select(String(skill6_5_data[0].rank));
      } else {
        // Default to '0' if no rank value is found
        radioField.select('0');
      }
    } catch (e) {
      console.log('Error setting skill65 radio button:', e);
    }

    // Safe fallback for undefined array
    const saos = data.saos || [];

    // Debug logs for troubleshooting
    console.log('PDFGEN: EIT_ID for matching:', EIT_ID);
    console.log('PDFGEN: SKILL_1_1_ID for matching:', SKILL_1_1_ID);
    console.log('PDFGEN: SKILL_1_2_ID for matching:', SKILL_1_2_ID);
    console.log('PDFGEN: SKILL_1_3_ID for matching:', SKILL_1_3_ID);
    console.log('PDFGEN: SKILL_1_4_ID for matching:', SKILL_1_4_ID);
    console.log('PDFGEN: SKILL_1_5_ID for matching:', SKILL_1_5_ID);
    console.log('PDFGEN: SKILL_1_6_ID for matching:', SKILL_1_6_ID);
    console.log('PDFGEN: SKILL_1_7_ID for matching:', SKILL_1_7_ID);
    console.log('PDFGEN: SKILL_1_8_ID for matching:', SKILL_1_8_ID);
    console.log('PDFGEN: SKILL_1_9_ID for matching:', SKILL_1_9_ID);
    console.log('PDFGEN: SKILL_1_10_ID for matching:', SKILL_1_10_ID);
    console.log('PDFGEN: SKILL_2_1_ID for matching:', SKILL_2_1_ID);
    console.log('PDFGEN: SKILL_2_2_ID for matching:', SKILL_2_2_ID);
    console.log('PDFGEN: SKILL_2_3_ID for matching:', SKILL_2_3_ID);
    console.log('PDFGEN: SKILL_3_1_ID for matching:', SKILL_3_1_ID);
    console.log('PDFGEN: SKILL_3_2_ID for matching:', SKILL_3_2_ID);
    console.log('PDFGEN: SKILL_4_1_ID for matching:', SKILL_4_1_ID);
    console.log('PDFGEN: SKILL_5_1_ID for matching:', SKILL_5_1_ID);
    console.log('PDFGEN: SKILL_6_1_ID for matching:', SKILL_6_1_ID);
    console.log('PDFGEN: SKILL_6_2_ID for matching:', SKILL_6_2_ID);
    console.log('PDFGEN: SKILL_6_3_ID for matching:', SKILL_6_3_ID);
    console.log('PDFGEN: SKILL_6_4_ID for matching:', SKILL_6_4_ID);
    console.log('PDFGEN: SKILL_6_5_ID for matching:', SKILL_6_5_ID);
    console.log('PDFGEN: All SAOs:', saos);

    // Find all SAOs for this EIT and skill 1.1
    let skill1_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_1_ID
    );

    // Find all SAOs for this EIT and skill 1.2
    let skill1_2_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_2_ID
    );

    // Find all SAOs for this EIT and skill 1.3
    let skill1_3_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_3_ID
    );

    // Find all SAOs for this EIT and skill 1.4
    let skill1_4_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_4_ID
    );

    // Find all SAOs for this EIT and skill 1.5
    let skill1_5_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_5_ID
    );

    // Find all SAOs for this EIT and skill 1.6
    let skill1_6_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_6_ID
    );

    // Find all SAOs for this EIT and skill 1.7
    let skill1_7_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_7_ID
    );

    // Find all SAOs for this EIT and skill 1.8
    let skill1_8_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_8_ID
    );

    // Find all SAOs for this EIT and skill 1.9
    let skill1_9_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_9_ID
    );

    // Find all SAOs for this EIT and skill 1.10
    let skill1_10_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_1_10_ID
    );

    // Find all SAOs for this EIT and skill 2.1
    let skill2_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_2_1_ID
    );

    // Find all SAOs for this EIT and skill 2.2
    let skill2_2_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_2_2_ID
    );

    // Find all SAOs for this EIT and skill 2.3
    let skill2_3_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_2_3_ID
    );

    // Find all SAOs for this EIT and skill 3.1
    let skill3_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_3_1_ID
    );

    // Find all SAOs for this EIT and skill 3.2
    let skill3_2_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_3_2_ID
    );

    // Find all SAOs for this EIT and skill 4.1
    let skill4_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_4_1_ID
    );

    // Find all SAOs for this EIT and skill 5.1
    let skill5_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_5_1_ID
    );

    // Find all SAOs for this EIT and skill 6.1
    let skill6_1_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_6_1_ID
    );

    // Find all SAOs for this EIT and skill 6.2
    let skill6_2_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_6_2_ID
    );

    // Find all SAOs for this EIT and skill 6.3
    let skill6_3_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_6_3_ID
    );

    // Find all SAOs for this EIT and skill 6.4
    let skill6_4_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_6_4_ID
    );

    // Find all SAOs for this EIT and skill 6.5
    let skill6_5_saos = saos.filter(sao =>
      String(sao.eit_id).trim().toLowerCase() === EIT_ID &&
      String((sao as any).skill_id).trim().toLowerCase() === SKILL_6_5_ID
    );

    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.1:', skill1_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.2:', skill1_2_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.3:', skill1_3_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.4:', skill1_4_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.5:', skill1_5_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.6:', skill1_6_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.7:', skill1_7_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.8:', skill1_8_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.9:', skill1_9_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 1.10:', skill1_10_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 2.1:', skill2_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 2.2:', skill2_2_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 2.3:', skill2_3_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 3.1:', skill3_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 3.2:', skill3_2_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 4.1:', skill4_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 5.1:', skill5_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 6.1:', skill6_1_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 6.2:', skill6_2_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 6.3:', skill6_3_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 6.4:', skill6_4_saos);
    console.log('PDFGEN: Filtered SAOs for EIT and Skill 6.5:', skill6_5_saos);

    // Sort by updated_at descending if available
    if (skill1_1_saos.length > 0 && (skill1_1_saos[0] as any).updated_at) {
      skill1_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_2_saos.length > 0 && (skill1_2_saos[0] as any).updated_at) {
      skill1_2_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_3_saos.length > 0 && (skill1_3_saos[0] as any).updated_at) {
      skill1_3_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_4_saos.length > 0 && (skill1_4_saos[0] as any).updated_at) {
      skill1_4_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_5_saos.length > 0 && (skill1_5_saos[0] as any).updated_at) {
      skill1_5_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_6_saos.length > 0 && (skill1_6_saos[0] as any).updated_at) {
      skill1_6_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_7_saos.length > 0 && (skill1_7_saos[0] as any).updated_at) {
      skill1_7_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_8_saos.length > 0 && (skill1_8_saos[0] as any).updated_at) {
      skill1_8_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_9_saos.length > 0 && (skill1_9_saos[0] as any).updated_at) {
      skill1_9_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill1_10_saos.length > 0 && (skill1_10_saos[0] as any).updated_at) {
      skill1_10_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill2_1_saos.length > 0 && (skill2_1_saos[0] as any).updated_at) {
      skill2_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill2_2_saos.length > 0 && (skill2_2_saos[0] as any).updated_at) {
      skill2_2_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill2_3_saos.length > 0 && (skill2_3_saos[0] as any).updated_at) {
      skill2_3_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill3_1_saos.length > 0 && (skill3_1_saos[0] as any).updated_at) {
      skill3_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill3_2_saos.length > 0 && (skill3_2_saos[0] as any).updated_at) {
      skill3_2_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill4_1_saos.length > 0 && (skill4_1_saos[0] as any).updated_at) {
      skill4_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill5_1_saos.length > 0 && (skill5_1_saos[0] as any).updated_at) {
      skill5_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill6_1_saos.length > 0 && (skill6_1_saos[0] as any).updated_at) {
      skill6_1_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill6_2_saos.length > 0 && (skill6_2_saos[0] as any).updated_at) {
      skill6_2_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill6_3_saos.length > 0 && (skill6_3_saos[0] as any).updated_at) {
      skill6_3_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill6_4_saos.length > 0 && (skill6_4_saos[0] as any).updated_at) {
      skill6_4_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    if (skill6_5_saos.length > 0 && (skill6_5_saos[0] as any).updated_at) {
      skill6_5_saos.sort((a, b) =>
        new Date(((b as any).updated_at || 0) as string).getTime() -
        new Date(((a as any).updated_at || 0) as string).getTime()
      );
    }

    // Use the employer from the most recent matching SAO for skill 1.1
    if (skill1_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer11');
        employerField.setText(skill1_1_saos[0].employer ? skill1_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation11');
        const actionField = form.getTextField('action11');
        const outcomeField = form.getTextField('outcome11');

        situationField.setText(stripHtml(skill1_1_saos[0].situation) ? stripHtml(skill1_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_1_saos[0].action) ? stripHtml(skill1_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_1_saos[0].outcome) ? stripHtml(skill1_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.2
    if (skill1_2_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer12');
        employerField.setText(skill1_2_saos[0].employer ? skill1_2_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation12');
        const actionField = form.getTextField('action12');
        const outcomeField = form.getTextField('outcome12');

        situationField.setText(stripHtml(skill1_2_saos[0].situation) ? stripHtml(skill1_2_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_2_saos[0].action) ? stripHtml(skill1_2_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_2_saos[0].outcome) ? stripHtml(skill1_2_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.2:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.3
    if (skill1_3_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer13');
        employerField.setText(skill1_3_saos[0].employer ? skill1_3_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation13');
        const actionField = form.getTextField('action13');
        const outcomeField = form.getTextField('outcome13');

        situationField.setText(stripHtml(skill1_3_saos[0].situation) ? stripHtml(skill1_3_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_3_saos[0].action) ? stripHtml(skill1_3_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_3_saos[0].outcome) ? stripHtml(skill1_3_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.3:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.4
    if (skill1_4_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer14');
        employerField.setText(skill1_4_saos[0].employer ? skill1_4_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation14');
        const actionField = form.getTextField('action14');
        const outcomeField = form.getTextField('outcome14');

        situationField.setText(stripHtml(skill1_4_saos[0].situation) ? stripHtml(skill1_4_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_4_saos[0].action) ? stripHtml(skill1_4_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_4_saos[0].outcome) ? stripHtml(skill1_4_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.4:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.5
    if (skill1_5_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer15');
        employerField.setText(skill1_5_saos[0].employer ? skill1_5_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation15');
        const actionField = form.getTextField('action15');
        const outcomeField = form.getTextField('outcome15');

        situationField.setText(stripHtml(skill1_5_saos[0].situation) ? stripHtml(skill1_5_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_5_saos[0].action) ? stripHtml(skill1_5_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_5_saos[0].outcome) ? stripHtml(skill1_5_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.5:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.6
    if (skill1_6_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer16');
        employerField.setText(skill1_6_saos[0].employer ? skill1_6_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation16');
        const actionField = form.getTextField('action16');
        const outcomeField = form.getTextField('outcome16');

        situationField.setText(stripHtml(skill1_6_saos[0].situation) ? stripHtml(skill1_6_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_6_saos[0].action) ? stripHtml(skill1_6_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_6_saos[0].outcome) ? stripHtml(skill1_6_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.6:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.7
    if (skill1_7_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer17');
        employerField.setText(skill1_7_saos[0].employer ? skill1_7_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation17');
        const actionField = form.getTextField('action17');
        const outcomeField = form.getTextField('outcome17');

        situationField.setText(stripHtml(skill1_7_saos[0].situation) ? stripHtml(skill1_7_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_7_saos[0].action) ? stripHtml(skill1_7_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_7_saos[0].outcome) ? stripHtml(skill1_7_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.7:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.8
    if (skill1_8_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer18');
        employerField.setText(skill1_8_saos[0].employer ? skill1_8_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation18');
        const actionField = form.getTextField('action18');
        const outcomeField = form.getTextField('outcome18');

        situationField.setText(stripHtml(skill1_8_saos[0].situation) ? stripHtml(skill1_8_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_8_saos[0].action) ? stripHtml(skill1_8_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_8_saos[0].outcome) ? stripHtml(skill1_8_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.8:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.9
    if (skill1_9_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer19');
        employerField.setText(skill1_9_saos[0].employer ? skill1_9_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation19');
        const actionField = form.getTextField('action19');
        const outcomeField = form.getTextField('outcome19');

        situationField.setText(stripHtml(skill1_9_saos[0].situation) ? stripHtml(skill1_9_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_9_saos[0].action) ? stripHtml(skill1_9_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_9_saos[0].outcome) ? stripHtml(skill1_9_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.9:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 1.10
    if (skill1_10_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer110');
        employerField.setText(skill1_10_saos[0].employer ? skill1_10_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation110');
        const actionField = form.getTextField('action110');
        const outcomeField = form.getTextField('outcome110');

        situationField.setText(stripHtml(skill1_10_saos[0].situation) ? stripHtml(skill1_10_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill1_10_saos[0].action) ? stripHtml(skill1_10_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill1_10_saos[0].outcome) ? stripHtml(skill1_10_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 1.10:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 2.1
    if (skill2_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer21');
        employerField.setText(skill2_1_saos[0].employer ? skill2_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation21');
        const actionField = form.getTextField('action21');
        const outcomeField = form.getTextField('outcome21');

        situationField.setText(stripHtml(skill2_1_saos[0].situation) ? stripHtml(skill2_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill2_1_saos[0].action) ? stripHtml(skill2_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill2_1_saos[0].outcome) ? stripHtml(skill2_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 2.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 2.2
    if (skill2_2_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer22');
        employerField.setText(skill2_2_saos[0].employer ? skill2_2_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation22');
        const actionField = form.getTextField('action22');
        const outcomeField = form.getTextField('outcome22');

        situationField.setText(stripHtml(skill2_2_saos[0].situation) ? stripHtml(skill2_2_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill2_2_saos[0].action) ? stripHtml(skill2_2_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill2_2_saos[0].outcome) ? stripHtml(skill2_2_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 2.2:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 2.3
    if (skill2_3_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer23');
        employerField.setText(skill2_3_saos[0].employer ? skill2_3_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation23');
        const actionField = form.getTextField('action23');
        const outcomeField = form.getTextField('outcome23');

        situationField.setText(stripHtml(skill2_3_saos[0].situation) ? stripHtml(skill2_3_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill2_3_saos[0].action) ? stripHtml(skill2_3_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill2_3_saos[0].outcome) ? stripHtml(skill2_3_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 2.3:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 3.1
    if (skill3_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer31');
        employerField.setText(skill3_1_saos[0].employer ? skill3_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation31');
        const actionField = form.getTextField('action31');
        const outcomeField = form.getTextField('outcome31');

        situationField.setText(stripHtml(skill3_1_saos[0].situation) ? stripHtml(skill3_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill3_1_saos[0].action) ? stripHtml(skill3_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill3_1_saos[0].outcome) ? stripHtml(skill3_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 3.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 3.2
    if (skill3_2_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer32');
        employerField.setText(skill3_2_saos[0].employer ? skill3_2_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation32');
        const actionField = form.getTextField('action32');
        const outcomeField = form.getTextField('outcome32');

        situationField.setText(stripHtml(skill3_2_saos[0].situation) ? stripHtml(skill3_2_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill3_2_saos[0].action) ? stripHtml(skill3_2_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill3_2_saos[0].outcome) ? stripHtml(skill3_2_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 3.2:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 4.1
    if (skill4_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer41');
        employerField.setText(skill4_1_saos[0].employer ? skill4_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation41');
        const actionField = form.getTextField('action41');
        const outcomeField = form.getTextField('outcome41');

        situationField.setText(stripHtml(skill4_1_saos[0].situation) ? stripHtml(skill4_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill4_1_saos[0].action) ? stripHtml(skill4_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill4_1_saos[0].outcome) ? stripHtml(skill4_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 4.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 5.1
    if (skill5_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer51');
        employerField.setText(skill5_1_saos[0].employer ? skill5_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation51');
        const actionField = form.getTextField('action51');
        const outcomeField = form.getTextField('outcome51');

        situationField.setText(stripHtml(skill5_1_saos[0].situation) ? stripHtml(skill5_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill5_1_saos[0].action) ? stripHtml(skill5_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill5_1_saos[0].outcome) ? stripHtml(skill5_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 5.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 6.1
    if (skill6_1_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer61');
        employerField.setText(skill6_1_saos[0].employer ? skill6_1_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation61');
        const actionField = form.getTextField('action61');
        const outcomeField = form.getTextField('outcome61');

        situationField.setText(stripHtml(skill6_1_saos[0].situation) ? stripHtml(skill6_1_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill6_1_saos[0].action) ? stripHtml(skill6_1_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill6_1_saos[0].outcome) ? stripHtml(skill6_1_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 6.1:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 6.2
    if (skill6_2_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer62');
        employerField.setText(skill6_2_saos[0].employer ? skill6_2_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation62');
        const actionField = form.getTextField('action62');
        const outcomeField = form.getTextField('outcome62');

        situationField.setText(stripHtml(skill6_2_saos[0].situation) ? stripHtml(skill6_2_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill6_2_saos[0].action) ? stripHtml(skill6_2_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill6_2_saos[0].outcome) ? stripHtml(skill6_2_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 6.2:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 6.3
    if (skill6_3_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer63');
        employerField.setText(skill6_3_saos[0].employer ? skill6_3_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation63');
        const actionField = form.getTextField('action63');
        const outcomeField = form.getTextField('outcome63');

        situationField.setText(stripHtml(skill6_3_saos[0].situation) ? stripHtml(skill6_3_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill6_3_saos[0].action) ? stripHtml(skill6_3_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill6_3_saos[0].outcome) ? stripHtml(skill6_3_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 6.3:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 6.4
    if (skill6_4_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer64');
        employerField.setText(skill6_4_saos[0].employer ? skill6_4_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation64');
        const actionField = form.getTextField('action64');
        const outcomeField = form.getTextField('outcome64');

        situationField.setText(stripHtml(skill6_4_saos[0].situation) ? stripHtml(skill6_4_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill6_4_saos[0].action) ? stripHtml(skill6_4_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill6_4_saos[0].outcome) ? stripHtml(skill6_4_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 6.4:', e);
      }
    }

    // Use the employer from the most recent matching SAO for skill 6.5
    if (skill6_5_saos.length > 0) {
      try {
        const employerField = form.getTextField('employer65');
        employerField.setText(skill6_5_saos[0].employer ? skill6_5_saos[0].employer : 'Not specified');

        // Fill in Situation, Action, and Outcome fields
        const situationField = form.getTextField('situation65');
        const actionField = form.getTextField('action65');
        const outcomeField = form.getTextField('outcome65');

        situationField.setText(stripHtml(skill6_5_saos[0].situation) ? stripHtml(skill6_5_saos[0].situation) : 'Not specified');
        actionField.setText(stripHtml(skill6_5_saos[0].action) ? stripHtml(skill6_5_saos[0].action) : 'Not specified');
        outcomeField.setText(stripHtml(skill6_5_saos[0].outcome) ? stripHtml(skill6_5_saos[0].outcome) : 'Not specified');
      } catch (e) {
        console.log('Error filling SAO fields for skill 6.5:', e);
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

    let skill1_2_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_2_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_3_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_3_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_4_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_4_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_5_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_5_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_6_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_6_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_7_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_7_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_8_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_8_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_9_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_9_ID && eitIdStr === EIT_ID;
      }
    );

    let skill1_10_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_1_10_ID && eitIdStr === EIT_ID;
      }
    );

    let skill2_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_2_1_ID && eitIdStr === EIT_ID;
      }
    );

    let skill2_2_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_2_2_ID && eitIdStr === EIT_ID;
      }
    );

    let skill2_3_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_2_3_ID && eitIdStr === EIT_ID;
      }
    );

    let skill3_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_3_1_ID && eitIdStr === EIT_ID;
      }
    );

    let skill3_2_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_3_2_ID && eitIdStr === EIT_ID;
      }
    );

    let skill4_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_4_1_ID && eitIdStr === EIT_ID;
      }
    );

    let skill5_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_5_1_ID && eitIdStr === EIT_ID;
      }
    );

    let skill6_1_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_6_1_ID && eitIdStr === EIT_ID;
      }
    );

    let skill6_2_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_6_2_ID && eitIdStr === EIT_ID;
      }
    );

    let skill6_3_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_6_3_ID && eitIdStr === EIT_ID;
      }
    );

    let skill6_4_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_6_4_ID && eitIdStr === EIT_ID;
      }
    );

    let skill6_5_validators = (data.allValidators || []).filter(
      v => {
        const skillIdStr = v.skill_id ? String(v.skill_id).trim().toLowerCase() : '';
        const eitIdStr = v.eit_id ? String(v.eit_id).trim().toLowerCase() : '';
        return skillIdStr === SKILL_6_5_ID && eitIdStr === EIT_ID;
      }
    );

    // Sort by updated_at descending to get the most recent validator
    skill1_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_2_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_3_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_4_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_5_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_6_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_7_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_8_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_9_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill1_10_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill2_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill2_2_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill2_3_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill3_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill3_2_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill4_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill5_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill6_1_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill6_2_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill6_3_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill6_4_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    skill6_5_validators.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // --- FORCE OVERRIDE: Use first validator if no match and override is enabled ---
    if (FORCE_OVERRIDE && (!skill1_1_validators || skill1_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.1.');
      skill1_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_2_validators || skill1_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.2.');
      skill1_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_3_validators || skill1_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.3.');
      skill1_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_4_validators || skill1_4_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.4.');
      skill1_4_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_5_validators || skill1_5_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.5.');
      skill1_5_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_6_validators || skill1_6_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.6.');
      skill1_6_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_7_validators || skill1_7_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.7.');
      skill1_7_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_8_validators || skill1_8_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.8.');
      skill1_8_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_9_validators || skill1_9_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.9.');
      skill1_9_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_10_validators || skill1_10_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.10.');
      skill1_10_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_1_validators || skill2_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.1.');
      skill2_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_2_validators || skill2_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.2.');
      skill2_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_3_validators || skill2_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.3.');
      skill2_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill3_1_validators || skill3_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 3.1.');
      skill3_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill3_2_validators || skill3_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 3.2.');
      skill3_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill4_1_validators || skill4_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 4.1.');
      skill4_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill5_1_validators || skill5_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 5.1.');
      skill5_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_1_validators || skill6_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.1.');
      skill6_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_2_validators || skill6_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.2.');
      skill6_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_3_validators || skill6_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.3.');
      skill6_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_4_validators || skill6_4_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.4.');
      skill6_4_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_5_validators || skill6_5_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.5.');
      skill6_5_validators = [data.allValidators![0]];
    }

    if (skill1_1_validators.length > 0) {
      const mostRecentValidator = skill1_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn11');
        const vlNameField = form.getTextField('ln11');
        const vPosField = form.getTextField('vpos11');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.1
      let skill1_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_1_candidates.length > 0) {
        const fallbackValidator = skill1_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn11');
          const vlNameField = form.getTextField('ln11');
          const vPosField = form.getTextField('vpos11');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.1 (fallback):', e);
        }
      }
    }

    if (skill1_2_validators.length > 0) {
      const mostRecentValidator = skill1_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn12');
        const vlNameField = form.getTextField('ln12');
        const vPosField = form.getTextField('vpos12');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.2
      let skill1_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_2_candidates.length > 0) {
        const fallbackValidator = skill1_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn12');
          const vlNameField = form.getTextField('ln12');
          const vPosField = form.getTextField('vpos12');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.2 (fallback):', e);
        }
      }
    }

    if (skill1_3_validators.length > 0) {
      const mostRecentValidator = skill1_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn13');
        const vlNameField = form.getTextField('ln13');
        const vPosField = form.getTextField('vpos13');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.3
      let skill1_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_3_candidates.length > 0) {
        const fallbackValidator = skill1_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn13');
          const vlNameField = form.getTextField('ln13');
          const vPosField = form.getTextField('vpos13');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.3 (fallback):', e);
        }
      }
    }

    if (skill1_4_validators.length > 0) {
      const mostRecentValidator = skill1_4_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.4:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn14');
        const vlNameField = form.getTextField('ln14');
        const vPosField = form.getTextField('vpos14');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.4:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.4
      let skill1_4_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_4_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_4_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_4_candidates.length > 0) {
        const fallbackValidator = skill1_4_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.4:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn14');
          const vlNameField = form.getTextField('ln14');
          const vPosField = form.getTextField('vpos14');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.4 (fallback):', e);
        }
      }
    }

    if (skill1_5_validators.length > 0) {
      const mostRecentValidator = skill1_5_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.5:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn15');
        const vlNameField = form.getTextField('ln15');
        const vPosField = form.getTextField('vpos15');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.5:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.5
      let skill1_5_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_5_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_5_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_5_candidates.length > 0) {
        const fallbackValidator = skill1_5_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.5:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn15');
          const vlNameField = form.getTextField('ln15');
          const vPosField = form.getTextField('vpos15');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.5 (fallback):', e);
        }
      }
    }

    if (skill1_6_validators.length > 0) {
      const mostRecentValidator = skill1_6_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.6:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn16');
        const vlNameField = form.getTextField('ln16');
        const vPosField = form.getTextField('vpos16');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.6:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.6
      let skill1_6_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_6_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_6_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_6_candidates.length > 0) {
        const fallbackValidator = skill1_6_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.6:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn16');
          const vlNameField = form.getTextField('ln16');
          const vPosField = form.getTextField('vpos16');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.6 (fallback):', e);
        }
      }
    }

    if (skill1_7_validators.length > 0) {
      const mostRecentValidator = skill1_7_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.7:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn17');
        const vlNameField = form.getTextField('ln17');
        const vPosField = form.getTextField('vpos17');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.7:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.7
      let skill1_7_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_7_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_7_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_7_candidates.length > 0) {
        const fallbackValidator = skill1_7_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.7:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn17');
          const vlNameField = form.getTextField('ln17');
          const vPosField = form.getTextField('vpos17');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.7 (fallback):', e);
        }
      }
    }

    if (skill1_8_validators.length > 0) {
      const mostRecentValidator = skill1_8_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.8:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn18');
        const vlNameField = form.getTextField('ln18');
        const vPosField = form.getTextField('vpos18');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.8:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.8
      let skill1_8_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_8_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_8_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_8_candidates.length > 0) {
        const fallbackValidator = skill1_8_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.8:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn18');
          const vlNameField = form.getTextField('ln18');
          const vPosField = form.getTextField('vpos18');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.8 (fallback):', e);
        }
      }
    }

    if (skill1_9_validators.length > 0) {
      const mostRecentValidator = skill1_9_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.9:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn19');
        const vlNameField = form.getTextField('ln19');
        const vPosField = form.getTextField('vpos19');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.9:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.9
      let skill1_9_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_9_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_9_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_9_candidates.length > 0) {
        const fallbackValidator = skill1_9_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.9:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn19');
          const vlNameField = form.getTextField('ln19');
          const vPosField = form.getTextField('vpos19');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.9 (fallback):', e);
        }
      }
    }

    if (skill1_10_validators.length > 0) {
      const mostRecentValidator = skill1_10_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.10:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn110');
        const vlNameField = form.getTextField('ln110');
        const vPosField = form.getTextField('vpos110');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.10:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.10
      let skill1_10_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_10_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_10_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_10_candidates.length > 0) {
        const fallbackValidator = skill1_10_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.10:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn110');
          const vlNameField = form.getTextField('ln110');
          const vPosField = form.getTextField('vpos110');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.10 (fallback):', e);
        }
      }
    }

    if (skill2_1_validators.length > 0) {
      const mostRecentValidator = skill2_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn21');
        const vlNameField = form.getTextField('ln21');
        const vPosField = form.getTextField('vpos21');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.1
      let skill2_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_1_candidates.length > 0) {
        const fallbackValidator = skill2_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn21');
          const vlNameField = form.getTextField('ln21');
          const vPosField = form.getTextField('vpos21');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.1 (fallback):', e);
        }
      }
    }

    if (skill2_2_validators.length > 0) {
      const mostRecentValidator = skill2_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn22');
        const vlNameField = form.getTextField('ln22');
        const vPosField = form.getTextField('vpos22');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.2
      let skill2_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_2_candidates.length > 0) {
        const fallbackValidator = skill2_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn22');
          const vlNameField = form.getTextField('ln22');
          const vPosField = form.getTextField('vpos22');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.2 (fallback):', e);
        }
      }
    }

    if (skill2_3_validators.length > 0) {
      const mostRecentValidator = skill2_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn23');
        const vlNameField = form.getTextField('ln23');
        const vPosField = form.getTextField('vpos23');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.3
      let skill2_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_3_candidates.length > 0) {
        const fallbackValidator = skill2_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn23');
          const vlNameField = form.getTextField('ln23');
          const vPosField = form.getTextField('vpos23');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.3 (fallback):', e);
        }
      }
    }

    if (skill3_1_validators.length > 0) {
      const mostRecentValidator = skill3_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 3.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn31');
        const vlNameField = form.getTextField('ln31');
        const vPosField = form.getTextField('vpos31');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 3.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 3.1
      let skill3_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_3_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill3_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill3_1_candidates.length > 0) {
        const fallbackValidator = skill3_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 3.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn31');
          const vlNameField = form.getTextField('ln31');
          const vPosField = form.getTextField('vpos31');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 3.1 (fallback):', e);
        }
      }
    }

    if (skill3_2_validators.length > 0) {
      const mostRecentValidator = skill3_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 3.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn32');
        const vlNameField = form.getTextField('ln32');
        const vPosField = form.getTextField('vpos32');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 3.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 3.2
      let skill3_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_3_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill3_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill3_2_candidates.length > 0) {
        const fallbackValidator = skill3_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 3.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn32');
          const vlNameField = form.getTextField('ln32');
          const vPosField = form.getTextField('vpos32');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 3.2 (fallback):', e);
        }
      }
    }

    if (skill4_1_validators.length > 0) {
      const mostRecentValidator = skill4_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 4.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn41');
        const vlNameField = form.getTextField('ln41');
        const vPosField = form.getTextField('vpos41');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 4.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 4.1
      let skill4_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_4_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill4_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill4_1_candidates.length > 0) {
        const fallbackValidator = skill4_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 4.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn41');
          const vlNameField = form.getTextField('ln41');
          const vPosField = form.getTextField('vpos41');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 4.1 (fallback):', e);
        }
      }
    }

    if (skill5_1_validators.length > 0) {
      const mostRecentValidator = skill5_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 5.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn51');
        const vlNameField = form.getTextField('ln51');
        const vPosField = form.getTextField('vpos51');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 5.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 5.1
      let skill5_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_5_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill5_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill5_1_candidates.length > 0) {
        const fallbackValidator = skill5_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 5.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn51');
          const vlNameField = form.getTextField('ln51');
          const vPosField = form.getTextField('vpos51');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 5.1 (fallback):', e);
        }
      }
    }

    if (skill6_1_validators.length > 0) {
      const mostRecentValidator = skill6_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn61');
        const vlNameField = form.getTextField('ln61');
        const vPosField = form.getTextField('vpos61');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.1
      let skill6_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_1_candidates.length > 0) {
        const fallbackValidator = skill6_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn61');
          const vlNameField = form.getTextField('ln61');
          const vPosField = form.getTextField('vpos61');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.1 (fallback):', e);
        }
      }
    }

    if (skill6_2_validators.length > 0) {
      const mostRecentValidator = skill6_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn62');
        const vlNameField = form.getTextField('ln62');
        const vPosField = form.getTextField('vpos62');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.2
      let skill6_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_2_candidates.length > 0) {
        const fallbackValidator = skill6_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn62');
          const vlNameField = form.getTextField('ln62');
          const vPosField = form.getTextField('vpos62');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.2 (fallback):', e);
        }
      }
    }

    if (skill6_3_validators.length > 0) {
      const mostRecentValidator = skill6_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn63');
        const vlNameField = form.getTextField('ln63');
        const vPosField = form.getTextField('vpos63');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.3
      let skill6_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_3_candidates.length > 0) {
        const fallbackValidator = skill6_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn63');
          const vlNameField = form.getTextField('ln63');
          const vPosField = form.getTextField('vpos63');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.3 (fallback):', e);
        }
      }
    }

    if (skill6_4_validators.length > 0) {
      const mostRecentValidator = skill6_4_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.4:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn64');
        const vlNameField = form.getTextField('ln64');
        const vPosField = form.getTextField('vpos64');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.4:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.4
      let skill6_4_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_4_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_4_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_4_candidates.length > 0) {
        const fallbackValidator = skill6_4_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.4:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn64');
          const vlNameField = form.getTextField('ln64');
          const vPosField = form.getTextField('vpos64');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.4 (fallback):', e);
        }
      }
    }

    if (skill6_5_validators.length > 0) {
      const mostRecentValidator = skill6_5_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.5:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn65');
        const vlNameField = form.getTextField('ln65');
        const vPosField = form.getTextField('vpos65');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.5:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.5
      let skill6_5_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_5_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_5_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_5_candidates.length > 0) {
        const fallbackValidator = skill6_5_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.5:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn65');
          const vlNameField = form.getTextField('ln65');
          const vPosField = form.getTextField('vpos65');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.5 (fallback):', e);
        }
      }
    }

    // --- FORCE OVERRIDE: Use first validator if no match and override is enabled ---
    if (FORCE_OVERRIDE && (!skill1_1_validators || skill1_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.1.');
      skill1_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_2_validators || skill1_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.2.');
      skill1_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_3_validators || skill1_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.3.');
      skill1_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_4_validators || skill1_4_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.4.');
      skill1_4_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_5_validators || skill1_5_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.5.');
      skill1_5_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_6_validators || skill1_6_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.6.');
      skill1_6_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_7_validators || skill1_7_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.7.');
      skill1_7_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_8_validators || skill1_8_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.8.');
      skill1_8_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_9_validators || skill1_9_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.9.');
      skill1_9_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill1_10_validators || skill1_10_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 1.10.');
      skill1_10_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_1_validators || skill2_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.1.');
      skill2_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_2_validators || skill2_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.2.');
      skill2_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill2_3_validators || skill2_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 2.3.');
      skill2_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill3_1_validators || skill3_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 3.1.');
      skill3_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill3_2_validators || skill3_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 3.2.');
      skill3_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill4_1_validators || skill4_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 4.1.');
      skill4_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill5_1_validators || skill5_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 5.1.');
      skill5_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_1_validators || skill6_1_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.1.');
      skill6_1_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_2_validators || skill6_2_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.2.');
      skill6_2_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_3_validators || skill6_3_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.3.');
      skill6_3_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_4_validators || skill6_4_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.4.');
      skill6_4_validators = [data.allValidators![0]];
    }

    if (FORCE_OVERRIDE && (!skill6_5_validators || skill6_5_validators.length === 0) && ((data.allValidators ?? []).length > 0)) {
      console.log('FORCE OVERRIDE ENABLED: Using first validator row regardless of match for skill 6.5.');
      skill6_5_validators = [data.allValidators![0]];
    }

    if (skill1_1_validators.length > 0) {
      const mostRecentValidator = skill1_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn11');
        const vlNameField = form.getTextField('ln11');
        const vPosField = form.getTextField('vpos11');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.1
      let skill1_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_1_candidates.length > 0) {
        const fallbackValidator = skill1_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn11');
          const vlNameField = form.getTextField('ln11');
          const vPosField = form.getTextField('vpos11');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.1 (fallback):', e);
        }
      }
    }

    if (skill1_2_validators.length > 0) {
      const mostRecentValidator = skill1_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn12');
        const vlNameField = form.getTextField('ln12');
        const vPosField = form.getTextField('vpos12');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.2
      let skill1_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_2_candidates.length > 0) {
        const fallbackValidator = skill1_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn12');
          const vlNameField = form.getTextField('ln12');
          const vPosField = form.getTextField('vpos12');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.2 (fallback):', e);
        }
      }
    }

    if (skill1_3_validators.length > 0) {
      const mostRecentValidator = skill1_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn13');
        const vlNameField = form.getTextField('ln13');
        const vPosField = form.getTextField('vpos13');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.3
      let skill1_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_3_candidates.length > 0) {
        const fallbackValidator = skill1_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn13');
          const vlNameField = form.getTextField('ln13');
          const vPosField = form.getTextField('vpos13');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.3 (fallback):', e);
        }
      }
    }

    if (skill1_4_validators.length > 0) {
      const mostRecentValidator = skill1_4_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.4:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn14');
        const vlNameField = form.getTextField('ln14');
        const vPosField = form.getTextField('vpos14');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.4:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.4
      let skill1_4_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_4_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_4_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_4_candidates.length > 0) {
        const fallbackValidator = skill1_4_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.4:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn14');
          const vlNameField = form.getTextField('ln14');
          const vPosField = form.getTextField('vpos14');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.4 (fallback):', e);
        }
      }
    }

    if (skill1_5_validators.length > 0) {
      const mostRecentValidator = skill1_5_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.5:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn15');
        const vlNameField = form.getTextField('ln15');
        const vPosField = form.getTextField('vpos15');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.5:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.5
      let skill1_5_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_5_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_5_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_5_candidates.length > 0) {
        const fallbackValidator = skill1_5_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.5:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn15');
          const vlNameField = form.getTextField('ln15');
          const vPosField = form.getTextField('vpos15');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.5 (fallback):', e);
        }
      }
    }

    if (skill1_6_validators.length > 0) {
      const mostRecentValidator = skill1_6_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.6:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn16');
        const vlNameField = form.getTextField('ln16');
        const vPosField = form.getTextField('vpos16');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.6:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.6
      let skill1_6_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_6_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_6_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_6_candidates.length > 0) {
        const fallbackValidator = skill1_6_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.6:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn16');
          const vlNameField = form.getTextField('ln16');
          const vPosField = form.getTextField('vpos16');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.6 (fallback):', e);
        }
      }
    }

    if (skill1_7_validators.length > 0) {
      const mostRecentValidator = skill1_7_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.7:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn17');
        const vlNameField = form.getTextField('ln17');
        const vPosField = form.getTextField('vpos17');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.7:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.7
      let skill1_7_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_7_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_7_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_7_candidates.length > 0) {
        const fallbackValidator = skill1_7_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.7:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn17');
          const vlNameField = form.getTextField('ln17');
          const vPosField = form.getTextField('vpos17');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.7 (fallback):', e);
        }
      }
    }

    if (skill1_8_validators.length > 0) {
      const mostRecentValidator = skill1_8_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.8:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn18');
        const vlNameField = form.getTextField('ln18');
        const vPosField = form.getTextField('vpos18');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.8:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.8
      let skill1_8_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_8_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_8_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_8_candidates.length > 0) {
        const fallbackValidator = skill1_8_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.8:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn18');
          const vlNameField = form.getTextField('ln18');
          const vPosField = form.getTextField('vpos18');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.8 (fallback):', e);
        }
      }
    }

    if (skill1_9_validators.length > 0) {
      const mostRecentValidator = skill1_9_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.9:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn19');
        const vlNameField = form.getTextField('ln19');
        const vPosField = form.getTextField('vpos19');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.9:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.9
      let skill1_9_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_9_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_9_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_9_candidates.length > 0) {
        const fallbackValidator = skill1_9_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.9:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn19');
          const vlNameField = form.getTextField('ln19');
          const vPosField = form.getTextField('vpos19');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.9 (fallback):', e);
        }
      }
    }

    if (skill1_10_validators.length > 0) {
      const mostRecentValidator = skill1_10_validators[0];
      console.log('PDFGEN: Most recent validator for skill 1.10:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn110');
        const vlNameField = form.getTextField('ln110');
        const vPosField = form.getTextField('vpos110');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 1.10:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 1.10
      let skill1_10_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_1_10_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill1_10_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill1_10_candidates.length > 0) {
        const fallbackValidator = skill1_10_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 1.10:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn110');
          const vlNameField = form.getTextField('ln110');
          const vPosField = form.getTextField('vpos110');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 1.10 (fallback):', e);
        }
      }
    }

    if (skill2_1_validators.length > 0) {
      const mostRecentValidator = skill2_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn21');
        const vlNameField = form.getTextField('ln21');
        const vPosField = form.getTextField('vpos21');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.1
      let skill2_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_1_candidates.length > 0) {
        const fallbackValidator = skill2_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn21');
          const vlNameField = form.getTextField('ln21');
          const vPosField = form.getTextField('vpos21');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.1 (fallback):', e);
        }
      }
    }

    if (skill2_2_validators.length > 0) {
      const mostRecentValidator = skill2_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn22');
        const vlNameField = form.getTextField('ln22');
        const vPosField = form.getTextField('vpos22');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.2
      let skill2_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_2_candidates.length > 0) {
        const fallbackValidator = skill2_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn22');
          const vlNameField = form.getTextField('ln22');
          const vPosField = form.getTextField('vpos22');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.2 (fallback):', e);
        }
      }
    }

    if (skill2_3_validators.length > 0) {
      const mostRecentValidator = skill2_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 2.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn23');
        const vlNameField = form.getTextField('ln23');
        const vPosField = form.getTextField('vpos23');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 2.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 2.3
      let skill2_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_2_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill2_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill2_3_candidates.length > 0) {
        const fallbackValidator = skill2_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 2.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn23');
          const vlNameField = form.getTextField('ln23');
          const vPosField = form.getTextField('vpos23');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 2.3 (fallback):', e);
        }
      }
    }

    if (skill3_1_validators.length > 0) {
      const mostRecentValidator = skill3_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 3.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn31');
        const vlNameField = form.getTextField('ln31');
        const vPosField = form.getTextField('vpos31');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 3.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 3.1
      let skill3_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_3_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill3_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill3_1_candidates.length > 0) {
        const fallbackValidator = skill3_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 3.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn31');
          const vlNameField = form.getTextField('ln31');
          const vPosField = form.getTextField('vpos31');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 3.1 (fallback):', e);
        }
      }
    }

    if (skill3_2_validators.length > 0) {
      const mostRecentValidator = skill3_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 3.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn32');
        const vlNameField = form.getTextField('ln32');
        const vPosField = form.getTextField('vpos32');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 3.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 3.2
      let skill3_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_3_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill3_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill3_2_candidates.length > 0) {
        const fallbackValidator = skill3_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 3.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn32');
          const vlNameField = form.getTextField('ln32');
          const vPosField = form.getTextField('vpos32');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 3.2 (fallback):', e);
        }
      }
    }

    if (skill4_1_validators.length > 0) {
      const mostRecentValidator = skill4_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 4.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn41');
        const vlNameField = form.getTextField('ln41');
        const vPosField = form.getTextField('vpos41');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 4.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 4.1
      let skill4_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_4_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill4_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill4_1_candidates.length > 0) {
        const fallbackValidator = skill4_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 4.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn41');
          const vlNameField = form.getTextField('ln41');
          const vPosField = form.getTextField('vpos41');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 4.1 (fallback):', e);
        }
      }
    }

    if (skill5_1_validators.length > 0) {
      const mostRecentValidator = skill5_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 5.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn51');
        const vlNameField = form.getTextField('ln51');
        const vPosField = form.getTextField('vpos51');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 5.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 5.1
      let skill5_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_5_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill5_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill5_1_candidates.length > 0) {
        const fallbackValidator = skill5_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 5.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn51');
          const vlNameField = form.getTextField('ln51');
          const vPosField = form.getTextField('vpos51');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 5.1 (fallback):', e);
        }
      }
    }

    if (skill6_1_validators.length > 0) {
      const mostRecentValidator = skill6_1_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.1:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn61');
        const vlNameField = form.getTextField('ln61');
        const vPosField = form.getTextField('vpos61');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.1:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.1
      let skill6_1_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_1_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_1_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_1_candidates.length > 0) {
        const fallbackValidator = skill6_1_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.1:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn61');
          const vlNameField = form.getTextField('ln61');
          const vPosField = form.getTextField('vpos61');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.1 (fallback):', e);
        }
      }
    }

    if (skill6_2_validators.length > 0) {
      const mostRecentValidator = skill6_2_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.2:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn62');
        const vlNameField = form.getTextField('ln62');
        const vPosField = form.getTextField('vpos62');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.2:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.2
      let skill6_2_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_2_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_2_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_2_candidates.length > 0) {
        const fallbackValidator = skill6_2_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.2:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn62');
          const vlNameField = form.getTextField('ln62');
          const vPosField = form.getTextField('vpos62');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.2 (fallback):', e);
        }
      }
    }

    if (skill6_3_validators.length > 0) {
      const mostRecentValidator = skill6_3_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.3:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn63');
        const vlNameField = form.getTextField('ln63');
        const vPosField = form.getTextField('vpos63');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.3:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.3
      let skill6_3_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_3_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_3_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_3_candidates.length > 0) {
        const fallbackValidator = skill6_3_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.3:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn63');
          const vlNameField = form.getTextField('ln63');
          const vPosField = form.getTextField('vpos63');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.3 (fallback):', e);
        }
      }
    }

    if (skill6_4_validators.length > 0) {
      const mostRecentValidator = skill6_4_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.4:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn64');
        const vlNameField = form.getTextField('ln64');
        const vPosField = form.getTextField('vpos64');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.4:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.4
      let skill6_4_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_4_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_4_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_4_candidates.length > 0) {
        const fallbackValidator = skill6_4_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.4:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn64');
          const vlNameField = form.getTextField('ln64');
          const vPosField = form.getTextField('vpos64');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.4 (fallback):', e);
        }
      }
    }

    if (skill6_5_validators.length > 0) {
      const mostRecentValidator = skill6_5_validators[0];
      console.log('PDFGEN: Most recent validator for skill 6.5:', mostRecentValidator);
      try {
        const vfNameField = form.getTextField('fn65');
        const vlNameField = form.getTextField('ln65');
        const vPosField = form.getTextField('vpos65');
        vfNameField.setText(mostRecentValidator.first_name || '');
        vlNameField.setText(mostRecentValidator.last_name || '');
        vPosField.setText(mostRecentValidator.position || '');
      } catch (e) {
        console.log('Error filling validator fields for skill 6.5:', e);
      }
    } else {
      // Try fallback: match only on skill_id for skill 6.5
      let skill6_5_candidates = (data.allValidators || []).filter(
        v => (v.skill_id ? String(v.skill_id).trim().toLowerCase() : '') === SKILL_6_5_ID
      );
      // Sort fallback candidates by updated_at descending as well
      skill6_5_candidates.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      if (skill6_5_candidates.length > 0) {
        const fallbackValidator = skill6_5_candidates[0];
        console.log('PDFGEN: Fallback validator for skill 6.5:', fallbackValidator);
        try {
          const vfNameField = form.getTextField('fn65');
          const vlNameField = form.getTextField('ln65');
          const vPosField = form.getTextField('vpos65');
          vfNameField.setText(fallbackValidator.first_name || '');
          vlNameField.setText(fallbackValidator.last_name || '');
          vPosField.setText(fallbackValidator.position || '');
        } catch (e) {
          console.log('Error filling validator fields for skill 6.5 (fallback):', e);
        }
      }
    }

    // Add debugging section after all skill processing
    console.log('\n=== SKILL DATA COMPLETENESS REPORT ===');
    
    // Track all skills and their data status
    const skillStatus: { [key: string]: { id: string; hasSAO: boolean; hasValidator: boolean; rank: string | null } } = {
      '1.1': { id: SKILL_1_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.2': { id: SKILL_1_2_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.3': { id: SKILL_1_3_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.4': { id: SKILL_1_4_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.5': { id: SKILL_1_5_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.6': { id: SKILL_1_6_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.7': { id: SKILL_1_7_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.8': { id: SKILL_1_8_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.9': { id: SKILL_1_9_ID, hasSAO: false, hasValidator: false, rank: null },
      '1.10': { id: SKILL_1_10_ID, hasSAO: false, hasValidator: false, rank: null },
      '2.1': { id: SKILL_2_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '2.2': { id: SKILL_2_2_ID, hasSAO: false, hasValidator: false, rank: null },
      '2.3': { id: SKILL_2_3_ID, hasSAO: false, hasValidator: false, rank: null },
      '3.1': { id: SKILL_3_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '3.2': { id: SKILL_3_2_ID, hasSAO: false, hasValidator: false, rank: null },
      '4.1': { id: SKILL_4_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '5.1': { id: SKILL_5_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '6.1': { id: SKILL_6_1_ID, hasSAO: false, hasValidator: false, rank: null },
      '6.2': { id: SKILL_6_2_ID, hasSAO: false, hasValidator: false, rank: null },
      '6.3': { id: SKILL_6_3_ID, hasSAO: false, hasValidator: false, rank: null },
      '6.4': { id: SKILL_6_4_ID, hasSAO: false, hasValidator: false, rank: null },
      '6.5': { id: SKILL_6_5_ID, hasSAO: false, hasValidator: false, rank: null }
    };

    // Update status based on SAOs
    Object.entries(skillStatus).forEach(([skillNum, status]) => {
      const saos = data.saos?.filter(sao => 
        String(sao.eit_id).trim().toLowerCase() === EIT_ID && 
        String((sao as any).skill_id).trim().toLowerCase() === status.id
      ) || [];
      status.hasSAO = saos.length > 0;
      
      // Log SAO details if present
      if (status.hasSAO) {
        console.log(`\nSAO Details for Skill ${skillNum}:`);
        console.log('Employer:', saos[0].employer);
        console.log('Situation:', saos[0].situation);
        console.log('Action:', saos[0].action);
        console.log('Outcome:', saos[0].outcome);
      }
    });

    // Update status based on validators
    Object.entries(skillStatus).forEach(([skillNum, status]) => {
      const validators = (data.allValidators || []).filter(v => 
        String(v.skill_id).trim().toLowerCase() === status.id && 
        String(v.eit_id).trim().toLowerCase() === EIT_ID
      );
      status.hasValidator = validators.length > 0;
      
      // Log validator details if present
      if (status.hasValidator) {
        console.log(`\nValidator Details for Skill ${skillNum}:`);
        console.log('Name:', `${validators[0].first_name} ${validators[0].last_name}`);
        console.log('Position:', validators[0].position);
      }
    });

    // Update rank status
    Object.entries(skillStatus).forEach(([skillNum, status]) => {
      const rankData = form.getRadioGroup(`skill${skillNum.replace('.', '')}`).getSelected();
      status.rank = rankData || '0';
    });

    // Generate summary report
    console.log('\n=== SKILL COMPLETENESS SUMMARY ===');
    const missingSAOs: string[] = [];
    const missingValidators: string[] = [];
    const missingRanks: string[] = [];

    Object.entries(skillStatus).forEach(([skillNum, status]) => {
      if (!status.hasSAO) missingSAOs.push(skillNum);
      if (!status.hasValidator) missingValidators.push(skillNum);
      if (status.rank === '0') missingRanks.push(skillNum);
    });

    console.log('\nSkills missing SAOs:', missingSAOs.length > 0 ? missingSAOs.join(', ') : 'None');
    console.log('Skills missing Validators:', missingValidators.length > 0 ? missingValidators.join(', ') : 'None');
    console.log('Skills with default rank (0):', missingRanks.length > 0 ? missingRanks.join(', ') : 'None');

    // Log field population status
    console.log('\n=== FIELD POPULATION STATUS ===');
    Object.entries(skillStatus).forEach(([skillNum, status]) => {
      const skillNumFormatted = skillNum.replace('.', '');
      console.log(`\nSkill ${skillNum}:`);
      console.log('Rank:', status.rank);
      console.log('Employer:', form.getTextField(`employer${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Situation:', form.getTextField(`situation${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Action:', form.getTextField(`action${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Outcome:', form.getTextField(`outcome${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Validator First Name:', form.getTextField(`fn${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Validator Last Name:', form.getTextField(`ln${skillNumFormatted}`).getText() || 'Not populated');
      console.log('Validator Position:', form.getTextField(`vpos${skillNumFormatted}`).getText() || 'Not populated');
    });

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
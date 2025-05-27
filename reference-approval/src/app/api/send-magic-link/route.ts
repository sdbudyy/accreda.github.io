import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const smtpHost = process.env.SMTP_HOST!;
const smtpPort = Number(process.env.SMTP_PORT!);
const smtpUser = process.env.SMTP_USER!;
const smtpPass = process.env.SMTP_PASS!;
const smtpSecure = process.env.SMTP_SECURE === 'true';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      job_reference_id,
      eit_name,
      eit_email,
      job_title,
      job_company,
      reference_email
    } = body;

    // Generate magic link token and expiry
    const magic_link_token = crypto.randomBytes(32).toString('hex');
    const magic_link_expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Insert into reference_magic_links
    const { error } = await supabase.from('reference_magic_links').insert([
      {
        job_reference_id,
        eit_name,
        eit_email,
        job_title,
        job_company,
        reference_email,
        magic_link_token,
        magic_link_expires_at
      }
    ]);
    if (error) throw error;

    // Construct magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_MAGIC_LINK_BASE_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/approve?token=${magic_link_token}`;

    // Send email via Nodemailer (MailerSend SMTP)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `Accreda References <${smtpUser}>`,
      to: reference_email,
      subject: `Reference Request for ${eit_name}`,
      text: `You have been asked to provide a reference for ${eit_name} (${eit_email}) for the position: ${job_title} at ${job_company}.

Click the link below to approve and fill in your details:
${magicLink}

This link will expire in 24 hours.`,
      html: `<p>You have been asked to provide a reference for <b>${eit_name}</b> (${eit_email}) for the position: <b>${job_title}</b> at <b>${job_company}</b>.</p><p><a href="${magicLink}">Click here to approve and fill in your details</a></p><p>This link will expire in 24 hours.</p>`
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { token, reference_name, reference_position } = await req.json();
    if (!token || !reference_name || !reference_position) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('reference_magic_links')
      .select('*')
      .eq('magic_link_token', token)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 });
    }
    if (data.approved) {
      return NextResponse.json({ error: 'Already approved.' }, { status: 409 });
    }
    if (new Date(data.magic_link_expires_at) < new Date()) {
      return NextResponse.json({ error: 'This link has expired.' }, { status: 410 });
    }
    const { error: updateError } = await supabase
      .from('reference_magic_links')
      .update({
        reference_name,
        reference_position,
        approved: true,
        approved_at: new Date().toISOString(),
      })
      .eq('magic_link_token', token);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 
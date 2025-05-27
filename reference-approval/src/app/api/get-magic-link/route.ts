import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'No token provided.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('reference_magic_links')
    .select('*')
    .eq('magic_link_token', token)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 });
  }
  if (new Date(data.magic_link_expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired.' }, { status: 410 });
  }
  return NextResponse.json({ data });
} 
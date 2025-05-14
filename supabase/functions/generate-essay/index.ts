import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'npm:openai@4.28.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const { skills, experiences } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing Self-Assessment Outcome (SAO) essays for engineering competencies. Write in a professional, clear, and engaging style.',
        },
        {
          role: 'user',
          content: `Write a SAO essay based on the following skills and experiences:
            Skills: ${JSON.stringify(skills)}
            Experiences: ${JSON.stringify(experiences)}
            
            Focus on demonstrating how the experiences prove competency in the skills.`,
        },
      ],
    });

    const essay = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ essay }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
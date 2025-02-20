
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { uploadedHeaders, shopifyFields } = await req.json();

    if (!Array.isArray(uploadedHeaders) || !Array.isArray(shopifyFields)) {
      throw new Error('Invalid input format');
    }

    const prompt = `
      I have a CSV file with the following headers:
      ${uploadedHeaders.join(', ')}

      I need to map these to Shopify product import fields:
      ${shopifyFields.join(', ')}

      Return a JSON object where:
      - keys are Shopify fields
      - values are the best matching uploaded headers
      - if no good match exists, use an empty string
      - consider semantic similarities, common variations, and abbreviations
      Only return the JSON object, no other text.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that matches CSV headers to Shopify product import fields. Only return valid JSON objects.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const suggestionText = data.choices[0].message.content;
    
    // Parse the suggestion into a proper mapping object
    const suggestedMapping = JSON.parse(suggestionText.trim());

    return new Response(JSON.stringify({ mapping: suggestedMapping }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-field-mapping function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

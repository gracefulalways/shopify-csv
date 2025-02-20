
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    const { action, key_type, api_key } = await req.json()
    console.log(`Processing ${action} request for ${key_type} key`)

    switch (action) {
      case 'store': {
        // Validate the API key with OpenAI before storing
        if (key_type === 'openai') {
          const validateResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${api_key}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (!validateResponse.ok) {
            throw new Error('Invalid OpenAI API key')
          }
        }

        // Delete any existing keys of this type for the user
        await supabase
          .from('api_keys')
          .delete()
          .eq('user_id', user.id)
          .eq('key_type', key_type)

        // Store the new key
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert({
            user_id: user.id,
            key_type,
            key_hash: api_key, // In a production environment, this should be encrypted
          })

        if (insertError) throw insertError
        return new Response(
          JSON.stringify({ message: 'API key stored successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { error: deleteError } = await supabase
          .from('api_keys')
          .delete()
          .eq('user_id', user.id)
          .eq('key_type', key_type)

        if (deleteError) throw deleteError
        return new Response(
          JSON.stringify({ message: 'API key deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'check': {
        const { data, error: checkError } = await supabase
          .from('api_keys')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('key_type', key_type)
          .single()

        if (checkError) throw checkError
        return new Response(
          JSON.stringify({ exists: !!data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

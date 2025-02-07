
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  try {
    const {
      user,
      email_data: { confirmation_url },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        confirmation_url: string
      }
    }

    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        confirmationUrl: confirmation_url,
        email: user.email,
      })
    )

    const { error } = await resend.emails.send({
      from: 'ShopifyCSV.app <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Welcome to ShopifyCSV.app - Please Confirm Your Email',
      html,
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

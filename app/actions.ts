'use server'

import { cookies } from 'next/headers'

export async function verifyTurnstileToken (token: string) {
  const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  const result = await fetch(verifyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
      response: token
    })
  }).then(res => res.json())

  if (result.success) {
    cookies().set('turnstile_verified', 'true', { httpOnly: true, secure: true, sameSite: 'strict' })
    return { success: true }
  } else {
    return { success: false, errors: result['error-codes'] }
  }
}

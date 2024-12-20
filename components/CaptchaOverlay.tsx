// components/CaptchaOverlay.tsx
'use client'

import React, { useEffect } from 'react'

const CaptchaOverlay = ({ onVerify }: { onVerify: (token: string) => void }) => {
  useEffect(() => {
    const handleCaptcha = (event: any) => {
      if (event.detail.success) {
        onVerify(event.detail.token)
      }
    }
    window.addEventListener('turnstile-callback', handleCaptcha)
    return () => {
      window.removeEventListener('turnstile-callback', handleCaptcha)
    }
  }, [onVerify])

  return (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
            <div className='turnstile' data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback='turnstile-callback' />
            <script src='https://challenges.cloudflare.com/turnstile/v0/api.js' async defer />
        </div>
  )
}

export default CaptchaOverlay

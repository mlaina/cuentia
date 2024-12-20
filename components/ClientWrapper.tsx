// components/ClientWrapper.tsx
'use client'

import React, { useState } from 'react'
import CaptchaOverlay from '@/components/CaptchaOverlay'
import SupabaseProvider from '@/components/SupabaseProvider'

const ClientWrapper = ({ children, user }: { children: React.ReactNode, user: any }) => {
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = (token: string) => {
    setIsVerified(true)
  }

  return (
        <>
            {!isVerified && <CaptchaOverlay onVerify={handleVerify} />}
            <SupabaseProvider session={{ user }}>
                {children}
            </SupabaseProvider>
        </>
  )
}

export default ClientWrapper

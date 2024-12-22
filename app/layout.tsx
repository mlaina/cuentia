// layout.tsx
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'
import SupabaseProvider from '@/components/SupabaseProvider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: 'Imagins - Cuentos personalizados',
  description: 'Crea historias únicas para tus hijos',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default async function RootLayout ({
  children
}: {
    children: React.ReactNode
}) {
  const supabase = createServerComponentClient<Database>({
    cookies
  })

  const { data: { user } } = await supabase.auth.getUser()

  return (
        <html lang='es'>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-black`}>
                <SupabaseProvider session={{ user }}>
                    {children}
                </SupabaseProvider>
            </body>
        </html>
  )
}

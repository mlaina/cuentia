// layout.tsx
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import type { Metadata } from 'next'
import React from 'react'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Imagins AI',
  description: 'Cuentos personalizados para niños',
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
            <body className={`${poppins.className} antialiased text-black`}>
                <SupabaseProvider session={{ user }}>
                    {children}
                </SupabaseProvider>
            </body>
        </html>
  )
}

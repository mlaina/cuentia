import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import type { Database } from '@/types/supabase'
import type { Metadata } from 'next'
import React from 'react'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Poppins } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { CreditsProvider } from '@/context/CreditsContext'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Imagins',
  description: 'Cuentos personalizados para niños',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
const FALLBACK_LOCALE: SupportedLocale = 'en'

function getBrowserPreferredLang (acceptLang: string): SupportedLocale {
  const [firstLang] = acceptLang.split(',')
  const shortLang = firstLang.trim().split('-')[0].toLowerCase()

  if (SUPPORTED_LOCALES.includes(shortLang as SupportedLocale)) {
    return shortLang as SupportedLocale
  }

  return FALLBACK_LOCALE
}

export default async function RootLayout ({
  children
}: {
    children: React.ReactNode
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const localeCookie = cookies().get('locale')?.value
  const acceptLang = headers().get('accept-language') || ''

  const browserLang = getBrowserPreferredLang(acceptLang)

  const locale = (localeCookie || browserLang) as SupportedLocale

  let messages
  try {
    messages = (await import(`../locales/${locale}.json`)).default
  } catch (error) {
    messages = (await import(`../locales/${FALLBACK_LOCALE}.json`)).default
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
        <html lang={locale}>
            <body className={`${poppins.className} antialiased text-black`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SupabaseProvider session={{ user }}>
                        <CreditsProvider>
                            {children}
                        </CreditsProvider>
                    </SupabaseProvider>
                </NextIntlClientProvider>
            </body>
        </html>
  )
}

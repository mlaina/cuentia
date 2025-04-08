'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@supabase/auth-helpers-react'

function getLocaleCookie () {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(^|;\s*)locale=([^;]+)/)
  return match?.[2] || 'en'
}

type LanguageContextType = {
    locale: string
    setLocale: (locale: string) => Promise<void>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider ({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>('en')
  const supabase = createClientComponentClient()
  const user = useUser()

  useEffect(() => {
    const fetchLang = async () => {
      if (user) {
        const { data } = await supabase.from('users').select('lang').eq('user_id', user.id).single()
        setLocaleState(data?.lang || getLocaleCookie())
      } else {
        setLocaleState(getLocaleCookie())
      }
    }
    fetchLang()
  }, [user])

  const setLocale = async (newLocale: string) => {
    setLocaleState(newLocale)
    document.cookie = `locale=${newLocale}; Path=/;`

    if (user) {
      try {
        const { error } = await supabase.from('users').update({ lang: newLocale }).eq('user_id', user.id).select()

        if (error) {
          console.error('Error al actualizar el idioma en la base de datos:', error)
        }
      } catch (err) {
        console.error('Error al actualizar el idioma:', err)
      }
    }

    // We don't call router.refresh() here anymore
    // Instead, components will react to the locale change
  }

  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>
}

export function useLanguage () {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

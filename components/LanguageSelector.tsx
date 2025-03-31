import { Globe } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useUser } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function getLocaleCookie () {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(^|;\s*)locale=([^;]+)/)
  return match?.[2] || 'en'
}

export default function LanguageSelector () {
  const [locale, setLocale] = useState<string>('en')
  const supabase = createClientComponentClient()
  const user = useUser()
  const t = useTranslations()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { value: 'en', label: t('language_english') },
    { value: 'es', label: t('language_spanish') },
    { value: 'fr', label: t('language_french') },
    { value: 'de', label: t('language_german') },
    { value: 'it', label: t('language_italian') },
    { value: 'pt', label: t('language_portuguese') },
    { value: 'nl', label: t('language_dutch') }
  ]

  useEffect(() => {
    const fetchLang = async () => {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('lang')
          .eq('user_id', user.id)
          .single()
        setLocale(data?.lang || getLocaleCookie())
      } else {
        setLocale(getLocaleCookie())
      }
    }
    fetchLang()
  }, [user])

  const handleLocaleChange = async (newLocale: string) => {
    setLocale(newLocale)
    document.cookie = `locale=${newLocale}; Path=/;`

    if (user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ lang: newLocale })
          .eq('user_id', user.id)
          .select()

        if (error) {
          console.error('Error al actualizar el idioma en la base de datos:', error)
        }
      } catch (err) {
        console.error('Error al actualizar el idioma:', err)
      }
    }
    router.refresh()
  }

  useEffect(() => {
    function handleClickOutside (event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
        <div className='flex gap-5 items-center'>
            {/* Versión de escritorio: visible desde sm en adelante */}
            <div className='relative hidden sm:block' ref={dropdownRef}>
                <button
                  type='button'
                  onClick={() => setIsOpen(!isOpen)}
                  className='flex items-center gap-2 px-3 font-bold text-primary'
                  aria-haspopup='true'
                  aria-expanded={isOpen}
                >
                    <Globe className='h-4 w-4' />
                </button>
                {isOpen && (
                    <ul className='absolute z-50 mt-1 w-full min-w-[200px] bg-white border rounded-md shadow-lg py-1 max-h-60 overflow-auto'>
                        {languages.map((language) => (
                            <li
                              key={language.value}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${locale === language.value ? 'bg-gray-50' : ''}`}
                              onClick={() => {
                                handleLocaleChange(language.value)
                                setIsOpen(false)
                              }}
                            >
                                <div className='flex items-center justify-between'>
                                    {language.label}
                                    {locale === language.value && (
                                        <svg
                                          xmlns='http://www.w3.org/2000/svg'
                                          width='16'
                                          height='16'
                                          viewBox='0 0 24 24'
                                          fill='none'
                                          stroke='currentColor'
                                          strokeWidth='2'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          className='ml-2'
                                        >
                                            <polyline points='20 6 9 17 4 12' />
                                        </svg>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className='block sm:hidden'>
                <Button
                  variant='outline'
                  className='w-full justify-start z-50'
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                  }}
                >
                    <Globe className='mr-2 h-4 w-4' />
                    {t('profile_language')}
                </Button>
                {isOpen && (
                    <ul className='absolute z-50 mt-1 w-full min-w-[180px] max-w-[200px] bg-white border rounded-md shadow-lg py-1 max-h-60 overflow-auto'>
                        {languages.map((language) => (
                            <li
                              key={language.value}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${locale === language.value ? 'bg-gray-50' : ''}`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleLocaleChange(language.value)
                                setIsOpen(false)
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleLocaleChange(language.value)
                                setIsOpen(false)
                              }}
                            >
                                <div className='flex items-center justify-between'>
                                    {language.label}
                                    {locale === language.value && (
                                        <svg
                                          xmlns='http://www.w3.org/2000/svg'
                                          width='16'
                                          height='16'
                                          viewBox='0 0 24 24'
                                          fill='none'
                                          stroke='currentColor'
                                          strokeWidth='2'
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          className='ml-2'
                                        >
                                            <polyline points='20 6 9 17 4 12' />
                                        </svg>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
  )
}

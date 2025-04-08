'use client'

import { Globe, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

export default function LanguageSelector () {
  const { locale, setLocale } = useLanguage()
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

  const handleLocaleChange = async (newLocale: string) => {
    await setLocale(newLocale)
    router.refresh() // Still refresh for page-level translations
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
                                    {locale === language.value && <Check className='h-4 w-4 ml-2' />}
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
                                    {locale === language.value && <Check className='h-4 w-4 ml-2' />}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
  )
}

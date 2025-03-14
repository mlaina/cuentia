'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Función auxiliar para leer la cookie 'locale' con una RegExp sencilla
function getLocaleCookie () {
  if (typeof document === 'undefined') return 'en' // Evita errores en SSR
  const match = document.cookie.match(/(^|;\s*)locale=([^;]+)/)
  return match?.[2] || 'en'
}

export default function ProfilePage () {
  const t = useTranslations()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()

  // Estados de perfil
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })
  const [, setError] = useState<string | null>(null)

  // Estado para el locale actual
  const [locale, setLocale] = useState<string>('en')

  // Cargar datos de usuario y email/nombre
  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.name || '')
    } else {
      router.push('/login')
    }
  }, [user, router])

  // Leer cookie de idioma al montar
  useEffect(() => {
    setLocale(getLocaleCookie())
  }, [])

  // Manejar cambio de nombre
  const handleNameBlur = async () => {
    if (!user) return
    try {
      setError(null)
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) throw error
      setMessage({ text: t('profile_name_updated'), type: 'success' })
    } catch (error) {
      console.error('Error al actualizar el nombre:', error)
      setMessage({ text: t('profile_name_update_error'), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambio de idioma
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

  if (loading) {
    return (
        <div className='flex justify-center items-center h-screen'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
    )
  }

  if (!user) {
    return (
        <Alert variant='destructive' className='m-6'>
          <AlertDescription>{t('profile_login_required')}</AlertDescription>
        </Alert>
    )
  }

  return (
      <div className='w-full h-full background-section-4 px-8 md:px-0'>
        <div className='max-w-5xl mx-auto mt-10'>
          <h2 className='text-2xl text-secondary font-bold mb-6'>{t('profile_user_data')}</h2>

          {message.text && (
              <div
                className={`mb-4 p-4 rounded ${
                      message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
              >
                {message.text}
              </div>
          )}

          <div>
            <Label htmlFor='email'>{t('profile_email')}</Label>
            <Input id='email' type='email' value={email} disabled />
          </div>

          <div className='mt-2'>
            <Label htmlFor='name'>{t('profile_name')}</Label>
            <Input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
            />
          </div>

          {/* Selector de idioma */}
          <div className='mt-6 flex gap-5 items-center '>
            <Label htmlFor='language'>{t('profile_language')}</Label>
            <select
              id='language'
              className='mt-2 p-1 border rounded'
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
            >
              <option value='en'>{t('language_english')}</option>
              <option value='es'>{t('language_spanish')}</option>
              <option value='fr'>{t('language_french')}</option>
              <option value='de'>{t('language_german')}</option>
              <option value='it'>{t('language_italian')}</option>
              <option value='pt'>{t('language_portuguese')}</option>
              <option value='nl'>{t('language_dutch')}</option>
            </select>
          </div>

          {/* Botón para gestionar suscripción */}
          <a href='https://billing.stripe.com/p/login/00gbJ48gvgQQcMMaEE' target='_blank' rel='noreferrer'>
            <button className='mt-6 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-700'>
              {t('profile_manage_subscription')}
            </button>
          </a>
        </div>
      </div>
  )
}

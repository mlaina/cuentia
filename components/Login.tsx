'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Google from '@/components/google'
import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Login () {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [email, setEmail] = useState('')
  const supabase = useSupabaseClient()

  const handleOAuthSignIn = async (provider: 'google' | 'custom') => {
    setIsLoading(true)

    const createUserProfile = async (userId) => {
      try {
        // Obtener el idioma del navegador o de la cookie
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {})

        const locale = cookies.locale || navigator.language.split('-')[0] || 'en'

        // Insertar el nuevo registro en la tabla
        const { error } = await supabase
          .from('profiles') // Reemplaza 'profiles' con el nombre real de tu tabla
          .insert({
            user_id: userId,
            plan: 'WAITING',
            lang: locale,
            credits: 10000, // Asumiendo que quieres inicializar con créditos como en tus ejemplos
            email
          })

        if (error) {
          console.error('Error creating user profile:', error)
        }
      } catch (err) {
        console.error('Error in createUserProfile:', err)
      }
    }

    if (provider === 'custom') {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage({ text: error.message, type: 'error' })
      } else {
        // Verificar si es un nuevo usuario
        const { data: userData, error: userError } = await supabase
          .from('profiles') // Reemplaza 'profiles' con el nombre real de tu tabla
          .select('user_id')
          .eq('email', email)
          .single()

        if (userError || !userData) {
          // Es un nuevo usuario, obtener su ID y crear el perfil
          const { data: authData } = await supabase.auth.getUser()
          if (authData?.user) {
            await createUserProfile(authData.user.id)
          }
        }

        setMessage({ text: t('login_email_sent'), type: 'success' })
      }
    } else {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage({ text: error.message, type: 'error' })
      } else {
        // Nota: Para OAuth, necesitaremos manejar la creación del perfil en la página de callback
        // ya que seremos redirigidos fuera de esta página
      }
    }
    setIsLoading(false)
  }

  return (
      <div
        id='login'
        className='lg:absolute lg:left-1/2 lg:top-0 lg:w-[460px] w-full lg:z-30 backdrop-blur-sm rounded-lg lg:mt-6 lg:ml-12 px-4 lg:px-0 lg:shadow-lg'
      >
        <div className='border-glow-container rounded-lg p-4 bg-white lg:bg-white/80 backdrop-blur-sm min-h-[240px]'>
          <div className='border-glow absolute inset-0 rounded-lg pointer-events-none min-h-[240px]' />
          {!message.text && (
              <>
                <div className='flex'>
                  <Mail className='absolute m-2 text-gray-400' />
                  <Input
                    type='email'
                    id='email'
                    placeholder={t('login_email_placeholder')}
                    className='pl-10 w-full'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label={t('login_email_aria')}
                  />
                </div>
                <Button
                  type='submit'
                  onClick={() => handleOAuthSignIn('custom')}
                  className='rounded-lg text-md mt-2 w-full transition-all ease-in-out b-glow to-secondary drop-shadow-lg text-white font-bold'
                  disabled={!email || isLoading}
                >
                  {t('login_button')}
                </Button>
                <div className='flex items-center my-3'>
                  <div className='flex-grow border-t border-gray-200' />
                  <span className='mx-4 text-gray-400'>{t('login_or')}</span>
                  <div className='flex-grow border-t border-gray-200' />
                </div>
                <Button
                  className='w-full'
                  variant='outline'
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  <Google className='w-6 h-6 mr-2' />
                  {t('login_google')}
                </Button>
                <p className='text-xs text-gray-600 text-center mt-2'>{t('login_existing_account')}</p>
              </>
          )}
          {message.text && (
              <div
                className={`w-full h-full lg:max-w-[460px] rounded-md p-4 ${message.type === 'success' ? 'bg-teal-100' : 'bg-red-50'}`}
              >
                {message.text}
              </div>
          )}
        </div>
      </div>
  )
}

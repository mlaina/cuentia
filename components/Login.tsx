'use client'

import { Input } from '@/components/ui/input'
import { Turnstile } from '@marsidev/react-turnstile'
import { Button } from '@/components/ui/button'
import Google from '@/components/google'
import React, { useState } from 'react'
import { verifyTurnstileToken } from '@/app/actions'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Mail } from 'lucide-react'

export default function Login () {
  const [isLoading, setIsLoading] = useState(false)
  const [, setMessage] = useState({ text: '', type: '' })
  const [email, setEmail] = useState('')
  const supabase = useSupabaseClient()
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleOAuthSignIn = async (provider: 'google' | 'custom') => {
    if (!email || !turnstileToken) {
      alert('Por favor completa todos los campos')
      return
    }
    setIsLoading(true)
    const verifyResult = await verifyTurnstileToken(turnstileToken)

    if (verifyResult.success) {
      setMessage({ text: 'Falló la verificación de seguridad', type: 'error' })
      setIsLoading(false)
      return
    }
    if (provider === 'custom') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        setMessage({ text: error.message, type: 'error' })
      } else {
        setMessage({ text: 'Se ha enviado un correo electrónico con un enlace de inicio de sesión', type: 'success' })
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider
      })
      if (error) {
        setMessage({ text: error.message, type: 'error' })
      }
    }
    setIsLoading(false)
  }
  return (
        <div className='absolute lg:left-1/2 top-0 lg:min-w-[460px] md:min-w-[400px] sm:min-w-[300px] z-50 backdrop-blur-sm rounded-lg mt-6 ml-12 shadow-lg'>
            <div className='border-glow-container rounded-lg p-4 bg-white/80 backdrop-blur-sm'>
                <div className='border-glow absolute inset-0 rounded-lg pointer-events-none' />
                <div className='flex'>
                    <Mail className='absolute m-2 text-gray-400' />
                    <Input
                      type='email'
                      id='email'
                      placeholder='tu@email.com'
                      className='pl-10 w-full'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-label='Email address'
                    />
                </div>
                <Turnstile
                  options={{
                    size: 'flexible'
                  }}
                  className='mt-2 w-full h-8'
                  siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE}
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                  }}
                />
                <Button
                  type='submit'
                  onClick={() => handleOAuthSignIn('custom')}
                  className='rounded-lg text-md mt-2 w-full transition-all ease-in-out b-glow to-sky-500 drop-shadow-lg text-white font-bold'
                  disabled={!email || !turnstileToken || isLoading}
                >
                    Accede a Imagins
                </Button>
                <div className='flex items-center my-3'>
                    <div className='flex-grow border-t border-gray-200' />
                    <span className='mx-4 text-gray-400'>o</span>
                    <div className='flex-grow border-t border-gray-200' />
                </div>
                <Button
                  className='w-full'
                  variant='outline'
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                    <Google className='w-6 h-6 mr-2' />
                    Continúa con Google
                </Button>
                <p className='text-xs text-gray-600 text-center mt-2'>Si ya tienes cuenta, iniciaremos sesión con ella.</p>
            </div>
        </div>
  )
}

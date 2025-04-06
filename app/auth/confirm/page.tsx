'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function ConfirmInvite () {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('Procesando invitación...')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleInviteConfirmation = async () => {
      try {
        // Check if we have a hash fragment
        const hashFragment = window.location.hash.substring(1)

        if (!hashFragment) {
          setError('No se encontraron datos de autenticación')
          setLoading(false)
          return
        }

        setMessage('Verificando datos de invitación...')

        // Parse the hash fragment
        const params = new URLSearchParams(hashFragment)
        const tokenHash = params.get('access_token') // This is actually the token_hash
        const type = params.get('type')

        if (!tokenHash || type !== 'invite') {
          setError('Datos de autenticación inválidos')
          setLoading(false)
          return
        }

        setMessage('Verificando invitación...')

        // For invitations, we need to verify the token_hash
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'invite'
        })

        if (verifyError) {
          console.error('Verification error:', verifyError)
          setError(verifyError.message)
          setLoading(false)
          return
        }

        setMessage('Obteniendo información de usuario...')

        // Get the user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('User error:', userError)
          setError(userError?.message || 'No se pudo obtener la información del usuario')
          setLoading(false)
          return
        }

        setMessage('Verificando perfil de usuario...')

        // Check if user profile exists
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        // Create user profile if it doesn't exist
        if (!existingUser && !queryError?.message.includes('Results contain 0 rows')) {
          setMessage('Creando perfil de usuario...')

          const { error: insertError } = await supabase.from('users').insert({
            user_id: user.id,
            plan: 'WAITING',
            lang: navigator.language.split('-')[0] || 'en',
            credits: 0,
            email: user.email
          })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          }
        }

        setMessage('Redirigiendo...')

        // Force a full page reload to ensure middleware recognizes the new auth state
        window.location.href = '/'
      } catch (err) {
        console.error('Error processing invitation:', err)
        setError('Ocurrió un error durante la autenticación')
      } finally {
        setLoading(false)
      }
    }

    handleInviteConfirmation()
  }, [])

  if (loading) {
    return (
<div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto' />
                <p className='mt-4'>{message}</p>
            </div>
        </div>
    )
  }

  if (error) {
    return (
<div className='flex items-center justify-center min-h-screen'>
            <div className='text-center p-6 max-w-md bg-white rounded-lg shadow-md'>
                <h2 className='text-xl font-bold text-red-600 mb-4'>Error</h2>
                <p>{error}</p>
                <button
                  onClick={() => {
                    window.location.href = '/'
                  }}
                  className='mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90'
                >
                    Ir al inicio
                </button>
            </div>
        </div>
    )
  }

  return null
}

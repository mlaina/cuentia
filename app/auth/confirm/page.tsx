'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfirmInvite () {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleInviteConfirmation = async () => {
      try {
        // Check if we have a hash fragment with access_token
        const hashFragment = window.location.hash.substring(1)

        if (!hashFragment || !hashFragment.includes('access_token')) {
          setLoading(false)
          return
        }

        // Parse the hash fragment
        const params = new URLSearchParams(hashFragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setError('Invalid authentication data')
          setLoading(false)
          return
        }

        // Set the session in Supabase
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }

        // Get the user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setError(userError?.message || 'Failed to get user')
          setLoading(false)
          return
        }

        // Check if user profile exists
        const { data: existingUser, error: queryError } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        // Create user profile if it doesn't exist
        if (!existingUser && !queryError?.message.includes('Results contain 0 rows')) {
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

        // Redirect to home page
        router.push('/')
      } catch (err) {
        console.error('Error processing invitation:', err)
        setError('An error occurred during authentication')
      } finally {
        setLoading(false)
      }
    }

    handleInviteConfirmation()
  }, [router, supabase])

  if (loading) {
    return (
<div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto' />
                <p className='mt-4'>Procesando invitación...</p>
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
                  onClick={() => router.push('/')}
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

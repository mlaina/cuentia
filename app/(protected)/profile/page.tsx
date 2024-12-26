'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function ProfilePage () {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.name || '')
    } else {
      router.push('/login')
    }
  }, [user])

  const handleNameBlur = async () => {
    if (!user) return
    try {
      setError(null)
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        data: {
          name
        }
      })

      if (error) throw error

      setMessage({ text: 'Nombre actualizado automáticamente.', type: 'success' })
    } catch (error) {
      console.error('Error al actualizar el nombre:', error)
      setMessage({ text: 'No se pudo actualizar el nombre.', type: 'error' })
    } finally {
      setLoading(false)
    }
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
        <AlertDescription>Debes iniciar sesión para ver y gestionar tus protagonistas.</AlertDescription>
      </Alert>
    )
  }

  return (
      <div className='w-full h-full background-section-4 px-8 md:px-0'>
        <div className='max-w-5xl mx-auto mt-10 '>
          <h2 className='text-2xl text-secondary font-bold mb-6'>Datos de usuario</h2>

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
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input id='email' type='email' value={email} disabled />
          </div>
          <div className='mt-2'>
            <Label htmlFor='name'>Nombre</Label>
            <Input
              id='name'
              type='text'
              value={name || ''}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
            />
          </div>
          <a href='https://billing.stripe.com/p/login/00gbJ48gvgQQcMMaEE' target='_blank' rel='noreferrer'>
            <button
              className='mt-6 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-700'
            >
              Gestionar subscripción
            </button>
          </a>
        </div>
      </div>
  )
}

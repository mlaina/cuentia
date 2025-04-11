'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslations } from 'next-intl'

export default function ProfilePage () {
  const t = useTranslations()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()

  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.name || '')
    } else {
      router.push('/login')
    }
  }, [user, router])

  const handleNameBlur = async () => {
    if (!user) return
    try {
      setError(null)
      setSaveStatus(t('saving'))
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error al actualizar el nombre:', error)
    } finally {
      setSaveStatus(t('saved'))
      setTimeout(() => {
        setSaveStatus(null)
      }, 1000)
    }
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

          <a href='https://billing.stripe.com/p/login/00gbJ48gvgQQcMMaEE' target='_blank' rel='noreferrer'>
            <button className='mt-6 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-700'>
              {t('profile_manage_subscription')}
            </button>
          </a>

          <div className='h-3 mb-4'>
            {saveStatus && <p className='float-right text-sm text-secondary animate-pulse'>{saveStatus}</p>}
          </div>
        </div>
      </div>
  )
}

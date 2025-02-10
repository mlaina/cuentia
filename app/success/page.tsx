'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function SuccessPage ({ searchParams }: { searchParams: { session_id?: string } }) {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (searchParams.session_id) {
      fetchSession(searchParams.session_id)
    }
  }, [searchParams])

  const fetchSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })
      const data = await res.json()

      if (data.success) {
        router.push('/create')
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error(t('error_fetching_session'), error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>{t('loading')}</p>

  if (!session) return <p>{t('session_not_found')}</p>

  return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <h1 className='text-4xl font-bold text-green-600'>{t('thank_you')}</h1>
        <p className='mt-4 text-lg text-primary'>{t('payment_success')}</p>
      </div>
  )
}

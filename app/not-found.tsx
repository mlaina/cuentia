'use client'

import React, { useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'

export default function NotFound () {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/create')
    } else {
      router.push('/')
    }
  }, [user, router])

  return (
        <div className='flex flex-col items-center justify-center min-h-screen background-section-4'>
            <h1 className='text-7xl font-bold text-secondary mb-4 flex items-center'> <BookOpen className='w-16 h-16 mr-6 text-secondary' /> 404</h1>
            <p className='text-lg text-primary mb-8'>
                Oops, la página que buscas no existe.
            </p>
        </div>
  )
}

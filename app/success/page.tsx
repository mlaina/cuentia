'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage ({ searchParams }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line camelcase
    const { session_id } = searchParams

    // eslint-disable-next-line camelcase
    if (session_id) {
      fetchSession(session_id)
    }
  }, [searchParams])

  const fetchSession = async (sessionId) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      })
      const data = await res.json()

      if (data.success) {
        router.push('/create')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  if (!session) return <p>No se encontró la sesión.</p>

  return (
        <div>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pago ha sido procesado con éxito.</p>
        </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function InvitationForm () {
  const [email, setEmail] = useState('')
  const [credits, setCredits] = useState('')
  const [lang, setLang] = useState('')
  const [sendeds, setSendeds] = useState<any[]>([])

  const handleInvite = () => {
    if (!email) return

    fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang, credits })
    }).then(async (res) => {
      const body = await res.json().catch(() => ({}))
      setSendeds(prev => [...prev, { email, lang, credits, error: res.status !== 200 ? body.error : null }])
      setTimeout(() => setSendeds(prev => prev.filter(s => s.email !== email)), 4000)
    })

    setEmail(''); setCredits(''); setLang('')
  }

  return (
    <section className='mb-8'>
      <h2 className='text-2xl font-bold mb-4'>Enviar invitación</h2>

      <div className='flex flex-wrap gap-4 max-w-4xl'>
        <input
          className='flex-1 min-w-[180px] px-4 py-2 border rounded-md'
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder='Correo electrónico'
        />
        <input
          className='w-24 px-4 py-2 border rounded-md'
          value={credits} onChange={e => setCredits(e.target.value)}
          placeholder='créditos'
        />
        <input
          className='w-24 px-4 py-2 border rounded-md'
          value={lang} onChange={e => setLang(e.target.value)}
          placeholder='idioma'
        />
        <Button onClick={handleInvite}>Enviar</Button>
      </div>

      {sendeds.map(s => (
        <div key={s.email} className={`mt-2 p-3 rounded-md w-fit ${s.error ? 'bg-red-50 text-red-600' : 'bg-green-50'}`}>
          {s.error ? s.error : `Invitación enviada a ${s.email}`}
        </div>
      ))}
    </section>
  )
}

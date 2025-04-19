'use client'

import React, { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function UsersTab () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('user_id, email, credits, plan, stripe_id, lang, last_payment, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar los usuarios:', error)
      } else {
        setUsers(data)
      }

      setLoading(false)
    }

    if (user) {
      fetchUsers()
    }
  }, [supabase, user])

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Usuarios</h1>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className='w-full border border-gray-300 text-left text-sm'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>User ID</th>
              <th className='p-2 border'>Email</th>
              <th className='p-2 border'>Créditos</th>
              <th className='p-2 border'>Plan</th>
              <th className='p-2 border'>Stripe ID</th>
              <th className='p-2 border'>Idioma</th>
              <th className='p-2 border'>Último pago</th>
              <th className='p-2 border'>Creado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className='hover:bg-gray-50'>
                <td className='p-2 border'>{u.user_id}</td>
                <td className='p-2 border'>{u.email}</td>
                <td className='p-2 border'>{u.credits}</td>
                <td className='p-2 border'>{u.plan}</td>
                <td className='p-2 border'>{u.stripe_id}</td>
                <td className='p-2 border'>{u.lang}</td>
                <td className='p-2 border'>{u.last_payment}</td>
                <td className="p-2 border">
                {u.created_at
                    ? new Date(u.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : '—'}
                </td>

 

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function ErrorsTab () {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchErrors = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('errors') // tabla public.errors
        .select('user_id, email, trace, context')
        .order('created_at', { ascending: false }) // por si acaso

      if (error) {
        console.error('Error al cargar errores:', error)
      } else {
        setErrors(data)
      }
      setLoading(false)
    }

    if (user) fetchErrors()
  }, [supabase, user])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Errores</h1>

      {loading ? (
        <p>Cargando errores…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border max-w-[300px]">User ID</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Traza</th>
                <th className="p-2 border">Contexto</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border max-w-[300px]">{err.user_id}</td>
                  <td className="p-2 border">{err.email}</td>
                  <td className="p-2 border whitespace-pre-wrap break-all max-w-xs">{err.trace}</td>
                  <td className="p-2 border">{err.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'

export default function RequestsTab () {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests') // tabla public.requests
        .select('created_at, story_id, email')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar solicitudes:', error)
      } else {
        setRequests(data)
      }
      setLoading(false)
    }

    if (user) fetchRequests()
  }, [supabase, user])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Solicitudes</h1>

      {loading ? (
        <p>Cargando solicitudes…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Cuento</th>
                <th className="p-2 border">Email</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {new Date(req.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 border text-blue-600 underline">
                    <Link href={`/detailed-story/${req.story_id}`}>
                      {req.story_id}
                    </Link>
                  </td>
                  <td className="p-2 border">{req.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

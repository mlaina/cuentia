'use client'

import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

export default function FeedbackTab () {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const ratingIcon: Record<string, string> = {
    positive: '🟢',
    negative: '🔴',
    neutral: '🟡'
  }

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('feedback') // <-- nombre exacto de tu tabla
        .select('user_id, email, comment, path, created_at, rating')
        .order('created_at', { ascending: false }) // orden descendente

      if (error) {
        console.error('Error al cargar feedbacks:', error)
      } else {
        setFeedbacks(data)
      }
      setLoading(false)
    }

    if (user) fetchFeedbacks()
  }, [supabase, user])

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Feedbacks</h1>

      {loading
        ? (
        <p>Cargando feedbacks…</p>
          )
        : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm border-collapse'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='p-2 border'>User ID</th>
                <th className='p-2 border'>Email</th>
                <th className='p-2 border'>Comentario</th>
                <th className='p-2 border'>Path</th>
                <th className='p-2 border'>Fecha</th>
                <th className='p-2 border'>Rating</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f, i) => (
                <tr key={i} className='hover:bg-gray-50'>
                  <td className='p-2 border'>{f.user_id}</td>
                  <td className='p-2 border'>{f.email}</td>
                  <td className='p-2 border max-w-xs break-words'>{f.comment}</td>
                  <td className='p-2 border'>{f.path}</td>
                  <td className='p-2 border'>
                    {new Date(f.created_at).toLocaleString()}
                  </td>
                  <td className='p-2 border text-center'>
                    {ratingIcon[f.rating] ?? f.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
    </div>
  )
}

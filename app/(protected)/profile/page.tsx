'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'

interface Protagonist {
  id?: number;
  author_id: string;
  name: string;
  physical_description: string;
  likes: string;
  dislikes: string;
}

export default function ProfilePage () {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })
  const [protagonists, setProtagonists] = useState<Protagonist[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setName(user.user_metadata?.name || '')
    } else {
      router.push('/login')
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProtagonists()
    } else {
      setLoading(false)
    }
  }, [user])

  async function fetchProtagonists () {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('protagonists')
        .select('*')
        .eq('author_id', user.id)
        .order('id', { ascending: true })

      if (error) throw error
      setProtagonists(data || [])
    } catch (error) {
      console.error('Error fetching protagonists:', error)
      setError('No se pudieron cargar los protagonistas.')
    } finally {
      setLoading(false)
    }
  }

  async function addProtagonist () {
    if (!user) {
      setError('Debes iniciar sesión para añadir un protagonista.')
      return
    }
    const newProtagonist: Protagonist = {
      author_id: user.id,
      name: '',
      physical_description: '',
      likes: '',
      dislikes: ''
    }
    try {
      setError(null)
      const { data, error } = await supabase
        .from('protagonists')
        .insert([newProtagonist])
        .select()

      if (error) throw error
      if (data) setProtagonists([...protagonists, data[0]])
    } catch (error) {
      console.error('Error adding protagonist:', error)
      setError('No se pudo añadir el protagonista.')
    }
  }

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

  function handleInputChange (id: number, field: keyof Protagonist, value: string) {
    setProtagonists((prevProtagonists) =>
      prevProtagonists.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    )
  }

  async function handleBlur (id: number, field: keyof Protagonist, value: string) {
    if (!user) return
    try {
      setError(null)
      const { error } = await supabase
        .from('protagonists')
        .update({ [field]: value })
        .eq('id', id)
        .eq('author_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating protagonist:', error)
      setError('No se pudo actualizar el protagonista.')
    }
  }

  async function removeProtagonist (id: number) {
    if (!user) return
    try {
      setError(null)
      const { error } = await supabase
        .from('protagonists')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id)

      if (error) throw error
      setProtagonists(protagonists.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error removing protagonist:', error)
      setError('No se pudo eliminar el protagonista.')
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
    <div className='max-w-5xl mx-auto mt-10'>
      <h2 className='text-2xl font-bold mb-6'>Datos de usuario</h2>

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
      <h2 className='text-2xl font-bold mt-10 mb-4'>Protagonistas</h2>
      {protagonists.map((protagonist, index) => (
        <Card key={protagonist.id}>
          <CardHeader>
            <CardTitle className='flex justify-between items-center'>
              @{protagonist.name || 'Protagonista ' + (index + 1)}
              <Button variant='ghost' size='icon' onClick={() => removeProtagonist(protagonist.id!)}>
                <Trash2 className='h-5 w-5' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div>
                <label htmlFor={`name-${protagonist.id}`} className='block text-sm font-medium text-gray-700'>
                    Nombre
                </label>
                <Input
                  id={`name-${protagonist.id}`}
                  value={protagonist.name}
                  onChange={(e) =>
                    handleInputChange(protagonist.id!, 'name', e.target.value)}
                  onBlur={(e) =>
                    handleBlur(protagonist.id!, 'name', e.target.value)}
                  placeholder='Nombre del protagonista'
                />
              </div>
              <div>
                <label htmlFor={`physical-${protagonist.id}`} className='block text-sm font-medium text-gray-700'>
                    Descripción
                </label>
                <Textarea
                  id={`physical-${protagonist.id}`}
                  className='resize-none'
                  value={protagonist.physical_description}
                  onChange={(e) =>
                    handleInputChange(protagonist.id!, 'physical_description', e.target.value)}
                  onBlur={(e) =>
                    handleBlur(protagonist.id!, 'physical_description', e.target.value)}
                  placeholder='Describe las características físicas'
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addProtagonist} className='mt-4'>
          <PlusCircle className='mr-2 h-4 w-4' /> Añadir Protagonista
      </Button>
    </div>
  )
}

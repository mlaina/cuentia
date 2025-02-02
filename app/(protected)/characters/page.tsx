'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

function DraftAvatar ({ protagonistId, index }: { protagonistId: number; index: number }) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  useEffect(() => {
    async function fetchImage () {
      try {
        const { data, error } = await supabase
          .from('protagonists')
          .select('avatars')
          .eq('id', protagonistId)
          .single()

        if (error) throw error

        if (data && data.avatars && Array.isArray(data.avatars)) {
          setImage(data.avatars[index] || null)
        }
      } catch (error) {
        console.error('Error fetching existing image:', error)
      }
    }

    fetchImage()
  }, [supabase, protagonistId, index])

  async function uploadImageToAPI (file: File) {
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploadingImage(true)

      const response = await fetch('/api/characters', {
        method: 'POST',
        body: formData
      })

      const resp = await response.json()
      if (!response.ok) {
        throw new Error('Error al subir la imagen.')
      }

      await createImagePage(resp.description)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const createImagePage = async (description: any) => {
    let response
    try {
      await updateCredits(5);
      response = await fetch('/api/story/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      })

      if (response.status === 500) {
        response = await fetch('/api/story/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ description })
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { image: pageImage } = await response.json()
      setImage(pageImage)
      await updateProtagonistData(protagonistId, description, pageImage, index)
    } catch (error) {
      console.error('Error creating story index:', error)
      throw error
    }
  }

  async function updateProtagonistData (
    protagonistId: number,
    description: string | null,
    image: string | null,
    index: number
  ) {
    try {
      const { data, error } = await supabase
        .from('protagonists')
        .select('descriptions, avatars')
        .eq('id', protagonistId)
        .single()

      if (error) throw error

      const updatedDescriptions = data.descriptions || []
      const updatedAvatars = data.avatars || []

      updatedDescriptions[index] = description ?? updatedDescriptions[index] ?? null
      updatedAvatars[index] = image ?? updatedAvatars[index] ?? null

      const { error: updateError } = await supabase
        .from('protagonists')
        .update({
          descriptions: updatedDescriptions,
          avatars: updatedAvatars
        })
        .eq('id', protagonistId)

      if (updateError) throw updateError

      console.log('Protagonist data updated successfully')
    } catch (error) {
      console.error('Error updating protagonist data:', error)
    }
  }

  const handleImageClick = () => {
    document.getElementById(`file-input-${index}`)?.click()
  }

  const handleRemoveImage = () => {
    setImage(null)
    updateProtagonistData(protagonistId, '', '', index) // Borra la descripción y avatar en el índice
  }

  return (
      <div className='flex gap-2 items-center'>
        {image
          ? (
            <div className='relative group'>
              <img
                src={image}
                alt='Avatar'
                className='md:w-72 w-40 rounded-lg cursor-pointer'
                onClick={handleImageClick}
              />
              <button
                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100'
                onClick={handleRemoveImage}
              >
                ✕
              </button>
            </div>
            )
          : (
            <Input
              id={`file-input-${index}`}
              className='cursor-pointer border-dashed border border-gray-400'
              type='file'
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadImageToAPI(e.target.files[0])
                }
              }}
            />
            )}
        {uploadingImage && <Loader2 className='h-5 w-5 animate-spin' />}
      </div>
  )
}

export default function Characters () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [protagonists, setProtagonists] = useState<Protagonist[]>([])
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProtagonists()
    } else {
      setLoading(false)
    }
  }, [user])

  const updateCredits = async (cost) => {
    if (!user) return

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      console.error('Error fetching user:', error)
      return
    }

    const currentCredits = data.user.user_metadata.credits || 0
    const newCredits = currentCredits - cost

    const { error: updateError } = await supabase.auth.updateUser({
      data: { credits: newCredits }
    })

    if (updateError) {
      console.error('Error updating credits:', updateError)
    }
  }
  
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
      physical_description: ''
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

  async function handleInferDescription (protagonistId: number) {
    try {
      await updateCredits(2);
      const response = await fetch('/api/characters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ protagonistId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error inferiendo la descripción física.')
      }

      const { inference } = await response.json()
      setProtagonists((prevProtagonists) =>
        prevProtagonists.map((p) =>
          p.id === protagonistId ? { ...p, inference } : p
        )
      )
    } catch (error) {
      console.error('Error realizando la inferencia:', error)
    }
  }

  return (
    <div className='background-section-3 px-8 md:px-0'>
      <div className='max-w-5xl mx-auto mt-10 '>
        <h2 className='text-3xl font-bold mt-10 mb-4 text-secondary'>Protagonistas</h2>
        <div className='flex flex-col gap-4'>
          {protagonists.map((protagonist, index) => (
            <Card key={protagonist.id} className='border-secondary border border-dashed shadow-lg'>
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
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700'>Subir Imágenes</label>
                  <label className='block text-xs font-medium text-gray-500 mb-2'>Ninguna de las imágenes se almacenará en la plataforma, solo se utilizarán para generar avatares</label>
                  <div className='flex md:flex-row flex-col gap-3 items-start justify-between'>
                    {[1, 2, 3].map((num) => (
                        <DraftAvatar key={num} protagonistId={protagonist.id!} index={num} />
                    ))}
                  </div>
                  {protagonist.avatars &&
                      protagonist.avatars.some((avatar: string | null) => avatar) && (
                          <div className='mt-4 text-right'>
                            <Button onClick={() => handleInferDescription(protagonist.id!)} className='bg-accent'>
                              Inferir descripción física
                            </Button>
                          </div>
                  )}
                  <div className='mt-2'>
                    <label htmlFor={`inference-${protagonist.id}`} className='block text-sm font-medium text-gray-700'>
                      Descripción Inferida
                    </label>
                    <Textarea
                      id={`inference-${protagonist.id}`}
                      value={protagonist.inference || ''}
                      disabled
                      className='resize-none mt-1 h-72'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button onClick={addProtagonist} className='my-4 bg-secondary'>
          <PlusCircle className='mr-2 h-4 w-4' /> Añadir Protagonista
        </Button>
      </div>
    </div>
  )
}

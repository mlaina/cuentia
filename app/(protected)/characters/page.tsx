'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

  const user = useUser()

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

  const createImagePage = async (description: any) => {
    let response
    try {
      await updateCredits(5)
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
  const t = useTranslations()

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
          <AlertDescription>{t('login_required')}</AlertDescription>
        </Alert>
    )
  }

  async function handleInferDescription (protagonistId: number) {
    try {
      await updateCredits(2)
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
      <div className='background-section-3 px-8 md:px-0  '>
        <div className='max-w-7xl mx-auto mt-10 overflow-x-auto'>
          <div className='flex gap-4'>
            {protagonists.map((protagonist, index) => (
                <Card key={protagonist.id} className='border-gray border shadow-lg drop-shadow-lg w-full min-w-full'>
                  <CardHeader>
                    <CardTitle className='flex justify-between items-center'>
                      {protagonist.name || t('protagonist_default', { index: index + 1 })}
                      <button className='border-gray border rounded-2xl p-2' onClick={() => removeProtagonist(protagonist.id!)}>
                        <Trash2 className='h-5 w-5 text-gray-400' />
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      <div>
                        <label className='text-gray-400 mb-1'>{t('name')}</label>
                        <Input
                          className='max-w-[300px]'
                          id={`name-${protagonist.id}`}
                          value={protagonist.name}
                          onChange={(e) =>
                            handleInputChange(protagonist.id!, 'name', e.target.value)}
                          onBlur={(e) =>
                            handleBlur(protagonist.id!, 'name', e.target.value)}
                          placeholder={t('name_placeholder')}
                        />
                      </div>

                      <div className='space-y-4'>
                        <h2 className='font-bold text-lg'>{t('physical_traits')}</h2>
                        <div>
                          <label className='text-gray-400 mb-1'>{t('height')}</label>
                          <div className='flex flex-wrap gap-2'>
                            {['Alta', 'Media', 'Baja'].map((option) => (
                                <button
                                  key={option}
                                  className={`px-3 py-1 rounded ${protagonist.height === option ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                  onClick={() => handleInputChange(protagonist.id, 'height', option)}
                                >
                                  {option}
                                </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className='text-gray-400 mb-1'>{t('physique')}</label>
                          <div className='flex flex-wrap gap-2'>
                            {['Robusta', 'Delgada', 'Atlética', 'Descuidada', 'Musculosa'].map((option) => (
                                <button
                                  key={option}
                                  className={`px-3 py-1 rounded ${protagonist.physique === option ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                  onClick={() => handleInputChange(protagonist.id, 'physique', option)}
                                >
                                  {option}
                                </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className='text-gray-400 mb-1'>{t('hair_color')}</label>
                          <div className='flex flex-wrap gap-2'>
                            {['Castaño', 'Rubio', 'Negro', 'Blanco'].map((option) => (
                                <button
                                  key={option}
                                  className={`px-3 py-1 rounded ${protagonist.hairColor === option ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                  onClick={() => handleInputChange(protagonist.id, 'hairColor', option)}
                                >
                                  {option}
                                </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className='text-gray-400 mb-1'>{t('eye_color')}</label>
                          <div className='flex flex-wrap gap-2'>
                            {['Azules', 'Verdes', 'Marrones'].map((option) => (
                                <button
                                  key={option}
                                  className={`px-3 py-1 rounded ${protagonist.eyeColor === option ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                  onClick={() => handleInputChange(protagonist.id, 'eyeColor', option)}
                                >
                                  {option}
                                </button>
                            ))}
                          </div>
                        </div>

                      </div>
                      <div>
                        <h2 className='font-bold text-lg'>{t('accessories')}</h2>
                        <div className='flex flex-wrap gap-2'>
                          {['Gafas', 'Sombrero', 'Bastón'].map((option) => (
                              <button
                                key={option}
                                className={`px-3 py-1 rounded ${protagonist.accessories?.includes(option) ? 'bg-yellow-500' : 'bg-gray-200'}`}
                                onClick={() => handleInputChange(protagonist.id, 'accessories', option)}
                              >
                                {option}
                              </button>
                          ))}
                        </div>
                        <Textarea
                          id={`physical-${protagonist.id}`}
                          className='resize-none'
                          value={protagonist.physical_description}
                          onChange={(e) =>
                            handleInputChange(protagonist.id!, 'physical_description', e.target.value)}
                          onBlur={(e) =>
                            handleBlur(protagonist.id!, 'physical_description', e.target.value)}
                          placeholder='others-accesories_placeholder'
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
          <Button onClick={addProtagonist} className='my-4 bg-secondary'>
            <PlusCircle className='mr-2 h-4 w-4' /> {t('add_protagonist')}
          </Button>
        </div>
      </div>
  )
}

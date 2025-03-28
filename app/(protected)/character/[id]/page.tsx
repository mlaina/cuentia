'use client'

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'

interface Protagonist {
  id?: number
  author_id: string
  name: string
  physical_description?: string
  personality?: string
  height?: string
  body_type?: string
  skin_color?: string
  hair_color?: string
  traits?: string[]
}

export default function EditProtagonistPage () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const protagonistId = params.id ? Number.parseInt(params.id as string) : undefined

  const [protagonist, setProtagonist] = useState<Protagonist>({
    author_id: user?.id || '',
    name: '',
    height: 'Media',
    body_type: 'Delgada',
    skin_color: 'Media',
    hair_color: 'Castaño',
    traits: ['Lista']
  })

  // Height options
  const heightOptions = [
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ]

  // Body type options
  const bodyTypeOptions = [
    { value: 'Robusta', label: 'Robusta' },
    { value: 'Delgada', label: 'Delgada' },
    { value: 'Baja', label: 'Baja' }
  ]

  // Skin color options
  const skinColorOptions = [
    { value: 'Morena', label: 'Morena' },
    { value: 'Media', label: 'Media' },
    { value: 'Clara', label: 'Clara' }
  ]

  // Hair color options
  const hairColorOptions = [
    { value: 'Castaño', label: 'Castaño' },
    { value: 'Rubio', label: 'Rubio' },
    { value: 'Negro', label: 'Negro' }
  ]

  // Personality traits options
  const personalityOptions = [
    { value: 'Divertida', label: 'Divertida' },
    { value: 'Gruñona', label: 'Gruñona' },
    { value: 'Lista', label: 'Lista' },
    { value: 'Ignorante', label: 'Ignorante' },
    { value: 'Torpe', label: 'Torpe' },
    { value: 'Rebelde', label: 'Rebelde' },
    { value: 'Prudente', label: 'Prudente' }
  ]

  useEffect(() => {
    if (protagonistId && user) {
      fetchProtagonist()
    }
  }, [protagonistId, user])

  async function fetchProtagonist () {
    if (!user || !protagonistId) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('protagonists')
        .select('*')
        .eq('id', protagonistId)
        .eq('author_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        // Parse traits from string if needed
        const traits = data.traits ? (typeof data.traits === 'string' ? JSON.parse(data.traits) : data.traits) : []

        setProtagonist({
          ...data,
          traits
        })
      }
    } catch (error) {
      console.error('Error fetching protagonist:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveProtagonist () {
    if (!user) return

    try {
      setLoading(true)

      // Create physical description from selected attributes
      const physicalDescription = `${protagonist.height || ''}, ${protagonist.body_type || ''}, ${protagonist.skin_color || ''}, ${protagonist.hair_color || ''}`

      // Create personality description from selected traits
      const personalityDescription = protagonist.traits?.join(', ') || ''

      const protagonistData = {
        ...protagonist,
        author_id: user.id,
        physical_description: physicalDescription,
        personality: personalityDescription,
        traits: JSON.stringify(protagonist.traits)
      }

      if (protagonistId) {
        // Update existing protagonist
        const { error } = await supabase
          .from('protagonists')
          .update(protagonistData)
          .eq('id', protagonistId)
          .eq('author_id', user.id)

        if (error) throw error
      } else {
        // Create new protagonist
        const { error } = await supabase.from('protagonists').insert([protagonistData])

        if (error) throw error
      }

      router.push('/protagonists')
    } catch (error) {
      console.error('Error saving protagonist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTraitToggle = (trait: string) => {
    setProtagonist((prev) => {
      const currentTraits = prev.traits || []

      if (currentTraits.includes(trait)) {
        // Remove trait if already selected
        return {
          ...prev,
          traits: currentTraits.filter((t) => t !== trait)
        }
      } else {
        // Add trait if not selected
        return {
          ...prev,
          traits: [...currentTraits, trait]
        }
      }
    })
  }

  const handleOptionSelect = (category: keyof Protagonist, value: string) => {
    setProtagonist((prev) => ({
      ...prev,
      [category]: value
    }))
  }

  const handleGoBack = () => {
    router.push('/characters')
  }

  return (
      <div className='lg:flex background-section-6 pt-12'>
        <button
          onClick={handleGoBack}
          className='fixed bottom-8 left-12 z-50 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg bg-secondary hover:bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300'
          aria-label='Añadir protagonista'
        >
          <ArrowLeft className='w-6 h-6 sm:w-7 sm:h-7' />
        </button>
        {/* Left side - Quote */}
        <div className='lg:w-1/2 flex items-center justify-center p-10'>
          <h1 className='text-5xl md:text-6xl font-bold text-secondary leading-tight'>
            No existe cuento
            <br />
            sin quienes lo
            <br />
            habitan...
          </h1>
        </div>

        {/* Right side - Editor */}
        <div className='lg:w-1/2 p-10 lg:pr-20 flex items-center justify-center'>
          <div className='w-full max-w-3xl lg:max-w-full'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2'>Edita tu protagonista</h2>
            <p className='text-gray-600 mb-6'>Edita a los protagonistas que darán forma a tus cuentos.</p>

            <div className='bg-white bg-opacity-50 rounded-xl border-2 border-dashed border-secondary-500 p-6'>
              {/* Character name and avatar */}
              <div className='flex items-center mb-6'>
                <div
                  className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 mr-3'
                >
                  <span className='text-gray-500 text-sm'>{protagonist.name?.[0] || '?'}</span>
                </div>
                <h3 className='text-xl font-bold text-secondary'>{protagonist.name || 'Nuevo protagonista'}</h3>
              </div>

              {/* Physical characteristics */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold text-gray-700 mb-3'>¿Cómo es físicamente?</h4>

                <div className='grid grid-cols-2 gap-6'>
                  {/* Height */}
                  <div>
                    <p className='text-gray-600 mb-2'>Estatura:</p>
                    <div className='flex flex-wrap gap-2'>
                      {heightOptions.map((option) => (
                          <button
                            key={option.value}
                            type='button'
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  protagonist.height === option.value
                                      ? 'bg-secondary-200 text-secondary-800'
                                      : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                              }`}
                            onClick={() => handleOptionSelect('height', option.value)}
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Body type */}
                  <div>
                    <p className='text-gray-600 mb-2'>Fisionomía:</p>
                    <div className='flex flex-wrap gap-2'>
                      {bodyTypeOptions.map((option) => (
                          <button
                            key={option.value}
                            type='button'
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  protagonist.body_type === option.value
                                      ? 'bg-secondary-200 text-secondary-800'
                                      : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                              }`}
                            onClick={() => handleOptionSelect('body_type', option.value)}
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Skin color */}
                  <div>
                    <p className='text-gray-600 mb-2'>Color de piel:</p>
                    <div className='flex flex-wrap gap-2'>
                      {skinColorOptions.map((option) => (
                          <button
                            key={option.value}
                            type='button'
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  protagonist.skin_color === option.value
                                      ? 'bg-secondary-200 text-secondary-800'
                                      : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                              }`}
                            onClick={() => handleOptionSelect('skin_color', option.value)}
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair color */}
                  <div>
                    <p className='text-gray-600 mb-2'>Color de pelo:</p>
                    <div className='flex flex-wrap gap-2'>
                      {hairColorOptions.map((option) => (
                          <button
                            key={option.value}
                            type='button'
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  protagonist.hair_color === option.value
                                      ? 'bg-secondary-200 text-secondary-800'
                                      : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                              }`}
                            onClick={() => handleOptionSelect('hair_color', option.value)}
                          >
                            {option.label}
                          </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personality traits */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold text-gray-700 mb-3'>¿Cómo es personalmente?</h4>
                <div className='flex flex-wrap gap-2'>
                  {personalityOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.traits?.includes(option.value)
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleTraitToggle(option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                type='button'
                className='w-full py-3 bg-secondary hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors'
                onClick={saveProtagonist}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

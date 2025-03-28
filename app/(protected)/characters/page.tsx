'use client'

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useState, useEffect, useRef } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Protagonist {
  id?: number
  author_id: string
  name: string
  physical_description: string
  likes: string
  dislikes: string
  role?: string
  inference?: string
}

export default function Characters () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [protagonists, setProtagonists] = useState<Protagonist[]>([])
  const [, setError] = useState<string | null>(null)
  const t = useTranslations()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

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

      for (const protagonist of data) {
        const { data: stories, error: storyError } = await supabase
          .from('stories')
          .select('title')
          .contains('protagonists', protagonist.id)
          .order('id', { ascending: false })

        console.log('stories', stories)
        if (storyError) throw storyError
        protagonist.stories = stories
      }
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
    const newProtagonist: Protagonist = {
      author_id: user.id,
      name: '',
      physical_description: ''
    }
    try {
      setError(null)
      const { data, error } = await supabase.from('protagonists').insert([newProtagonist]).select()

      if (error) throw error
      if (data) {
        setProtagonists([...protagonists, data[0]])
        setCurrentIndex(protagonists.length)
        router.push(`/character/${data[0].id}`)
      }
    } catch (error) {
      console.error('Error adding protagonist:', error)
      setError('No se pudo añadir el protagonista.')
    }
  }

  const prevCharacter = () => {
    if (protagonists.length <= 1) return
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? protagonists.length - 1 : prevIndex - 1))
  }

  const nextCharacter = () => {
    if (protagonists.length <= 1) return
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex === protagonists.length - 1 ? 0 : prevIndex + 1))
  }

  const goToCharacter = (index: number) => {
    if (protagonists.length <= 1) return
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const getVisibleCharacters = () => {
    if (protagonists.length === 0) return []

    // If only one protagonist, just show it in the center
    if (protagonists.length === 1) {
      return [{ index: 0, position: 'center' }]
    }

    const prev = currentIndex === 0 ? protagonists.length - 1 : currentIndex - 1
    const next = currentIndex === protagonists.length - 1 ? 0 : currentIndex + 1

    return [
      { index: prev, position: 'left' },
      { index: currentIndex, position: 'center' },
      { index: next, position: 'right' }
    ]
  }

  if (loading && protagonists.length === 0) {
    return (
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary' />
        </div>
    )
  }

  return (
      <div className='flex flex-col items-center justify-center background-section-3 w-full'>
        <div ref={containerRef} className='relative w-full max-w-6xl px-4 py-6 md:py-12'>
          {/* Floating Add Button */}
          <button
            onClick={addProtagonist}
            className='fixed bottom-8 right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg bg-secondary hover:bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300'
            aria-label='Añadir protagonista'
          >
            <Plus className='w-6 h-6 sm:w-7 sm:h-7' />
          </button>

          {/* Empty state when no protagonists */}
          {/* eslint-disable-next-line multiline-ternary */}
          {protagonists.length === 0 ? (
              <div className='flex flex-col items-center justify-center bg-secondary-50 rounded-xl border-2 border-dashed border-secondary-200 p-8 text-center h-[400px] max-w-md mx-auto'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>No protagonists yet</h3>
                <p className='text-gray-600 mb-6'>Create your first protagonist by clicking the + button</p>
              </div>
          ) : (
              <>
                {/* Navigation buttons - only show if more than one protagonist */}
                {protagonists.length > 1 && (
                    <>
                      <button
                        onClick={prevCharacter}
                        className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        aria-label='Personaje anterior'
                      >
                        <ChevronLeft className='w-5 h-5 md:w-6 md:h-6' />
                      </button>

                      <button
                        onClick={nextCharacter}
                        className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        aria-label='Personaje siguiente'
                      >
                        <ChevronRight className='w-5 h-5 md:w-6 md:h-6' />
                      </button>
                    </>
                )}

                {/* Carousel container - adjust height based on screen size */}
                <div className='relative overflow-hidden h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]'>
                  <div className='absolute w-full h-full flex justify-center items-center'>
                    {getVisibleCharacters().map(({ index, position }) => (
                        <AnimatePresence key={protagonists[index]?.id || index} mode='popLayout'>
                          <motion.div
                            key={`character-${protagonists[index]?.id || index}`}
                            initial={{
                              x: direction > 0 ? 300 : -300,
                              scale: 0.8,
                              opacity: 0.5
                            }}
                            animate={{
                              x: position === 'center' ? 0 : position === 'left' ? -300 : 300,
                              scale: position === 'center' ? 1 : 0.8,
                              opacity: position === 'center' ? 1 : 0.7,
                              zIndex: position === 'center' ? 10 : 5
                            }}
                            exit={{
                              x: direction > 0 ? -300 : 300,
                              scale: 0.8,
                              opacity: 0.5
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`absolute select-none ${
                                  position === 'center'
                                      ? 'bg-secondary-50 border-secondary-300 z-20 border-solid h-[380px] sm:h-[420px] md:h-[480px] lg:h-[580px]'
                                      : 'bg-secondary-50/90 border-secondary-200/70 z-10 border-dashed h-[350px] sm:h-[390px] md:h-[450px] lg:h-[550px] hidden sm:flex'
                              } w-[85%] sm:w-[300px] md:w-[320px] lg:w-[350px] rounded-xl border-2 p-3 sm:p-4 md:p-6 flex flex-col shadow-lg ${
                                  position !== 'center' ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                              }`}
                            onClick={() => {
                              if (position === 'left') {
                                prevCharacter()
                              } else if (position === 'right') {
                                nextCharacter()
                              }
                            }}
                          >
                            {/* Header with avatar and name */}
                            <div className='flex items-center mb-2 md:mb-4'>
                              <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300'>
                          <span className='text-gray-500 text-xs sm:text-sm'>
                            {protagonists[index]?.name?.[0] || '?'}
                          </span>
                              </div>
                              <div className='ml-2 md:ml-3 overflow-hidden'>
                                <h3 className='text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate'>
                                  {protagonists[index]?.name || t('New protagonist')}
                                </h3>
                                <p className='text-xs sm:text-sm md:text-base text-gray-600 truncate'>
                                  {protagonists[index]?.role || ''}
                                </p>
                              </div>
                              <Link className='ml-auto' href={`/character/${protagonists[index]?.id}`}>
                                <button className='ml-auto border border-gray-300 hover:bg-gray-200 rounded-full p-1 sm:p-1.5 md:p-2 transition-colors'>
                                  <Pencil className='w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-500' />
                                </button>
                              </Link>
                            </div>

                            {/* Description */}
                            <p className='text-gray-700 mb-2 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 md:line-clamp-4'>
                              {protagonists[index]?.inference || protagonists[index]?.physical_description || ''}
                            </p>

                            {/* Stories section */}
                            <div className='flex-grow'>
                              <h4 className='text-gray-700 font-bold mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base'>
                                {t('appeared_stories')}
                              </h4>
                              <ul className='space-y-3'>
                                {protagonists[index]?.stories?.map((story, i) => (
                                    <li key={i} className='flex items-center'>
                                      <CheckCircle size={18} className='text-gray-500 mr-2 flex-shrink-0' />
                                      <span className='text-gray-600'>{story.title}</span>
                                    </li>
                                ))}
                              </ul>
                            </div>

                            {/* Delete button - now properly positioned at the bottom */}
                            <button
                              className='text-red-500 hover:text-red-600 transition-colors text-center mt-auto text-xs sm:text-sm md:text-base py-1'
                            >
                              {t('delete')}
                            </button>
                          </motion.div>
                        </AnimatePresence>
                    ))}
                  </div>
                </div>

                {/* Pagination indicators - only show if more than one protagonist */}
                {protagonists.length > 1 && (
                    <div className='flex justify-center mt-4 md:mt-8 space-x-1 sm:space-x-1.5 md:space-x-2'>
                      {protagonists.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToCharacter(index)}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                                  index === currentIndex ? 'bg-secondary sm:w-3 md:w-4' : 'bg-secondary-300'
                              }`}
                            aria-label={`Ir al personaje ${index + 1}`}
                          />
                      ))}
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  )
}

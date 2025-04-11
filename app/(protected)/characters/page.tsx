'use client'

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState, useEffect, useRef } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, Pencil, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Story {
  id: number
  title: string
}

interface Protagonist {
  id?: number
  author_id: string
  name: string
  physical_description: string
  likes: string
  dislikes: string
  role?: string
  inference?: string
  stories?: Story[]
  age?: number | string
  gender?: string
  height?: string
  hair_color?: string
  eye_color?: string
  skin_color?: string
}

// Función para formatear la descripción completa del protagonista usando labels
function formatProtagonistDescription (
  protagonist: Protagonist,
  t: (key: string) => string
): string {
  const parts: string[] = []
  if (protagonist.name) parts.push(protagonist.name)
  if (protagonist.age) parts.push(`${t('age')}: ${protagonist.age}`)
  if (protagonist.height) parts.push(`${t('height')}: ${t(protagonist.height)}`)
  if (protagonist.skin_color) parts.push(`${t('skin')}: ${t(protagonist.skin_color)}`)
  if (protagonist.hair_color) parts.push(`${t('hair_color')}: ${t(protagonist.hair_color)}`)
  if (protagonist.hair_type) parts.push(`${t('hair_type')}: ${t(protagonist.hair_type)}`)
  if (protagonist.accessories && protagonist.accessories.length > 0) {
    const accessories = protagonist.accessories?.map(accessory => t(accessory))
    parts.push(`${t('accessories')}: ${accessories.join(', ')}`)
  }

  return parts.join(', ')
}

export default function Characters () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [protagonists, setProtagonists] = useState<Protagonist[]>([])
  const [, setError] = useState<string | null>(null)
  const t = useTranslations()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Estado para confirmar borrado
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [protagonistToDelete, setProtagonistToDelete] = useState<number | undefined>(undefined)

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

      if (data.length === 0) {
        const newProtagonist: Protagonist = {
          author_id: user.id,
          name: ''
        }
        const { data: newP } = await supabase.from('protagonists').insert([newProtagonist]).select().single()
        router.push(`/character/${newP.id}`)
      }

      if (error) throw error

      // Para cada protagonista, se obtienen sus historias (sin duplicados)
      const protagonistsWithStories = await Promise.all(
        data.map(async (protagonist) => {
          try {
            const { data: storiesData, error: storyError } = await supabase
              .from('stories')
              .select('id, title')
              .contains('protagonists', protagonist.id)
              .order('id', { ascending: false })
              .limit(6)

            if (storyError) throw storyError

            const uniqueStories = new Map<string, Story>()
            storiesData.forEach((story) => {
              if (!uniqueStories.has(story.title)) {
                uniqueStories.set(story.title, story)
              }
            })
            protagonist.stories = Array.from(uniqueStories.values())
            return protagonist
          } catch (error) {
            console.error('Error fetching stories for protagonist:', error)
            protagonist.stories = []
            return protagonist
          }
        })
      )

      setProtagonists(protagonistsWithStories || [])
    } catch (error) {
      console.error(t('error_fetching_protagonist'), error)
      setError(t('error_fetching_protagonist'))
    } finally {
      setLoading(false)
    }
  }

  async function addProtagonist () {
    // @ts-ignore
    const newProtagonist: Protagonist = {
      author_id: user.id,
      name: ''
    }
    try {
      setError(null)
      const { data, error } = await supabase.from('protagonists').insert([newProtagonist]).select()
      if (error) throw error
      if (data) {
        router.push(`/character/${data[0].id}`)
        setProtagonists([...protagonists, data[0]])
        setCurrentIndex(protagonists.length)
      }
    } catch (error) {
      console.error('Error adding protagonist:', error)
      setError(t('error_adding_protagonist'))
    }
  }

  // Delete confirmation functions
  const openDeleteConfirm = (id: number | undefined) => {
    if (id) {
      setProtagonistToDelete(id)
      setShowDeleteConfirm(true)
    }
  }
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setProtagonistToDelete(undefined)
  }
  const confirmDelete = async () => {
    if (!protagonistToDelete) return
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.from('protagonists').delete().eq('id', protagonistToDelete)
      if (error) throw error
      const updatedProtagonists = protagonists.filter((p) => p.id !== protagonistToDelete)
      setProtagonists(updatedProtagonists)
      if (updatedProtagonists.length === 0) {
        setCurrentIndex(0)
      } else if (currentIndex >= updatedProtagonists.length) {
        setCurrentIndex(updatedProtagonists.length - 1)
      }
      closeDeleteConfirm()
    } catch (error) {
      console.error('Error deleting protagonist:', error)
      setError(t('error_deleting_protagonist'))
    } finally {
      setLoading(false)
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
    if (protagonists.length === 1) return [{ index: 0, position: 'center' }]
    if (protagonists.length === 2) {
      return [
        { index: 0, position: currentIndex === 0 ? 'center' : 'left' },
        { index: 1, position: currentIndex === 1 ? 'center' : 'right' }
      ]
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
          {protagonists?.length <= 10 && (
              <button
                onClick={addProtagonist}
                className='fixed bottom-12 md:right-4 right-2 z-50 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg bg-secondary hover:bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300'
                aria-label={t('add_protagonist')}
              >
                <Plus className='w-6 h-6 sm:w-7 sm:h-7' />
              </button>
          )}

          {/* Empty state when no protagonists */}
          {/* eslint-disable-next-line multiline-ternary */}
          {protagonists.length === 0 ? (
              <div className='flex flex-col items-center justify-center bg-secondary-50 rounded-xl border-2 border-dashed border-secondary-200 p-8 text-center h-[400px] max-w-md mx-auto'>
                <h3 className='text-xl font-bold text-gray-800 mb-4'>{t('no_protagonists_yet')}</h3>
                <p className='text-gray-600 mb-6'>{t('create_first_protagonist_instruction')}</p>
              </div>
          ) : (
              <>
                {/* Navigation buttons for desktop */}
                {protagonists.length > 1 && (
                    <>
                      <button
                        onClick={prevCharacter}
                        className='hidden md:block absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        aria-label={t('previous_character')}
                      >
                        <ChevronLeft className='w-5 h-5 md:w-6 md:h-6' />
                      </button>
                      <button
                        onClick={nextCharacter}
                        className='hidden md:block absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        aria-label={t('next_character')}
                      >
                        <ChevronRight className='w-5 h-5 md:w-6 md:h-6' />
                      </button>
                    </>
                )}

                {/* Mobile view */}
                <div className='md:hidden flex flex-col items-center gap-3'>
                  {protagonists.map((protagonist, index) => (
                      <div
                        key={`character-${protagonists[index]?.id || index}`}
                        className='select-none bg-secondary-50 border-secondary-300 z-20 border-solid h-[380px] sm:h-[420px] md:h-[480px] lg:h-[580px] w-[85%] sm:w-[300px] md:w-[320px] lg:w-[350px] rounded-xl border-2 p-3 sm:p-4 md:p-6 flex flex-col shadow-lg cursor-pointer hover:opacity-90 transition-opacity'
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
                              {protagonists[index]?.name || t('new_protagonist')}
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

                        {/* Description using full details */}
                        <p className='text-gray-700 mb-2 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 md:line-clamp-4'>
                          {formatProtagonistDescription(protagonists[index], t)}
                        </p>

                        {/* Stories section */}
                        <div className='flex-grow'>
                          <h4 className='text-gray-700 font-bold mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base'>
                            {t('appeared_stories')}
                          </h4>
                          <ul className='space-y-3'>
                            {protagonists[index]?.stories?.map((story) => (
                                <Link key={story.id} className='flex items-center' href={story.id ? `/story/${story.id}` : '#'}>
                                  <li className='flex items-center'>
                                    <CheckCircle size={18} className='text-gray-500 mr-2 flex-shrink-0' />
                                    <span className='text-gray-600'>{story.title}</span>
                                  </li>
                                </Link>
                            ))}
                          </ul>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteConfirm(protagonists[index]?.id)
                          }}
                          className='text-red-500 hover:text-red-600 transition-colors text-center mt-auto text-xs sm:text-sm md:text-base py-1'
                        >
                          {t('delete')}
                        </button>
                      </div>
                  ))}
                </div>

                {/* Carousel for desktop */}
                <div className='hidden md:block relative overflow-hidden h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]'>
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
                              x:
                                    protagonists.length === 2
                                      ? position === 'center'
                                        ? currentIndex === 0
                                          ? -80
                                          : 80
                                        : position === 'left'
                                          ? -200
                                          : 200
                                      : position === 'center'
                                        ? 0
                                        : position === 'left'
                                          ? -300
                                          : 300,
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
                                      : 'bg-secondary-50/90 border-secondary-200/70 z-10 border-dashed h-[350px] sm:h-[390px] md:h-[450px] lg:h-[550px] hidden md:flex'
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
                                  {protagonists[index]?.name || t('new_protagonist')}
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
                              {formatProtagonistDescription(protagonists[index], t)}
                            </p>

                            {/* Stories section */}
                            <div className='flex-grow'>
                              <h4 className='text-gray-700 font-bold mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base'>
                                {t('appeared_stories')}
                              </h4>
                              <ul className='space-y-3'>
                                {protagonists[index]?.stories?.map((story) => (
                                    <Link key={story.id} className='flex items-center' href={position === 'center' ? `/story/${story.id}` : ''}>
                                      <li className='flex items-center'>
                                        <CheckCircle size={18} className='text-gray-500 mr-2 flex-shrink-0' />
                                        <span className='text-gray-600'>{story.title}</span>
                                      </li>
                                    </Link>
                                ))}
                              </ul>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteConfirm(protagonists[index]?.id)
                              }}
                              className='text-red-500 hover:text-red-600 transition-colors text-center mt-auto text-xs sm:text-sm md:text-base py-1'
                            >
                              {t('delete')}
                            </button>
                          </motion.div>
                        </AnimatePresence>
                    ))}
                  </div>
                </div>

                {/* Pagination indicators for desktop */}
                {protagonists.length > 1 && (
                    <div className='hidden md:flex justify-center mt-4 md:mt-8 space-x-1 sm:space-x-1.5 md:space-x-2'>
                      {protagonists.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToCharacter(index)}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                                  index === currentIndex ? 'bg-secondary sm:w-3 md:w-4' : 'bg-secondary-300'
                              }`}
                            aria-label={t('go_to_character', { num: index + 1 })}
                          />
                      ))}
                    </div>
                )}
              </>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl'>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>{t('delete_protagonist')}</h3>
                    <button onClick={closeDeleteConfirm} className='text-gray-500 hover:text-gray-700'>
                      <X size={20} />
                    </button>
                  </div>
                  <div className='mb-6'>
                    <p className='text-gray-600'>{t('delete_protagonist_confirmation')}</p>
                  </div>
                  <div className='flex justify-end space-x-3'>
                    <button
                      onClick={closeDeleteConfirm}
                      className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={confirmDelete}
                      className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}

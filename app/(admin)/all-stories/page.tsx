'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function DashboardComponent () {
  const t = useTranslations()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [email, setEmail] = useState('')
  const [credits, setCredits] = useState('')
  const [lang, setLang] = useState('')
  const loadingRef = useRef(null)
  // Ref para mantener actualizado el número de historias
  const storiesRef = useRef([])
  const supabase = useSupabaseClient()
  const user = useUser()
  const ITEMS_PER_PAGE = 8

  // Actualizamos el ref cada vez que cambie stories
  useEffect(() => {
    storiesRef.current = stories
  }, [stories])

  const loadMoreStories = useCallback(async (isInitialLoad = false) => {
    if (!user || loading || (!hasMore && !isInitialLoad)) return

    setLoading(true)

    // Usamos el ref para obtener el número actual de historias
    const startIndex = isInitialLoad ? 0 : storiesRef.current.length
    const endIndex = startIndex + ITEMS_PER_PAGE - 1

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, images, protagonists')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex)

      if (error) {
        console.error(t('error_fetching_stories'), error)
        return
      }

      if (data.length === 0 || data.length < ITEMS_PER_PAGE) {
        setHasMore(false)
      }

      if (isInitialLoad) {
        setStories(data)
        setInitialized(true)
      } else {
        // Usamos el setter funcional para asegurarnos de usar el estado más reciente
        setStories(prevStories => {
          const existingIds = new Set(prevStories.map(story => story.id))
          const newStories = data.filter(story => !existingIds.has(story.id))
          return [...prevStories, ...newStories]
        })
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }, [user, loading, hasMore, supabase, t])

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (user && !initialized && stories.length === 0) {
      loadMoreStories(true)
    }
  }, [user, initialized, stories.length, loadMoreStories])

  // Configurar el observer para el elemento de carga
  useEffect(() => {
    if (!loadingRef.current || !initialized) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreStories(false)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadingRef.current)

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [hasMore, loading, initialized, loadMoreStories])

  const handleInvite = async () => {
    if (!email) return

    await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang, credits })
    })

    setEmail('')
    setCredits('')
    setLang('')
  }

  return (
      <div className='flex background-section-3 min-h-screen'>
        <main className='flex-1 m-auto'>
          <div className='mx-auto py-6 px-6 md:px-24'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold mb-4'>Enviar invitación</h1>
              <div className='flex gap-4 max-w-3xl'>
                <input
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-primary focus:border-primary'
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Correo electrónico'
                />
                <input
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-primary focus:border-primary'
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder='creditos'
                />
                <input
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-primary focus:border-primary'
                  onChange={(e) => setLang(e.target.value)}
                  placeholder='idioma'
                />
                <Button
                  onClick={handleInvite}
                  className='bg-primary text-white hover:bg-primary-700'
                >
                  Enviar
                </Button>
              </div>
            </div>

            {stories.length === 0 && !loading
              ? (
                    <p className='text-center text-gray-600'>{t('no_stories_yet')}</p>
                )
              : (
                    <>
                      <div className='hidden md:grid grid-cols-1 grid-cols-3 lg:grid-cols-8 gap-10'>
                        {stories.map((story) => (
                            <Link key={story.id} href={`/detailed-story/${story.id}`} passHref>
                              <div className='relative w-26'>
                                <img
                                  src={
                                      story.images && story.images[0] !== ''
                                        ? story.images[0]
                                        : 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
                                    }
                                  alt={t('cover_image')}
                                  className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                                />
                                <div className='absolute inset-y-0 left-0 w-2 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                              </div>
                            </Link>
                        ))}
                      </div>

                      <div className='grid md:hidden gap-4 grid-cols-3'>
                        {stories.map((story) => (
                            <Link key={story.id} href={`/detailed-story/${story.id}`} passHref>
                              <div className='relative w-26'>
                                <img
                                  src={
                                      story.images && story.images[0] !== ''
                                        ? story.images[0]
                                        : 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
                                    }
                                  alt={t('cover_image')}
                                  className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                                />
                                <div className='absolute inset-y-0 left-0 w-1 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                              </div>
                            </Link>
                        ))}
                      </div>
                    </>
                )}

            {/* Elemento de carga y trigger para más contenido */}
            <div ref={loadingRef} className='w-full flex justify-center py-8'>
              {loading
                ? (
                      <div className='flex items-center'>
                        <Loader2 className='animate-spin mr-2 h-5 w-5' />
                        <span>{t('loading') || 'Cargando'}...</span>
                      </div>
                  )
                : hasMore
                  ? (
                          <div className='h-10' />
                    )
                  : (
                      stories.length > 0 && (
                              <p className='text-gray-500 text-sm'>
                                {t('no_more_stories') || 'No hay más historias'}
                              </p>
                      )
                    )}
            </div>
          </div>
        </main>
      </div>
  )
}

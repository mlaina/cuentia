'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function DashboardComponent () {
  const t = useTranslations()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const loadingRef = useRef(null)
  const supabase = useSupabaseClient()
  const user = useUser()
  const ITEMS_PER_PAGE = 8

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (user && !initialized && stories.length === 0) {
      loadMoreStories(true)
      setInitialized(true)
    }
  }, [user, initialized])

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
  }, [hasMore, loading, initialized])

  const loadMoreStories = async (isInitialLoad = false) => {
    if (!user || loading || (!hasMore && !isInitialLoad)) return

    setLoading(true)

    try {
      const startIndex = isInitialLoad ? 0 : stories.length
      const endIndex = startIndex + ITEMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('stories')
        .select('id, title, images, protagonists')
        .eq('author_id', user.id)
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
      } else {
        const existingIds = new Set(stories.map(story => story.id))
        const newStories = data.filter(story => !existingIds.has(story.id))

        setStories(prevStories => [...prevStories, ...newStories])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex background-section-3 min-h-screen'>
      <main className='flex-1 max-w-7xl m-auto'>
        <div className='mx-auto py-6 px-6 md:px-24'>
          <div className='mb-6'>
            <Link href='/create'>
              <Button
                className='bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg'
              >
                <PlusCircle className='w-5 h-5 mr-2' />
                {t('create_new_story')}
              </Button>
            </Link>
          </div>

          {stories.length === 0 && !loading
            ? (
            <p className='text-center text-gray-600'>{t('no_stories_yet')}</p>
              )
            : (
            <>
              <div className='hidden md:grid grid-cols-1 grid-cols-3 lg:grid-cols-4 gap-10'>
                {stories.map((story) => (
                  <Link key={story.id} href={`/story/${story.id}`} passHref>
                    <div className='relative w-26'>
                      <img
                        src={story.images && story.images[0] !== '' ? story.images[0] : 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'}
                        alt={t('cover_image')}
                        className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                      />
                      <div className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                    </div>
                  </Link>
                ))}
              </div>

              <div className='grid md:hidden gap-4 grid-cols-3'>
                {stories.map((story) => (
                  <Link key={story.id} href={`/story/${story.id}`} passHref>
                    <div className='relative w-26'>
                      <img
                        src={story.images && story.images[0] !== '' ? story.images[0] : 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'}
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
          <div
            ref={loadingRef}
            className='w-full flex justify-center py-8'
          >
            {/* eslint-disable-next-line multiline-ternary */}
            {loading ? (
              <div className='flex items-center'>
                <Loader2 className='animate-spin mr-2 h-5 w-5' />
                <span>{t('loading') || 'Cargando'}...</span>
              </div>
            // eslint-disable-next-line multiline-ternary
            ) : hasMore ? (
              <div className='h-10' /> // Espacio invisible para que el observer funcione
            ) : (
              stories.length > 0 && (
                <p className='text-gray-500 text-sm'>{t('no_more_stories') || 'No hay más historias'}</p>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

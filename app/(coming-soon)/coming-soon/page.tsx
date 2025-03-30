'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function Home () {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations()
  const [currentStoryPage, setCurrentStoryPage] = useState(0)

  const [favoriteStories, setFavoriteStories] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchFavoriteStories () {
      const { data, error } = await supabase.from('stories').select('*').eq('fav', true)

      if (error) {
        console.error('Error fetching favorite stories:', error)
        return
      }

      setFavoriteStories(data || [])
    }

    fetchFavoriteStories()
  }, [supabase])

  const totalStoryPages = Math.ceil(favoriteStories.length / 4)
  const currentStories = favoriteStories.slice(currentStoryPage * 4, currentStoryPage * 4 + 4)
  return (
      <main
        className=' h-full min-h-screen w-full bg-[url("/images/soon.png")] bg-cover bg-center bg-no-repeat flex-col gap-5 pb-6 flex items-center justify-center text-white pt-20'
      >
          <div className='flex flex-col justify-center gap-4 mt-12'>
              <img
                className='md:max-w-[400px] mb-4'
                src='/images/footprints.svg'
              />
              <h1 className='text-secondary text-center text-2xl md:text-5xl font-bold'>{t('coming_soon_title')}</h1>
              <p className='text-secondary md:max-w-[500px] text-center'>{t('coming_soon_description')}</p>
          </div>
          <div className='md:hidden container mx-auto px-4 py-12'>
              <div className='grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-5 md:gap-10'>
                  {currentStories.map((story, index) => {
                    const coverImage = story.content?.[0]?.imageUrl
                    return (
                        <Link key={story.id} href={`/story-view/${story.id}`}>
                          <div
                            key={index}
                            className='relative w-26 cursor-pointer hover:opacity-90 transition-opacity'
                          >
                              <img
                                src={
                                      coverImage ||
                                      'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public' ||
                                      '/placeholder.svg' ||
                                      '/placeholder.svg'
                                  }
                                alt='Cover Image'
                                className='w-full object-cover rounded-md md:rounded-r-md drop-shadow-xl shadow-lg aspect-[3/4]'
                              />
                              <div
                                className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none'
                              />
                          </div>
                        </Link>
                    )
                  })}
              </div>

              {totalStoryPages > 1 && (
                  <div className='flex justify-center mt-6 space-x-2 md:space-x-3'>
                      {Array.from({ length: totalStoryPages }).map((_, index) => (
                          <button
                            key={index}
                            type='button'
                            onClick={() => setCurrentStoryPage(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                  index === currentStoryPage ? 'bg-secondary scale-125 w-5' : 'bg-secondary-300 hover:bg-secondary-400 '
                              }`}
                            aria-label={`Ver página ${index + 1} de historias`}
                          />
                      ))}
                  </div>
              )}
          </div>
          <div
            className='hidden md:grid px-4 lg:max-w-5xl md:grid-cols-3 lg:py-10 xl:py-14 lg:grid-cols-4 gap-10'
          >
              {favoriteStories.map((story, index) => {
                const coverImage = story.content?.[0]?.imageUrl
                return (
                    <Link key={story.id} href={`/story-view/${story.id}`}>
                      <div
                        className='relative w-26 cursor-pointer hover:opacity-90 transition-opacity'
                      >
                          <img
                            src={coverImage || 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'}
                            alt='Cover Image'
                            className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                          />
                          <div
                            className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none'
                          />
                      </div>
                    </Link>
                )
              })}
          </div>
      </main>
  )
}

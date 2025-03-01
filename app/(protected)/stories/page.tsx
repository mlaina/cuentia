'use client'

import React, { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function DashboardComponent () {
  const t = useTranslations()
  const [stories, setStories] = useState([])
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('stories')
        .select('id, title, style, images, protagonists')
        .eq('author_id', user.id)
        .order('id', { ascending: false })

      if (error) {
        console.error(t('error_fetching_stories'), error)
      } else {
        setStories(data)
      }
    }

    fetchStories()
  }, [user, supabase])

  return (
      <div className='flex background-section-3'>
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
            {stories.length === 0
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
                              src={story.images && story.images[0] !== '' ? story.images[0] : '/placeholder-covers.svg'}
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
                              src={story.images && story.images[0] !== '' ? story.images[0] : '/placeholder-covers.svg'}
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
          </div>
          {stories.length > 3 && <hr className='pt-16' />}
        </main>
      </div>
  )
}

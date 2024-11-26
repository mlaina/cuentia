'use client'

import React, { useEffect, useState } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import AnimatedParticlesBackground from '@/components/ui/AnimatedParticlesBackground'

export default function DashboardComponent () {
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
        console.error('Error fetching stories:', error)
      } else {
        setStories(data)
      }
    }

    fetchStories()
  }, [user, supabase])

  return (
      <div className='flex'>
        <AnimatedParticlesBackground />
        <main className='flex-1 '>
          <div className=' mx-auto py-6 px-24'>
            <div className='mb-6'>
              <Link href='/story'>
                <Button className='bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg'>
                  <PlusCircle className='w-5 h-5 mr-2' />
                  Crea un nuevo cuento
                </Button>
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-10 '>
              {stories.map((story) => {
                return (
                    <Link key={story.id} href={`/story/${story.id}`} passHref>
                      <div className='relative w-26'>
                        <img
                          src={story.images[0]}
                          alt='Cover Image'
                          className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                        />
                        <div className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                      </div>
                    </Link>
                )
              })}
            </div>
          </div>
          {stories.length > 3 &&
              <hr className='pt-16' />}
        </main>
      </div>
  )
}
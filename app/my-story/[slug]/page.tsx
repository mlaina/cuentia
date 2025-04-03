'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import StoryViewer from '@/components/StoryViewer'
import Head from 'next/head'

const IMAGINS =
    '"La imaginación es la chispa que enciende los sueños y da forma al futuro. Es el poder de transformar lo imposible en posible, abriendo puertas a ideas y soluciones que desafían los límites. Cuando dejamos volar nuestra mente, conectamos con un potencial ilimitado para crear y reinventar el mundo."'

function decodeId (encoded) {
  return Buffer.from(encoded, 'base64').toString('utf8')
}

function encodeId (id: string | number) {
  return Buffer.from(String(id), 'utf8').toString('base64')
}

export default function PreviewPage ({ params }) {
  const { slug } = params
  const [favoriteStories, setFavoriteStories] = useState([])
  const [story, setStory] = useState({ content: [] })
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData () {
      try {
        setIsLoading(true)

        // Fetch favorite stories
        const { data: favData, error: favError } = await supabase
          .from('stories')
          .select('id, content')
          .eq('fav', true)

        if (favError) {
          console.error('Error fetching favorite stories:', favError)
        } else {
          setFavoriteStories(favData || [])
        }

        // Decode slug back to ID
        const realId = decodeId(slug)

        // Fetch current story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', realId)
          .eq('public', true)
          .single()

        if (storyError) {
          console.error('Error fetching story:', storyError)
        } else {
          setStory(storyData || { content: [] })
        }
      } catch (error) {
        console.error('Error in data fetching:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, slug])

  return (
      <>
        <Head>
          <title>Imagins AI - {story?.name}</title>
        </Head>
        <div className='relative min-h-screen overflow-hidden bg-white background-section-1'>
          <header id='top' className='container mx-auto max-w-5xl py-4 pt-6 px-8'>
            <nav className='flex justify-between items-center'>
              <Link href='/' className='text-3xl font-bold text-gray-800 flex items-center'>
                <BookOpen className='w-10 h-10 mr-2 text-secondary' />
                <p className='text-secondary text-4xl font-bold'>Imagins</p>
              </Link>
              <div className='hidden md:flex space-x-8 text-md'>
                <a href='/#library' className='text-primary font-bold hover:text-secondary'>
                  {t('library')}
                </a>
                <a href='/#pricing' className='text-primary font-bold hover:text-secondary'>
                  {t('pricing')}
                </a>
              </div>
            </nav>
          </header>

          <main>
            <div className='container mx-auto px-4 py-8'>
              {isLoading
                ? (
                  <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary' />
                  </div>
                  )
                : (
                  <StoryViewer pages={story.content} hiddenPageText={IMAGINS} />
                  )}
            </div>

            {favoriteStories?.length > 0 && (
                <section className='container mx-auto px-4 py-16'>
                  <h2 className='text-3xl font-bold text-secondary mb-8 text-center'>{t('more_stories')}</h2>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-6xl mx-auto'>
                    {favoriteStories.map((story) => {
                      const coverImage = story.content?.[0]?.imageUrl
                      const encodedId = encodeId(story.id)
                      return (
                          <Link key={story.id} href={`/preview/${encodedId}`}>
                            <div className='relative w-26 cursor-pointer hover:opacity-90 transition-opacity'>
                              <img
                                src={
                                      coverImage ||
                                      'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
                                  }
                                alt='Cover Image'
                                className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                              />
                              <div className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                            </div>
                          </Link>
                      )
                    })}
                  </div>
                </section>
            )}
          </main>
        </div>
      </>
  )
}

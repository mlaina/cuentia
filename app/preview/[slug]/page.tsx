import Preview from '@/components/Preview'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import React from 'react'

interface PreviewPageProps {
  params: {
    slug: string
  }
}

async function getStoryBySlug (slug: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', slug)
      .single()

    if (error) {
      console.error('Error fetching story:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching story:', error)
    return null
  }
}

const IMAGINS = '"La imaginación es la chispa que enciende los sueños y da forma al futuro. Es el poder de transformar lo imposible en posible, abriendo puertas a ideas y soluciones que desafían los límites. Cuando dejamos volar nuestra mente, conectamos con un potencial ilimitado para crear y reinventar el mundo."'

export default async function PreviewPage ({ params }: PreviewPageProps) {
  const { slug } = params
  const story = await getStoryBySlug(slug)

  // Fetch favorite stories for the gallery, excluding the current story
  const supabase = createServerComponentClient({ cookies })
  const { data: favoriteStories } = await supabase
    .from('stories')
    .select('*')
    .eq('fav', true)
    .neq('id', slug)
    .limit(8)

  if (!story) {
    notFound()
  }

  return (
      <div className='relative min-h-screen overflow-hidden bg-white'>
        <header id='top' className='container mx-auto max-w-6xl py-4 pt-6 px-8'>
          <nav className='flex justify-between items-center'>
            <Link href='/' className='text-3xl font-bold text-gray-800 flex items-center'>
              <BookOpen className='w-10 h-10 mr-2 text-secondary' />
              <p className='text-secondary text-4xl font-bold'>Imagins</p>
            </Link>
            <div className='hidden md:flex space-x-8 text-md'>
              <a href='/#library' className='text-primary font-bold hover:text-secondary'>Librería</a>
              <a href='/#pricing' className='text-primary font-bold hover:text-secondary'>Precios</a>
            </div>
          </nav>
        </header>

        <main className='background-section-1-small lg:background-section-1'>
          <div className='container mx-auto px-4 py-8'>
            <Preview pages={story.content} hiddenPageText={IMAGINS} />
          </div>

          {favoriteStories?.length > 0 && (
              <section className='container mx-auto px-4 py-16'>
                <h2 className='text-3xl font-bold text-secondary mb-8 text-center'>Más historias</h2>
                <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-6xl mx-auto'>
                  {favoriteStories.map((story) => {
                    const coverImage = story.content?.[0]?.imageUrl
                    return (
                        <Link key={story.id} href={`/preview/${story.id}`}>
                          <div className='relative w-26 cursor-pointer hover:opacity-90 transition-opacity'>
                            <img
                              src={coverImage || '/placeholder-covers.svg'}
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
              </section>
          )}
        </main>
      </div>
  )
}

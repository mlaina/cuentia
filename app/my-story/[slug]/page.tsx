'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Page, Text, Document, pdf, Image, Font, View } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import he from 'he'
import { useTranslations } from 'next-intl'
import DownloadMenu from '@/components/DownloadMenu'
import { useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import Preview from '@/components/Preview'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

const MyDocument = ({ story }) => {
  const pages =
      typeof story.content === 'string'
        ? JSON.parse(story.content)
        : story.content

  return (
      <Document>
        {pages.map((page, index) => {
          const isCover = index === 0
          const isBackCover = index === pages.length - 1

          return (
              <Page
                key={index}
                size='A4'
                orientation='landscape'
                style={{
                  padding: 0,
                  margin: 0,
                  flexDirection: 'row', // Dividimos la página en dos columnas
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Mitad izquierda */}
                <View
                  style={{
                    flex: 1,
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {isBackCover ? (
                  // Contraportada: se pinta la imagen en la izquierda
                    page.imageUrl && (
                          <Image
                            alt='Contraportada'
                            src={page.imageUrl}
                            style={{
                              left: '5%',
                              width: '110%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              display: 'block'
                            }}
                          />
                    )
                  ) : (
                  // Páginas intermedias: se pinta el texto en la izquierda
                    !isCover &&
                      page.content && (
                          <Text
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              padding: 12,
                              borderRadius: 4,
                              fontSize: 18,
                              lineHeight: 1.6,
                              letterSpacing: 0.5,
                              fontWeight: 500
                            }}
                          >
                            {he.decode(marked(page.content).replace(/<[^>]*>/g, ''))}
                          </Text>
                    )
                  )}
                </View>

                {/* Mitad derecha */}
                <View
                  style={{
                    flex: 1,
                    padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {isCover ? (
                  // Portada: se pinta la imagen en la derecha
                    page.imageUrl && (
                          <Image
                            alt='Portada'
                            src={page.imageUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                    )
                  ) : (
                  // Páginas intermedias: se pinta la imagen en la derecha
                    !isBackCover &&
                      page.imageUrl && (
                          <Image
                            alt='Imagen de página'
                            src={page.imageUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                    )
                  )}
                </View>
              </Page>
          )
        })}
      </Document>
  )
}

const IMAGINS =
    '"La imaginación es la chispa que enciende los sueños y da forma al futuro. Es el poder de transformar lo imposible en posible, abriendo puertas a ideas y soluciones que desafían los límites. Cuando dejamos volar nuestra mente, conectamos con un potencial ilimitado para crear y reinventar el mundo."'

export default function PreviewPage ({ params }: PreviewPageProps) {
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
        const { data: favData, error: favError } = await supabase.from('stories').select('id, content').eq('fav', true)

        if (favError) {
          console.error('Error fetching favorite stories:', favError)
        } else {
          setFavoriteStories(favData || [])
        }

        // Fetch current story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', slug)
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
      <div className='relative min-h-screen overflow-hidden bg-white background-section-1-small'>
        <header id='top' className='container mx-auto max-w-6xl py-4 pt-6 px-8'>
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

        <main className=' lg:background-section-1'>
          <div className='container mx-auto px-4 py-8'>
            {isLoading
              ? (
                    <div className='flex justify-center items-center h-64'>
                      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary' />
                    </div>
                )
              : (
                    <Preview pages={story.content} hiddenPageText={IMAGINS} />
                )}
          </div>

          {favoriteStories?.length > 0 && (
              <section className='container mx-auto px-4 py-16'>
                <h2 className='text-3xl font-bold text-secondary mb-8 text-center'>{t('more_stories')}</h2>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 max-w-6xl mx-auto'>
                  {favoriteStories.map((story) => {
                    const coverImage = story.content?.[0]?.imageUrl
                    return (
                        <Link key={story.id} href={`/preview/${story.id}`}>
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
  )
}

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
import { useUser } from '@supabase/auth-helpers-react'

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
                  {/* eslint-disable-next-line multiline-ternary */}
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
                  {/* eslint-disable-next-line multiline-ternary */}
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

export default function StoryPage ({ params }: { params: { slug: string } }) {
  const t = useTranslations()
  const [story, setStory] = useState(null)
  const [isLoadingEpub, setIsLoadingEpub] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const router = useRouter()
  const user = useUser()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkSuperAdminStatus () {
      if (!user) return

      try {
        const { data, error } = await supabase.rpc('check_is_super_admin')

        if (error) throw error

        if (!data) {
          router.push('/stories')
        }
      } catch (error) {
        console.error('Error verificando estado de super admin:', error)
      }
    }

    checkSuperAdminStatus()
  }, [])

  useEffect(() => {
    async function loadStory () {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', Number(params.slug))
        .single()

      console.log(story)

      if (error) {
        console.error(t('error_fetching_story'), error)
        return
      }

      if (!story) {
        console.error(t('story_not_found'))
        return
      }

      setStory(story)
    }

    loadStory()
  }, [params.slug, router, supabase])

  const convertToEpub = async () => {
    if (!story) return

    setIsLoadingEpub(true)
    try {
      const response = await fetch('/api/generate-epub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id })
      })

      if (!response.ok) throw new Error(t('error_generating_epub'))

      const blob = await response.blob()
      saveAs(blob, `${story.title}.epub`)
    } catch (error) {
      console.error(t('error_converting_epub'), error)
    } finally {
      setIsLoadingEpub(false)
    }
  }

  const convertToPdf = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!story) return

    setIsLoadingPdf(true)
    try {
      const blob = await pdf(<MyDocument story={story} user={user} />).toBlob()
      saveAs(blob, `${story.title}.pdf`)
    } catch (error) {
      console.error(t('error_generating_pdf'), error)
    } finally {
      setIsLoadingPdf(false)
    }
  }

  const convertFav = async () => {
    if (!story) return

    const newFav = !story.fav

    const { error } = await supabase
      .from('stories')
      .update({ fav: newFav })
      .eq('id', story.id)

    setStory({ ...story, fav: newFav })
    if (error) {
      console.error('Error actualizando fav:', error)
    }
  }

  if (!story) {
    return <div />
  }

  return (
      <div className='background-section-4 h-full'>
        <div className='max-w-6xl mx-auto mt-14'>
          <StoryViewer pages={story.content} />
        </div>
        <div className='flex my-6 flex-col max-w-[1000px] mx-auto'>
          <div className='w-full flex gap-5'>
            <button
              onClick={convertFav}
              className='my-6 px-4 py-2 hover:cursor-pointer bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
            >
              {!story.fav ? 'fav' : 'unfav'}
            </button>
            <button
              onClick={convertToPdf}
              className='my-6 px-4 py-2 hover:cursor-pointer bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
            >
              Lulu
            </button>
          </div>
          <h1 className='text-3xl font-bold'>Prompts</h1>
          <h2 className='text-xl font-bold'>Idea:</h2>
          <p>{story.idea_prompt}</p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Covers:</h2>
          <p>{story.front_prompt}</p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Index:</h2>
          <p>{story.index_prompts?.map((p, i) =>
              <p key={i}>{p.content}</p>
          )}</p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Images:</h2>
          <p>{story.images_prompts?.map((p, i) =>
              <p key={i}><strong>{(i + 1) * 2}: </strong>{p}</p>
          )}</p>

        </div>
        <div className='mb-8 max-w-6xl mx-auto hidden md:flex justify-center'>
          <button
            onClick={convertToEpub}
            disabled={isLoadingEpub}
            className='px-4 py-2 bg-accent text-primary rounded hover:bg-secondary-100 transition-colors'
          >
          {isLoadingEpub ? t('generating_epub') : t('convert_to_epub')}
          </button>
          <button
            onClick={convertToPdf}
            disabled={isLoadingPdf}
            className='ml-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
          >
            {isLoadingPdf ? t('generating_pdf') : t('convert_to_pdf')}
          </button>
        </div>
      </div>
  )
}

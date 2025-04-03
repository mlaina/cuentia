'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Page,
  Text,
  Document,
  pdf,
  Image,
  Font,
  View
} from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import he from 'he'
import { useTranslations } from 'next-intl'
import { useUser } from '@supabase/auth-helpers-react'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

/*
  PRIMER PDF: COVERS A4 LANDSCAPE
  Contraportada a la IZQUIERDA, Portada a la DERECHA
*/
function CoversPDF ({ frontPage, backPage }) {
  // Si frontPage o backPage no existen, podrías controlar el caso
  return (
      <Document>
        <Page size='A4' orientation='landscape'>
          {/* Contenedor flex con 2 mitades */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              width: '100%',
              height: '100%'
            }}
          >
            {/* Izquierda: Contraportada */}
            <View style={{ flex: 1 }}>
              {backPage?.imageUrl && (
                  <Image
                    src={backPage.imageUrl}
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                  />
              )}
            </View>
            {/* Derecha: Portada */}
            <View style={{ flex: 1 }}>
              {frontPage?.imageUrl && (
                  <Image
                    src={frontPage.imageUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
              )}
            </View>
          </View>
        </Page>
      </Document>
  )
}

/*
  SEGUNDO PDF: CONTENIDO A5
  Ejemplo: Para cada página del contenido:
  - Generamos 2 páginas:
      1) Texto en la primera
      2) Imagen en la segunda
  o bien texto e imagen en la misma. Ajusta a tu gusto.
*/
function ContentPDF ({ contentPages }) {
  return (
      <Document>
        {contentPages.map((page, index) => {
          // Texto (decodificamos HTML a texto plano)
          const textContent = he
            .decode(marked(page.content || '').replace(/<[^>]*>/g, ''))
            .trim()

          return (
              <>

                {/* Página de TEXTO */}
                <Page key={`text-${index}`} size='A5' style={{ paddingLeft: 25, paddingRight: 25, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 20,
                      lineHeight: 1.5,
                      fontFamily: 'Roboto'
                    }}
                  >
                    {textContent}
                  </Text>
                </Page>

                {/* Página de IMAGEN (solo si existe) */}
                {page.imageUrl && (
                    <Page key={`img-${index}`} size='A5'>
                      <Image
                        src={page.imageUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Page>
                )}
              </>
          )
        })}
      </Document>
  )
}

export default function StoryPage ({ params }) {
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
        console.error('Error verificando super admin:', error)
      }
    }
    checkSuperAdminStatus()
  }, [user, supabase, router])

  useEffect(() => {
    async function loadStory () {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.push('/login')
        return
      }

      // Si `params.slug` es un string y tu ID en la BD es numérico, conviene parsear
      const { data: storyData, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', Number(params.slug))
        .single()

      if (error) {
        console.error(t('error_fetching_story'), error)
        return
      }
      if (!storyData) {
        console.error(t('story_not_found'))
        return
      }
      setStory(storyData)
    }
    loadStory()
  }, [params.slug, router, supabase, t])

  const convertFav = async () => {
    if (!story) return
    const newFav = !story.fav

    const { error } = await supabase
      .from('stories')
      .update({ fav: newFav })
      .eq('id', story.id)

    if (!error) {
      setStory({ ...story, fav: newFav })
    } else {
      console.error('Error actualizando fav:', error)
    }
  }

  // Botón Lulu: Genera 2 PDFs y los descarga
  const convertToLulu = async () => {
    if (!story) return

    setIsLoadingPdf(true)
    try {
      // Parseamos las páginas
      let pages = story.content
      if (typeof pages === 'string') {
        pages = JSON.parse(pages)
      }

      // Asegurar que al menos tengamos 2 páginas: front[0] y back[-1]
      const frontPage = pages[0]
      const backPage = pages[pages.length - 1]
      const contentPages = pages.slice(1, pages.length - 1)

      // 1) Generar PDF de portadas en A4 horizontal
      const coversBlob = await pdf(
          <CoversPDF frontPage={frontPage} backPage={backPage} />
      ).toBlob()
      saveAs(coversBlob, 'lulu-covers.pdf')

      // 2) Generar PDF de contenido en A5
      const contentBlob = await pdf(<ContentPDF contentPages={contentPages} />).toBlob()
      saveAs(contentBlob, 'lulu-content.pdf')
    } catch (error) {
      console.error('Error generando PDFs para Lulu:', error)
    } finally {
      setIsLoadingPdf(false)
    }
  }

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

  if (!story) {
    return <div /> // Loading o vacío
  }

  return (
      <div className='background-section-4 h-full'>
        <div className='max-w-5xl mx-auto mt-20'>
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

            {/* BOTÓN LULU => Descarga 2 PDFs */}
            <button
              onClick={convertToLulu}
              disabled={isLoadingPdf}
              className='my-6 px-4 py-2 hover:cursor-pointer bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
            >
              {isLoadingPdf ? 'Generando PDFs...' : 'Lulu'}
            </button>
          </div>

          {/* Resto de contenido/Prompts */}
          <h1 className='text-3xl font-bold'>Prompts</h1>
          <h2 className='text-xl font-bold'>Idea:</h2>
          <p>{story.idea_prompt}</p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Covers:</h2>
          <p>{story.front_prompt}</p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Index:</h2>
          <p>
            {story.index_prompts?.map((p, i) => (
                <p key={i}>{p.content}</p>
            ))}
          </p>
          <hr className='my-4' />
          <h2 className='text-xl font-bold'>Images:</h2>
          <p>
            {story.images_prompts?.map((p, i) => (
                <p key={i}>
                  <strong>{(i + 1) * 2}: </strong>
                  {p}
                </p>
            ))}
          </p>
        </div>

        <div className='mb-8 max-w-6xl mx-auto hidden md:flex justify-center'>
          {/* Ejemplo: otros botones para EPUB/PDF general */}
          <button
            onClick={convertToEpub}
            disabled={isLoadingEpub}
            className='px-4 py-2 bg-accent text-primary rounded hover:bg-secondary-100 transition-colors'
          >
            {isLoadingEpub ? t('generating_epub') : t('convert_to_epub')}
          </button>

          {/* convertToPdf original, si sigues usándolo aparte */}
          <button
            onClick={() => { /* ... */ }}
            className='ml-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
          >
            {t('convert_to_pdf')}
          </button>
        </div>
      </div>
  )
}

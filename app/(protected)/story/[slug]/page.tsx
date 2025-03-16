'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Page, Text, Document, pdf, Image, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import he from 'he'
import { useTranslations } from 'next-intl'
import DownloadMenu from '@/components/DownloadMenu'
import { Pencil, Save, X } from 'lucide-react'
import StoryEditViewer from '@/components/StoryEditViewer'
import { useUser } from '@supabase/auth-helpers-react'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

const MyDocument = ({ story }) => {
  const content =
      typeof story.content === 'string'
        ? JSON.parse(story.content)
        : story.content

  return (
      <Document>
        {content.map((page, index) => (
            <Page
              key={index}
              size='A5'
              style={{
                padding: 0,
                margin: 0,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {page.imageUrl && (
                  <Image
                    alt='page'
                    src={page.imageUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      margin: 0,
                      padding: 0
                    }}
                  />
              )}
              {page.content && index !== content.length - 1 && (
                  <Text
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 10,
                      right: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: 12,
                      borderRadius: 4,
                      zIndex: 10,
                      fontSize: 18,
                      lineHeight: 1.6,
                      letterSpacing: 0.5,
                      fontWeight: 500
                    }}
                  >
                    {he.decode(marked(page.content).replace(/<[^>]*>/g, ''))}
                  </Text>
              )}
            </Page>
        ))}
      </Document>
  )
}

export default function StoryPage ({ params }) {
  const t = useTranslations()
  const [story, setStory] = useState(null)
  const [isLoadingEpub, setIsLoadingEpub] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)

  // Controla el modo edición (mostrar StoryEditViewer)
  const [editing, setEditing] = useState(false)
  // Controla la visibilidad del popup
  const [showModal, setShowModal] = useState(false)

  const router = useRouter()
  const user = useUser()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadStory () {
      if (!user) {
        router.push('/login')
        return
      }

      const { data: loadedStory, error } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .eq('id', Number(params.slug))
        .single()

      if (error) {
        console.error(t('error_fetching_story'), error)
        return
      }

      if (!loadedStory) {
        console.error(t('story_not_found'))
        return
      }

      setStory(loadedStory)
    }

    loadStory()
  }, [params.slug, router, supabase, t])

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

  const handleSave = async () => {
    if (!story) return
    try {
      // Aquí iría la actualización real en la BD si lo deseas:
      // const { error } = await supabase
      //   .from('stories')
      //   .update({ content: JSON.stringify(story.content) })
      //   .eq('id', story.id)
      //   .eq('author_id', user.id)
      // if (error) throw error

      setEditing(false)
    } catch (error) {
      console.error(t('error_saving_story'), error)
    }
  }

  const handleChanges = (newContent) => {
    setStory({ ...story, content: newContent })
  }

  // Abre el popup al hacer clic en "Editar"
  const handleEditClick = () => {
    setShowModal(true)
  }

  // Cierra el popup sin hacer nada
  const handleCancelModal = () => {
    setShowModal(false)
  }

  // Cierra el popup y activa la edición
  const handleNextModal = () => {
    setShowModal(false)
    setEditing(true)
  }

  if (!story) {
    return <div />
  }

  return (
      <div className='background-section-4 h-full relative'>
        {/* Botonera superior (cuando NO estás editando) */}
        {!editing && (
            <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-end gap-4 pr-4'>
              <button
                onClick={handleEditClick}
                className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
              >
                <Pencil className='w-5 h-5' />
              </button>
              <DownloadMenu
                onConvertToEpub={convertToEpub}
                onConvertToPdf={convertToPdf}
                isLoadingEpub={isLoadingEpub}
                isLoadingPdf={isLoadingPdf}
                t={t}
              />
            </div>
        )}

        {/* Botonera superior (cuando SÍ estás editando) */}
        {editing && (
            <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-end gap-4 pr-4'>
              <button
                onClick={() => setEditing(false)}
                className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
              <button
                onClick={handleSave}
                className='flex items-center justify-center w-10 h-10 text-white rounded-full bg-secondary transition-colors'
              >
                <Save className='w-5 h-5' />
              </button>
            </div>
        )}

        {/* Vista normal (StoryViewer) */}
        {!editing && (
            <div className='max-w-6xl mx-auto pb-10'>
              <StoryViewer pages={story.content} />
            </div>
        )}

        {/* Vista edición (StoryEditViewer) */}
        {editing && (
            <div className='max-w-6xl mx-auto pb-10'>
              <StoryEditViewer pages={story.content} onChanges={handleChanges} />
            </div>
        )}

        {/* Modal (popup) para personalizar/editar */}
        {showModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
              {/* Contenedor del popup */}
              <div className='bg-white p-6 rounded-lg shadow-md max-w-5xl w-full'>
                <h2 className='text-xl font-semibold mb-10'>
                  Personaliza y edita tu cuento
                </h2>
                <div className='flex gap-4'>
                  {/* Columna izquierda */}
                  <div className='flex-1 text-secondary p-4 rounded flex justify-center items-center'>
                    <p className='font-medium mb-2'>
                      Edita el texto manualmente o con ayuda de la IA
                    </p>

                  </div>
                  <div className='flex justify-center items-center'>
                    <img
                      src='/popup-edit.svg'
                      alt='Inteligencia Artificial'
                      className='w-full'
                    />
                  </div>
                  {/* Columna derecha */}
                  <div className='flex-1 text-accent-700 p-4 rounded flex justify-center items-center'>
                    <p className='font-medium mb-2'>
                    Reemplaza las ilustraciones por imágenes o genera nuevas
                    </p>
                    {/* Más detalles o iconos aquí */}
                  </div>
                </div>
                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={handleCancelModal}
                    className='border border-gray-300 px-4 py-2 rounded'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleNextModal}
                    className='bg-secondary text-white px-4 py-2 rounded'
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

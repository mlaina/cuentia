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
import { Pencil, Save, X, Share2, AlertTriangle } from 'lucide-react'
import StoryEditViewer from '@/components/StoryEditViewer'
import { useUser } from '@supabase/auth-helpers-react'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

const MyDocument = ({ story }) => {
  const pages = typeof story.content === 'string' ? JSON.parse(story.content) : story.content

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
                  {isBackCover // Contraportada: se pinta la imagen en la izquierda
                    ? page.imageUrl && (
                      <Image
                        alt='Cover'
                        src={page.imageUrl || '/placeholder.svg'}
                        style={{
                          left: '5%',
                          width: '110%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                      />
                    ) // Páginas intermedias: se pinta el texto en la izquierda
                    : !isCover &&
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
                  {isCover // Portada: se pinta la imagen en la derecha
                    ? page.imageUrl && (
                      <Image
                        alt='Cover'
                        src={page.imageUrl || '/placeholder.svg'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) // Páginas intermedias: se pinta la imagen en la derecha
                    : !isBackCover &&
                      page.imageUrl && (
                          <Image
                            alt='Imagen de página'
                            src={page.imageUrl || '/placeholder.svg'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                      )}
                </View>
              </Page>
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
  // Controla el modo edición (mostrar StoryEditViewer)
  const [editing, setEditing] = useState(false)
  // Controla la visibilidad del popup
  const [showModal, setShowModal] = useState(false)
  // Nuevos estados para los modales de confirmación
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false)
  const [showPrintRequestModal, setShowPrintRequestModal] = useState(false)

  const router = useRouter()
  const user = useUser()
  const supabase = createClientComponentClient()

  const loadStory = async () => {
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

    document.title = loadedStory?.title + ' - Imagins'
    if (error) {
      console.error(t('error_fetching_story'), error)
      return
    }

    if (!loadedStory) {
      console.error(t('story_not_found'))
      return
    }

    // Validar el contenido de la historia
    const content = typeof loadedStory.content === 'string' ? JSON.parse(loadedStory.content) : loadedStory.content

    // Verificar si hay páginas incompletas (excluyendo la portada)
    const hasIncompletePages = content.some((page, index) => {
      if (index === 0) return false // Ignorar la portada
      return !page.content && !page.imageUrl
    })

    if (hasIncompletePages) {
      router.push(`/creator/${loadedStory.id}`)
      return
    }

    setStory(loadedStory)
  }

  useEffect(() => {
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

  const handleSaveClick = () => {
    setShowSaveConfirmModal(true)
  }

  const handleSaveConfirm = async () => {
    if (!story) return
    try {
      setEditing(false)
      await supabase.from('stories').update(story).eq('id', story.id)
      setShowSaveConfirmModal(false)
    } catch (error) {
      console.error(t('error_saving_story'), error)
    }
  }

  const handleCancelClick = () => {
    setShowCancelConfirmModal(true)
  }

  const handleCancelConfirm = () => {
    setEditing(false)
    loadStory()
    setShowCancelConfirmModal(false)
  }

  const handleChanges = (page, newContent) => {
    setStory((prevStory) => {
      const updatedContent = [...prevStory.content]
      updatedContent[page] = { ...updatedContent[page], content: newContent }
      return { ...prevStory, content: updatedContent }
    })
  }

  const handleImageChanges = (page, newImageUrl) => {
    setStory((prevStory) => {
      const updatedContent = [...prevStory.content]
      updatedContent[page] = { ...updatedContent[page], imageUrl: newImageUrl }
      return { ...prevStory, content: updatedContent }
    })
  }

  const handleEditClick = () => {
    setShowModal(true)
  }

  const handleCancelModal = () => {
    setShowModal(false)
  }

  const handleNextModal = () => {
    setShowModal(false)
    setEditing(true)
  }

  if (!story) {
    return <div />
  }
  function encodeId (id) {
    return Buffer.from(String(id), 'utf8').toString('base64')
  }

  const handleShare = async () => {
    const encodedId = encodeId(story.id)
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/my-story/${encodedId}`

    await supabase.from('stories').update({ public: true }).eq('id', story.id)

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          url: shareUrl
        })
      } catch (error) {
        console.error(t('error_sharing'), error)
        copyToClipboard(shareUrl)
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(t('text_copied'))
    } catch (err) {
      console.error(t('error_copying'), err)
    }
  }

  const handlePrintRequest = async () => {
    try {
      // Here you would add the actual logic to store the print request in your database
      await supabase.from('requests').insert({
        story_id: story.id,
        user_id: user.id,
        email: user.email
      })

      // Show confirmation modal
      setShowPrintRequestModal(true)

      // Automatically hide the modal after 3 seconds
      setTimeout(() => {
        setShowPrintRequestModal(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting print request:', error)
    }
  }

  return (
      <>
        <div className='background-section-4 h-full relative pt-6'>
          {/* Botonera superior (cuando NO estás editando) */}
          {!editing && (
              <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-end gap-4 pr-4'>
                <button
                  onClick={handleEditClick}
                  className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
                >
                  <Pencil className='w-5 h-5' />
                </button>
                <button
                  onClick={handleShare}
                  className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
                >
                  <Share2 className='w-5 h-5' />
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
                  onClick={handleCancelClick}
                  className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
                <button
                  onClick={handleSaveClick}
                  className='flex items-center justify-center w-10 h-10 text-white rounded-full bg-secondary transition-colors'
                >
                  <Save className='w-5 h-5' />
                </button>
              </div>
          )}

          {/* Vista normal (StoryViewer) */}
          {!editing && (
              <div className='container max-w-5xl mx-auto'>
                <StoryViewer pages={story.content} />
                <div className='flex justify-center mt-8 mb-8'>
                  <button
                    onClick={handlePrintRequest}
                    className='bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors'
                  >
                    {t('request_print')}
                  </button>
                </div>
              </div>
          )}

          {/* Vista edición (StoryEditViewer) */}
          {editing && (
              <div className='max-w-6xl mx-auto'>
                <StoryEditViewer
                  storyId={story.id}
                  pages={story.content}
                  handleImageChanges={handleImageChanges}
                  handleChanges={handleChanges}
                />
              </div>
          )}

          {!editing && (
              <div className='mb-4 max-w-6xl mx-auto md:hidden flex justify-start gap-4 pl-4'>
                <DownloadMenu
                  onConvertToEpub={convertToEpub}
                  onConvertToPdf={convertToPdf}
                  isLoadingEpub={isLoadingEpub}
                  isLoadingPdf={isLoadingPdf}
                  t={t}
                  bot
                />
                <button
                  onClick={handleShare}
                  className='flex items-center justify-center w-10 h-10 border border-gray-600 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
                >
                  <Share2 className='w-5 h-5' />
                </button>
              </div>
          )}

          {/* Modal (popup) para personalizar/editar */}
          {showModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                {/* Contenedor del popup */}
                <div className='bg-white p-6 rounded-lg shadow-md max-w-5xl w-full'>
                  <h2 className='text-xl font-semibold mb-10'>{t('customize_story_title')}</h2>
                  <div className='flex gap-4'>
                    {/* Columna izquierda */}
                    <div className='flex-1 text-secondary p-4 rounded flex justify-center items-center'>
                      <p className='font-medium mb-2'>{t('customize_story_edit_text')}</p>
                    </div>
                    <div className='flex justify-center items-center'>
                      <img src='/popup-edit.svg' alt={t('ai_alt') || 'Inteligencia Artificial'} className='w-full' />
                    </div>
                    {/* Columna derecha */}
                    <div className='flex-1 text-accent-700 p-4 rounded flex justify-center items-center'>
                      <p className='font-medium mb-2'>{t('customize_story_replace_images')}</p>
                    </div>
                  </div>
                  <div className='mt-4 flex justify-end gap-2'>
                    <button onClick={handleCancelModal} className='border border-gray-300 px-4 py-2 rounded'>
                      {t('cancel')}
                    </button>
                    <button onClick={handleNextModal} className='bg-secondary text-white px-4 py-2 rounded'>
                      {t('next')}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Modal de confirmación para guardar */}
          {showSaveConfirmModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                <div className='bg-white p-6 rounded-lg shadow-md max-w-md w-full'>
                  <div className='flex items-center gap-3 mb-4'>
                    <Save className='w-6 h-6 text-secondary' />
                    <h2 className='text-xl font-semibold'>{t('confirm_save_title') || 'Save Changes'}</h2>
                  </div>
                  <p className='mb-6'>
                    {t('confirm_save_message') ||
                        '¿Estás seguro de que quieres guardar los cambios realizados en tu historia?'}
                  </p>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setShowSaveConfirmModal(false)}
                      className='border border-gray-300 px-4 py-2 rounded'
                    >
                      {t('cancel')}
                    </button>
                    <button onClick={handleSaveConfirm} className='bg-secondary text-white px-4 py-2 rounded'>
                      {t('save') || 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Modal de confirmación para cancelar */}
          {showCancelConfirmModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                <div className='bg-white p-6 rounded-lg shadow-md max-w-md w-full'>
                  <div className='flex items-center gap-3 mb-4'>
                    <AlertTriangle className='w-6 h-6 text-orange-500' />
                    <h2 className='text-xl font-semibold'>{t('confirm_cancel_title') || 'Descartar Cambios'}</h2>
                  </div>
                  <p className='mb-6'>
                    {t('confirm_cancel_message') ||
                        '¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.'}
                  </p>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setShowCancelConfirmModal(false)}
                      className='border border-gray-300 px-4 py-2 rounded'
                    >
                      {t('continue_editing') || 'Seguir editando'}
                    </button>
                    <button onClick={handleCancelConfirm} className='bg-orange-500 text-white px-4 py-2 rounded'>
                      {t('discard_changes') || 'Descartar cambios'}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Print Request Confirmation Modal */}
          {showPrintRequestModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
                <div className='bg-white p-6 rounded-lg shadow-md max-w-md w-full'>
                  <div className='flex items-center justify-center mb-4'>
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-8 w-8 text-green-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                  </div>
                  <h2 className='text-xl font-semibold text-center mb-2'>{t('print_request_received')}</h2>
                  <p className='text-center text-gray-600 mb-4'>{t('print_request_notification')}</p>
                </div>
              </div>
          )}
        </div>
      </>
  )
}

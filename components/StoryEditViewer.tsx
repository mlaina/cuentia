'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Edit, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCredits } from '@/context/CreditsContext'

export default function StoryEditViewer ({
  story,
  pages = [],
  storyId,
  handleChanges,
  handleImageChanges
}: {
  story: any
  pages: any[]
  storyId: string
  handleChanges: (index: number, newContent: string) => void
  handleImageChanges: (index: number, newImageUrl: string) => void
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const t = useTranslations()

  // Estados para prompt de texto
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [coverTitle, setCoverTitle] = useState(story.title ?? '')
  const [coverAuthor, setCoverAuthor] = useState(story.author_cover ?? '')
  const [coverPos, setCoverPos] = useState(story.position_title?.position ?? 'bottom')
  const [coverColor, setCoverColor] = useState(story.position_title?.color ?? '#ffffff')
  const [ideaText, setIdeaText] = useState(story.idea ?? '')
  // Estados para prompt de imagen
  const [showImagePrompt, setShowImagePrompt] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [referenceImageError, setReferenceImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModifyingCurrentImage, setIsModifyingCurrentImage] = useState(false)
  const [keepEssence, setKeepEssence] = useState(true)

  // Créditos
  const { decreaseCredits, checkCreditsBeforeOperation } = useCredits()

  // Navegación de páginas
  const goToPage = (index: number) => {
    setCurrentPage(index)
  }
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
  }
  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  // === FUNCIONES DE EDICIÓN DE TEXTO (páginas intermedias) ===
  const editContent = async (index: number, prompt: string) => {
    setIsLoading(true)
    try {
      // Restar créditos inmediatamente (si no usas checkCreditsBeforeOperation)
      await decreaseCredits(1)

      const response = await fetch('/api/edit/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, index, storyId })
      })
      const data = await response.json()

      if (data.error) {
        console.error('Error:', data.error)
      } else {
        handleChanges(index, data.newContent)
        setAIPrompt('')
        setShowAIPrompt(false)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // === FUNCIONES DE EDICIÓN DE IMÁGENES (páginas intermedias) ===
  const generateImage = async (index: number, prompt: string) => {
    setIsImageLoading(true)
    setReferenceImageError('')
    try {
      // Restar créditos
      await decreaseCredits(7)

      // Primero, conseguir un "prompt" mejorado
      const response1 = await fetch('/api/edit/prompt-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, storyId, index })
      })
      const { description } = await response1.json()

      // Preparar body
      const requestBody: any = { description }
      if (referenceImage) {
        requestBody.image_prompt = referenceImage
      }

      // Generar imagen
      const response2 = await fetch('/api/story/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data2 = await response2.json()
      if (data2.error) {
        throw new Error(data2.error)
      } else {
        handleImageChanges(index, data2.image)
        setImagePrompt('')
        setReferenceImage(null)
        setShowImagePrompt(false)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      setReferenceImageError(t('image_generation_error'))
    } finally {
      setIsImageLoading(false)
    }
  }

  const modifyCurrentImage = async (index: number, prompt: string) => {
    setIsImageLoading(true)
    setReferenceImageError('')
    try {
      // Restar créditos
      await decreaseCredits(7)

      const current = pages[index]

      const response1 = await fetch('/api/edit/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const { description } = await response1.json()

      console.log('description', description)
      const requestBody = {
        description,
        image_prompt: current.imageUrl,
        seed: keepEssence
      }
      const response2 = await fetch('/api/story/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data2 = await response2.json()
      if (data2.error) {
        throw new Error(data2.error)
      } else {
        handleImageChanges(index, data2.image)
        setImagePrompt('')
        setShowImagePrompt(false)
        setIsModifyingCurrentImage(false)
      }
    } catch (error) {
      console.error('Error modifying image:', error)
      setReferenceImageError(t('image_generation_error'))
    } finally {
      setIsImageLoading(false)
    }
  }

  // Subir imagen manual
  const uploadImage = async () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'

    fileInput.onchange = async (event: any) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataURL = e.target?.result
        if (!dataURL) return

        try {
          const response = await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataURL })
          })
          const result = await response.json()
          if (result.image) {
            handleImageChanges(currentPage, result.image)
          } else {
            console.error('Error uploading image:', result.error)
          }
        } catch (error) {
          console.error(t('error_converting_epub'), error)
        }
      }
      reader.readAsDataURL(file)
    }

    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  // Manejo de imagen de referencia
  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceImageError('')
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setReferenceImageError(t('invalid_image_format'))
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setReferenceImageError(t('image_too_large'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (!e.target?.result) return
      setReferenceImage(e.target.result as string)
    }
    reader.onerror = () => {
      setReferenceImageError(t('error_reading_image'))
    }
    reader.readAsDataURL(file)
  }

  // Renderiza el prompt emergente para AI de imagen
  const renderImagePromptUI = () => {
    const current = pages[currentPage]

    return (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/70 transition-opacity rounded-md p-6'>
          <div className='bg-white rounded-lg p-4 w-full max-w-md'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              {isModifyingCurrentImage ? t('modify_current_image') : t('generate_ai_image_prompt')}
            </h3>

            {/* Text prompt input */}
            <textarea
              disabled={isImageLoading}
              className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-3'
              rows={4}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder={
                  isModifyingCurrentImage
                    ? t('enter_ai_image_modification_prompt')
                    : t('enter_ai_image_prompt_placeholder')
                }
            />

            {/* Solo mostramos la referencia si NO estamos modificando la imagen actual */}
            {!isModifyingCurrentImage && (
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-sm font-medium text-gray-700'>{t('reference_image')}</label>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImageLoading}
                      className='text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1'
                    >
                      <Upload size={14} />
                      {t('upload_reference')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/jpeg,image/png,image/webp,image/jpg'
                      className='hidden'
                      onChange={handleReferenceImageUpload}
                      disabled={isImageLoading}
                    />
                  </div>

                  {referenceImageError && (
                      <div className='text-red-500 text-xs mb-2'>{referenceImageError}</div>
                  )}

                  {referenceImage
                    ? (
                      <div className='relative h-32 bg-gray-100 rounded-md overflow-hidden'>
                        <img
                          src={referenceImage}
                          alt={t('reference_image')}
                          className='h-full w-auto mx-auto object-contain'
                        />
                        <button
                          type='button'
                          onClick={() => setReferenceImage(null)}
                          className='absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80'
                          disabled={isImageLoading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      )
                    : (
                      <div className='h-16 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm'>
                  <span className='text-center px-4'>
                    {t('no_reference_image')}
                    <br />
                    <span className='text-xs'>{t('supported_formats')}</span>
                  </span>
                      </div>
                      )}
                </div>
            )}

            {/* Si modificamos la imagen actual, mostramos previsualización y checkbox "mantener esencia" */}
            {isModifyingCurrentImage && (
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='text-sm font-medium text-gray-700'>{t('current_image')}</label>
                  </div>
                  <div className='relative h-32 bg-gray-100 rounded-md overflow-hidden'>
                    <img
                      src={current.imageUrl || '/placeholder.svg'}
                      alt={t('current_image')}
                      className='h-full w-auto mx-auto object-contain'
                    />
                  </div>
                  <div className='flex items-center mt-3'>
                    <input
                      type='checkbox'
                      id='keep-essence'
                      checked={keepEssence}
                      onChange={(e) => setKeepEssence(e.target.checked)}
                      className='h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded'
                    />
                    <label htmlFor='keep-essence' className='ml-2 block text-sm text-gray-700'>
                      {t('keep_essence')}
                    </label>
                  </div>
                </div>
            )}

            {referenceImageError && (
                <div className='text-red-500 text-xs mb-2'>{referenceImageError}</div>
            )}

            {/* Botones de acción */}
            <div className='flex justify-end space-x-2'>
              <button
                onClick={() => {
                  setShowImagePrompt(false)
                  setReferenceImage(null)
                  setReferenceImageError('')
                  setIsModifyingCurrentImage(false)
                  setKeepEssence(true)
                }}
                className='px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100'
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (!imagePrompt.trim()) return
                  if (isModifyingCurrentImage) {
                    // Primero checkCreditsBeforeOperation(6)...
                    checkCreditsBeforeOperation(6, async () => await modifyCurrentImage(currentPage, imagePrompt))
                  } else {
                    checkCreditsBeforeOperation(7, async () => await generateImage(currentPage, imagePrompt))
                  }
                }}
                disabled={!imagePrompt.trim() || isImageLoading}
                className='px-3 py-1.5 text-sm text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isImageLoading
                  ? (
                    <span className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                      {isModifyingCurrentImage ? t('modifying_image') : t('generating_image')}
                </span>
                    )
                  : isModifyingCurrentImage
                    ? (
                        t('modify')
                      )
                    : (
                        t('generate')
                      )}
              </button>
            </div>
          </div>
        </div>
    )
  }

  // Página actual
  const current = pages[currentPage] || {}

  return (
      <div className='mx-auto p-4 py-2 md:py-4 max-w-6xl'>
        {/* Contenedor de la página */}
        <div className='relative bg-white shadow-md w-[1120px] h-[700px] flex justify-center items-center'>
          {/* eslint-disable-next-line multiline-ternary */}
          {currentPage === 0 ? (
              /* ---------------------- PORTADA ---------------------- */
              <div className='w-full h-full flex'>
                {/* === Columna IZQ: formulario de metadatos === */}
                <div className='w-1/2 flex flex-col gap-4 p-6 overflow-y-auto'>
                  <label className='text-sm font-medium'>{t('title')}</label>
                  <input
                    className='border p-2 rounded-md'
                    value={coverTitle}
                    onChange={(e) => setCoverTitle(e.target.value)}
                  />

                  <label className='text-sm font-medium mt-2'>{t('author')}</label>
                  <input
                    className='border p-2 rounded-md'
                    value={coverAuthor}
                    onChange={(e) => setCoverAuthor(e.target.value)}
                  />

                  <label className='text-sm font-medium mt-2'>{t('title_position')}</label>
                  <select
                    className='border p-2 rounded-md'
                    value={coverPos}
                    onChange={(e) => setCoverPos(e.target.value as 'top' | 'center' | 'bottom')}
                  >
                    <option value='top'>{t('top')}</option>
                    <option value='center'>{t('center')}</option>
                    <option value='bottom'>{t('bottom')}</option>
                  </select>

                  <label className='text-sm font-medium mt-2'>{t('title_color')}</label>
                  <input
                    type='color'
                    className='h-10 w-16 p-1 border rounded-md'
                    value={coverColor}
                    onChange={(e) => setCoverColor(e.target.value)}
                  />
                </div>

                {/* === Columna DER: imagen con overlay de edición === */}
                <div className='w-1/2 relative group p-6 flex items-center justify-center'>
                  <img
                    src={story.clean_covers?.front || '/placeholder.svg'}
                    alt='Cover'
                    className='max-h-full max-w-full object-cover rounded-md'
                  />

                  {/* reutilizamos el overlay que ya tienes */}
                  {showImagePrompt
                    ? renderImagePromptUI()
                    : (
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md'>
                            <button
                              onClick={uploadImage}
                              className='bg-white w-[300px] text-black px-4 py-2 rounded-md mb-4'
                            >
                              {t('upload_image')}
                            </button>

                            <button
                              onClick={() => {
                                setIsModifyingCurrentImage(true)
                                setShowImagePrompt(true)
                              }}
                              className='bg-blue-600 w-[300px] text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center gap-2'
                            >
                              <Edit className='h-5 w-5' />
                              {t('modify_current_image')}
                            </button>

                            <button
                              onClick={() => setShowImagePrompt(true)}
                              className='bg-pink-600 w-[300px] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2'
                            >
                              {t('generate_ai_image')}
                            </button>
                          </div>
                      )}
                </div>
              </div>
          ) : currentPage === pages.length - 1 ? (
              <div className='w-full h-full flex'>

                {/* Izquierda → imagen back con overlay */}
                <div className='w-1/2 h-full relative group p-6 flex items-center justify-end'>

                  {/* Imagen */}
                  <img
                    src={story.clean_covers?.back || '/placeholder.svg'}
                    alt='Back cover'
                    className='max-h-full max-w-full object-cover rounded-md'
                  />

                  {/* Overlay de edición (reutiliza tu UI) */}
                  {showImagePrompt
                    ? renderImagePromptUI(/* si necesitas otro UI ponlo aquí */)
                    : (
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md'>

                            <button
                              onClick={uploadImage /* o tu handler específico para back */}
                              className='bg-white w-[300px] text-black px-4 py-2 rounded-md mb-4'
                            >
                              {t('upload_image')}
                            </button>

                            <button
                              onClick={() => {
                                setIsModifyingCurrentImage(true)
                                setShowImagePrompt(true) // o setShowBackImagePrompt
                              }}
                              className='bg-blue-600 w-[300px] text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center gap-2'
                            >
                              <Edit className='h-5 w-5' />
                              {t('modify_current_image')}
                            </button>

                            <button
                              onClick={() => setShowImagePrompt(true)} // o setShowBackImagePrompt
                              className='bg-pink-600 w-[300px] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2'
                            >
                              {t('generate_ai_image')}
                            </button>
                          </div>
                      )}
                </div>

                {/* Derecha → textarea con la idea */}
                <div className='w-1/2 h-full p-6 flex items-center'>
                  <textarea
                    className='w-full h-full border-2 border-secondary rounded-md p-4 resize-none'
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    placeholder={t('story_idea_placeholder')}
                  />
                </div>

              </div>
          ) : (
              // =====================
              // PÁGINAS INTERMEDIAS => SE PUEDE EDITAR
              // =====================
              <div className='w-full h-full flex'>
                {/* Columna de texto */}
                <div className='w-1/2 flex flex-col justify-between p-4'>
                  <div className='overflow-y-auto h-full'>
                <textarea
                  className='text-sm md:text-md w-full bg-white border-2 border-secondary text-black rounded-md p-4 shadow-sm focus:outline-none resize-none'
                  rows={15}
                  value={current.content}
                  onChange={(e) => handleChanges(currentPage, e.target.value)}
                />
                    {showAIPrompt && (
                        <div className='mt-4 mb-4'>
                          <div className='flex flex-col space-y-2'>
                            <label htmlFor='ai-prompt' className='text-sm font-medium text-gray-700'>
                              {t('ai_edit_prompt')}
                            </label>
                            <textarea
                              disabled={isLoading}
                              id='ai-prompt'
                              className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
                              rows={3}
                              value={aiPrompt}
                              onChange={(e) => setAIPrompt(e.target.value)}
                              placeholder={t('enter_ai_prompt_placeholder')}
                            />
                            <div className='flex justify-end space-x-2'>
                              <button
                                onClick={() => setShowAIPrompt(false)}
                                className='px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100'
                              >
                                {t('cancel')}
                              </button>
                              <button
                                onClick={() => {
                                  if (aiPrompt.trim()) {
                                    checkCreditsBeforeOperation(1, async () => await editContent(currentPage, aiPrompt))
                                  }
                                }}
                                disabled={!aiPrompt.trim() || isLoading}
                                className='px-3 py-1.5 text-sm text-white bg-secondary rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                              >
                                {isLoading
                                  ? (
                                    <span className='flex items-center'>
                              <svg
                                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                />
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                />
                              </svg>
                                      {t('processing')}
                            </span>
                                    )
                                  : (
                                      t('apply_ai_edit')
                                    )}
                              </button>
                            </div>
                          </div>
                        </div>
                    )}
                    {!showAIPrompt && (
                        <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-end gap-4 pr-4'>
                          {/* Botón para abrir prompt de edición con IA */}
                          <button
                            onClick={() => setShowAIPrompt(true)}
                            className='flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md bg-secondary transition-colors hover:bg-secondary/90'
                          >
                            <Edit className='w-4 h-4' />
                            <span>{t('edit_with_ai')}</span>
                          </button>
                        </div>
                    )}
                  </div>
                  <span className='text-sm text-gray-500 font-bold'>{currentPage * 2 - 1}</span>
                </div>

                {/* Columna de imagen */}
                <div className='w-1/2 flex flex-col justify-between p-4'>
                  <div className='relative group'>
                    {current.imageUrl && (
                        <>
                          {/* Imagen */}
                          <div className='relative max-h-full max-w-full rounded-md overflow-hidden'>
                            <img
                              src={current.imageUrl || '/placeholder.svg'}
                              alt='Image for page'
                              className='max-h-full max-w-full rounded-md object-cover'
                            />
                            <div className='absolute bottom-0 left-0 w-full h-[6%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none rounded-b-md' />
                          </div>
                          {/* Overlay de edición al hover */}
                          {showImagePrompt
                            ? (
                                renderImagePromptUI()
                              )
                            : (
                              <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md'>
                                <button
                                  onClick={uploadImage}
                                  className='bg-white w-[300px] text-black px-4 py-2 rounded-md mb-4'
                                >
                                  {t('upload_image')}
                                </button>
                                <button
                                  onClick={() => {
                                    setIsModifyingCurrentImage(true)
                                    setShowImagePrompt(true)
                                  }}
                                  className='bg-blue-600 w-[300px] text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center gap-2'
                                >
                                  <Edit className='h-5 w-5' />
                                  {t('modify_current_image')}
                                </button>
                                <button
                                  onClick={() => setShowImagePrompt(true)}
                                  className='bg-pink-600 w-[300px] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2'
                                >
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  >
                                    <path d='M12 2v6.5M12 13v9' />
                                    <path d='M19 9c0 3.5-3 3.5-3 3.5s-3 0-3-3.5 3-3.5 3-3.5 3 0 3 3.5z' />
                                    <path d='M5 13c0 3.5 3 3.5 3 3.5s3 0 3-3.5-3-3.5-3-3.5-3 0-3 3.5z' />
                                  </svg>
                                  {t('generate_ai_image')}
                                </button>
                              </div>
                              )}
                        </>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Navegación: botones y miniaturas */}
        <div className='flex flex-col px-4 pt-2'>
          <div className='flex items-center gap-4'>
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className='p-2 rounded-full bg-black/80 text-white disabled:opacity-50 transition-opacity hover:bg-black/90'
              aria-label='Página anterior'
            >
              <ChevronLeft className='w-3 h-3 md:w-6 md:h-6' />
            </button>

            <div className='flex-1 overflow-x-auto'>
              <div className='flex gap-3 md:justify-center py-6'>
                {pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`shadow-md shadow-inner bg-gray-100 border border-secondary-100 relative flex-shrink-0 ${(pages <= 18 ? ' w-10 h-14 md:w-20 md:h-28 ' : ' w-10 h-14  md:w-14 md:h-20 ')} rounded-md overflow-hidden transition-all duration-200 ${
                            index === (currentPage === 0 ? 0 : Math.floor(currentPage / 2) + 1)
                                ? 'ring-2 ring-secondary-100 ring-offset-1 border-none'
                                : 'hover:ring-2 hover:ring-secondary hover:ring-offset-1'
                        }`}
                      aria-label={index === 0 || index === pages.length - 1 ? `Ir a la ${index === 0 ? 'portada' : 'contraportada'}` : `Ir a la página ${(index - 1) * 2 + 1}-${(index - 1) * 2 + 2}`}
                    >
                      {page.imageUrl
                        ? (
                              <Image
                                src={page.imageUrl}
                                alt={index === 0 ? 'Portada' : index === pages.length - 1 ? 'Cover' : `Miniatura ${(index - 1) * 2 + 1}-${(index - 1) * 2 + 2}`}
                                fill
                                className='object-cover opacity-80'
                              />
                          )
                        : (
                              <div className='flex items-center justify-center w-full h-full border-secondary-100 text-secondary text-sm font-medium'>
                                {index === 0 ? 'Portada' : index === pages.length - 1 ? 'Cover' : `${(index - 1) * 2 + 1}-${(index - 1) * 2 + 2}`}
                              </div>
                          )}
                    </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={(currentPage === 0 ? 0 : Math.floor(currentPage / 2) + 1) === pages.length - 1}
              className='p-2 rounded-full bg-black/80 text-white disabled:opacity-50 transition-opacity hover:bg-black/90'
              aria-label='Página siguiente'
            >
              <ChevronRight className='w-3 h-3 md:w-6 md:h-6' />
            </button>
          </div>
        </div>
      </div>
  )
}

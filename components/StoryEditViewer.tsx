'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Edit, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function StoryEditViewer ({ pages = [], storyId, handleChanges, handleImageChanges }) {
  const [currentPage, setCurrentPage] = useState(0)
  const t = useTranslations()
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showImagePrompt, setShowImagePrompt] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [referenceImage, setReferenceImage] = useState(null)
  const [referenceImageError, setReferenceImageError] = useState('')
  const fileInputRef = useRef(null)

  const goToPage = (index) => {
    setCurrentPage(index)
  }

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const editContent = async (index, prompt) => {
    setIsLoading(true)
    fetch('/api/edit/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, index, storyId })
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false)
        if (data.error) {
          console.error('Error:', data.error)
        } else {
          handleChanges(index, data.newContent)
          // Only hide the prompt area after successful completion
          setAIPrompt('')
          setShowAIPrompt(false)
        }
      })
      .catch((error) => {
        setIsLoading(false)
        console.error('Error:', error)
      })
  }

  const generateImage = async (index, prompt) => {
    setIsImageLoading(true)
    setReferenceImageError('')

    try {
      // First get the enhanced prompt from the API
      const response1 = await fetch('/api/edit/prompt-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, storyId, index })
      })
      const { description } = await response1.json()

      // Prepare the request body
      const requestBody = { description }

      // Add reference image if available
      if (referenceImage) {
        requestBody.image_prompt = referenceImage
      }

      // Generate the image
      const response2 = await fetch('/api/story/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data2 = await response2.json()
      if (data2.error) {
        throw new Error(data2.error)
      } else {
        handleImageChanges(currentPage, data2.image)
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

  const uploadImage = async () => {
    // Crea un input file de forma dinámica
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'

    fileInput.onchange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Lee el archivo como Data URL para enviarlo en el body
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataURL = e.target.result

        try {
          const response = await fetch('/api/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataURL })
          })
          const result = await response.json()
          if (result.image) {
            // Actualiza el estado del page actual con la nueva URL
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

  const handleReferenceImageUpload = (event) => {
    setReferenceImageError('')
    const file = event.target.files[0]
    if (!file) return

    // Check file type - only allow common raster formats
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setReferenceImageError(t('invalid_image_format'))
      return
    }

    // Check file size (limit to 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setReferenceImageError(t('image_too_large'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setReferenceImage(e.target.result)
    }
    reader.onerror = () => {
      setReferenceImageError(t('error_reading_image'))
    }
    reader.readAsDataURL(file)
  }

  const current = pages[currentPage]

  const renderImagePromptUI = () => {
    return (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/70 transition-opacity rounded-md p-6'>
          <div className='bg-white rounded-lg p-4 w-full max-w-md'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>{t('generate_ai_image_prompt')}</h3>

            {/* Text prompt input */}
            <textarea
              disabled={isImageLoading}
              className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-3'
              rows={4}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder={t('enter_ai_image_prompt_placeholder')}
            />

            {/* Reference image section */}
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

              {referenceImageError && <div className='text-red-500 text-xs mb-2'>{referenceImageError}</div>}

              {referenceImage
                ? (
                  <div className='relative h-32 bg-gray-100 rounded-md overflow-hidden'>
                    <img
                      src={referenceImage || '/placeholder.svg'}
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

            {/* Action buttons */}
            <div className='flex justify-end space-x-2'>
              <button
                onClick={() => {
                  setShowImagePrompt(false)
                  setReferenceImage(null)
                  setReferenceImageError('')
                }}
                className='px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100'
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (imagePrompt.trim()) {
                    generateImage(currentPage, imagePrompt)
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
                      {t('generating_image')}
                </span>
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

  return (
      <div className='mx-auto p-4 py-2 md:py-4 max-w-6xl'>
        {/* Contenedor de la página */}
        <div className='relative bg-white shadow-md w-[1120px] h-[700px] flex justify-center items-center'>
          {/* eslint-disable-next-line multiline-ternary */}
          {currentPage === 0 ? (
              // Primera página: solo imagen alineada a la derecha
              <div className='w-full h-full flex justify-end items-center'>
                {current.imageUrl && (
                    <div className='group w-full h-full flex justify-end items-center p-6'>
                      <img
                        src={current.imageUrl || '/placeholder.svg'}
                        alt='Portada'
                        className='max-h-full max-w-full object-cover rounded-md'
                      />
                      {showImagePrompt
                        ? (
                            renderImagePromptUI()
                          )
                        : (
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button onClick={uploadImage} className='bg-white w-[300px] text-black px-4 py-2 rounded-md mb-4'>
                              {t('upload_image')}
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
                    </div>
                )}
              </div>
              // eslint-disable-next-line multiline-ternary
          ) : currentPage === pages.length - 1 ? (
              // Última página: solo imagen alineada a la izquierda
              <div className='w-full h-full flex justify-start items-center p-4'>
                {current.imageUrl && (
                    <div className='group w-full h-full flex justify-end items-center p-6'>
                      <img
                        src={current.imageUrl || '/placeholder.svg'}
                        alt='Contraportada'
                        className='max-h-full max-w-full object-cover rounded-md'
                      />
                      {showImagePrompt
                        ? (
                            renderImagePromptUI()
                          )
                        : (
                          <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button onClick={uploadImage} className='bg-white w-[300px] text-black px-4 py-2 rounded-md mb-4'>
                              {t('upload_image')}
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
                    </div>
                )}
              </div>
          ) : (
              // Páginas intermedias: dos columnas (texto e imagen)
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
                                    editContent(currentPage, aiPrompt)
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
                          {/* AI edition */}
                          <button
                            onClick={() => setShowAIPrompt((prev) => !prev)}
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

                <div className='w-1/2 flex flex-col justify-between p-4'>
                  <div className='relative group'>
                    {current.imageUrl && (
                        <>
                          {/* Imagen de la página */}
                          <div className='relative max-h-full max-w-full rounded-md overflow-hidden'>
                            <img
                              src={current.imageUrl || '/placeholder.svg'}
                              alt='Image for page'
                              className='max-h-full max-w-full rounded-md object-cover'
                            />
                            <div className='absolute bottom-0 left-0 w-full h-[6%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none rounded-b-md' />
                          </div>
                          {/* Overlay al hover o cuando se muestra el prompt */}
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
              <ChevronLeft className='w-5 h-5' />
            </button>

            <div className='flex-1 overflow-x-auto'>
              <div className='flex gap-3 md:justify-center py-6'>
                {pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`shadow-md shadow-inner bg-gray-100 border border-secondary-100 relative flex-shrink-0 w-10 h-14 md:w-20 md:h-28 rounded-md overflow-hidden transition-all duration-200 ${
                            index === currentPage
                                ? 'ring-2 ring-secondary-100 ring-offset-1 border-none'
                                : 'hover:ring-2 hover:ring-secondary hover:ring-offset-1'
                        }`}
                      aria-label={`Ir a la página ${index + 1}`}
                    >
                      {page.imageUrl
                        ? (
                          <Image
                            src={page.imageUrl || '/placeholder.svg'}
                            alt={`Miniatura ${index + 1}`}
                            fill
                            className='object-cover opacity-80'
                          />
                          )
                        : (
                          <div className='flex items-center justify-center w-full h-full border-secondary-100 text-secondary text-sm font-medium'>
                            {index + 1}
                          </div>
                          )}
                    </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className='p-2 rounded-full bg-black/80 text-white disabled:opacity-50 transition-opacity hover:bg-black/90'
              aria-label='Página siguiente'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
  )
}

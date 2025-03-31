'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Atom } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function StoryEditViewer ({ pages = [], handleChanges }) {
  const [currentPage, setCurrentPage] = useState(0)
  const t = useTranslations()

  const goToPage = (index) => {
    setCurrentPage(index)
  }

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const current = pages[currentPage]

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
                        src={current.imageUrl}
                        alt='Portada'
                        className='max-h-full max-w-full object-cover rounded-md'
                      />
                      <div
                        className='
                              absolute
                              inset-0
                              flex
                              flex-col
                              items-center
                              justify-center
                              bg-black/50
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                            '
                      >
                        <button className='bg-white w-[300px]  text-black px-4 py-2 rounded-md mb-4'>
                          {t('upload_image')}
                        </button>
                        <button className='bg-pink-600 w-[300px]  text-white px-4 py-2 rounded-md'>
                          {t('generate_image')}
                        </button>
                      </div>
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
                        src={current.imageUrl}
                        alt='Contraportada'
                        className='max-h-full max-w-full object-cover rounded-md'
                      />
                      <div
                        className='
                              absolute
                              inset-0
                              flex
                              flex-col
                              items-center
                              justify-center
                              bg-black/50
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                            '
                      >
                        <button className='bg-white w-[300px]  text-black px-4 py-2 rounded-md mb-4'>
                          {t('upload_image')}
                        </button>
                        <button className='bg-pink-600 w-[300px]  text-white px-4 py-2 rounded-md'>
                          {t('generate_image')}
                        </button>
                      </div>
                    </div>
                )}
                </div>
          ) : (
          // Páginas intermedias: dos columnas (texto y imagen)
              <div className='w-full h-full flex'>
                {/* Columna de texto */}
                <div className='w-1/2 flex flex-col justify-between p-4'>
                  <div className='overflow-y-auto h-full'>
                    <textarea
                      className='
                        w-full
                        bg-white
                        border-2
                        border-secondary
                        text-black
                        rounded-md
                        p-4
                        shadow-sm
                        focus:outline-none
                        resize-none
                      '
                      rows={15}
                      value={current.content}
                      onChange={(e) => handleChanges(currentPage, e.target.value)}
                    />
                    <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-end gap-4 pr-4'>
                      <button
                        className='flex items-center justify-center w-10 h-10 text-white rounded-full bg-secondary transition-colors'
                      >
                        <Atom className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                  <span className='text-sm text-gray-500 font-bold'>
                  {currentPage * 2 - 1}
                  </span>
                </div>

                <div className='w-1/2 flex flex-col justify-between p-4'>
                  <div className='relative group'>
                    {current.imageUrl && (
                        <>
                          {/* La imagen en sí */}
                          <div className='relative max-h-full max-w-full rounded-md overflow-hidden'>
                            <img
                              src={current.imageUrl}
                              alt='Image for page'
                              className='max-h-full max-w-full rounded-md object-cover'
                            />
                            <div
                              className='absolute bottom-0 left-0 w-full h-[6%] bg-gradient-to-t from-black/90 to-transparent pointer-events-none rounded-b-md'
                            />
                          </div>

                          {/* Overlay que aparece al hover */}
                          <div
                            className='
                              absolute
                              inset-0
                              flex
                              flex-col
                              items-center
                              justify-center
                              bg-black/50
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                              rounded-md
                            '
                          >
                            <button className='bg-white w-[300px]  text-black px-4 py-2 rounded-md mb-4'>
                              Subir imagen
                            </button>
                            <button className='bg-pink-600 w-[300px]  text-white px-4 py-2 rounded-md'>
                              Generar imagen
                            </button>
                          </div>
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
                            src={page.imageUrl}
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

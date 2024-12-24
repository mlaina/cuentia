'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HTMLFlipBook from 'react-pageflip'
import LoadingText from '@/components/LoadingText'

interface StoryPage {
  content: string
  imageUrl: string
}

interface StoryViewerProps {
  pages: StoryPage[]
  stream?: boolean
}

function Lome ({ pages }) {
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setFadeIn(true)
    }, 1000)
  }, [])

  return (
      <>
        {pages[0].imageUrl
          ? (
            <>
              <img
                src={pages[0].imageUrl}
                alt='Cover Image'
                className='absolute inset-0 w-full h-full object-cover rounded-r-sm'
              />
              <div
                className={`${
                      fadeIn ? 'opacity-100' : 'opacity-0'
                  } transition-opacity ease-in duration-1000 absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent`}
              />
              <div
                className={`${
                      fadeIn ? 'opacity-100' : 'opacity-0'
                  } transition-opacity ease-in duration-1000 absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/0 via-white/50 to-white/0`}
              />
            </>
            )
          : null}
      </>
  )
}

export default function Component ({ pages = [], stream = false }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showFormattedText, setShowFormattedText] = useState<boolean[]>(new Array(pages.length).fill(!stream))
  const bookRef = useRef<any>(null)

  const goToPage = (pageIndex: number) => {
    const totalPages = (pages.length - 2) * 2 + 2 // Account for cover and back cover
    const validPageIndex = Math.max(0, Math.min(pageIndex * 2, totalPages - 1))
    setCurrentPage(validPageIndex)
    bookRef.current.pageFlip().turnToPage(validPageIndex)
  }

  const nextPage = () => {
    setCurrentPage(currentPage + 1)
    bookRef.current.pageFlip().flipNext()
  }

  const prevPage = () => {
    setCurrentPage(currentPage - 1)
    bookRef.current.pageFlip().flipPrev()
  }

  useEffect(() => {
    if (stream) {
      pages.forEach((page, index) => {
        if (page.content !== null) {
          setTimeout(() => {
            setShowFormattedText(prev => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }, 11000)
        }
      })
    }
  }, [pages, stream])

  function formatTextWithBoldQuotes (text: string) {
    if (!text) return null

    const parts = text.split(/(\*\*.*?\*\*|".*?"|_.*?_)/).filter(Boolean)

    return (
        <>
          {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index}>{part.slice(2, -2)}</strong>
            } else if (part.startsWith('_') && part.endsWith('_')) {
              return <strong key={index}>{part.slice(1, -1)}</strong>
            } else if (part.startsWith('"') && part.endsWith('"')) {
              return <strong key={index}>{part.slice(1, -1)}</strong>
            } else {
              return part
            }
          })}
        </>
    )
  }

  function formatStoryText (text: string | undefined) {
    if (!text) return null

    const cleanText = text.replace(/\\"/g, '"').replace(/\\n/g, '\n')
    const paragraphs = cleanText.split('\n\n')

    return paragraphs.map((paragraph, index) => (
        <p key={index} className='text-justify leading-relaxed mb-4'>
          {formatTextWithBoldQuotes(paragraph)}
        </p>
    ))
  }

  return (
      <div className='mx-auto p-4 py-2 md:py-4 max-w-6xl'>
        <div className='relative'>
          <HTMLFlipBook
            width={550}
            height={700}
            size='stretch'
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.2}
            showCover
            mobileScrollSupport
            onFlip={(e: any) => {
              setCurrentPage(Math.floor(e.data))
            }}
            ref={bookRef}
            className='mx-auto cursor-grab'
            style={{
              '--page-shadow-color': 'rgba(0, 0, 0, 0.1)'
            } as React.CSSProperties}
          >
            <div className='page bg-white shadow-md flex justify-center items-center'>
              {pages[0].imageUrl
                ? (
                  <>
                    <img
                      src={pages[0].imageUrl}
                      alt='Cover Image'
                      className='absolute inset-0 w-full h-full object-cover rounded-r-sm'
                    />
                    <Lome pages={pages} />
                  </>
                  )
                : (
                  <div className='relative border-glow-container rounded-sm max-w-full max-h-full overflow-hidden shadow-inner shadow-md'>
                    <img alt='cover' src='/placeholder-covers.svg' className='w-full h-full object-cover ' />
                    <div className='border-glow absolute inset-0 rounded-sm pointer-events-none' />
                  </div>
                  )}
            </div>

            {pages.slice(1, -1).flatMap((page, index) => [
              <div key={`text-${index * 2}`} className='page bg-white shadow-md'>
                <div className='page-content h-full flex items-center pb-8'>
                  <div className='flex pl-8 relative'>
                    <div className='prose prose-sm max-w-none overflow-y-auto items-center'>
                      <div>
                        {page.content
                          ? (
                              showFormattedText[index + 1]
                                ? (
                                <div className='pr-8'>
                                  {formatStoryText(page.content)}
                                </div>
                                  )
                                : (
                                <LoadingText finalText={page.content} />
                                  )
                            )
                          : (
                            <LoadingText />
                            )}
                      </div>
                    </div>
                  </div>
                  <span className='absolute bottom-4 left-8 text-sm  text-gray-500 font-bold'>
                  {index * 2 + 1}
                </span>
                </div>
              </div>,

              <div key={`image-${index * 2 + 1}`} className='page bg-white shadow-md'>
                <div className='page-content h-full flex justify-center pb-8 items-center px-8'>
                  {page.imageUrl
                    ? (
                      <img src={page.imageUrl} alt={`Image for page ${index * 2 + 2}`} className='max-h-full max-w-full rounded-md' />
                      )
                    : (
                      <div className='relative border-glow-container rounded-md max-w-full max-h-full overflow-hidden shadow-inner shadow-md'>
                        <img alt='loading' src='/placeholder.svg' className='w-full h-full object-cover ' />
                        <div className='border-glow absolute inset-0 rounded-md pointer-events-none transition-opacity' />
                      </div>
                      )}
                </div>
                <span className='absolute bottom-4 right-8 text-sm text-gray-500 font-bold'>
                {index * 2 + 2}
              </span>
              </div>
            ])}

            <div className='page bg-white shadow-md flex justify-center items-center'>
              {pages[pages.length - 1].imageUrl
                ? (
                  <>
                    <img
                      src={pages[pages.length - 1].imageUrl}
                      alt='Back Cover Image'
                      className='absolute inset-0 w-full h-full object-cover'
                    />
                    <div className='absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/30 via-transparent to-transparent' />
                    <div className='absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/0 via-white/50 to-white/0' />
                  </>
                  )
                : (
                  <div className='relative border-glow-container rounded-sm max-w-full max-h-full overflow-hidden shadow-inner shadow-md'>
                    <img alt='loading' src='/placeholder-covers.svg' className='w-full h-full object-cover ' />
                    <div className='border-glow absolute inset-0 rounded-sm pointer-events-none' />
                  </div>
                  )}
            </div>
          </HTMLFlipBook>

          <div className='flex flex-col px-4 pt-2'>
            <div className='flex items-center gap-4'>
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className='p-2 rounded-full bg-black/80 text-white disabled:opacity-50 transition-opacity hover:bg-black/90'
                aria-label='Página anterior'
              >
                <ChevronLeft className='w-6 h-6' />
              </button>

              <div className='flex-1 overflow-x-auto'>
                <div className='flex gap-3 justify-center py-6'>
                  {pages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`shadow-md shadow-inner bg-gray-100 border border-secondary-100 relative flex-shrink-0 w-20 h-28 rounded-md overflow-hidden transition-all duration-200 ${
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
                              alt={index === 0 ? 'Portada' : index === pages.length - 1 ? 'Contraportada' : `Miniatura ${(index - 1) * 2 + 1}-${(index - 1) * 2 + 2}`}
                              fill
                              className='object-cover opacity-80'
                            />
                            )
                          : (
                            <div className='flex items-center justify-center w-full h-full border-secondary-100 text-secondary text-sm font-medium'>
                              {index === 0 ? 'Portada' : index === pages.length - 1 ? 'Contra' : `${(index - 1) * 2 + 1}-${(index - 1) * 2 + 2}`}
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
                <ChevronRight className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

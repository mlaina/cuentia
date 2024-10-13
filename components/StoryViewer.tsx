'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StoryPage {
  content: string
  imageUrl: string
}

interface StoryViewerProps {
  pages: StoryPage[]
}

export default function StoryViewer({ pages = [] }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const goToPage = (pageIndex: number) => {
    setCurrentPage(Math.max(0, Math.min(pageIndex, pages.length - 1)))
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return (
    <div className="mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex p-8 gap-8 min-h-[60vh]">
          <div className="w-1/2 flex ">
            <p className="text-md">{pages[currentPage].content ? pages[currentPage].content : <i className={'text-gray-400'}>Generando texto...</i>}</p>
          </div>
          <div className="w-1/2">
            {pages[currentPage].imageUrl ?
                <Image
                    src={pages[currentPage].imageUrl}
                    alt={`Ilustración de la página ${currentPage + 1}`}
                    width={400}
                    height={300}
                    className="rounded-lg object-cover w-full h-full"
                    priority
                />
                :
                <div className="animate-pulse bg-gray-300 w-[500px] h-[500px] rounded-lg flex items-center justify-center animate-heartbeat" />
            }
          </div>
        </div>

        <div className="flex justify-between items-center px-8 py-4 bg-gray-100">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-2 rounded-full bg-primary text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium">
            Página {currentPage + 1} de {pages.length}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            className="p-2 rounded-full bg-primary text-white disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex overflow-x-auto p-4 bg-gray-200">
          {pages.map((page, index) => (
              <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`flex-shrink-0 w-20 h-20 mr-2 rounded-md overflow-hidden bg-gray-500 border-4 ${
                      index === currentPage ? 'border-primary' : 'border-transparent'
                  }`}
              >
                {page.imageUrl ?
                    <img src={page.imageUrl} alt={`${index + 1}`} className="w-full h-full object-cover opacity-80"/>
                    :
                    <div
                        className="flex items-center  justify-center w-full h-full text-white text-lg font-semibold">{index + 1}</div>
                }
              </button>
          ))}
        </div>
      </div>
    </div>
  )
}

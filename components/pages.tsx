'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Page {
    text: string
    image: string
}

const pages: Page[] = [
  {
    text: 'Había una vez, en un bosque encantado, un pequeño conejo llamado Hop. Hop era muy curioso y siempre estaba buscando nuevas aventuras.',
    image: 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
  },
  {
    text: 'Un día, Hop encontró una puerta mágica escondida entre los arbustos. Con mucho cuidado, la abrió y entró en un mundo de colores brillantes.',
    image: 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
  },
  {
    text: 'En este nuevo mundo, Hop hizo muchos amigos: mariposas que brillaban como estrellas y flores que cantaban dulces melodías.',
    image: 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
  }
]

export default function LibroDeCuentos () {
  const [currentPage, setCurrentPage] = useState(0)

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
        <div className='flex justify-center items-center min-h-screen bg-amber-50'>
            <div className='relative w-[800px] h-[500px] bg-white shadow-2xl rounded-r-lg overflow-hidden'>
                <div className="absolute left-0 top-0 w-full h-full bg-[url('/paper-texture.png')] opacity-20 pointer-events-none" />
                <div className='flex h-full'>
                    <AnimatePresence mode='wait'>
                        <motion.div
                          key={currentPage}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.5 }}
                          className='flex-1 p-8 flex flex-col justify-center'
                        >
                            <p className='text-xl leading-relaxed font-serif'>{pages[currentPage].text}</p>
                        </motion.div>
                    </AnimatePresence>
                    <AnimatePresence mode='wait'>
                        <motion.div
                          key={currentPage}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.5 }}
                          className='w-[300px] h-full bg-amber-100 flex items-center justify-center'
                        >
                            <img
                              src={pages[currentPage].image}
                              alt={`Ilustración para la página ${currentPage + 1}`}
                              className='max-w-full max-h-full object-contain'
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className='absolute left-0 top-0 w-12 h-full bg-amber-200 rounded-r-lg shadow-inner' />
                <div className='absolute flex justify-between w-full bottom-4 px-4'>
                    <Button
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className='bg-amber-700 hover:bg-amber-800 text-white'
                    >
                        <ChevronLeft className='mr-2 h-4 w-4' /> Anterior
                    </Button>
                    <Button
                      onClick={nextPage}
                      disabled={currentPage === pages.length - 1}
                      className='bg-amber-700 hover:bg-amber-800 text-white'
                    >
                        Siguiente <ChevronRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
  )
}

'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export default function DownloadMenu ({
  onConvertToEpub,
  onConvertToPdf,
  isLoadingEpub,
  isLoadingPdf,
  t
}) {
  const [open, setOpen] = useState(false)

  const handleEpubClick = () => {
    setOpen(false)
    onConvertToEpub()
  }

  const handlePdfClick = () => {
    setOpen(false)
    onConvertToPdf()
  }

  return (
        <div className='relative inline-block text-left'>
            {/* Botón con ícono de descarga */}
            <button
              onClick={() => setOpen(!open)}
              className='flex items-center justify-center w-10 h-10 bg-secondary text-white rounded-full hover:bg-secondary-700 transition-colors'
              aria-label={t('download')}
            >
                <Download className='w-5 h-5' />
            </button>

            {/* Menú flotante */}
            {open && (
                <div className='absolute right-0 mt-2 w-44 bg-white rounded shadow-lg border z-20'>
                    <button
                      onClick={handleEpubClick}
                      disabled={isLoadingEpub}
                      className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-60'
                    >
                        {isLoadingEpub ? t('generating_epub') : t('convert_to_epub')}
                    </button>
                    <button
                      onClick={handlePdfClick}
                      disabled={isLoadingPdf}
                      className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-60'
                    >
                        {isLoadingPdf ? t('generating_pdf') : t('convert_to_pdf')}
                    </button>
                </div>
            )}
        </div>
  )
}

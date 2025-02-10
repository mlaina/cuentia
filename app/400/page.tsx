'use client'

import { useTranslations } from 'next-intl'

export default function Error400 () {
  const t = useTranslations()

  return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
            <h1 className='text-5xl font-bold text-red-600'>{t('error_400_title')}</h1>
            <p className='mt-4 text-lg text-primary'>{t('error_400_description')}</p>
            <a
              href='/'
              className='mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-700'
            >
                {t('go_back_home')}
            </a>
        </div>
  )
}

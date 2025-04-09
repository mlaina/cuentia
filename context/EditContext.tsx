'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type EditContextType = {
  isEditing: boolean
  setIsEditing: (val: boolean) => void
}

const EditContext = createContext<EditContextType | undefined>(undefined)

export const EditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  const [lastPath, setLastPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== lastPath) {
      if (isEditing) {
        // Bloqueamos navegación: volvemos al path anterior
        setShowConfirm(true)
        setPendingUrl(pathname)
        router.push(lastPath) // volvemos atrás
      } else {
        setLastPath(pathname)
      }
    }
  }, [pathname])

  const confirmNavigation = () => {
    if (pendingUrl) {
      setIsEditing(false)
      setShowConfirm(false)
      setLastPath(pendingUrl)
      router.push(pendingUrl)
      setPendingUrl(null)
    }
  }

  const cancelNavigation = () => {
    setShowConfirm(false)
    setPendingUrl(null)
  }

  return (
      <EditContext.Provider value={{ isEditing, setIsEditing }}>
        {children}

        {showConfirm && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
              <div className='bg-white p-8 rounded-md shadow-md max-w-sm w-full'>
                <p className='font-bold text-lg text-center'>{t('CHANGES_NOT_SAVED')}</p>
                <p className='mt-2 text-center text-gray-600 text-sm'>{t('CHANGES_ARE_YOU_SURE')}</p>
                <div className='flex gap-4 mt-6'>
                  <button
                    onClick={cancelNavigation}
                    className='flex-1 px-4 py-2 border rounded text-gray-700'
                  >
                    {t('NO')}
                  </button>
                  <button
                    onClick={confirmNavigation}
                    className='flex-1 px-4 py-2 bg-secondary text-white rounded'
                  >
                    {t('YES')}
                  </button>
                </div>
              </div>
            </div>
        )}
      </EditContext.Provider>
  )
}

export const useEditContext = () => {
  const ctx = useContext(EditContext)
  if (!ctx) throw new Error('useEditContext must be used inside EditProvider')
  return ctx
}

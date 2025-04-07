'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'use-intl'

interface CreditsContextProps {
    credits: number
    isLoading: boolean
    fetchCredits: () => Promise<void>
    updateCredits: (newAmount: number) => Promise<void>
    decreaseCredits: (cost: number) => Promise<void>
    checkCreditsBeforeOperation: (cost: number, onConfirm: () => Promise<void>) => void
}

interface ModalInfo {
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm?: () => void
    onCancel?: () => void
}

const CreditsContext = createContext<CreditsContextProps>({
  credits: 0,
  isLoading: true,
  fetchCredits: async () => {},
  updateCredits: async () => {},
  decreaseCredits: async () => {},
  checkCreditsBeforeOperation: () => {}
})

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const t = useTranslations()

  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const [modal, setModal] = useState<ModalInfo>({ open: false })

  const fetchCredits = async () => {
    if (!user) {
      setCredits(0)
      setIsLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setCredits(data?.credits ?? 0)
    } catch (err) {
      console.error('Error al obtener créditos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCredits = async (newAmount: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ credits: newAmount })
        .eq('user_id', user.id)
        .select('credits')
        .single()

      if (error) throw error
      setCredits(data?.credits ?? 0)
    } catch (err) {
      console.error('Error al actualizar créditos:', err)
    }
  }

  const decreaseCredits = async (cost: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('decrement_credits', {
        user_uuid: user.id,
        cost
      })
      if (error) throw error
      
      if (data < 0 || cost > credits) {
        router.push('/pricing')
        return
      }
      
      setCredits(data ?? 0)
    } catch (err) {
      console.error('Error al decrementar créditos:', err)
    }
  }

  const checkCreditsBeforeOperation = async (cost: number, onConfirm: () => Promise<void>) => {
    if (!user) return

    // Insuficientes
    if (credits < cost) {
      setModal({
        open: true,
        title: t('insufficient_credits_title'),
        message: t('insufficient_credits_message'),
        confirmLabel: t('insufficient_credits_confirm_label'),
        cancelLabel: t('insufficient_credits_cancel_label'),
        onConfirm: () => {
          setModal({ open: false })
          router.push('/pricing')
        },
        onCancel: () => setModal({ open: false })
      })
      return
    }

    if (credits - cost < 50) {
      setModal({
        open: true,
        title: t('low_credits_title'),
        message: t('low_credits_message', { remaining: credits - cost }),
        confirmLabel: t('low_credits_confirm_label'),
        cancelLabel: t('low_credits_cancel_label'),
        onConfirm: async () => {
          setModal({ open: false })
          await onConfirm()
        },
        onCancel: () => setModal({ open: false })
      })
    } else {
      await onConfirm()
    }
  }

  useEffect(() => {
    if (user) {
      fetchCredits()
    } else {
      setCredits(0)
      setIsLoading(false)
    }
  }, [user])

  return (
        <CreditsContext.Provider
          value={{
            credits,
            isLoading,
            fetchCredits,
            updateCredits,
            decreaseCredits,
            checkCreditsBeforeOperation
          }}
        >
            {children}

            {modal.open && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-6 rounded shadow-md max-w-sm w-full'>
                        <h2 className='text-xl font-bold mb-4'>{modal.title}</h2>
                        <p className='mb-6'>{modal.message}</p>
                        <div className='flex justify-end space-x-2'>
                            {modal.cancelLabel && (
                                <button
                                  onClick={modal.onCancel}
                                  className='px-4 py-2 border rounded'
                                >
                                    {modal.cancelLabel}
                                </button>
                            )}
                            {modal.confirmLabel && (
                                <button
                                  onClick={modal.onConfirm}
                                  className='px-4 py-2 bg-secondary text-white rounded'
                                >
                                    {modal.confirmLabel}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </CreditsContext.Provider>
  )
}

export const useCredits = () => useContext(CreditsContext)

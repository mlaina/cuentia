'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

interface CreditsContextProps {
    credits: number
    isLoading: boolean
    fetchCredits: () => Promise<void>
    updateCredits: (newAmount: number) => Promise<void>
    decreaseCredits: (cost: number) => Promise<void>

    // NUEVO: función para verificar créditos y mostrar modal si < 50
    checkCreditsBeforeOperation: (cost: number, onConfirm: () => Promise<void>) => void
}

// Para el modal:
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

  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Estado para manejar el modal de advertencia o error
  const [modal, setModal] = useState<ModalInfo>({ open: false })

  // 1. Cargar los créditos desde tu tabla 'users'
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

  // 2. Actualizar créditos directamente
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

  // 3. Disminuir créditos de forma atómica con RPC
  const decreaseCredits = async (cost: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('decrement_credits', {
        user_uuid: user.id,
        cost
      })
      if (error) throw error
      // 'data' es el valor de créditos tras la resta
      setCredits(data ?? 0)
    } catch (err) {
      console.error('Error al decrementar créditos:', err)
    }
  }

  /**
     * NUEVO:
     * Verifica si al consumir `cost` créditos se quedará:
     * - por debajo de 0 => no hay suficientes créditos => modal error => ir a /pricing
     * - entre 0 y 50 => modal de alerta => continuar o cancelar
     * - más de 50 => ejecuta `onConfirm` directamente
     */
  const checkCreditsBeforeOperation = (cost: number, onConfirm: () => Promise<void>) => {
    // Si no hay usuario, no podemos hacer nada
    if (!user) return

    // Caso 1: No hay créditos suficientes
    if (credits < cost) {
      setModal({
        open: true,
        title: 'Créditos insuficientes',
        message: 'No tienes créditos suficientes para esta operación.',
        confirmLabel: 'Ir a Pricing',
        onConfirm: () => {
          setModal({ open: false })
          router.push('/pricing')
        },
        // No hay botón de cancelar, o si quieres lo pones
        cancelLabel: 'Cancelar',
        onCancel: () => setModal({ open: false })
      })
      return
    }

    // Caso 2: Se quedaría con menos de 50
    if (credits - cost < 50) {
      setModal({
        open: true,
        title: 'Bajos créditos',
        message: `Tras esta operación te quedarían ${credits - cost} créditos. ¿Quieres continuar?`,
        confirmLabel: 'Sí, continuar',
        cancelLabel: 'Cancelar',
        onConfirm: async () => {
          // Al confirmar, cerramos modal y hacemos la operación
          setModal({ open: false })
          await onConfirm()
        },
        onCancel: () => {
          setModal({ open: false })
        }
      })
      return
    }

    // Caso 3: Quedan más de 50 => ejecutamos directo
    //         Consumimos créditos y luego onConfirm
    decreaseCredits(cost).then(onConfirm).catch((err) => {
      console.error('Error en decreaseCredits:', err)
    })
  }

  // Cargar créditos cuando haya usuario
  useEffect(() => {
    if (user) {
      fetchCredits()
    } else {
      setCredits(0)
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            {/** MODAL GLOBAL (simple) */}
            {modal.open && (
                <div
                  className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'
                    // Ajusta tu estilo de overlay
                >
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

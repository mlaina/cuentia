'use client'

import Header from '@/components/ui/header'
import type React from 'react'
import { useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useTranslations } from 'next-intl'

export default function ProtectedLayout ({
  children
}: {
    children: React.ReactNode
}) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedbackStatus('idle')
    setErrorMessage('')

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      // Convertir FormData a un objeto JavaScript
      const feedbackData = {
        comment: formData.get('comment')?.toString() || '',
        rating: formData.get('rating')?.toString() || 'neutral',
        user_id: user?.id,
        email: user?.email,
        path: window.location.pathname
      }

      console.log('Enviando feedback:', feedbackData)

      // Enviar a Supabase
      const { error } = await supabase.from('feedback').insert([feedbackData])

      if (error) {
        console.error('Error al enviar feedback:', error)
        setFeedbackStatus('error')
        setErrorMessage(t('feedback_error_default'))
      } else {
        setFeedbackStatus('success')
        form.reset()
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      setFeedbackStatus('error')
      setErrorMessage(t('feedback_error_unexpected'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetFeedbackForm = () => {
    setFeedbackStatus('idle')
    setErrorMessage('')
    const dialog = document.getElementById('feedback-dialog') as HTMLDialogElement
    dialog?.close()
  }

  return (
        <div className='flex flex-col h-screen'>
            <main className='flex-1 text-black'>
                <Header />
                <div className='h-full pt-12'>{children}</div>
            </main>

            {/* Botón de feedback en la esquina inferior derecha */}
            <div className='fixed bottom-2 right-2 md:right-4 z-50'>
                <button
                  className='bg-primary text-white text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 hover:bg-primary/90 shadow-md'
                  onClick={() => {
                    setFeedbackStatus('idle')
                    setErrorMessage('')
                    const dialog = document.getElementById('feedback-dialog') as HTMLDialogElement
                    dialog?.showModal()
                  }}
                >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                    </svg>
                    <span>{t('feedback_button_text')}</span>
                </button>
            </div>

            {/* Diálogo de feedback con HTML nativo */}
            <dialog id='feedback-dialog' className='p-0 rounded-lg shadow-lg backdrop:bg-black/50 w-full max-w-[425px]'>
                <div className='p-6'>
                    {feedbackStatus === 'success'
                      ? (
                        <div className='text-center py-6'>
                            <div className='mb-4 flex justify-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='48'
                                  height='48'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='text-green-500'
                                >
                                    <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                                    <polyline points='22 4 12 14.01 9 11.01' />
                                </svg>
                            </div>
                            <h3 className='text-lg font-medium mb-2'>{t('feedback_success_title')}</h3>
                            <p className='text-sm text-gray-500 mb-6'>{t('feedback_success_description')}</p>
                            <button onClick={resetFeedbackForm} className='px-4 py-2 bg-primary text-white rounded-md'>
                                {t('feedback_success_button')}
                            </button>
                        </div>
                        )
                      : (
                        <>
                            <div className='mb-4'>
                                <h3 className='text-lg font-medium'>{t('feedback_modal_title')}</h3>
                                <p className='text-sm text-gray-500'>{t('feedback_modal_description')}</p>
                            </div>

                            {feedbackStatus === 'error' && (
                                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm'>
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmitFeedback} className='space-y-4'>
                                <div className='space-y-2'>
                                    <label htmlFor='comment' className='block text-sm font-medium'>
                                        {t('feedback_label_comment')}
                                    </label>
                                    <textarea
                                      id='comment'
                                      name='comment'
                                      placeholder={t('feedback_placeholder_comment')}
                                      required
                                      className='w-full min-h-[100px] p-2 border rounded-md'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <span className='block text-sm font-medium'>{t('feedback_label_rating')}</span>
                                    <div className='flex space-x-4'>
                                        <label className='flex items-center space-x-2'>
                                            <input type='radio' name='rating' value='negative' />
                                            <span>{t('feedback_rating_negative')}</span>
                                        </label>
                                        <label className='flex items-center space-x-2'>
                                            <input type='radio' name='rating' value='neutral' defaultChecked />
                                            <span>{t('feedback_rating_neutral')}</span>
                                        </label>
                                        <label className='flex items-center space-x-2'>
                                            <input type='radio' name='rating' value='positive' />
                                            <span>{t('feedback_rating_positive')}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className='flex justify-end space-x-2 pt-2'>
                                    <button
                                      type='button'
                                      className='px-4 py-2 border rounded-md'
                                      onClick={() => {
                                        const dialog = document.getElementById('feedback-dialog') as HTMLDialogElement
                                        dialog?.close()
                                      }}
                                    >
                                        {t('feedback_button_cancel')}
                                    </button>
                                    <button type='submit' className='px-4 py-2 bg-primary text-white rounded-md' disabled={isSubmitting}>
                                        {isSubmitting ? t('feedback_button_submitting') : t('feedback_button_submit')}
                                    </button>
                                </div>
                            </form>
                        </>
                        )}
                </div>
            </dialog>
        </div>
  )
}

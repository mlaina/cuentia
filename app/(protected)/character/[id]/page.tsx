'use client'

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Protagonist {
  id?: number
  author_id: string
  name: string
  physical_description?: string
  personality?: string
  age?: number | string
  gender?: string
  hair_type?: string
  hair_color?: string
  skin_color?: string
  height?: string
  accessories?: string[]
  extra_appearance?: string
  extra_personality?: string
  stories?: Array<{ title: string }>
}

export default function EditProtagonistPage () {
  const supabase = useSupabaseClient()
  const user = useUser()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)
  const t = useTranslations()
  const protagonistId = params.id ? Number.parseInt(params.id as string) : undefined

  const [protagonist, setProtagonist] = useState<Protagonist>({
    author_id: user?.id || '',
    name: '',
    age: '',
    gender: '',
    hair_type: '',
    hair_color: '',
    skin_color: '',
    height: '',
    accessories: [],
    extra_appearance: '',
    extra_personality: ''
  })

  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'other', label: t('other') }
  ]

  const hairTypeOptions = [
    { value: 'long', label: t('long') },
    { value: 'short', label: t('short') },
    { value: 'very_short', label: t('very_short') }
  ]

  const hairColorOptions = [
    { value: 'brown', label: t('brown') },
    { value: 'blonde', label: t('blonde') },
    { value: 'black', label: t('black') },
    { value: 'white', label: t('white') },
    { value: 'redhead', label: t('redhead') }
  ]

  const skinColorOptions = [
    { value: 'white', label: t('white_skin') },
    { value: 'olive', label: t('olive') },
    { value: 'dark', label: t('dark') }
  ]

  const heightOptions = [
    { value: 'tall', label: t('tall') },
    { value: 'medium', label: t('medium') },
    { value: 'short', label: t('short') }
  ]

  const accessoriesOptions = [
    { value: 'glasses', label: t('glasses') },
    { value: 'cap', label: t('cap') },
    { value: 'hat', label: t('hat') },
    { value: 'gorro', label: t('gorro') }
  ]

  useEffect(() => {
    if (protagonistId && user) {
      fetchProtagonist()
    }
  }, [protagonistId, user])

  async function fetchProtagonist () {
    if (!user || !protagonistId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('protagonists')
        .select('*')
        .eq('id', protagonistId)
        .eq('author_id', user.id)
        .single()
      if (error) throw error
      if (data) {
        setProtagonist({
          ...data,
          extra_appearance: data.extra_appearance || '',
          extra_personality: data.extra_personality || ''
        })
      }
    } catch (error) {
      console.error(t('error_fetching_protagonist'), error)
      setError(t('error_fetching_protagonist'))
    } finally {
      setLoading(false)
    }
  }

  const debouncedSave = React.useCallback(
    React.useMemo(() => {
      const saveData = async (data: Protagonist) => {
        if (!user) return
        try {
          setSaveStatus(t('saving'))
          const protagonistData = {
            ...data,
            author_id: user.id,
            accessories: data.accessories || [],
            extra_appearance: data.extra_appearance || '',
            extra_personality: data.extra_personality || ''
          }
          if (protagonistId) {
            const { error } = await supabase
              .from('protagonists')
              .update(protagonistData)
              .eq('id', protagonistId)
              .eq('author_id', user.id)
            if (error) throw error
          } else {
            const { error } = await supabase.from('protagonists').insert([protagonistData])
            if (error) throw error
          }
          setSaveStatus(t('saved'))
          setTimeout(() => setSaveStatus(null), 2000)
        } catch (error) {
          console.error(t('error_saving_protagonist'), error)
          setError(t('error_saving_protagonist'))
          setSaveStatus(t('error_saving'))
          setTimeout(() => setSaveStatus(null), 2000)
        }
      }

      // eslint-disable-next-line
      let timeout: NodeJS.Timeout
      return (data: Protagonist) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => saveData(data), 1000)
      }
    }, [user, protagonistId, supabase, t]),
    [user, protagonistId, supabase, t]
  )

  const handleOptionSelect = (category: keyof Protagonist, value: string) => {
    if (category === 'name' && !value) return
    const updatedProtagonist = { ...protagonist, [category]: value }
    setProtagonist(updatedProtagonist)
    debouncedSave(updatedProtagonist)
  }

  const handleAccessoryToggle = (accessory: string) => {
    setProtagonist((prev) => {
      const current = prev.accessories || []
      const updatedProtagonist = current.includes(accessory)
        ? { ...prev, accessories: current.filter((a) => a !== accessory) }
        : { ...prev, accessories: [...current, accessory] }
      debouncedSave(updatedProtagonist)
      return updatedProtagonist
    })
  }

  const handleGoBack = () => {
    router.push('/characters')
  }

  if (loading) {
    return (
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary' />
        </div>
    )
  }

  return (
      <div className='lg:flex background-section-6 pt-12'>
        <button
          onClick={handleGoBack}
          className='fixed md:bottom-8 bottom-2 left-2 md:left-12 z-50 w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg bg-secondary hover:bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300'
          aria-label={t('go_back')}
        >
          <ArrowLeft className='w-6 h-6 sm:w-7 sm:h-7' />
        </button>

        <div className='md:w-1/2 flex items-center justify-center md:p-10'>
          <h1 className='text-3xl md:text-6xl font-bold text-secondary leading-tight'>
            {t('quote_line1')}
            <br />
            {t('quote_line2')}
            <br />
            {t('quote_line3')}
          </h1>
        </div>

        <div className='lg:w-1/2 md:p-10 px-4 py-2 lg:pr-20 flex items-center justify-center'>
          <div className='w-full max-w-3xl lg:max-w-full'>
            <div className='mb-6 flex items-center'>
              <div className='min-w-10 min-h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-secondary mr-3'>
                <span className='text-secondary text-sm'>{protagonist.name?.[0] || '?'}</span>
              </div>
              <input
                type='text'
                value={protagonist.name}
                onChange={(e) => handleOptionSelect('name', e.target.value)}
                placeholder={t('new_protagonist')}
                className='w-full text-xl font-bold text-secondary border-b border-dashed focus:outline-none'
              />
            </div>

            <div className='mb-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-gray-600 mb-2'>{t('age')}</p>
                <input
                  type='number'
                  max='999'
                  value={protagonist.age}
                  onChange={(e) => handleOptionSelect('age', e.target.value)}
                  className='w-full max-w-[80px] px-3 py-2 border border-secondary-300 rounded-md'
                />
              </div>

              <div>
                <p className='text-gray-600 mb-2'>{t('gender')}</p>
                <div className='flex flex-wrap gap-2'>
                  {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.gender === option.value
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleOptionSelect('gender', option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-gray-600 mb-2'>{t('hair_type')}</p>
                <div className='flex flex-wrap gap-2'>
                  {hairTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.hair_type === option.value
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleOptionSelect('hair_type', option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-gray-600 mb-2'>{t('hair_color')}</p>
                <div className='flex flex-wrap gap-2'>
                  {hairColorOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.hair_color === option.value
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleOptionSelect('hair_color', option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-gray-600 mb-2'>{t('skin')}</p>
                <div className='flex flex-wrap gap-2'>
                  {skinColorOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.skin_color === option.value
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleOptionSelect('skin_color', option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-gray-600 mb-2'>{t('height')}</p>
                <div className='flex flex-wrap gap-2'>
                  {heightOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.height === option.value
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleOptionSelect('height', option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>

              <div className='md:col-span-2'>
                <p className='text-gray-600 mb-2'>{t('accessories')}</p>
                <div className='flex flex-wrap gap-2'>
                  {accessoriesOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              protagonist.accessories?.includes(option.value)
                                  ? 'bg-secondary-200 text-secondary-800'
                                  : 'bg-secondary-50 border border-secondary-300 text-gray-700 hover:bg-secondary-50'
                          }`}
                        onClick={() => handleAccessoryToggle(option.value)}
                      >
                        {option.label}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='mb-4'>
              <p className='text-gray-600 mb-2'>{t('extra_appearance')}</p>
              <textarea
                value={protagonist.extra_appearance}
                onChange={(e) => handleOptionSelect('extra_appearance', e.target.value)}
                className='w-full px-3 py-2 border border-secondary-300 rounded-md resize-none'
                rows={3}
              />
            </div>

            <div className='mb-2'>
              <p className='text-gray-600 mb-2'>{t('extra_personality')}</p>
              <textarea
                value={protagonist.extra_personality}
                onChange={(e) => handleOptionSelect('extra_personality', e.target.value)}
                className='w-full px-3 py-2 border border-secondary-300 rounded-md resize-none'
                rows={3}
              />
            </div>

            <div className='h-3 mb-4'>
              {saveStatus && <p className='float-right text-sm text-secondary animate-pulse'>{saveStatus}</p>}
            </div>
          </div>
        </div>
      </div>
  )
}

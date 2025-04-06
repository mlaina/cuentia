'use client'

import { useEffect, useState } from 'react'
import { Wand2 } from 'lucide-react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Slider } from '@/components/ui/slider'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MentionsEditor } from '@/components/MentionsEditor'
import { useCredits } from '@/context/CreditsContext'

function getLocaleCookie () {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(^|;\s*)locale=([^;]+)/)
  return match?.[2] || 'en'
}

export default function CrearCuentoPage () {
  const t = useTranslations()
  const [descripcion, setDescripcion] = useState('')
  const [randomIdeas, setRandomIdeas] = useState([])
  const [ideas, setIdeas] = useState([])
  const [protagonists, setProtagonists] = useState([])
  const [seletedProtagonists, setSeletedProtagonists] = useState([])
  const [longitud, setLongitud] = useState(10)
  const [loading, setLoading] = useState(false)
  const [ld, setLd] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const { checkCreditsBeforeOperation } = useCredits()

  // Función auxiliar para obtener las menciones de los protagonistas seleccionados.
  const getMentions = () =>
    seletedProtagonists.map((protagonist) => `@${protagonist.name}`).join(' ')

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('lang')
          .eq('user_id', user.id)
          .single()
        const lang = data?.lang || getLocaleCookie()
        const response = await fetch(`/ideas/${lang}.json`)
        const ideas = await response.json()
        setIdeas(ideas)
      } catch (error) {
        console.error(t('error_loading_ideas'), error)
      }
    }
    loadIdeas()
  }, [user])

  useEffect(() => {
    const fetchProtagonists = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('protagonists')
          .select('id, name, avatars')
          .eq('author_id', user.id)
        if (error) {
          throw error
        }
        setLd(true)
        setProtagonists(data || [])
      } catch (error) {
        console.error(t('error_loading_protagonists'), error)
      }
    }
    fetchProtagonists()
  }, [user, supabase])

  const getRandomIdeas = () => {
    const shuffled = [...ideas].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  const generarDescripcionAleatoria = () => {
    const newIdeas = getRandomIdeas()
    setRandomIdeas(newIdeas)
    if (newIdeas.length > 0) {
      // Combina la descripción de la idea con las menciones de los protagonistas seleccionados
      setDescripcion(`${newIdeas[0].description} ${getMentions()}`.trim())
    }
  }

  useEffect(() => {
    if (ideas.length > 0) {
      const newIdeas = getRandomIdeas()
      setRandomIdeas(newIdeas)
    }
  }, [ideas])

  // Al hacer click en una idea, se reemplaza la parte de idea pero se mantienen las menciones.
  const handleIdeaClick = (idea) => {
    setDescripcion(`${idea.description} ${getMentions()}`.trim())
  }

  const handleCheck = async () => {
    await checkCreditsBeforeOperation(15 + longitud * 3, handleCrearCuento)
  }

  const handleCrearCuento = async () => {
    setLoading(true)
    const characters = seletedProtagonists.map((protagonist) => protagonist.id)
    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            author_id: user.id,
            idea: descripcion,
            protagonists: characters,
            length: longitud
          }
        ])
        .select()
      if (error) {
        throw error
      }
      const storyId = data[0].id
      router.push(`/creator/${storyId}`)
    } catch (error) {
      console.error(t('error_creating_story'), error.message)
    }
  }

  const handleMemberClick = (protagonist) => {
    // Al agregar un protagonista, se añade su mención y se conserva lo que ya había
    const newText = `${descripcion} @${protagonist.name}`.trim()
    setSeletedProtagonists((prev) => [...prev, protagonist])
    setDescripcion(newText)
  }

  // Calculamos los protagonistas no seleccionados
  const unselectedProtagonists = protagonists.filter(
    (protagonist) => !seletedProtagonists.some((selected) => selected.id === protagonist.id)
  )

  return (
      <div className='h-full flex flex-col md:flex-row background-section-4 [transform:scaleX(-1)]'>
        <div
          className={`max-w-7xl w-full mx-auto flex flex-col md:flex-row [transform:scaleX(-1)] transition-opacity duration-300 ${
                loading ? 'opacity-50 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
        >
          {/* Lado izquierdo - Título inspirador */}
          <div className='w-full md:w-1/2 flex items-center md:justify-start justify-center pt-6 md:pt-0'>
            <h1 className='text-5xl md:text-7xl font-bold text-secondary leading-tight'>
              {t('inspirational_title_line1')}
              <br />
              {t('inspirational_title_line2')}
            </h1>
          </div>

          {/* Lado derecho - Formulario de creación */}
          <div className='w-full md:w-1/2 px-3 flex items-center justify-center md:py-6 md:py-10'>
            <div className='w-full max-w-3xl lg:w-full'>
              <h2 className='text-2xl md:text-3xl hidden md:block font-bold text-gray-800'>
                {t('ready_to_dream')}
              </h2>
              <p className='text-gray-600 mb-4'>
                {t('story_description_instruction')}
              </p>

              {/* Alerta si no hay protagonistas */}
              {!protagonists.length && ld && (
                  <div className='border border-dashed border-red-200 py-3 px-4 rounded-md bg-red-50 text-red-700 text-sm mb-4'>
                    {t('no_protagonists_yet')}{' '}
                    <a href='/characters' className='underline decoration-secondary font-bold'>
                      {t('create_one_here')}
                    </a>{' '}
                    ✨
                  </div>
              )}
              <div className='p-4 mb-6 border-2 border-dashed border-secondary-300 rounded-xl bg-secondary-50 bg-opacity-60 md:bg-transparent'>
                {/* Usamos MentionsEditor y le pasamos el callback para actualizar los seleccionados */}
                <MentionsEditor
                  value={descripcion}
                  onChange={setDescripcion}
                  selectedProtagonists={seletedProtagonists}
                  onSelectedProtagonistsChange={setSeletedProtagonists}
                />

                {/* Ideas aleatorias y botón de varita mágica */}
                <div className='flex justify-between mt-4'>
                  <div className='flex flex-wrap gap-2 min-h-14'>
                    {randomIdeas.map((idea, index) => (
                        <button
                          key={index}
                          onClick={() => handleIdeaClick(idea)}
                          className='inline-flex border border-secondary-300 items-center justify-center text-xs font-medium h-6 px-3 rounded-full text-secondary-700 hover:bg-secondary-50'
                        >
                          {idea.title}
                        </button>
                    ))}
                  </div>
                  <button
                    onClick={generarDescripcionAleatoria}
                    className='inline-flex border border-secondary-300 items-center justify-center text-xs font-medium h-6 px-2 rounded-full text-secondary-700 hover:bg-secondary-50'
                    title={t('generate_random_idea')}
                  >
                    <Wand2 className='w-4 h-4' />
                  </button>
                </div>
                <div className='flex flex-col gap-6'>
                  <div className='w-full flex flex-col gap-3'>
                    <div className='hidden md:block'>
                      {unselectedProtagonists.length > 0 && (
                          <h3 className='text-lg font-semibold text-gray-700 mb-2 mt-3'>
                            {t('characters_available')}
                          </h3>
                      )}
                      <div className='max-h-[150px] overflow-y-auto pr-2'>
                        <div className='flex flex-wrap  gap-2'>
                          {unselectedProtagonists.map((protagonist) => (
                              <div
                                key={protagonist.id}
                                onClick={() => handleMemberClick(protagonist)}
                                className='flex items-center gap-2 cursor-pointer rounded-2xl bg-secondary-50 hover:bg-secondary-200 py-1.5 px-2 transition-colors'
                              >
                                {protagonist.avatars
                                  ? (
                                        <img
                                          src={protagonist.avatars || '/placeholder.svg'}
                                          alt={protagonist.name}
                                          className='w-8 h-8 rounded-full'
                                        />
                                    )
                                  : (
                                        <div
                                          className='w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-800 font-bold'
                                        >
                                          {protagonist.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                <span>@{protagonist.name}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-between mt-3'>
                      <h3 className='text-lg font-semibold text-gray-700'>
                        {t('story_length')}:
                      </h3>
                      <span className='font-medium text-secondary'>{longitud}</span>
                    </div>
                    <div className='relative'>
                      <Slider
                        value={[longitud]}
                        onValueChange={(value) => setLongitud(value[0])}
                        min={6}
                        max={26}
                        step={2}
                        className='w-full'
                      />
                      <div className='flex justify-between mt-1 text-sm text-gray-500'>
                        <span>{t('min_pages')}</span>
                        <span>{t('max_pages')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protagonistas disponibles (versión móvil) */}
                {unselectedProtagonists.length > 0 && (
                    <div className='md:hidden mby-6'>
                      <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                        {t('characters_available')}
                      </h3>
                      <div className='grid grid-cols-2 gap-2 bg-secondary-50 p-3 rounded-lg'>
                        {unselectedProtagonists.map((protagonist) => (
                            <div
                              key={protagonist.id}
                              onClick={() => handleMemberClick(protagonist)}
                              className='flex items-center gap-2 cursor-pointer hover:bg-secondary-100 p-2 rounded-full'
                            >
                              {protagonist.avatars
                                ? (
                                      <img
                                        src={protagonist.avatars || '/placeholder.svg'}
                                        alt={protagonist.name}
                                        className='w-8 h-8 rounded-full'
                                      />
                                  )
                                : (
                                      <div className='w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-800 font-bold'>
                                        {protagonist.name.charAt(0).toUpperCase()}
                                      </div>
                                  )}
                              <span className='text-sm truncate'>@{protagonist.name}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                <button
                  type='button'
                  className={`w-full mt-3 py-2 md:py-4 bg-secondary hover:bg-secondary-600 text-white font-medium rounded-lg transition-all duration-300 text-lg ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-md'
                    }`}
                  onClick={handleCheck}
                  disabled={loading || disabled}
                >
                  {loading ? t('creating') : t('create_story')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

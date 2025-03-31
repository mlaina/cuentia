'use client'

import { useEffect, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Wand2 } from 'lucide-react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Slider } from '@/components/ui/slider'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

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
  const textFieldRef = useRef(null)
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const { default: importedIdeas } = await import('@/types/ideas/en.json')
        setIdeas(importedIdeas)
      } catch (error) {
        console.error(t('error_loading_ideas'), error)
      }
    }

    loadIdeas()
  }, [])

  useEffect(() => {
    const fetchProtagonists = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('protagonists')
          .select('id, name, physical_description, inference, avatars')
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
      setDescripcion(newIdeas[0].description)
    }
  }

  useEffect(() => {
    if (ideas.length > 0) {
      const newIdeas = getRandomIdeas()
      setRandomIdeas(newIdeas)
    }
  }, [ideas])

  const handleIdeaClick = (idea) => {
    setDescripcion(idea.description)
  }

  const handleCrearCuento = async () => {
    setLoading(true)

    const characters = seletedProtagonists.map(
      (protagonist) => protagonist.id
    )

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

  const handleTextFieldChange = (e) => {
    const value = e.target.value
    setDescripcion(value)

    const mentionsInText = value.match(/@\w+/g) || []
    const updatedSelectedProtagonists = seletedProtagonists.filter((protagonist) =>
      mentionsInText.includes(`@${protagonist.name}`)
    )
    setSeletedProtagonists(updatedSelectedProtagonists)
  }

  const handleMemberClick = (protagonist) => {
    const newText = `${descripcion} @${protagonist.name}`.trim()
    setSeletedProtagonists((prev) => [...prev, protagonist])
    setDescripcion(newText)
  }

  const unselectedProtagonists = protagonists.filter(
    (protagonist) => !seletedProtagonists.some((selected) => selected.id === protagonist.id)
  )

  useEffect(() => {
    const calculatePrice = (longitud) => {
      if (user?.user_metadata?.credits) {
        setDisabled(11 + 5 * longitud > user.user_metadata.credits)
      }
    }
    calculatePrice(longitud)
  }, [longitud, user])

  return (
      <div className='h-full flex flex-col md:flex-row background-section-4 [transform:scaleX(-1)]'>
        <div
          className={`w-full flex flex-col md:flex-row [transform:scaleX(-1)] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
        >

          {/* Lado izquierdo - Título inspirador */}
          <div className='w-full md:w-1/2 flex items-center justify-center p-8 md:p-16'>
            <h1 className='text-5xl md:text-7xl font-bold text-secondary leading-tight'>
              Empieza
              <br />a soñar
            </h1>
          </div>

          {/* Lado derecho - Formulario de creación */}
          <div className='w-full md:w-1/2 flex items-center justify-center py-6 md:py-10'>
            <div className='w-full max-w-3xl lg:w-full lg:pr-20'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>
                {t('ready_to_dream') || 'Crea tu historia'}
              </h2>
              <p className='text-gray-600 mb-4'>
                Escribe una descripción breve de tu cuento.{' '}
                <span className='font-medium'>Recuerda añadir a los protagonistas</span> que has creado antes con @nombre
                o pulsando en ellos.
              </p>

              {/* Alerta si no hay protagonistas */}
              {!protagonists.length && ld && (
                  <div className='border border-dashed border-red-200 py-3 px-4 rounded-md bg-red-50 text-red-700 text-sm mb-4'>
                    {t('no_protagonists_yet') || 'No tienes protagonistas todavía.'}{' '}
                    <a href='/characters' className='underline decoration-secondary font-bold'>
                      {t('create_one_here') || 'Crea uno aquí'}
                    </a>{' '}
                    ✨
                  </div>
              )}
              <div className='p-4 mb-6 border-2 border-dashed border-secondary-300 rounded-xl '>

                <div className=' mb-2'>
                  {seletedProtagonists.length > 0 && (
                      <div className='flex gap-2 mb-2'>
                        {seletedProtagonists.map((protagonist) => (
                            <div
                              key={protagonist.id}
                              className='flex items-center bg-secondary-50 px-3 py-1 rounded-full hover:bg-secondary-100 cursor-pointer border border-secondary-200'
                              onClick={() => handleMemberClick(protagonist)}
                            >
                              {protagonist.avatars && protagonist.avatars.some((avatar) => avatar)
                                ? (
                                      <img
                                        src={protagonist.avatars.find((avatar) => avatar) || '/placeholder.svg'}
                                        alt={protagonist.name}
                                        title={`@${protagonist.name}`}
                                        className='w-8 h-8 rounded-full mr-2'
                                      />
                                  )
                                : (
                                      <div
                                        className='w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-800 font-bold mr-2'
                                      >
                                        {protagonist.name.charAt(0).toUpperCase()}
                                      </div>
                                  )}
                              <span className='text-sm'>@{protagonist.name}</span>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
                <Textarea
                  placeholder={t('story_description_placeholder') || 'Inicia tu cuento y deja que empiece la magia...'}
                  value={descripcion}
                  onChange={handleTextFieldChange}
                  className='w-full min-h-[150px] bg-white bg-opacity-80 rounded-lg p-4 focus:outline-none resize-none'
                  ref={textFieldRef}
                />

                {/* Ideas aleatorias y botón de varita mágica */}
                <div className='flex justify-between mt-4'>
                  <div className='flex flex-wrap gap-2'>
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
                    title='Generar idea aleatoria'
                  >
                    <Wand2 className='w-4 h-4' />
                  </button>
                </div>
                {/* Contenedor de dos columnas para protagonistas y longitud */}
                <div className='flex flex-col gap-6 mb-6'>
                  {/* Longitud del cuento */}
                  <div className='w-full flex flex-col gap-3'>

                    {/* Protagonistas disponibles (versión desktop) */}
                    <div className='hidden md:block '>
                      {unselectedProtagonists.length > 0 &&
                      <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                        {t('characters_avialable') || 'Tus protagonistas'}
                      </h3>}
                      <div className='max-h-[150px] overflow-y-auto pr-2'>
                        <div className='flex gap-2'>
                          {unselectedProtagonists.map((protagonist) => (
                              <div
                                key={protagonist.id}
                                onClick={() => handleMemberClick(protagonist)}
                                className='flex items-center gap-2 cursor-pointer rounded-2xl bg-secondary-50 hover:bg-secondary-200 py-1.5 px-2 rounded transition-colors'
                              >
                                {protagonist.avatars && protagonist.avatars.some((avatar) => avatar)
                                  ? (
                                        <img
                                          src={protagonist.avatars.find((avatar) => avatar) || '/placeholder.svg'}
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
                    <div className='flex justify-between mb-2'>
                      <h3 className='text-lg font-semibold text-gray-700'>{t('pages') || 'Longitud del cuento'}:</h3>
                      <span className='font-medium text-secondary'>{longitud}</span>
                    </div>
                    <div className='relative'>
                      <Slider
                        value={[longitud]}
                        onValueChange={(value) => setLongitud(value[0])}
                        min={6}
                        max={14}
                        step={2}
                        className='w-full'
                      />
                      <div className='flex justify-between mt-1 text-sm text-gray-500'>
                        <span>6 páginas</span>
                        <span>14 páginas</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Protagonistas disponibles (versión móvil) */}
                <div className='md:hidden mb-6'>
                  <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                    {t('characters_avialable') || 'Tus protagonistas'}
                  </h3>
                  <div className='grid grid-cols-2 gap-2 bg-secondary-50 p-3 rounded-lg'>
                    {unselectedProtagonists.map((protagonist) => (
                        <div
                          key={protagonist.id}
                          onClick={() => handleMemberClick(protagonist)}
                          className='flex items-center gap-2 cursor-pointer hover:bg-secondary-100 p-2 rounded'
                        >
                          {protagonist.avatars && protagonist.avatars.some((avatar) => avatar)
                            ? (
                                  <img
                                    src={protagonist.avatars.find((avatar) => avatar) || '/placeholder.svg'}
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
                          <span className='text-sm truncate'>@{protagonist.name}</span>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Botón de crear */}
                <button
                  type='button'
                  className={`w-full py-4 bg-secondary hover:bg-secondary-600 text-white font-medium rounded-lg transition-all duration-300 text-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-md'}`}
                  onClick={handleCrearCuento}
                  disabled={loading || disabled}
                >
                  {loading ? t('creating') || 'Creando...' : t('create_story') || '¡Crear cuento!'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
  )
}

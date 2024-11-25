'use client'

import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Wand2 } from 'lucide-react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Slider } from '@/components/ui/slider'
import { useRouter } from 'next/navigation'
import AnimatedParticlesBackground from '@/components/ui/AnimatedParticlesBackground'

export default function CrearCuentoPage () {
  const [descripcion, setDescripcion] = useState('')
  const [randomIdeas, setRandomIdeas] = useState([])
  const [ideas, setIdeas] = useState([])
  const [protagonists, setProtagonists] = useState([{}])
  const [longitud, setLongitud] = useState(6)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const { default: importedIdeas } = await import('@/types/ideas.json')
        setIdeas(importedIdeas)
      } catch (error) {
        console.error('Error al cargar las ideas:', error)
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
          .select('id, name, physical_description, likes, dislikes')
          .eq('author_id', user.id)

        if (error) {
          throw error
        }

        setProtagonists(data || [])
      } catch (error) {
        console.error('Error al cargar los protagonistas:', error)
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

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([
          {
            author_id: user.id,
            idea: descripcion,
            length: longitud,
            phase: 0
          }
        ])
        .select()

      if (error) {
        throw error
      }

      const storyId = data[0].id
      router.push(`/creator/${storyId}`)
    } catch (error) {
      console.error('Error al crear la historia:', error.message)
    }
  }

  return (
      <div className='flex h-2/3 items-center'>
        <AnimatedParticlesBackground />
        <section className={`flex-1 transition duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          <div className='max-w-4xl mx-auto p-6 items-center h-full justify-center space-y-8'>
            <div className='pb-4'>
              <h1 className='text-center bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-6xl font-bold text-transparent '>
                Listos para soñar
              </h1>
            </div>
            {!protagonists.length && (
                <div className='border border-dashed border-red-200 py-3 px-4 rounded-md bg-red-50 text-red-700 text-sm'>
                  ¡Aún no has registrado ningún protagonista!{' '}
                  <a
                    href='/profile'
                    className='underline decoration-sky-500 font-bold'
                  >
                    Haz clic aquí para crear uno
                  </a>{' '}
                  ✨
                </div>
            )}
            <div className='space-y-4'>
              <div className='relative border-glow-container rounded-lg'>
                <Textarea
                  placeholder='Escribe una breve descripción de tu idea para el cuento... Puedes mencionar a tus protagonistas con @nombre'
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className='min-h-[100px] resize-none'
                />
                <div className='border-glow absolute inset-0 rounded-sm pointer-events-none' />
              </div>
              <div className='flex justify-between'>
                <div className='flex gap-2'>
                  {randomIdeas.map((idea, index) => (
                      <button
                        key={index}
                        onClick={() => handleIdeaClick(idea)}
                        className='inline-flex border border-gray-500 items-center justify-center text-xs font-medium h-6 px-2 rounded-full text-gray-600 hover:bg-muted/80 hover:text-gray-900'
                      >
                        {idea.title}
                      </button>
                  ))}
                </div>
                <button
                  onClick={generarDescripcionAleatoria}
                  className='inline-flex border border-gray-500 items-center justify-center text-xs font-medium h-6 px-2 rounded-full text-gray-600 hover:bg-muted/80 hover:text-gray-900'
                >
                  <Wand2 className='w-4 h-4' />
                </button>
              </div>
            </div>
            <div>
              <div className='flex items-center space-x-4'>
                <Slider
                  value={[longitud]}
                  onValueChange={(value) => setLongitud(value[0])}
                  min={4}
                  max={12}
                  step={2}
                  className='relative w-full h-2 rounded-full cursor-pointer'
                />
                <span className='w-32 text-gray-700'>{longitud} páginas</span>
              </div>
            </div>
            <button
              className='py-3 rounded-lg text-lg w-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 transition transition-all ease-in-out hover:b-glow hover:to-sky-500 hover:drop-shadow-lg transition-all hover:translate-y-1 hover:scale-105 text-white font-bold'
              onClick={handleCrearCuento}
              disabled={loading}
            >
              Crear Cuento
            </button>

          </div>
        </section>
      </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import AnimatedParticlesBackground from '@/components/ui/AnimatedParticlesBackground'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import StoryViewer from '@/components/StoryViewer'

export const runtime = 'edge'

function sanitizeText (text) {
  let sanitized = text.replace(/"([^"]*)$/g, '“$1”')

  const openBrackets = (sanitized.match(/\[/g) || []).length
  const closeBrackets = (sanitized.match(/\]/g) || []).length
  if (openBrackets > closeBrackets) {
    sanitized += ']'.repeat(openBrackets - closeBrackets)
  } else if (closeBrackets > openBrackets) {
    sanitized = sanitized.replace(/\](?=[^[]*\])/g, '')
  }

  const unmatchedAsterisks = (sanitized.match(/\*/g) || []).length % 2
  if (unmatchedAsterisks) {
    sanitized = sanitized.replace(/\*$/, '')
  }

  const openBraces = (sanitized.match(/{/g) || []).length
  const closeBraces = (sanitized.match(/}/g) || []).length
  if (closeBraces > openBraces) {
    sanitized = sanitized.slice(0, -1 * (closeBraces - openBraces))
  }

  sanitized = sanitized.replace(/["“”]+$/g, '')

  sanitized = sanitized.replace(/["}]+$/g, '')

  return sanitized
}

export default function CrearCuentoPage ({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState(null)
  const [indice, setIndice] = useState([])
  const [loading, setLoading] = useState(0)
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const hasExecutedRef = useRef(false)

  useEffect(() => {
    const fetchStory = async () => {
      if (!user || !supabase || hasExecutedRef.current) return

      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, content, images, idea, length, protagonists')
          .eq('author_id', user.id)
          .eq('id', params.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          await handleCrearCuento(data)
        } else {
          console.error('Story not found')
        }
      } catch (error) {
        console.error('Error al cargar la historia:', error)
      }
    }

    fetchStory()
  }, [user, supabase, params.id])

  useEffect(() => {
    setLoading(1)
    setTimeout(() => {
      setLoading(2)
      setTimeout(() => {
        setLoading(3)
        setTimeout(() => {
          setLoading(4)
          setTimeout(() => {
            setLoading(5)
            setTimeout(() => {
              setLoading(6)
            }, 3000)
          }, 3000)
        }, 3000)
      }, 3000)
    }, 3000)
  }, [])

  const createStoryIndex = async (story, length) => {
    try {
      const response = await fetch('/api/story/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story, length, storyId: params.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const respIndex = await response.json()
      const index = JSON.parse(respIndex.index)
      const content = respIndex.content

      setTitle(index.title)
      setIndice(content)

      return index
    } catch (error) {
      console.error('Error creating story index:', error)
      throw error
    }
  }

  const createPageFront = async (description, title) => {
    try {
      const response = await fetch('/api/story/front-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, title, storyId: params.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { image: frontCoverImage } = await response.json()
      setIndice(prev => {
        const newIndice = [...prev]
        newIndice[0].imageUrl = frontCoverImage
        return newIndice
      })
    } catch (error) {
      console.error('Error creating story index:', error)
      throw error
    }
  }

  const createPageBack = async (description, idea, length) => {
    try {
      const response = await fetch('/api/story/back-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, idea, length, storyId: params.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { image: backCoverImage } = await response.json()
      setIndice(prev => {
        const newIndice = [...prev]
        newIndice[newIndice.length - 1].content = description
        newIndice[newIndice.length - 1].imageUrl = backCoverImage
        return newIndice
      })
    } catch (error) {
      console.error('Error creating story index:', error)
      throw error
    }
  }

  const createTextPage = async (index, number) => {
    try {
      const response = await fetch('/api/story/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index, number, historic: indice, storyId: params.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { page } = await response.json()

      setIndice(prev => {
        const newIndice = [...prev]
        newIndice[number].content = sanitizeText(page.text)
        return newIndice
      })

      return page
    } catch (error) {
      console.log('Error creating story page:', error)
      throw error
    }
  }

  const createImagePage = async (index, description, number) => {
    try {
      const response = await fetch('/api/story/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index, description, number, storyId: params.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { image: pageImage } = await response.json()

      setIndice(prev => {
        const newIndice = [...prev]
        newIndice[number].imageUrl = pageImage
        return newIndice
      })
    } catch (error) {
      console.error('Error creating story index:', error)
      throw error
    }
  }

  const handleCrearCuento = async (story) => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    console.log('Creating story...')

    const ind = await createStoryIndex(story, story.length / 2)

    // eslint-disable-next-line no-unused-vars
    let [_, __, page] = await Promise.all([
      createPageFront(ind.frontpage_description, ind.title),
      createPageBack(ind.frontpage_description, story.idea, story.length / 2),
      createTextPage(ind.index, 1)
    ])

    for (let i = 1; i < ind.index.length + 1; i++) {
      if (i !== ind.index.length) {
        // eslint-disable-next-line no-const-assign,no-unused-vars
        [__, page] = await Promise.all([
          createImagePage(ind.index, page.image_description, i),
          createTextPage(ind.index, i + 1)
        ])
      } else {
        await createImagePage(ind.index, page.image_description, i)
      }
    }
  }

  useEffect(() => {
    const fetchStory = async () => {
      if (indice.length > 0) {
        const images = [indice[0]?.imageUrl] || []
        await supabase
          .from('stories')
          .update({
            title,
            content: indice,
            images
          })
          .eq('author_id', user.id)
          .eq('id', params.id)
      }
    }
    fetchStory()
  }, [indice])

  return (
      <>
        <Head>
            <title>{title ? { title } : 'Creando cuento...'}</title>
        </Head>

        <div className='overflow-hidden'>
        {indice.length > 0 && loading > 5 &&
            <StoryViewer title={title} pages={indice} stream />}
        </div>
        <div className='flex flex-col h-screen w-full'>
          <AnimatedParticlesBackground />
          <div className='flex flex-col justify-center items-center w-full h-2/3 text-gray-500 relative'>
            <section className={`absolute inset-0 transition-opacity duration-500 ${loading === 1 ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}>
              <p className='text-5xl flex items-center'>
                <span className='underline decoration-pink-500'>Despertando</span>&nbsp;a <strong className='text-sky-500'>&nbsp;dragones</strong>
                <span role='img' aria-label='despertando' className='mr-2'>🌅</span>
              </p>
            </section>

            <section className={`absolute inset-0 transition-opacity duration-500 ${loading === 2 ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}>
              <p className='text-5xl flex items-center'>
                <span className='underline decoration-purple-500'>Convocando</span>&nbsp;a las <strong className='text-pink-500'>&nbsp;brujas</strong>
                <span role='img' aria-label='convocando' className='mr-2'>🔮</span>
              </p>
            </section>

            <section className={`absolute inset-0 transition-opacity duration-500 ${loading === 3 ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}>
              <p className='text-5xl flex items-center'>
                <span className='underline decoration-sky-500'>Explorando</span>&nbsp;la <strong className='text-purple-500'>&nbsp;galaxia</strong>
                <span role='img' aria-label='explorando' className='mr-2'>🚀</span>
              </p>
            </section>

            <section className={`absolute inset-0 transition-opacity duration-500 ${loading === 4 ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}>
              <p className='text-5xl flex items-center'>
                <span className='underline decoration-pink-500'>Llamando</span>&nbsp;al <strong className='text-purple-500'>&nbsp;fénix</strong>
                <span role='img' aria-label='llamando' className='mr-2'>🔥</span>
              </p>
            </section>

            <section className={`absolute inset-0 transition-opacity duration-500 ${loading === 5 ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}>
              <p className='text-5xl flex items-center'>
                <span className='underline decoration-purple-500'>Entrenando</span>&nbsp;a la <strong className='text-sky-500'>&nbsp;jauría</strong>
                <span role='img' aria-label='entrenando' className='mr-2'>🐺</span>
              </p>
            </section>
          </div>
        </div>
      </>
  )
}

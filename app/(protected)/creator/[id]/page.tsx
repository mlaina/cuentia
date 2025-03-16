'use client'

import { useEffect, useRef, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
// import AnimatedParticlesBackground from '@/components/ui/AnimatedParticlesBackground'
import Head from 'next/head'
import StoryViewer from '@/components/StoryViewer'
import { useTranslations } from 'next-intl'

export const runtime = 'edge'

function sanitizeText (text: string) {
  let sanitized = text.replace(/"([^"]*)$/g, '"' + '$1' + '"')

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

  sanitized = sanitized.replace(/["""]+$/g, '')

  sanitized = sanitized.replace(/["}]+$/g, '')

  return sanitized
}

const MAX_RETRIES = 3

async function withRetry (operation: () => Promise<any>, operationName: string) {
  let attempts = 0

  while (attempts < MAX_RETRIES) {
    try {
      return await operation()
    } catch (error) {
      attempts++
      console.error(`Error in ${operationName} (attempt ${attempts}/${MAX_RETRIES}):`, error)

      if (attempts === MAX_RETRIES) {
        throw new Error(`${operationName} failed after ${MAX_RETRIES} attempts`)
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
    }
  }
}

export default function CrearCuentoPage ({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState(null)
  const [indice, setIndice] = useState([])
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(0)
  const [description, setDescription] = useState(null)
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

  const updateCredits = async (cost) => {
    if (!user) return

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      console.error('Error fetching user:', error)
      return
    }

    const currentCredits = data.user.user_metadata.credits || 0
    const newCredits = currentCredits - cost

    const { error: updateError } = await supabase.auth.updateUser({
      data: { credits: newCredits }
    })

    if (updateError) {
      console.error('Error updating credits:', updateError)
    }
  }

  useEffect(() => {
    const steps = [1, 2, 3, 4, 5, 6]
    const delay = 3000

    const progressLoading = async () => {
      for (const step of steps) {
        setLoading(step)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    progressLoading()

    return () => setLoading(0)
  }, [])

  const createStoryIndex = async (story, description, length) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/index', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ story, description, length, storyId: params.id })
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
      }, 'Create Story Index')
    } catch (error) {
      console.error('Error creating story index:', error)
      alert('No se pudo crear el índice de la historia después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const createPageFront = async (description, title) => {
    try {
      await updateCredits(5)
      await withRetry(async () => {
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
      }, 'Create Front Page')
    } catch (error) {
      console.error('Error creating front page:', error)
      alert('No se pudo crear la portada después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const createPageBack = async (description, idea, length) => {
    try {
      await updateCredits(5)
      await withRetry(async () => {
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
      }, 'Create Back Page')
    } catch (error) {
      console.error('Error creating back page:', error)
      alert('No se pudo crear la contraportada después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  /*
  const createTextPage = async (index, number, protagonists) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ index, number, historic: indice, storyId: params.id, protagonists })
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
      }, 'Create Text Page')
    } catch (error) {
      console.error('Error creating text page:', error)
      alert('No se pudo crear el texto de la página después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }
   */

  const createImagePage = async (description: any, number: number) => {
    try {
      await updateCredits(4)
      await withRetry(async () => {
        const response = await fetch('/api/story/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ description })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { image: pageImage } = await response.json()
        setIndice(prev => {
          const newIndice = [...prev]
          // @ts-ignore
          newIndice[number].imageUrl = pageImage
          return newIndice
        })
      }, 'Create Image Page')
    } catch (error) {
      console.error('Error creating image page:', error)
      alert('No se pudo crear la imagen después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const buildPromptCover = async (text: null, mainElements : any) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/prompt-image-front', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text, mainElements })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { prompt } = await response.json()
        return prompt
      }, 'Create Image Page')
    } catch (error) {
      console.error('Error creating image page:', error)
      alert('No se pudo crear la imagen después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const buildPromptImage = async (text: null, characters: any) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/prompt-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text, characters })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { prompt } = await response.json()
        return prompt
      }, 'Create Image Page')
    } catch (error) {
      console.error('Error creating image page:', error)
      alert('No se pudo crear la imagen después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const developIdea = async (length: any, idea: undefined, characters: undefined) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/idea', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ length, idea, characters, storyId: params.id })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const { idea: text } = await response.json()
        return text
      }, 'Create Image Page')
    } catch (error) {
      console.error('Error creating image page:', error)
      alert('No se pudo crear la imagen después de varios intentos. Por favor, inténtelo de nuevo.')
      throw error
    }
  }

  const handleCrearCuento = async (story: { id: any; title: any; content: any; images: any; idea: any; length: any; protagonists: any }) => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    console.log('Creating story...')

    // 1. Ejecutar en paralelo lo que no sea dependiente
    const descriptiona = await developIdea(story.length / 2, story.idea, story.protagonists)

    setDescription(descriptiona)

    // 2. Ahora sí, una vez tenemos 'description', podemos crear el índice
    const ind = await createStoryIndex(story, descriptiona, story.length / 2)

    const promptCover = await buildPromptCover(story.idea, ind.main_elements)
    // 3. Estas llamadas necesitan el resultado de promptCover e ind, se hacen secuencialmente
    await Promise.all([
      createPageFront(promptCover, ind.title),
      createPageBack(promptCover, story.idea, story.length / 2)
    ])

    for (let i = 0; i < ind.index.length; i++) {
      const page = ind.index[i]
      let charactersDescription = ''

      for (const characterName of page.characters_appear) {
        for (const character of ind.characters) {
          if (character.name === characterName) {
            charactersDescription += `${character.description}\n`
          }
        }
      }

      // Actualizar el estado con la información de la página
      setIndice((prev) => {
        const newIndice = [...prev]
        newIndice[i + 1].content = sanitizeText(page.text)
        return newIndice
      })

      // Construir el prompt y generar la página de manera asíncrona
      const prompt = await buildPromptImage(page.text, charactersDescription)
      setPrompts((prev) => [...prev, prompt])
      // Guardamos la promesa de creación de imagen
      await createImagePage(prompt, i + 1)
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

  useEffect(() => {
    const fetchStory = async () => {
      if (prompts.length > 0) {
        await supabase
          .from('stories')
          .update({
            images_prompts: prompts
          })
          .eq('author_id', user.id)
          .eq('id', params.id)
      }
    }
    fetchStory()
  }, [prompts])

  const t = useTranslations()

  return (
      <>
        <Head>
          <title>{title || t('creating_story')}</title>
        </Head>

        {indice.length > 0 && loading > 5 &&
          <div className='overflow-hidden h-full background-section-4'>
             <StoryViewer pages={indice} stream />
          </div>}

        {indice.length <= 0 && loading <= 5 && !description &&
        <div className='flex flex-col h-full w-full background-section-4'>
          <div className='flex flex-col justify-center items-center w-full h-2/3 text-gray-500 relative'>
            {[1, 2, 3, 4, 5].map((step) => (
                <section
                  key={step}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                        loading === step ? 'opacity-100' : 'opacity-0'
                    } flex justify-center items-center`}
                >
                  <p className='text-5xl flex items-center'>
                <span className={`underline decoration-${t(`loading_step_${step}_color`)}`}>
                  {t(`loading_step_${step}_action`)}
                </span>
                    &nbsp;{t(`loading_step_${step}_object`)}
                    <span role='img' aria-label={t(`loading_step_${step}_emoji_label`)} className='mr-2'>
                  {t(`loading_step_${step}_emoji`)}
                </span>
                  </p>
                </section>
            ))}
          </div>
        </div>}
      </>
  )
}

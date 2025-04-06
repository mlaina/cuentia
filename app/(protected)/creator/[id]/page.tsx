'use client'

import { useEffect, useRef, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import StoryViewer from '@/components/StoryViewer'
import { useTranslations } from 'next-intl'
import LoadingImageAnimation from '@/components/loading-image-animation'
import StoryStepper, { type Step } from '@/components/story-stepper'
import { useRouter } from 'next/navigation'

export const runtime = 'edge'

const IMAGES = [
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/b554f97a-2ccb-4700-9da2-cdd227f8de00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/1fda4855-4e9b-41d3-2c3d-3c6deca83400/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/035dd683-8635-4111-1e6d-f1eada67dc00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/7f20a316-fdaf-4f6f-fe78-3c87b47ba300/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/27c73af9-ee2b-4b77-7e86-661eb7eeef00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/1a531b04-c3d9-4eb2-d68e-d6cd13846600/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/461a7fe4-7e40-44c5-c12e-a06d27876900/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/f5935a77-bd6c-432f-6b0c-9a7501c94000/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/2c9caedd-7eaa-4c6a-772a-9bad95689800/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/a387cb47-354f-44b5-1582-397f40700400/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/8c0ce7e4-3eae-4c84-56b3-ad7004a19100/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/d8c0d37a-29f0-4e9f-3976-c6408f532d00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/b75f2714-8465-49ed-fca7-05e76e655100/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/df06a836-b11c-451a-1f21-8ae19ee40500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/97433eac-6907-446f-b7d1-9b2c3ad51400/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/de079655-2d7a-4ecb-3f04-83b28e19cd00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/f5b372b7-a7f2-404f-58fb-f0cbf6478f00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/3fa09938-5805-4ff7-5aa4-6aa8db73b400/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/d7db3dca-c25d-4053-57df-aa458ca7b400/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/eb6781bb-8676-4e8d-53d7-da414741c000/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/b51a2c9e-7a50-464d-5692-c58f14a7df00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/c376454c-b3ce-4a59-2c0c-9faee460d000/public'
]

const STORY_STEPS = (t: (key: string) => string): Step[] => [
  { id: 'ideation', label: t('stepper_ideation_label'), status: 'pending' },
  { id: 'structure', label: t('stepper_structure_label'), status: 'pending' },
  { id: 'covers', label: t('stepper_covers_label'), status: 'pending' },
  { id: 'pages', label: t('stepper_pages_label'), status: 'pending', progress: { current: 0, total: 0 } }
]

function sanitizeText (text: string): string {
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
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000))
    }
  }
}

function formatProtagonistDescription (protagonist: any, t: (key: string) => string): string {
  const parts: string[] = []
  if (protagonist.name) parts.push(protagonist.name)
  if (protagonist.age) parts.push(`${t('protagonist_age_label')}: ${protagonist.age}`)
  if (protagonist.height) parts.push(`${t('protagonist_height_label')}: ${t(protagonist.height)}`)
  if (protagonist.skin_color) parts.push(`${t('protagonist_skin_color_label')}: ${t(protagonist.skin_color)}`)
  if (protagonist.hair_color) parts.push(`${t('protagonist_hair_color_label')}: ${t(protagonist.hair_color)}`)
  if (protagonist.hair_type) parts.push(`${t('protagonist_hair_type_label')}: ${t(protagonist.hair_type)}`)
  if (protagonist.accessories && protagonist.accessories.length > 0) {
    const accessories = protagonist.accessories?.map((accessory: string) => t(accessory))
    parts.push(`${t('protagonist_accessories_label')}: ${accessories.join(', ')}`)
  }
  return parts.join(', ')
}

export default function CrearCuentoPage ({ params }: { params: { id: string } }) {
  const t = useTranslations()
  const [title, setTitle] = useState<string | null>(null)
  const [indice, setIndice] = useState<any[]>([])
  const [prompts, setPrompts] = useState<string[]>([])
  const [loading, setLoading] = useState(0)
  const [, setDescription] = useState<string | null>(null)
  const supabase = useSupabaseClient()
  const user = useUser()
  const hasExecutedRef = useRef(false)
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<string>('ideation')
  const [steps, setSteps] = useState<Step[]>(STORY_STEPS(t))
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

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

        if (error) throw error
        if (!data) {
          console.error('Story not found')
          return
        }

        let characters = ''
        for (const protagonistId of data.protagonists) {
          const { data: protagonistsData, error: protError } = await supabase
            .from('protagonists')
            .select('*')
            .eq('id', protagonistId)
            .single()

          if (protError) {
            console.error('Error fetching protagonist:', protError)
            continue
          }
          if (protagonistsData) {
            characters += formatProtagonistDescription(protagonistsData, t) + '\n'
          }
        }

        console.log('Fetched characters description:', characters)
        await handleCrearCuento({ ...data, protagonists: characters })
      } catch (error) {
        console.error('Error al cargar la historia:', error)
      }
    }

    fetchStory()
  }, [user, supabase, params.id, t])

  const updateCredits = async (cost: number) => {
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
    if (indice.length > 0) return

    const delay = 3000

    const loopLoading = async () => {
      let step = 1
      while (indice.length === 0) {
        setLoading(step)
        step = step === 5 ? 1 : step + 1
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    loopLoading()
  }, [indice])

  const createStoryIndex = async (story: any, description: string, length: number) => {
    try {
      setCurrentStep('structure')
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story, description, length, storyId: params.id })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const respIndex = await response.json()
        const index = JSON.parse(respIndex.index)
        const content = respIndex.content
        setTitle(index.title)
        setIndice(content)
        const pageCount = index.index.length
        setTotalPages(pageCount)
        console.log(`Total pages: ${pageCount}`)
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 'pages'
              ? { ...step, progress: { current: 0, total: pageCount } }
              : step
          )
        )
        return index
      }, 'Create Story Index')
    } catch (error) {
      console.error('Error creating story index:', error)
      alert(t('error_create_index_failed'))
      throw error
    }
  }

  const createPageFront = async (description: string, title: string) => {
    try {
      setCurrentStep('covers')
      await updateCredits(5)
      await withRetry(async () => {
        const response = await fetch('/api/story/front-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, title, storyId: params.id })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { image: frontCoverImage } = await response.json()
        setIndice((prev) => {
          const newIndice = [...prev]
          if (newIndice[0]) newIndice[0].imageUrl = frontCoverImage
          return newIndice
        })
      }, 'Create Front Page')
    } catch (error) {
      console.error('Error creating front page:', error)
      alert(t('error_create_front_cover_failed'))
      throw error
    }
  }

  const createPageBack = async (description: string, idea: string, length: number) => {
    try {
      await updateCredits(5)
      await withRetry(async () => {
        const response = await fetch('/api/story/back-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, idea, length, storyId: params.id })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { image: backCoverImage } = await response.json()
        setIndice((prev) => {
          const newIndice = [...prev]
          if (newIndice.length > 0) {
            newIndice[newIndice.length - 1].content = description
            newIndice[newIndice.length - 1].imageUrl = backCoverImage
          }
          return newIndice
        })
      }, 'Create Back Page')
    } catch (error) {
      console.error('Error creating back page:', error)
      alert(t('error_create_back_cover_failed'))
      throw error
    }
  }

  const createImagePage = async (description: string, number: number) => {
    try {
      await updateCredits(4)
      await withRetry(async () => {
        const response = await fetch('/api/story/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { image: pageImage } = await response.json()
        setIndice((prev) => {
          const newIndice = [...prev]
          if (newIndice[number]) newIndice[number].imageUrl = pageImage
          return newIndice
        })
      }, 'Create Image Page')
    } catch (error) {
      console.error('Error creating image page:', error)
      alert(t('error_create_image_failed'))
      throw error
    }
  }

  const buildPromptCover = async (text: string | null, mainElements: any, characters: string) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/prompt-image-front', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, mainElements, characters })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { prompt } = await response.json()
        return prompt
      }, 'Build Prompt Cover')
    } catch (error) {
      console.error('Error building cover prompt:', error)
      alert(t('error_build_cover_prompt_failed'))
      throw error
    }
  }

  const buildPromptImage = async (text: string | null, characters: string) => {
    try {
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/prompt-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, characters })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { prompt } = await response.json()
        return prompt
      }, 'Build Prompt Image')
    } catch (error) {
      console.error('Error building image prompt:', error)
      alert(t('error_build_image_prompt_failed'))
      throw error
    }
  }

  const developIdea = async (length: number, idea: string | undefined, characters: string | undefined) => {
    try {
      setCurrentStep('ideation')
      await updateCredits(1)
      return await withRetry(async () => {
        const response = await fetch('/api/story/idea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ length, idea, characters, storyId: params.id })
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const { idea: text } = await response.json()
        return text
      }, 'Develop Idea')
    } catch (error) {
      console.error('Error developing idea:', error)
      alert(t('error_develop_idea_failed'))
      throw error
    }
  }

  const handleCrearCuento = async (story: {
    id: string
    title: string | null
    content: any
    images: any
    idea: string
    length: number
    protagonists: string
  }) => {
    if (hasExecutedRef.current) return
    hasExecutedRef.current = true

    console.log('Creating story...')

    try {
      const description = await developIdea(story.length / 2, story.idea, story.protagonists)
      setDescription(description)

      const ind = await createStoryIndex(story, description, story.length / 2)

      const promptCover = await buildPromptCover(story.idea, ind.main_elements, story.protagonists)
      await Promise.all([
        createPageFront(promptCover, ind.title),
        createPageBack(promptCover, story.idea, story.length / 2)
      ])

      setCurrentStep('pages')

      const imageCreationPromises = []

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

        setCurrentPage(i + 1)

        setIndice((prev) => {
          const newIndice = [...prev]
          if (newIndice[i + 1]) {
            newIndice[i + 1].content = sanitizeText(page.text)
          }
          return newIndice
        })

        const prompt = await buildPromptImage(page.text, charactersDescription)
        setPrompts((prev) => [...prev, prompt])
        imageCreationPromises.push(createImagePage(prompt, i + 1))
      }

      await Promise.all(imageCreationPromises)

      console.log('All pages generated. Redirecting...')
      router.push(`/story/${params.id}`)
    } catch (error) {
      console.error('Failed to create story:', error)
      alert(t('error_story_creation_failed'))
    }
  }

  useEffect(() => {
    const updateStoryInDB = async () => {
      if (indice.length > 0 && user && params.id && title) {
        const images = indice[0]?.imageUrl ? [indice[0].imageUrl] : []
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
    updateStoryInDB()
  }, [indice, title, user, supabase, params.id])

  useEffect(() => {
    const updatePromptsInDB = async () => {
      if (prompts.length > 0 && user && params.id) {
        await supabase
          .from('stories')
          .update({
            images_prompts: prompts
          })
          .eq('author_id', user.id)
          .eq('id', params.id)
      }
    }
    updatePromptsInDB()
  }, [prompts, user, supabase, params.id])

  return (
      <div className='background-section-4 h-full'>
        <Head>
          <title>{title || t('page_title_creating')}</title>
        </Head>

        <div className='container mx-auto px-4 pt-6'>
          <StoryStepper steps={steps} currentStepId={currentStep} />

          {currentStep === 'pages' && totalPages > 0 && (
              <div className='text-center mt-2 text-secondary font-bold text-lg'>
                {t('status_generating_page', { currentPageDoubled: currentPage * 2, totalPagesDoubled: totalPages * 2 })}
              </div>
          )}
        </div>

        {indice.length > 0 && (
            <div className='container mx-auto max-w-4xl px-4 py-8'>
              <StoryViewer pages={indice} stream />
            </div>
        )}

        {indice.length <= 0 && (
            <div className='flex flex-col w-full '>
              <div className='flex flex-col justify-center items-center w-full mt-16 text-gray-500 relative'>
                {[1, 2, 3, 4, 5].map((step) => (
                    <section
                      key={step}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                            loading === step ? 'opacity-100' : 'opacity-0'
                        } flex justify-center items-center`}
                    >
                      <p className='text-2xl md:text-5xl flex items-center'>
                        <span className={`underline decoration-${t(`loading_step_${step}_color`)}`}>
                          {t(`loading_step_${step}_action`)}
                        </span>
                        <span className='ml-2'>
                          {t(`loading_step_${step}_object`)}
                        </span>
                      </p>
                    </section>
                ))}
              </div>
              <div>
                <LoadingImageAnimation images={IMAGES} maxVisibleImages={5} />
              </div>
            </div>
        )}
      </div>
  )
}

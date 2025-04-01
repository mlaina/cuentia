'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Font } from '@react-pdf/renderer'
import { useTranslations } from 'next-intl'
import { useUser } from '@supabase/auth-helpers-react'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

export default function StoryPage ({ params }) {
  const t = useTranslations()
  const [story, setStory] = useState(null)

  const router = useRouter()
  const user = useUser()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadStory () {
      if (!user) {
        router.push('/login')
        return
      }

      const { data: loadedStory, error } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .eq('id', Number(params.slug))
        .single()

      if (error) {
        console.error(t('error_fetching_story'), error)
        return
      }

      if (!loadedStory) {
        console.error(t('story_not_found'))
        return
      }

      setStory(loadedStory)
    }

    loadStory()
  }, [params.slug, router, supabase, t])

  if (!story) {
    return <div />
  }

  return (
      <div className='background-section-4 h-full relative'>
        <div className='max-w-6xl mx-auto'>
          <StoryViewer pages={story.content} />
        </div>
      </div>
  )
}

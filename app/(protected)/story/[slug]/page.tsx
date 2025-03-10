'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Page, Text, Document, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import he from 'he'
import { useTranslations } from 'next-intl'

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  content: {
    fontSize: 20,
    margin: 10,
    fontFamily: 'Roboto',
    lineHeight: 1.5,
    textAlign: 'justify'
  }
})

const MyDocument = ({ story, user }) => {
  const content = typeof story.content === 'string' ? JSON.parse(story.content) : story.content

  return (
      <Document>
        {content.map((page, index) => (
            <Page key={index} size='A4' style={styles.page}>
              {page.imageUrl && <Image alt='page' src={page.imageUrl} style={styles.coverImage} />}
              {page.content && <Text style={styles.content}>{he.decode(marked(page.content).replace(/<[^>]*>/g, ''))}</Text>}
            </Page>
        ))}
      </Document>
  )
}

export default function StoryPage ({ params }: { params: { slug: string } }) {
  const t = useTranslations()
  const [story, setStory] = useState(null)
  const [isLoadingEpub, setIsLoadingEpub] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadStory () {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .eq('id', Number(params.slug))
        .single()

      if (error) {
        console.error(t('error_fetching_story'), error)
        return
      }

      if (!story) {
        console.error(t('story_not_found'))
        return
      }

      setStory(story)
    }

    loadStory()
  }, [params.slug, router, supabase])

  const convertToEpub = async () => {
    if (!story) return

    setIsLoadingEpub(true)
    try {
      const response = await fetch('/api/generate-epub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id })
      })

      if (!response.ok) throw new Error(t('error_generating_epub'))

      const blob = await response.blob()
      saveAs(blob, `${story.title}.epub`)
    } catch (error) {
      console.error(t('error_converting_epub'), error)
    } finally {
      setIsLoadingEpub(false)
    }
  }

  const convertToPdf = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!story) return

    setIsLoadingPdf(true)
    try {
      const blob = await pdf(<MyDocument story={story} user={user} />).toBlob()
      saveAs(blob, `${story.title}.pdf`)
    } catch (error) {
      console.error(t('error_generating_pdf'), error)
    } finally {
      setIsLoadingPdf(false)
    }
  }

  if (!story) {
    return <div />
  }

  return (
      <div className='background-section-4 min-h-screen'>
        <div className='max-w-6xl mx-auto pb-10'>
          <StoryViewer pages={story.content} />
        </div>
        <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-center'>
          <button
            onClick={convertToEpub}
            disabled={isLoadingEpub}
            className='px-4 py-2 bg-accent text-primary rounded hover:bg-secondary-100 transition-colors'
          >
            {isLoadingEpub ? t('generating_epub') : t('convert_to_epub')}
          </button>
          <button
            onClick={convertToPdf}
            disabled={isLoadingPdf}
            className='ml-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
          >
            {isLoadingPdf ? t('generating_pdf') : t('convert_to_pdf')}
          </button>
        </div>
      </div>
  )
}

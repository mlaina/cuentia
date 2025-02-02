'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StoryViewer from '@/components/StoryViewer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Page, Text, View, Document, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { marked } from 'marked'
import he from 'he'

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
  title: {
    fontSize: 24,
    fontFamily: 'Roboto',
    marginBottom: 10,
    textAlign: 'center'
  },
  content: {
    fontSize: 20,
    margin: 10,
    fontFamily: 'Roboto',
    lineHeight: 1.5,
    textAlign: 'justify'
  },
  pageImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
})

const MyDocument = ({ story, user }) => {
  const content = typeof story.content === 'string' ? JSON.parse(story.content) : story.content

  const coverImage = content[0]?.imageUrl
  const backCoverImage = content[content.length - 1]?.imageUrl

  const markdownToPlainText = (markdown) => {
    return marked(markdown).replace(/<[^>]*>/g, '')
  }

  return (
    <Document>
      <Page size='A4' style={styles.page}>
          <Image alt='cover' src={coverImage} style={styles.coverImage} />
      </Page>

      {content.map((page, index) => {
        if ((index === 0 && coverImage) || (index === content.length - 1 && backCoverImage)) return null

        return (
          // eslint-disable-next-line react/jsx-key
          <>
            <Page size='A4' style={styles.page}>
              {page.content && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.content}>{he.decode(markdownToPlainText(page.content))}</Text>
                </View>
              )}
            </Page>
            <Page size='A4' style={styles.page}>
              {page.imageUrl && <Image alt='a4' src={page.imageUrl} style={styles.pageImage} />}
            </Page>
          </>
        )
      })}

      {backCoverImage && (
          <Page size='A4' style={styles.page}>
            <Image src={backCoverImage} alt='cover' style={styles.coverImage} />
          </Page>
      )}
    </Document>
  )
}

export default function StoryPage ({ params }: { params: { slug: string } }) {
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
        console.error('Error fetching story:', error)
        return
      }

      if (!story) {
        console.error('Story not found')
        return
      }

      const hasMissingImages = story.content.some(page => !page.imageUrl)
      if (hasMissingImages) {
        router.push(`/creator/${story.id}`)
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storyId: story.id })
      })

      if (!response.ok) {
        throw new Error('Failed to generate EPUB')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${story.title}.epub`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error converting to EPUB:', error)
      alert('Failed to generate EPUB. Please try again.')
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
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsLoadingPdf(false)
    }
  }

  if (!story) {
    return <div />
  }

  return (
      <div className='background-section-4 min-h-screen'>
        <div className='mb-4 max-w-6xl mx-auto hidden md:flex justify-center'>
          <button
            onClick={convertToEpub}
            disabled={isLoadingEpub}
            className='px-4 py-2 bg-accent text-primary rounded hover:bg-secondary-100  transition-colors'
          >
            {isLoadingEpub ? 'Generando EPUB...' : 'Convertir a EPUB'}
          </button>
          <button
            onClick={convertToPdf}
            disabled={isLoadingPdf}
            className='ml-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
          >
            {isLoadingPdf ? 'Generando PDF...' : 'Convertir a PDF'}
          </button>
        </div>
        <div className='max-w-6xl mx-auto pb-10'>
          <StoryViewer pages={story.content} />
        </div>
        <div className='max-w-6xl pb-4 mx-auto flex md:hidden justify-center'>
          <button
            onClick={convertToEpub}
            disabled={isLoadingEpub}
            className='px-4 py-2 bg-accent text-primary rounded hover:bg-secondary-100  transition-colors'
          >
            {isLoadingEpub ? 'Generando EPUB...' : 'Convertir a EPUB'}
          </button>
          <button
            onClick={convertToPdf}
            disabled={isLoadingPdf}
            className='ml-2 px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-700 transition-colors'
          >
            {isLoadingPdf ? 'Generando PDF...' : 'Convertir a PDF'}
          </button>
        </div>
      </div>
  )
}

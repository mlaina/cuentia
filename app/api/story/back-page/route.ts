import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import Replicate from 'replicate'
import { uploadImage } from '@/lib/cloudflare'

const replicate = new Replicate()

async function backGenerator (image, description, IMAGINS) {
  const formData = new FormData()
  const imageResponse = await axios.get(typeof image === 'string' ? image : image[0], {
    responseType: 'arraybuffer'
  })
  const imageBuffer = Buffer.from(imageResponse.data, 'binary')
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
  formData.append('image', imageBlob, 'image.png')

  formData.append('description', description)
  formData.append('IMAGINS', IMAGINS)
  const response = await axios.post(process.env.RENDER_UTILS_URL + '/process-image-back', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'arraybuffer',
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  return new Blob([response.data], { type: 'image/jpeg' })
}

// Función para actualizar clean_covers
async function updateCleanCovers (supabase, user, storyId, image, prompt) {
  const imageResponse = await axios.get(typeof image === 'string' ? image : image[0], {
    responseType: 'arraybuffer'
  })
  const imageBuffer = Buffer.from(imageResponse.data, 'binary')
  const cfCleanImageUrl = await uploadImage(imageBuffer)
  const { data: currentStory } = await supabase
    .from('stories')
    .select('clean_covers')
    .eq('author_id', user.id)
    .eq('id', storyId)
    .single()

  const updatedCleanCovers = {
    ...currentStory?.clean_covers,
    back: cfCleanImageUrl
  }

  return supabase.from('stories').update({
    clean_covers: updatedCleanCovers,
    back_prompt: prompt
  })
    .eq('author_id', user.id)
    .eq('id', storyId)
}

async function modifiedImageGen (image, idea, IMAGINS) {
  const modifiedImage = await backGenerator(image, idea, IMAGINS)

  return await uploadImage(modifiedImage)
}

export async function POST (req) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    const { data: userData } = await supabase
      .from('users')
      .select('lang')
      .eq('user_id', user.id)
      .maybeSingle()

    const lan = (userData && userData.lang) ? userData.lang : 'en'
    let prompts
    try {
      prompts = await import(`@/locales/${lan}.json`)
      prompts = prompts.default || prompts
    } catch (error) {
      console.log('Error:', error)
      prompts = await import('@/locales/en.json')
      prompts = prompts.default || prompts
    }

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, idea, storyId } = await req.json()

    const promptBack = `Create a vivid animated background for a book cover that reflects ${description}. Style: Vibrant colors, expansive storyworlds. Emphasize serene landscapes, ambient scenery, and subtle abstract elements without a distinct main focal point. Output in English.`

    let image = null
    try {
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptBack,
          aspect_ratio: '4:5',
          seed: 5555
        }
      })
    } catch (err) {
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptBack,
          aspect_ratio: '4:5',
          seed: 5555
        }
      })
    }

    const [, cfImageUrl] = await Promise.all([
      updateCleanCovers(supabase, user, storyId, image, promptBack),
      modifiedImageGen(image, idea, prompts.back_imagins)
    ])

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

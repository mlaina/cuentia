import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import Replicate from 'replicate'
import { uploadImage } from '@/lib/cloudflare'

const replicate = new Replicate()

const IMAGINS = '"La imaginación es la chispa que enciende los sueños y da forma al futuro. Es el poder de transformar lo imposible en posible, abriendo puertas a ideas y soluciones que desafían los límites. Cuando dejamos volar nuestra mente, conectamos con un potencial ilimitado para crear y reinventar el mundo." - Imagins Team'

async function backGenerator (image, description) {
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

export async function POST (req) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, idea } = await req.json()

    const promptBack = `Create a vivid animated background for a book cover that reflects ${description}. Style: Vibrant colors, expansive storyworlds. Emphasize serene landscapes, ambient scenery, and subtle abstract elements without a distinct main focal point. Output in English.`

    let image = null
    try {
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptBack,
          aspect_ratio: '4:5'
        }
      })
    } catch (err) {
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptBack,
          aspect_ratio: '4:5'
        }
      })
    }

    const modifiedImage = await backGenerator(image, idea)
    const cfImageUrl = await uploadImage(modifiedImage)

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

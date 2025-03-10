import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import Replicate from 'replicate'
import { uploadImage } from '@/lib/cloudflare'
import frontTemplate from '@/types/prompts/front.json'

const replicate = new Replicate()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function titleGenerator (image: string | object, title: any, user: string) {
  try {
    const formData = new FormData()
    // @ts-ignore
    const completionFront = await openai.chat.completions.create({
      ...frontTemplate,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `¿En qué posición y color en formato RGB iría el título "${title}"? top-center o bottom-center. Por favor, devuelve el color en formato RGB (por ejemplo, "255, 255, 255").`
            },
            {
              type: 'image_url',
              image_url: {
                url: typeof image === 'string' ? image : image[0]
              }
            }
          ]
        }
      ]
    })

    const imageResponse = await axios.get(typeof image === 'string' ? image : image[0], {
      responseType: 'arraybuffer'
    })
    const imageBuffer = Buffer.from(imageResponse.data, 'binary')

    const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
    formData.append('image', imageBlob, 'image.png')

    const info = JSON.parse(completionFront.choices[0].message.content)
    if (!info.position || !info.color) {
      info.position = 'bottom-center'
      info.color = 'white'
    }
    formData.append('info', JSON.stringify(info))

    formData.append('user', String(user))
    formData.append('title', String(title))

    const response = await axios.post(process.env.RENDER_UTILS_URL + '/process-image-front', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer',
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    })

    return new Blob([response.data], { type: 'image/jpeg' })
  } catch (error) {
    console.error('Error al procesar la imagen:', error)
    throw error
  }
}

export async function POST (req) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, title } = await req.json()

    const promptFront = `Create a vivid animation style amazing frontpage about ${description} Style: Vibrant colors, expansive storyworlds, stylized characters, flowing motion`
    let image = null
    try {
      // @ts-ignore
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptFront,
          aspect_ratio: '4:5'
        }
      })
    } catch (err) {
      // @ts-ignore
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptFront,
          aspect_ratio: '4:5'
        }
      })
    }

    const modifiedImage = await titleGenerator(image, title, user.user_metadata.full_name || user.email)

    if (!modifiedImage) {
      throw new Error('Error al generar la imagen con título')
    }

    const cfImageUrl = await uploadImage(modifiedImage)

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

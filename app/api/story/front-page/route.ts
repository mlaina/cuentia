import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import Replicate from 'replicate'
import { uploadImage } from '@/lib/cloudflare'
import { supabase } from '@/lib/supabase/client'

const replicate = new Replicate()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function titleGenerator (image: string | object, title: any, user: string, storyId : any, userId, supabase) {
  try {
    const formData = new FormData()

    const responseA = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that analyzes images.'
        },
        {
          role: 'system',
          content: `Return a JSON with 'position' and 'color'. 
                    Provide only the JSON output, without code blocks. 
                    The 'position' can be 'top', 'center', or 'bottom'. 
                    The 'color' should be a HEX value to ensure good contrast 
                    and avoid covering key elements of the image.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Decide where to place this title and what color to use: "${title}". 
                     Focus on readability and avoiding covering important elements. 
                     Place the title in the least interesting third of the image. 
                     It does not necessarily have to be white.`
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

    const info = JSON.parse(responseA.choices[0].message.content)
    console.log('info:', info)
    if (!info.position || !info.color) {
      info.position = 'bottom'
      info.color = 'white'
    }
    await supabase
      .from('stories')
      .update({
        position_title: info,
        author_cover: user
      })
      .eq('id', storyId)
      .eq('author_id', userId)

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
    front: cfCleanImageUrl
  }

  return supabase.from('stories').update({
    clean_covers: updatedCleanCovers,
    front_prompt: prompt
  })
    .eq('author_id', user.id)
    .eq('id', storyId)
}

async function modifiedImageGen (image, title, user, storyId :any, userId, supabase) {
  const modifiedImage = await titleGenerator(image, title, user.user_metadata.full_name || user.email, storyId, userId, supabase)

  if (!modifiedImage) {
    throw new Error('Error al generar la imagen con título')
  }

  return await uploadImage(modifiedImage)
}

export async function POST (req) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, title, storyId } = await req.json()

    const promptFront = `Create a vivid animation style amazing frontpage about ${description} Style: Vibrant colors, expansive storyworlds, stylized characters, flowing motion`
    let image = null
    try {
      // @ts-ignore
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptFront,
          aspect_ratio: '4:5',
          seed: 333
        }
      })
    } catch (err) {
      // @ts-ignore
      image = await replicate.run(process.env.IMAGE_MODEL, {
        input: {
          prompt: promptFront,
          aspect_ratio: '4:5',
          seed: 333
        }
      })
    }

    const [, cfImageUrl] = await Promise.all([
      updateCleanCovers(supabase, user, storyId, image, promptFront),
      modifiedImageGen(image, title, user, storyId, user.id, supabase)
    ])

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

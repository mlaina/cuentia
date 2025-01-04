import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient, User } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import frontTemplate from '@/types/prompts/front.json'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import Replicate from 'replicate'
import { uploadImage, wrapText } from '@/lib/cloudflare'

const replicate = new Replicate()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

path.resolve(process.cwd(), 'fonts', 'fonts.conf')
path.resolve(process.cwd(), 'fonts', 'Poppins-Regular.ttf')

sharp.cache(false)
if (process.env.NODE_ENV === 'production') {
  process.env.FONTCONFIG_PATH = '/var/task/fonts'
  process.env.LD_LIBRARY_PATH = '/var/task'
}

async function titleGenerator (image: string | object, title: any, user: User) {
  // @ts-ignore
  const response = await axios.get(image, { responseType: 'arraybuffer' })
  const buffer = Buffer.from(response.data, 'binary')

  const maxLineLength = 25
  const wrappedTitle = wrapText(title, maxLineLength)

  let i = {
    position: 'top-center',
    color: 'white'
  }
  try {
    // @ts-ignore
    const completionFront = await openai.chat.completions.create({
      ...frontTemplate,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `¿En qué posición y color iría el título "${title}"? top-center o bottom-center y white o black.`
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ]
    })

    // @ts-ignore
    i = JSON.parse(completionFront.choices[0].message.content)
  } catch (error) {
    console.log('Error al analizar front:', error)
  }

  let htmlTitle
  let htmlAuthor

  if (i.position === 'bottom-center') {
    if (wrappedTitle.length === 1) {
      htmlTitle = `<text x="50%" y="80%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[0]}</text>`
      htmlAuthor = `<text x="50%" y="85%" font-family="Poppins" font-size="38" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${user.user_metadata.name || user.email}</text>`
    } else {
      htmlTitle = `
            <text x="50%" y="75%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[0]}</text>
            <text x="50%" y="80%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[1]}</text>
        `
      htmlAuthor = `<text x="50%" y="87%" font-family="Poppins" font-size="38" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${user.user_metadata.name || user.email}</text>`
    }
  } else {
    if (wrappedTitle.length === 1) {
      htmlTitle = `<text x="50%" y="15%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[0]}</text>`
      htmlAuthor = `<text x="50%" y="20%" font-family="Poppins" font-size="38" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${user.user_metadata.name || user.email}</text>`
    } else {
      htmlTitle = `
            <text x="50%" y="10%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[0]}</text>
            <text x="50%" y="15%" font-family="Poppins" font-size="62" font-weight="bold" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${wrappedTitle[1]}</text>
        `
      htmlAuthor = `<text x="50%" y="22%" font-family="Poppins" font-size="38" fill="${i.color}" text-anchor="middle" dominant-baseline="middle">${user.user_metadata.name || user.email}</text>`
    }
  }

  const logoPath = path.join(process.cwd(), 'public', 'favicon.svg')
  const logoBuffer = fs.readFileSync(logoPath)
  const resizedLogoBuffer = await sharp(logoBuffer)
    .resize({ width: 70 })
    .toBuffer()

  const modifiedImage = await sharp(buffer)
    .resize(1000, 1250)
    .composite([
      {
        input: Buffer.from(`<svg width="1000" height="1250">
                    <style>
                          @font-face {
                            font-family: 'Poppins';
                            src: url(https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2) format('woff2');
                          }
                    </style>
                    ${htmlTitle}
                    ${htmlAuthor}
                </svg>`),
        gravity: 'north'
      },
      {
        input: resizedLogoBuffer,
        gravity: 'southwest',
        blend: 'over',
        top: 1160,
        left: 80
      }
    ])
    .toBuffer()

  return modifiedImage
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

    const modifiedImage = await titleGenerator(image, title, user)
    const cfImageUrl = await uploadImage(modifiedImage)

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

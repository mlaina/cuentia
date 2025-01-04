import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'
import Replicate from 'replicate'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { uploadImage, wrapText } from '@/lib/cloudflare'

const replicate = new Replicate()

const IMAGINS = '"La imaginación es la chispa que enciende los sueños y da forma al futuro. Es el poder de transformar lo imposible en posible, abriendo puertas a ideas y soluciones que desafían los límites. Cuando dejamos volar nuestra mente, conectamos con un potencial ilimitado para crear y reinventar el mundo."'

path.resolve(process.cwd(), 'fonts', 'fonts.conf')
path.resolve(process.cwd(), 'fonts', 'Poppins-Regular.ttf')

async function backGenerator (image, description) {
  const response = await axios.get(image, { responseType: 'arraybuffer' })
  const buffer = Buffer.from(response.data, 'binary')

  const maxLineLength = 56
  const wrappedTitle = wrapText(description, maxLineLength)
  const wrappedImagins = wrapText(IMAGINS, maxLineLength)

  const htmlTitle = wrappedTitle
    .map((line, index) => {
      return `<text x="70" y="${15 + index * 3}%" font-family="Poppins" font-size="32" fill="black" text-anchor="start" dominant-baseline="middle">${line}</text>`
    })
    .join('\n')

  const htmlImagins = wrappedImagins
    .map((line, index) => {
      return `<text x="70" y="${20 + (index + wrappedTitle.length) * 3}%" font-family="Poppins" font-size="32" fill="black" text-anchor="start" dominant-baseline="middle">${line}</text>`
    })
    .join('\n')

  const htmlOverlay = `
    <svg width="1000" height="1250">
        <style>
              @font-face {
                font-family: 'Poppins';
                src: url(https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLGT9Z1JlFc-K.woff2) format('woff2');
              }
        </style>
        <filter id="blurFilter" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
        <rect x="35" y="140" width="900" height="${wrappedTitle.length * 50}" fill="white" fill-opacity="0.6" rx="15" ry="15"></rect>
        ${htmlTitle}

        <rect x="35" y="${140 + wrappedTitle.length * 50 + 25}" width="900" height="${wrappedImagins.length * 50}" fill="white" fill-opacity="0.6" rx="15" ry="15"></rect>
        ${htmlImagins}
    </svg>
  `

  const logoPath = path.join(process.cwd(), 'public', 'favicon.svg')
  const logoBuffer = fs.readFileSync(logoPath)
  const resizedLogoBuffer = await sharp(logoBuffer)
    .resize({ width: 70 })
    .toBuffer()

  const modifiedImage = await sharp(buffer)
    .resize(1000, 1250)
    .composite([
      {
        input: Buffer.from(htmlOverlay),
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

    const { idea, description } = await req.json()

    const promptBack = `Create a vivid animation about ${description} Style: Vibrant colors, expansive storyworlds. Focus on landscapes, objects, or abstract elements`

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

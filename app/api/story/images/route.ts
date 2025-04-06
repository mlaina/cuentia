import Replicate from 'replicate'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { uploadImageUrl } from '@/lib/cloudflare'

const replicate = new Replicate()

export async function POST (req) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // eslint-disable-next-line camelcase
  const { description, image_prompt, seed } = await req.json()

  const prompt = `Vivid animation style modern animation. ${description} Vibrant colors, expansive storyworlds, stylized characters, flowing motion.`

  try {
    let output
    const input = {
      prompt,
      aspect_ratio: '4:5',
      seed: seed ? 333 : undefined
    }

    // Add image_prompt if provided
    // eslint-disable-next-line camelcase
    if (image_prompt) {
      // eslint-disable-next-line camelcase
      input.image_prompt = image_prompt
    }

    try {
      // @ts-ignore
      output = await replicate.run(process.env.IMAGE_MODEL, {
        input
      })
    } catch (err) {
      // Retry once if it fails
      // @ts-ignore
      output = await replicate.run(process.env.IMAGE_MODEL, {
        input
      })
    }

    const image = Array.isArray(output) ? output[0] : output

    const cfImageUrl = await uploadImageUrl(image)

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error procesando la imagen' }, { status: 500 })
  }
}

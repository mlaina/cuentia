import Replicate from 'replicate'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { uploadImageUrl } from '@/lib/cloudflare'

const replicate = new Replicate()

export async function POST (req: { json: () => PromiseLike<{ description: any }> | { description: any } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { description } = await req.json()

  const prompt = `vivid animation style. ${description} Style: Vibrant colors, expansive storyworlds, stylized characters, flowing motion`
  try {
    // @ts-ignore
    const output = await replicate.run(process.env.IMAGE_MODEL, {
      input: {
        prompt, aspect_ratio: '4:5'
      }
    })

    const image = Array.isArray(output) ? output[0] : output

    const cfImageUrl = await uploadImageUrl(image)

    return NextResponse.json({ image: cfImageUrl })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error procesando la imagen' }, { status: 500 })
  }
}

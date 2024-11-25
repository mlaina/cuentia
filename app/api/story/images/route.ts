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

  const { description } = await req.json()

  const prompt = `vivid animation style. ${description} Style: Vibrant colors, expansive storyworlds, stylized characters, flowing motion`
  console.log('prompt', prompt)
  const output = await replicate.run(process.env.IMAGE_MODEL, {
    input: {
      prompt, aspect_ratio: '4:5'
    }
  })
  const image = Array.isArray(output) ? output[0] : output

  const cfImageUrl = await uploadImageUrl(image)

  return NextResponse.json({ image: cfImageUrl })
}

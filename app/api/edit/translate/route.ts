import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'

export async function POST (req: { json: () => PromiseLike<{ length: any; story: any }> | { length: any; story: any } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { prompt } = await req.json()

    const messages = [
      {
        role: 'user',
        content: 'Translate this prompt to English: "' + prompt + '" only the prompt, no other text'
      }
    ]

    // @ts-ignore
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages
    })

    return NextResponse.json({ description: completion.choices[0].message.content }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

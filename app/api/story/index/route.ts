import storyIndexTemplate from '@/types/prompts/index.json'
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

    const { length, story } = await req.json()

    let indexPrompt = `Crear un cuento con ${length} páginas sobre ${story.idea}. El título debe ser corto y atractivo. Debe haber una apertura, un nudo y un desenlace, acciones y eventos directos.`
    if (story.protagonists) {
      indexPrompt = `Crear un cuento con ${length} páginas sobre ${story.idea}. Debe salir de protagonistas: ${story.protagonists} El título debe ser corto y atractivo.`
    }
    // @ts-ignore
    const completion = await openai.chat.completions.create({
      ...storyIndexTemplate,
      messages: [
        {
          role: 'user',
          content: indexPrompt
        }
      ]
    })

    const content = [
      { content: '', imageUrl: '' },
      ...Array.from({ length }, () => ({ content: '', imageUrl: '' })),
      { content: story.description, imageUrl: '' }
    ]

    console.log(completion.choices[0].message.content)

    return NextResponse.json({ index: completion.choices[0].message.content, content }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

import storyIndexTemplate from '@/types/prompts/index.json'
import indexStructure from '@/types/prompts/index_structure.json'
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

    let indexPrompt = `Crear un cuento con ${length} páginas sobre ${story.idea}.`
    if (story.protagonists) {
      indexPrompt = `Crear un cuento con ${length} páginas sobre ${story.idea}. Debe salir de protagonistas: ${story.protagonists} `
    }

    const messages = []

    messages.push({
      role: 'system',
      content: 'Eres un asistente que genera índices de cuentos para niños.'
    })
    messages.push({
      role: 'user',
      content: indexPrompt
    })
    messages.push({
      role: 'user',
      content: 'El título debe ser CORTO (no más de TRES palabras).  La descripción de la imagen de portada tiene que ser en inglés y descriptiva, épica y espectacular. La descripción de backpage_description tiene que ser un prompt en inglés de un paisaje tranquilo sin elementos impresionantes.'
    })
    messages.push({
      role: 'user',
      content: indexStructure.toString()
    })
    messages.push({
      role: 'user',
      content: 'Tienes que construir la historia utilizando los elementos proporcionados en el último mensaje. Ten en cuenta que los elementos están indexados para indicar su orden cronológico'
    })
    messages.push({
      role: 'user',
      content: 'Puede haber varios elementos en una misma página, pero se debe respetar su orden. Cada página tendrá un image_info para indicar información sobre la imagen a generar.'
    })

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

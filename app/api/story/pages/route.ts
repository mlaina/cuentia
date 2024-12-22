import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import storyPagesTemplate from '@/types/prompts/page.json'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'

export async function POST (req: { json: () => PromiseLike<{ index: any; number: any; historic: any }> | { index: any; number: any; historic: any } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { index, number, historic } = await req.json()

    const messages = []

    historic.forEach((page: { content: any }) => {
      if (page.content) {
        messages.push({
          role: 'assistant',
          content: page.content
        })
      }
    })

    if (!index[number - 1]?.summary) {
      return NextResponse.json({ error: 'No hay resumen' }, { status: 500 })
    }

    const prompt = `Profundiza en: ${index[number - 1].summary}. La respuesta debe en markdown, separando partes y resaltando nombres. No pongas títulos ni números de página. Debe ser corto un parrafo. El texto acompañará a una imagen por lo que el texto no tiene que tener ninguna descripción, tiene que ir directo a la acción. `
    messages.push({
      role: 'user',
      content: prompt
    })

    // @ts-ignore
    const completion = await openai.chat.completions.create({
      ...storyPagesTemplate,
      messages,
      max_tokens: 500
    })

    // @ts-ignore
    const page = JSON.parse(completion.choices[0].message.content)

    return NextResponse.json({ page }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

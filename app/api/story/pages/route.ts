import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import storyPagesTemplate from '@/types/prompts/page.json'
import OpenAI from 'openai'

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

    const { index, number, historic, protagonists } = await req.json()

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

    messages.push({
      role: 'system',
      content: 'Eres un asistente que desarrolla páginas de cuentos para niños y descripciones de imágenes correspondientes.'
    })
    const prompt = `Enriquece: ${index[number - 1].summary}. `
    messages.push({
      role: 'user',
      content: prompt
    })
    messages.push({
      role: 'user',
      content: 'No pongas títulos ni números de página. Página corta y directa.'
    })
    messages.push({
      role: 'user',
      content: 'Minimiza las descripciones de objetos y espacios, maximiza las acciones y diálogos.'
    })
    messages.push({
      role: 'user',
      content: 'La descripción de la imagen debe ser en inglés relacionada con: ' + index[number - 1].image_info
    })
    messages.push({
      role: 'user',
      content: 'Si en la información de la imagen aparece alguno de los protagonistas, utiliza esta descripción para añadirla sintetizada en la descripción de la imagen si es necesario: ' + protagonists
    })
    messages.push({
      role: 'user',
      content: 'Solo añade información de los protagonistas si es relevante para la página. Evita hacerlo si no lo es.'
    })
    messages.push({
      role: 'user',
      content: 'Usa un máximo de 1000 caracteres. En español.'
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

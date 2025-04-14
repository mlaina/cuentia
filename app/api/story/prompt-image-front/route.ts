import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from 'replicate'

export const runtime = 'edge'

const replicate = new Replicate()

async function deepseekStream (promptText: any) {
  const inputData = { prompt: promptText }
  let outputBuffer = ''

  // Itera sobre los eventos del stream
  // @ts-ignore
  for await (const event of replicate.stream(process.env.PROMPT_MODEL, { input: inputData })) {
    const eventText = event.data !== undefined ? event.data : String(event)
    outputBuffer += eventText
  }

  // Elimina todos los bloques entre <think> y </think>
  return outputBuffer.replace(/<think>.*?<\/think>/gs, '').trim()
}

export async function POST (req: { json: () => PromiseLike<{ length: any; story: any }> | { length: any; story: any } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const lang = 'en'
    let prompts = await import(`@/locales/${lang}.json`)
    prompts = prompts.default || prompts

    // @ts-ignore
    const { text, mainElements, characters } = await req.json()
    const compositePrompt = prompts.cover_image_prompt
      .replace('{idea}', text)
      .replace('{characters}', characters)
      .replace('{elements}', mainElements)

    let refinedOutput = await deepseekStream(compositePrompt)
    refinedOutput = refinedOutput.trim()

    if (refinedOutput.endsWith('{}')) {
      refinedOutput = refinedOutput.slice(0, -2).trim()
    }

    const wordsToRemove = [
      'Verbal',
      'verbal',
      'Tense',
      'tense',
      'conversation',
      'talking',
      'dialogue',
      'discussing',
      'exchange',
      'confrontational'
    ]
    for (const word of wordsToRemove) {
      refinedOutput = refinedOutput.replace(new RegExp(word, 'g'), '').trim()
    }

    return NextResponse.json({ prompt: refinedOutput }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

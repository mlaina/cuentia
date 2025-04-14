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

    const { data: userData } = await supabase
      .from('users')
      .select('lang')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const lan = (userData && userData.lang) ? userData.lang : 'en'
    let prompts
    try {
      prompts = await import(`@/locales/${lan}.json`)
      prompts = prompts.default || prompts
    } catch (error) {
      console.log('Error:', error)
      prompts = await import('@/locales/en.json')
      prompts = prompts.default || prompts
    }

    // @ts-ignore
    const { length, idea, characters, storyId } = await req.json()

    const compositePrompt = prompts.reasoner_prompt
      .replace('{idea}', idea)
      .replace('{characters}', characters)
      .replace('{length}', length)

    let refinedOutput = await deepseekStream(compositePrompt)
    refinedOutput = refinedOutput.trim()

    if (refinedOutput.endsWith('{}')) {
      refinedOutput = refinedOutput.slice(0, -2).trim()
    }

    await supabase.from('stories').update({
      idea_prompt: compositePrompt
    })
      .eq('author_id', user.id)
      .eq('id', storyId)

    return NextResponse.json({ idea: refinedOutput }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

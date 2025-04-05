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
  for await (const event of replicate.stream('deepseek-ai/deepseek-r1', { input: inputData })) {
    const eventText = event.data !== undefined ? event.data : String(event)
    outputBuffer += eventText
  }

  // Elimina todos los bloques entre <think> y </think>
  let refinedOutput = outputBuffer.replace(/<think>.*?<\/think>/gs, '').trim()

  refinedOutput = refinedOutput.trim()

  if (refinedOutput.endsWith('{}')) {
    refinedOutput = refinedOutput.slice(0, -2).trim()
  }

  return refinedOutput
}

export async function POST (req: { json: () => PromiseLike<{ description: any }> | { description: any } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { prompt, index, storyId } = await req.json()

  try {
    const { data } = await supabase
      .from('stories')
      .select('id, content')
      .eq('id', storyId)
      .single()

    const contents = data.content.slice(1, -1).map((c) => c.content).join(' ')

    const current = data.content[index].content

    const lang = 'en'
    let prompts = await import(`@/locales/${lang}.json`)
    prompts = prompts.default || prompts

    const compositePrompt = prompts.editcontent
      .replace('{contents}', contents)
      .replace('{prompt}', prompt)
      .replace('{current}', current)

    const newContent = await deepseekStream(compositePrompt)

    return NextResponse.json({ newContent })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error procesando la imagen' }, { status: 500 })
  }
}

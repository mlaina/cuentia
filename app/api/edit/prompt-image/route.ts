import Replicate from 'replicate'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

  const { prompt, storyId, index } = await req.json()

  try {
    const { data } = await supabase
      .from('stories')
      .select('images_prompts')
      .eq('author_id', user.id)
      .eq('id', storyId)
      .single()

    const oldprompt = data?.images_prompts[index - 1]
    const lang = 'en'

    let prompts = await import(`@/locales/${lang}.json`)

    prompts = prompts.default || prompts
    const compositePrompt = prompts.edit_image
      .replace('{prompt}', prompt)
      .replace('{oldprompt}', oldprompt)

    const description = await deepseekStream(compositePrompt)

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error procesando la imagen' }, { status: 500 })
  }
}

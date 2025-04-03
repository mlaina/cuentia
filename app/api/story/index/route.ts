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
      prompts = await import('@/locales/en.json')
      prompts = prompts.default || prompts
    }

    const { length, story, description, storyId } = await req.json()

    const messages = [
      {
        role: 'system',
        content: prompts.system_mission.replace('{length}', length)
      },
      {
        role: 'system',
        content: prompts.system_format
      },
      {
        role: 'system',
        content: prompts.system_remember
      },
      {
        role: 'system',
        content: prompts.system_illustration
      },
      {
        role: 'system',
        content: prompts.system_no_all_characters
      },
      {
        role: 'user',
        content: prompts.user_characters.replace(
          '{characters}',
          JSON.stringify(story.protagonists, null, 2)
        )
      },
      {
        role: 'user',
        content: prompts.user_main_idea
      },
      {
        role: 'user',
        content: description
      },
      {
        role: 'user',
        content: prompts.user_story_requirement
      }
    ]

    const completion = await openai.chat.completions.create({
      ...storyIndexTemplate,
      max_tokens: 16384,
      messages
    })

    const content = [
      { content: '', imageUrl: '' },
      ...Array.from({ length }, () => ({ content: '', imageUrl: '' })),
      { content: story.description, imageUrl: '' }
    ]
    await supabase.from('stories').update({
      index_prompts: messages
    })
      .eq('author_id', user.id)
      .eq('id', storyId)

    return NextResponse.json({ index: completion.choices[0].message.content, content }, { status: 200 })
  } catch (error) {
    console.error('Error al generar la historia:', error)
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 })
  }
}

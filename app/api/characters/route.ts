import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from 'replicate'
import { deleteImage, uploadImage } from '@/lib/cloudflare'
import OpenAI from 'openai'

const replicate = new Replicate()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST (req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  try {
    const imageUrl = await uploadImage(await imageFile.arrayBuffer())

    const imageId = imageUrl.split('/')[4]

    const input = {
      image: imageUrl,
      prompt: 'Describe the character of this image in detail. Color of the hair, eyes, skin, height, and any other relevant details. Be concise and direct, do not describe every detail. Do not mention the location of the character. Estimate the age of the character based on the image.'
    }

    const output = await replicate.run(
      'daanelson/minigpt-4:e447a8583cffd86ce3b93f9c2cd24f2eae603d99ace6afa94b33a08e94a3cd06',
      { input }
    )

    await deleteImage(imageId)

    return NextResponse.json({ success: true, description: output })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Error procesando la imagen' }, { status: 500 })
  }
}

export async function PUT (req: { json: () => PromiseLike<{ description: any }> | { description: any } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { protagonistId } = await req.json()
  try {
    const { data: protagonist, error } = await supabase
      .from('protagonists')
      .select('id, name, physical_description, descriptions')
      .eq('id', protagonistId)
      .single()

    if (error || !protagonist) {
      return NextResponse.json({ error: 'Protagonista no encontrado' }, { status: 404 })
    }

    const validDescriptions = (protagonist.descriptions || []).filter(
      (desc: string | null) => desc && desc.trim() !== ''
    )

    if (validDescriptions.length === 0) {
      return NextResponse.json({
        error: 'No hay descripciones válidas para inferir.'
      }, { status: 400 })
    }

    const prompt = (`Aquí tienes varias descripciones en inglés de ${protagonist.name}. Tu tarea es analizarlas y extrapolar cómo es ${protagonist.name} físicamente, su estilo y cualquier detalle relevante para imaginar cómo sería visualmente. Devuelve la respuesta en español. Descripciones:\n\n` +
        validDescriptions.map((desc, index) => `(${index + 1}) ${desc}`).join('\n\n')).toString()

    const messages = [
      {
        role: 'system',
        content: `Te voy a pasar varias descripciones de ${protagonist.name}, y tu tarea será extrapolar sus características físicas, estilo y detalles generales para generar una imagen representativa. Utiliza estas descripciones para imaginar cómo sería visualmente, destacando los rasgos más consistentes.`
      },
      {
        role: 'user',
        content: 'Sé conciso y directo, no necesitas describir cada detalle. No menciones los datos que se te han proporcionado, solo describe cómo sería visualmente. No menciones los distintos sitios dónde ha estado.'
      },
      {
        role: 'user',
        content: 'Da detalles sobre pelo, ojos, piel, estatura, potencialmente accesorios o características físicas distintivas.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    if (protagonist.physical_description) {
      messages.push(
        {
          role: 'user',
          content: 'Esta información está verificada, apoyate en ella para enriquecerla: ' + protagonist.physical_description
        })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages,
      max_tokens: 500
    })

    const inference = completion.choices[0].message.content

    await supabase
      .from('protagonists')
      .update({ inference })
      .eq('id', protagonistId)

    if (!protagonist) {
      return NextResponse.json({ error: 'Protagonista no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ inference })
  } catch (error) {
    return NextResponse.json({ error: 'Error realizando inferencia' }, { status: 500 })
  }
}

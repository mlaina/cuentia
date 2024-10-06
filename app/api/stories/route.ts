import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from "replicate"
import template from '@/types/prompt-gpt4o.json'


const replicate = new Replicate()

// Inicializa el cliente de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: Request) {
    try {
        // Verifica la autenticación
        const supabase = createRouteHandlerClient({ cookies })
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Obtiene los parámetros del cuerpo de la solicitud
        const { prompt, style, protagonists, ageRange } = await req.json();

        // Valida los parámetros
        if (!prompt || !style || !protagonists || !ageRange) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        const gptPrompt = `Genera un cuento corto en castellano, para niños con las siguientes características:
          - Idea principal: ${prompt}
          - Estilo: ${style}
          - Protagonistas: ${protagonists}
          - Rango de edad: ${ageRange}
          
          El cuento debe ser apropiado para niños, educativo y entretenido. Además, proporciona una descripción detallada en inglés de una imagen que tenga sentido para el cuento.`;


        const completion = await openai.chat.completions.create({
            ...template,
            messages: [
                ...template.messages,
                {
                    role: 'user',
                    content: gptPrompt
                }
            ]
        });

        let generatedText = ''

        const response = JSON.parse(completion.choices[0].message.content);

        generatedText = response.story as string;

        const input = {
            prompt: response.image_description
        }

        const output = await replicate.run("black-forest-labs/flux-schnell", { input });

        // Extraer el título y el contenido del texto generado
        const [titleLine, ...contentLines] = generatedText?.split('\n');
        const title = titleLine.replace('Título:', '').trim();
        const content = contentLines.join('\n').replace('Contenido:', '').trim();

        // Guarda la historia en la base de datos de Supabase
        const { data, error } = await supabase.from('stories').insert([
            {
                title,
                content,
                author_id: session.user.id,
                style,
                protagonists: [protagonists],
                age_range: ageRange,
                images: output
            },
        ]).select(); // .select() para obtener el registro insertado

        if (error) {
            console.error('Error al guardar la historia en Supabase:', error)
            return NextResponse.json({ error: 'Error al guardar la historia' }, { status: 500 });
        }

        // Puedes acceder a data[0] para obtener la historia guardada
        const savedStory = data[0];

        return NextResponse.json({ story: savedStory, image: output[0] });
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

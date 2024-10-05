import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


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

        // Construye el prompt para GPT-4
        const gptPrompt = `Genera un cuento corto para niños con las siguientes características:
            - Idea principal: ${prompt}
            - Estilo: ${style}
            - Protagonistas: ${protagonists}
            - Rango de edad: ${ageRange}
            
            El cuento debe ser apropiado para niños, educativo y entretenido. Incluye un título atractivo.
            
            Formato de respuesta:
            Título: [Título del cuento]
            Contenido:
            [Contenido del cuento]`;

        // Realiza la llamada a la API de OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: gptPrompt }],
            max_tokens: 1000,
        });

        const generatedText = completion.choices[0].message.content;

        // Extraer el título y el contenido del texto generado
        const [titleLine, ...contentLines] = generatedText.split('\n');
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
            },
        ]).select(); // .select() para obtener el registro insertado

        if (error) {
            console.error('Error al guardar la historia en Supabase:', error)
            return NextResponse.json({ error: 'Error al guardar la historia' }, { status: 500 });
        }

        // Puedes acceder a data[0] para obtener la historia guardada
        const savedStory = data[0];

        return NextResponse.json({ story: savedStory });
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

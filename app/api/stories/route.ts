import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from "replicate"
import template from '@/types/prompt-gpt4o.json'
import styles from '@/types/styles.json'
// import path from "path";
// import * as fs from "fs";
// import axios from "axios";
// import sharp from "sharp";


const replicate = new Replicate()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: Request) {
    try {

        const supabase = createRouteHandlerClient({ cookies })
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { prompt, style, gender, protagonists } = await req.json();

        if (!prompt || !style || !gender || !protagonists) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        const gptPrompt = `Genera un cuento corto en castellano, para niños con las siguientes características:
          - Idea principal: ${prompt}
          - Género: ${gender}
          - Protagonistas: ${protagonists}
          
          Debes respetar el género pedido. Además, proporciona una descripción detallada en inglés de una imagen que tenga sentido para el cuento.`;


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

        const stylePrompt = styles.find(s => s.name === style)?.prompt;

        const input = {
            prompt: response.image_description + ' Style: ' + stylePrompt
        }

        console.log(input)
        // const output = await replicate.run("black-forest-labs/flux-schnell", { input });

        const [titleLine, ...contentLines] = generatedText?.split('\n');
        const title = titleLine.replace('Título:', '').trim();
        const content = contentLines.join('\n').replace('Contenido:', '').trim();

        const { data, error } = await supabase.from('stories').insert([
            {
                title,
                content,
                author_id: session.user.id,
                style,
                protagonists: [protagonists]
            },
        ]).select()

        if (error) {
            console.error('Error al guardar la historia en Supabase:', error)
            return NextResponse.json({ error: 'Error al guardar la historia' }, { status: 500 });
        }

        const savedStory = data[0];

        return NextResponse.json({ story: savedStory, image: '' });
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

//
// export async function PUT() {
//
//     const concepts = [
//         {
//             prompt: "A majestic dragon flying over a medieval castle, with wings spread wide and clear details",
//             folderName: "dragon"
//         },
//         {
//             prompt: "A graceful princess standing in a magical forest, surrounded by glowing plants and animals",
//             folderName: "princess"
//         },
//         {
//             prompt: "A brave knight in shining armor battling a giant, with clear focus on both characters",
//             folderName: "knight"
//         },
//         {
//             prompt: "An enchanted garden with talking flowers, vibrant colors, and distinct plant features",
//             folderName: "garden"
//         },
//         {
//             prompt: "A pirate ship sailing under the moonlight on calm seas, with detailed sails and ship structure",
//             folderName: "pirate_ship"
//         }
//     ];
//
//
//     for (const concept of concepts) {
//         const conceptDirName = concept.folderName;
//         const conceptDirPath = path.join('./public/styles', conceptDirName);
//
//         if (!fs.existsSync(conceptDirPath)) {
//             fs.mkdirSync(conceptDirPath, { recursive: true });
//         }
//
//         for (const style of styles) {
//             const input = {
//                 prompt: `${concept.prompt} Style: ${style.prompt}`
//             };
//
//             try {
//                 const output = await replicate.run("black-forest-labs/flux-schnell", { input });
//
//                 const imageUrl = output[0];
//
//                 console.log(imageUrl)
//                 const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//                 const imageBuffer = Buffer.from(response.data);
//
//                 const styleFileName = style.fileName + '.webp';
//                 const imagePath = path.join(conceptDirPath, styleFileName);
//
//                 await sharp(imageBuffer)
//                     .webp()
//                     .toFile(imagePath);
//
//                 console.log(`Imagen guardada: ${imagePath}`);
//             } catch (error) {
//                 console.error(`Error al generar la imagen para el concepto "${concept.prompt}" y estilo "${style.name}":`, error);
//             }
//         }
//     }
//
//     return NextResponse.json({ message: 'Imágenes generadas exitosamente' });
//
// }

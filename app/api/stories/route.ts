import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from "replicate"
import storyIndexTemplate from '@/types/prompts/index.json'
import storyPagesTemplate from '@/types/prompts/page.json'
import styles from '@/types/styles.json'
import { OpenAIStream, StreamingTextResponse } from 'ai'
// import path from "path";
// import * as fs from "fs";
// import axios from "axios";
// import sharp from "sharp";


const replicate = new Replicate()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';


export async function POST(req) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { messages, schema } = await req.json();

        let template;
        if (schema === 'story_index') {
            template = storyIndexTemplate;
        } else if (schema === 'story_pages') {
            template = storyPagesTemplate;
        } else {
            return NextResponse.json({ error: 'Invalid schema' }, { status: 400 });
        }

        const lastUserMessage = messages?.reverse().find((msg) => msg.role === 'user');
        const prompt = lastUserMessage?.content;

        if (!prompt) {
            return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
        }

        console.log('Prompt:', prompt);
        const completion = await openai.chat.completions.create({
            ...template,
            stream: true,
            messages: [...template.messages,
                {
                    role: 'user',
                    content: prompt,
                }
            ]
        });
        console.log('-----------------------------------------');

        const stream = OpenAIStream(completion);
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { prompt, style, title, protagonists} = await req.json();

        if (!prompt ) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        const stylePrompt = styles.find(s => s.name === style)?.prompt;


        console.log(prompt + ' Style: ' + stylePrompt);
        const input = {
            prompt: prompt + ' Style: ' + stylePrompt
        }

        const output = await replicate.run("black-forest-labs/flux-schnell", { input });

        return NextResponse.json({ image: output[0] });
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

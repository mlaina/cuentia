import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Replicate from "replicate"
import template from '@/types/prompt-gpt4o.json'
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
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { messages } = await req.json();
        console.log('Messages:', messages);

        const lastUserMessage = messages?.reverse().find((msg) => msg.role === 'user');
        const prompt = lastUserMessage?.content;

        if (!prompt) {
            return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            ...template,
            stream: true,
            messages: [
                ...template.messages,
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const stream = OpenAIStream(completion);
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {

        console.log("aaaaaaaaaaaaaaaaaa")
        const supabase = createRouteHandlerClient({ cookies })
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session || !session.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { prompt, style, title, protagonists} = await req.json();

        if (!prompt ) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        const stylePrompt = styles.find(s => s.name === style)?.prompt;

        const input = {
            prompt: prompt + ' Style: ' + stylePrompt
        }

        const output = await replicate.run("black-forest-labs/flux-schnell", { input });

        const { error } = await supabase.from('stories').insert([
            {
                title,
                author_id: session.user.id,
                style,
                protagonists: [protagonists],
                images: output[0]
            },
        ]).select()
        if (error) {
            console.error('Error al guardar la historia en Supabase:', error)
            return NextResponse.json({ error: 'Error al guardar la historia' }, { status: 500 });
        }

        return NextResponse.json({ image: output[0] });
    } catch (error) {
        console.error('Error al generar la historia:', error);
        return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
    }
}

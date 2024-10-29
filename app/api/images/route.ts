import Replicate from "replicate";
import {NextResponse} from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const replicate = new Replicate()

export async function POST(req) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { model, input } = await req.json();
    const output = await replicate.run(model, { input });
    const image = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ image });
}

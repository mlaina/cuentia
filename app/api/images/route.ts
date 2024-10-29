import Replicate from "replicate";
import {NextResponse} from "next/server";


const replicate = new Replicate()


export async function POST(req) {
    const { model, input } = await req.json();
    const output = await replicate.run(model, { input });
    const image = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ image });
}

'use client'

import { useState } from "react"
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {PlusCircle} from "lucide-react";

export default function DashboardComponent() {
    const [prompt, setPrompt] = useState('')
    const [promptOld, setPromptOld] = useState('')
    const [image, setImage] = useState(null)

    const handleGenerateImage = async () => {
        const input = {
            prompt
        };

        const response = await fetch("/api/images", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input,
                model: 'black-forest-labs/flux-schnell'
            }),
        });
        const { image } = await response.json()
        setImage(image)
        setPromptOld(prompt);
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 justify-center">
            <main className=" max-w-[700px] w-full p-20">
                <div className={'mb-6 flex flex-col gap-2'}>
                    <p className="text-xs">Las imágenes no se guardarán en ningún sitio. Si te gustan guardalas manualmente</p>
                    <Textarea
                        placeholder="Escribe el prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                    <Button onClick={handleGenerateImage} className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:shadow-lg">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Generar imagen
                    </Button>
                </div>
                <hr className={'border my-3'}/>
                { image &&
                  <div>
                    <img src={image} alt="Imagen generada" className="max-w-[700px] w-full h-full object-cover" />
                      {promptOld &&
                        <p className="text-sm text-gray-500">Prompt: {promptOld}</p>
                      }
                  </div>
                }
            </main>
        </div>
    )
}

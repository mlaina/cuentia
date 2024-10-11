'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Wand2, RefreshCw } from "lucide-react"
import Image from "next/image"
import styles from "@/types/styles.json"
import { useChat } from 'ai/react'

const protagonistas = [
  { id: 1, nombre: "Niño" },
  { id: 2, nombre: "Niña" },
  { id: 3, nombre: "Hermanos" },
  { id: 4, nombre: "Familia" },
  { id: 5, nombre: "Mascota" },
]

const generos = [
  { id: 1, nombre: "Misterio" },
  { id: 2, nombre: "Fantasía" },
  { id: 3, nombre: "Ciencia ficción" },
  { id: 4, nombre: "Fábula" },
  { id: 5, nombre: "Mascota" },
  { id: 6, nombre: "Cuento de Hadas" },
  { id: 7, nombre: "Aventura" },
  { id: 8, nombre: "Animales" },
  { id: 9, nombre: "Humorístico" },
  { id: 10, nombre: "Educativo" },
  { id: 11, nombre: "Mitos y Leyendas" }
]

const descripciones = [
  "Un viaje mágico a través de un bosque encantado",
  "Una aventura submarina con criaturas marinas parlantes",
  "El misterio de la casa abandonada al final de la calle",
  "Un viaje en el tiempo a la época de los dinosaurios",
  "La amistad entre un niño y un dragón bebé",
]

const concepts = ["dragon", "princess", "knight", "garden", "pirate_ship"]

export default function CrearCuentoPage() {
  const [descripcion, setDescripcion] = useState("")
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [concepto, setConcepto] = useState("")
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] = useState("")
  const [generoSeleccionado, setGeneroSeleccionado] = useState("")
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
  const [openItem, setOpenItem] = useState('')
  const [imageUrl, setImageUrl] = useState("")

  const { messages, append, isLoading } = useChat({
    api: '/api/stories',
  })

  const generarDescripcionAleatoria = () => {
    setDescripcion(descripciones[Math.floor(Math.random() * descripciones.length)])
  }

  const generarConceptoSecuencial = () => {
    setConcepto(concepts[currentConceptIndex])
    setCurrentConceptIndex((currentConceptIndex + 1) % concepts.length)
  }

  useEffect(() => {
    setDescripcion(descripciones[Math.floor(Math.random() * descripciones.length)])
    setConcepto(concepts[Math.floor(Math.random() * concepts.length)])
  }, [])

  const handleCrearCuento = (e) => {
    e.preventDefault()

    if (!descripcion || !estiloSeleccionado || !protagonistaSeleccionado || !generoSeleccionado) {
      alert("Por favor, completa todos los campos requeridos.")
      return
    }

    const prompt = `Genera un cuento corto en castellano, para niños con las siguientes características:
    - Idea principal: ${descripcion}
    - Género: ${generos.find((g) => g.id.toString() === generoSeleccionado).nombre}
    - Protagonistas: ${protagonistas.find((p) => p.id.toString() === protagonistaSeleccionado).nombre}
    
    Debes respetar el género pedido. Además, proporciona una descripción detallada en inglés de una imagen que tenga sentido para el cuento. La descripción de la imagen debe estar en una nueva línea que comience con "IMAGE_DESCRIPTION:".`;

    append({ role: 'user', content: prompt })
  }

  const [assistantContent, setAssistantContent] = useState('')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [imageDescription, setImageDescription] = useState('')

  useEffect(() => {
    const assistantMessages = messages.filter((msg) => msg.role === 'assistant');
    const fullContent = assistantMessages.map((msg) => msg.content).join('');
    setAssistantContent(fullContent);

    const matchTitle = fullContent.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)$/);

    if (matchTitle) {
      setTitle(matchTitle[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
    }

    const matchImage = fullContent.match(/"image_description"\s*:\s*"((?:[^"\\]|\\.)*)"/);

    if (matchImage) {
      setImageDescription(matchImage[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
    }

    const matchStory = fullContent.match(/"story"\s*:\s*"((?:[^"\\]|\\.)*)$/);

    if (matchStory) {
      setStory(matchStory[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
    }

  }, [messages]);


  useEffect(() => {
    const updateStory = async () => {
        try {
          const response = await fetch("/api/stories", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              prompt: imageDescription,
              style: estiloSeleccionado,
              protagonists: protagonistas.find((p) => p.id === parseInt(protagonistaSeleccionado))?.nombre,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al crear el cuento");
          }

          const data = await response.json();
          setImageUrl(data.image);
        } catch (error) {
          console.error(error.message);
        }
    };
    if (imageDescription) {
      updateStory();
    }
  }, [imageDescription]);



  return (
      <div className="flex h-screen">
        <main className="flex-1">
            {messages.length === 0 ? (
                  <div className="max-w-4xl mx-auto p-6 space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Protagonistas</h2>
                      <Select onValueChange={setProtagonistaSeleccionado} value={protagonistaSeleccionado}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona los protagonistas" />
                        </SelectTrigger>
                        <SelectContent>
                          {protagonistas.map((protagonista) => (
                              <SelectItem key={protagonista.id} value={protagonista.id.toString()}>
                                {protagonista.nombre}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Género</h2>
                      <Select onValueChange={setGeneroSeleccionado} value={generoSeleccionado}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona el género" />
                        </SelectTrigger>
                        <SelectContent>
                          {generos.map((genero) => (
                              <SelectItem key={genero.id} value={genero.id.toString()}>
                                {genero.nombre}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Descripción de la Idea</h2>
                        <Button
                            onClick={generarDescripcionAleatoria}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Sorpréndeme
                        </Button>
                      </div>
                      <Textarea
                          placeholder="Escribe una breve descripción de tu idea para el cuento..."
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          className="min-h-[100px]"
                      />
                    </div>
                    {concepto &&
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Estilo de imágenes</h2>
                            <Button
                                onClick={generarConceptoSecuencial}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                              <RefreshCw/>
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {styles.filter(s => s.fav).map((estilo) => (
                                <Card
                                    key={estilo.name}
                                    className={`cursor-pointer transition-all ${
                                        estiloSeleccionado === estilo.name ? "ring-2 ring-purple-500" : ""
                                    }`}
                                    onClick={() => setEstiloSeleccionado(estilo.name)}
                                >
                                  <CardContent className="p-4 flex flex-col items-center">
                                    <Image
                                        src={'/styles/' + concepto + '/' + estilo.fileName + '.webp'}
                                        alt={estilo.name}
                                        width={200}
                                        height={200}
                                        className="rounded-md mb-2"
                                    />
                                    <span className="text-sm font-medium">{estilo.name}</span>
                                  </CardContent>
                                </Card>
                            ))}
                          </div>
                          <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
                            <AccordionItem value="styles">
                              <AccordionTrigger className="text-sm text-gray-500 cursor-pointer">
                                {openItem === 'styles' ? 'Ocultar' : 'Ver más estilos'}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-2">
                                  {styles.filter((s) => !s.fav).map((estilo) => {
                                    return (
                                        <Card
                                            key={estilo.name}
                                            className={`cursor-pointer transition-all ${
                                                estiloSeleccionado === estilo.name ? "ring-2 ring-purple-500" : ""
                                            }`}
                                            onClick={() => setEstiloSeleccionado(estilo.name)}
                                        >
                                          <CardContent className="p-4 flex flex-col items-center">
                                            <Image
                                                src={`/styles/${concepto}/${estilo.fileName}.webp`}
                                                alt={estilo.name}
                                                width={200}
                                                height={200}
                                                className="rounded-md mb-2"
                                            />
                                            <span className="text-sm font-medium">{estilo.name}</span>
                                          </CardContent>
                                        </Card>
                                    )
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                    }
                    <Button
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white"
                        onClick={handleCrearCuento}
                        disabled={isLoading}
                    >
                      Crear Cuento
                    </Button>
                  </div>
              ) : (
                <div className="max-w-6xl mx-auto p-6 space-y-4">
                  {title ? (
                      <h1 className="text-2xl font-bold">{title}</h1>
                  ) : (
                      <h1 className="text-2xl font-bold">Generando título...</h1>
                  )}
                  <div className="flex gap-3">
                    <p className="w-1/2 whitespace-pre-wrap">
                      {story || 'Generando historia...'}
                    </p>
                    <div className="flex justify-center items-center">
                      {imageUrl ? (
                          <Image
                              className="rounded-lg transition-opacity duration-500 ease-in-out opacity-0"
                              src={imageUrl}
                              alt="Imagen del cuento"
                              width={500}
                              height={500}
                              onLoadingComplete={(e) => e.classList.add("opacity-100")}
                          />
                      ) : (
                          <div className="w-[500px] h-[500px] bg-gray-200 animate-pulse rounded-lg transition-opacity duration-500 ease-in-out"></div>
                      )}
                    </div>
                  </div>
                  <Button
                      onClick={() => {
                        window.location.reload()
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white"
                  >
                    Crear otro cuento
                  </Button>
                </div>
              )}
        </main>
      </div>
  )
}

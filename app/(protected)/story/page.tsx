'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Wand2, RefreshCw } from "lucide-react"
import Image from "next/image"
import styles from "@/types/styles.json"
import ideas from "@/types/ideas.json"
import { useChat } from 'ai/react'
import {useSupabaseClient, useUser} from "@supabase/auth-helpers-react"
import Select from 'react-select'
import {Slider} from "@/components/ui/slider";
import StoryViewer from "@/components/StoryViewer";

const genders = [
  { id: 1, name: "Misterio" },
  { id: 2, name: "Fantasía" },
  { id: 3, name: "Ciencia ficción" },
  { id: 4, name: "Fábula" },
  { id: 5, name: "Mascota" },
  { id: 6, name: "Cuento de Hadas" },
  { id: 7, name: "Aventura" },
  { id: 8, name: "Animales" },
  { id: 9, name: "Humorístico" },
  { id: 10, name: "Educativo" },
  { id: 11, name: "Mitos y Leyendas" }
]

const concepts = ["dragon", "princess", "knight", "garden", "pirate_ship"]

export default function CrearCuentoPage() {
  const [descripcion, setDescripcion] = useState("")
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [concepto, setConcepto] = useState("")
  const [generoSeleccionado, setGeneroSeleccionado] = useState("")
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0)
  const [openItem, setOpenItem] = useState('')
  const [protagonists, setProtagonists] = useState([])
  const [proSelected, setProSelected] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [longitud, setLongitud] = useState(5)
  const [imageDescription, setImageDescription] = useState('')
  const [indice, setIndice] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = useSupabaseClient()
  const user = useUser()

  const {
    messages: indexMessages,
    append: appendIndex,
    isLoading: isLoadingIndex,
  } = useChat({
    api: '/api/stories',
  });

  const {
    messages: pageMessages,
    append: appendPage,
    isLoading: isLoadingPage,
  } = useChat({
    api: '/api/stories',
  })

  const generarDescripcionAleatoria = () => {
    setDescripcion(ideas[Math.floor(Math.random() * ideas.length)])
  }

  const generarConceptoSecuencial = () => {
    setConcepto(concepts[currentConceptIndex])
    setCurrentConceptIndex((currentConceptIndex + 1) % concepts.length)
  }

  useEffect(() => {
    setDescripcion(ideas[Math.floor(Math.random() * ideas.length)])
    setConcepto(concepts[Math.floor(Math.random() * concepts.length)])
  }, [])

  const handleCrearCuento = (e) => {
    e.preventDefault()

    if (!descripcion || !estiloSeleccionado || !proSelected || !generoSeleccionado) {
      alert("Por favor, completa todos los campos requeridos.")
      return
    }

    const chars = proSelected
        .map((p) => {
          return `${p.value.name} es ${p.value.physical_description} Sus gustos: ${p.value.likes} Lo que no le gusta: ${p.value.dislikes}`;
        })
        .join('. ')


    const prompt = `Genera un índice para un cuento infantil en castellano con las siguientes características:
      - Idea principal: ${descripcion}
      - Género: ${generoSeleccionado?.label}
      - Protagonistas: ${chars}
      - Número de páginas: ${longitud}
      
      Debes proporcionar un título para el cuento y una lista numerada donde cada número representa una página, y junto a cada número, un resumen breve (una frase) del contenido de esa página. No desarrolles el cuento aún. Aseguraté dar un indice por cada una de las páginas.`;


    appendIndex(
        { role: 'user', content: prompt },
        {
          options: {
            body: {
              schema: 'story_index',
            },
          },
        }
    )
  }


  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return

      const { data, error } = await supabase
          .from('protagonists')
          .select('id, name, physical_description, likes, dislikes')
          .eq('author_id', user.id)

      if (error) {
        console.error("Error fetching protagonists:", error)
      } else {
        setProtagonists(data)
      }
    }

    fetchStories()
  }, [user, supabase])

  useEffect(() => {
    if(!isLoadingPage && !isLoadingIndex && indice.length > 0 && indice.every((p) => p.status === 'image_generated')) {
      supabase.from('stories').insert([
        {
          title,
          content: indice,
          author_id: user.id,
          protagonists: proSelected.map((p) => p.value.name).join(', '),
          style: estiloSeleccionado,
          images: indice[0].imageUrl
        },
      ]).then(({ error }) => {
        if (error) {
          console.error("Error inserting story:", error)
        }
      })
    }

  }, [isLoadingPage, isLoadingIndex, indice])


  const desarrollarPagina = async (pagina) => {

    const prompt = `Desarrolla la página ${pagina.number} de "${title}". Debes desarrollar: "${pagina.summary}".`;

    await appendPage(
        { role: 'user', content: prompt },
        {
          options: {
            body: {
              schema: 'story_pages',
            },
          }
        }
    );
  };

  useEffect(() => {
    const paginaSinDesarrollar = indice.find((p) => p.content === '' && p.status === 'pending')
    if (paginaSinDesarrollar && !isLoadingPage) {
      setIndice((prevIndice) =>
          prevIndice.map((p) =>
              p.number === paginaSinDesarrollar.number ? { ...p, status: 'processing' } : p
          )
      )
      desarrollarPagina(paginaSinDesarrollar);
    } else if (!paginaSinDesarrollar) {
      setIsGenerating(false);
    }
  }, [indice, isLoadingPage]);


  useEffect(() => {
    const assistantMessages = indexMessages.filter((msg) => msg.role === 'assistant');
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]?.content;
    try {
      const data = JSON.parse(lastAssistantMessage);
      if(data.title && data.index) {
        setTitle(data.title);
        setIndice(data.index.map((item) => ({
          number: item.page,
          summary: item.summary,
          content: '',
          imageDescription: '',
          imageUrl: '',
          status: 'pending'
        })));
      }

    } catch (error) {
        console.log('Error parsing index response');
    }

  }, [indexMessages]);

  useEffect(() => {
    const assistantMessages = pageMessages.filter((msg) => msg.role === 'assistant');
    const fullContent = assistantMessages.map((msg) => msg.content).join('')

    if (fullContent) {
      try {

        const matchPage = fullContent.match(/"page"\s*:\s*(\d+)/)
        const matchContent = fullContent.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/)
        const matchImage = fullContent.match(/"image_description"\s*:\s*"((?:[^"\\]|\\.)*)"/)

        const page = matchPage && matchPage[1] ? Number(matchPage[1]) : null;
        const content = matchContent && matchContent[1] ?  matchContent[1]?.replace(/\\n/g, '\n').replace(/\\"/g, '"') : null;
        const image = matchImage && matchImage[1] ? matchImage[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : null

        if (page && content && image) {
          setIndice((prevIndice) => {
            const newIndice = [...prevIndice];
            newIndice[page-1].content = content
            newIndice[page-1].imageDescription = image
            newIndice[page-1].status = 'text_generated'

            return newIndice;
          });
        }
      } catch (error) {
        console.log('Error parsing page response');
      }
    }
  }, [pageMessages])


  useEffect(() => {
    const paginasConDescripcion = indice.filter((p) => p.imageDescription && !p.imageUrl && p.status === 'text_generated');

    paginasConDescripcion.forEach(async (pagina) => {
      if (pagina.status !== 'image_generating') {
        setIndice((prevIndice) => {
          const newIndice = prevIndice.map((p) => {
            if (p.number === pagina.number) {
              return { ...p, status: 'image_generating' };
            }
            return p;
          });
          return newIndice;
        });
      }
      if (!pagina.imageUrl) {
        try {
          const response = await fetch("/api/stories", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: pagina.imageDescription,
              style: estiloSeleccionado,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al generar la imagen");
          }

          const data = await response.json();

          setIndice((prevIndice) => {
            const newIndice = prevIndice.map((p) => {
              if (p.number === pagina.number) {
                return { ...p, imageUrl: data.image, status: 'image_generated' };
              }
              return p;
            });
            return newIndice;
          });
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  }, [indice]);


  const handleChange = (selected) => {
    setProSelected(selected || []);
  };


  return (
      <div className="flex h-screen">
        <main className="flex-1">
          {pageMessages.length === 0 ? (
              <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Protagonistas</h2>
                  <Select
                      isMulti
                      value={proSelected}
                      onChange={handleChange}
                      options={protagonists.map((p) => ({ value: p, label: p.name }))}
                      placeholder="Selecciona opciones"
                      className="basic-multi-select"
                      classNamePrefix="select"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Género</h2>
                  <Select
                      value={generoSeleccionado}
                      onChange={(s)=>setGeneroSeleccionado(s)}
                      options={genders.map((p) => ({ value: p.id, label: p.name }))}
                      placeholder="Selecciona opciones"
                      className="basic-multi-select"
                      classNamePrefix="select"
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Longitud de la historia</h2>
                  <div className="flex items-center space-x-4">
                    <Slider
                        value={[longitud]}
                        onValueChange={(value) => setLongitud(value[0])}
                        min={2}
                        max={15}
                        step={1}
                    />
                    <span className="w-32 text-gray-700">{longitud} páginas</span>
                  </div>
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
                      className="min-h-[100px] resize-none"
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
                    disabled={isLoadingPage || isLoadingIndex}
                >
                  Crear Cuento
                </Button>
              </div>
          ) : (
              <div className="max-w-6xl mx-auto py-6 space-y-4">
                {title ? (
                    <h1 className="bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent">{title}</h1>
                ) : (
                    <h1 className="bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent">Generando título...</h1>
                )}
                <StoryViewer pages={indice}/>
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

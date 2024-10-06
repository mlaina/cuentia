"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Home, Settings, User, LogOut, Mic, Sliders, Wand2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const estilos = [
  { id: 1, nombre: "Fantasía", imagen: "/placeholder.svg?height=100&width=100" },
  { id: 2, nombre: "Aventura", imagen: "/placeholder.svg?height=100&width=100" },
  { id: 3, nombre: "Misterio", imagen: "/placeholder.svg?height=100&width=100" },
  { id: 4, nombre: "Ciencia Ficción", imagen: "/placeholder.svg?height=100&width=100" },
  { id: 5, nombre: "Fábula", imagen: "/placeholder.svg?height=100&width=100" },
  { id: 6, nombre: "Educativo", imagen: "/placeholder.svg?height=100&width=100" },
]

const protagonistas = [
  { id: 1, nombre: "Niño" },
  { id: 2, nombre: "Niña" },
  { id: 3, nombre: "Hermanos" },
  { id: 4, nombre: "Familia" },
  { id: 5, nombre: "Mascota" },
]

const rangoEdad = [
  { id: 1, rango: "3-5 años" },
  { id: 2, rango: "6-8 años" },
  { id: 3, rango: "9-12 años" },
]

export default function CrearCuentoPage() {
  const [descripcion, setDescripcion] = useState("")
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)
  const [protagonistaSeleccionado, setProtagonistaSeleccionado] = useState("")
  const [edadSeleccionada, setEdadSeleccionada] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [story, setStory] = useState("")
  const router = useRouter()

  const generarDescripcionAleatoria = () => {
    const descripciones = [
      "Un viaje mágico a través de un bosque encantado",
      "Una aventura submarina con criaturas marinas parlantes",
      "El misterio de la casa abandonada al final de la calle",
      "Un viaje en el tiempo a la época de los dinosaurios",
      "La amistad entre un niño y un dragón bebé"
    ]
    setDescripcion(descripciones[Math.floor(Math.random() * descripciones.length)])
  }

  const handleCrearCuento = async () => {
    if (!descripcion || !estiloSeleccionado || !protagonistaSeleccionado || !edadSeleccionada) {
      setMessage({
        text: "Por favor, completa todos los campos requeridos.",
        type: "error",
      })
      return
    }

    setIsLoading(true)
    setMessage({ text: '', type: '' }) // Limpiar mensajes previos

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: descripcion,
          style: estilos.find(e => e.id === estiloSeleccionado)?.nombre,
          protagonists: protagonistas.find(p => p.id === parseInt(protagonistaSeleccionado))?.nombre,
          ageRange: rangoEdad.find(r => r.id === parseInt(edadSeleccionada))?.rango,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el cuento')
      }

      const data = await response.json()
      setMessage({
        text: "Tu cuento ha sido creado con éxito.",
        type: "success",
      })
      console.log(data)
      setStory(data.story.content)
    } catch (error) {
      setMessage({
        text: "Hubo un problema al crear el cuento. Por favor, intenta de nuevo.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
      <div className="flex h-screen">
        {/* Main content */}
        <main className="flex-1">

          {/* Content */}
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
              <h2 className="text-xl font-semibold">Rango de Edad</h2>
              <Select onValueChange={setEdadSeleccionada} value={edadSeleccionada}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el rango de edad" />
                </SelectTrigger>
                <SelectContent>
                  {rangoEdad.map((rango) => (
                      <SelectItem key={rango.id} value={rango.id.toString()}>
                        {rango.rango}
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

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Estilo del Cuento</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {estilos.map((estilo) => (
                    <Card
                        key={estilo.id}
                        className={`cursor-pointer transition-all ${estiloSeleccionado === estilo.id ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setEstiloSeleccionado(estilo.id)}
                    >
                      <CardContent className="p-4 flex flex-col items-center">
                        <Image
                            src={estilo.imagen}
                            alt={estilo.nombre}
                            width={100}
                            height={100}
                            className="rounded-md mb-2"
                        />
                        <span className="text-sm font-medium">{estilo.nombre}</span>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="opciones-avanzadas">
                <AccordionTrigger>Opciones Avanzadas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Aquí puedes añadir más opciones avanzadas según sea necesario */}
                    <p>Opciones avanzadas para la creación del cuento...</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white"
                onClick={handleCrearCuento}
                disabled={isLoading}
            >
              {isLoading ? "Creando Cuento..." : "Crear Cuento"}
            </Button>
          </div>
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            {story &&
                <p>{story}</p>
            }
          </div>
        </main>
      </div>
  )
}

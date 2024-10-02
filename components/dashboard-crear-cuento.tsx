"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Home, PlusCircle, Settings, User, LogOut, Mic, Sliders, Wand2 } from "lucide-react"
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

export function DashboardCrearCuentoComponent() {
  const [descripcion, setDescripcion] = useState("")
  const [estiloSeleccionado, setEstiloSeleccionado] = useState(null)

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 flex items-center">
          <BookOpen className="w-10 h-10 mr-2 text-sky-400" />
          <p className={'bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent'}>CuentIA</p>
        </div>
        <nav className="mt-6">
          <Link href="#" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <Home className="inline-block w-5 h-5 mr-2" />
            Inicio
          </Link>
          <Link href="#" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <BookOpen className="inline-block w-5 h-5 mr-2" />
            Mis Cuentos
          </Link>
          <Link href="#" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <Mic className="inline-block w-5 h-5 mr-2" />
            Mis Voces
          </Link>
          <Link href="#" className="block px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <Sliders className="inline-block w-5 h-5 mr-2" />
            Mis Parámetros
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Crear Cuento</h1>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@username" />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="grid gap-4">
                  <div className="font-medium">@username</div>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Protagonistas</h2>
            <Select>
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

          <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white">
            Crear Cuento
          </Button>
        </div>
      </main>
    </div>
  )
}

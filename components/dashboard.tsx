'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Home, PlusCircle, Settings, User, LogOut, Mic, Sliders } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function DashboardComponent() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Create new story button */}
          <div className="mb-6">
            <Button 
              className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Crea un nuevo cuento
            </Button>
          </div>

          {/* Story cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((story) => (
              <Card key={story} className="overflow-hidden">
                <Image
                  src={`/placeholder.svg?height=200&width=400`}
                  alt={`Portada del cuento ${story}`}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle>Cuento {story}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Resumen breve del cuento...</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Leer</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
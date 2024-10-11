'use client'

import { useEffect, useState } from "react"
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function DashboardComponent() {
  const [stories, setStories] = useState([]) // Estado para almacenar las historias del usuario
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    // Función para obtener las historias del usuario autenticado
    const fetchStories = async () => {
      if (!user) return // Si no hay un usuario logueado, no se hace la consulta

      const { data, error } = await supabase
          .from('stories') // Nombre de la tabla
          .select('id, title, style, age_range, images') // Seleccionamos las columnas necesarias
          .eq('author_id', user.id) // Solo historias creadas por el usuario logueado

      if (error) {
        console.error("Error fetching stories:", error)
      } else {
        setStories(data) // Guardamos las historias en el estado
      }
    }

    fetchStories()
  }, [user, supabase])

  return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <main className="flex-1">

          {/* Content */}
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Create new story button */}
            <div className="mb-6">
              <Link href="/story">
                <Button
                    className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Crea un nuevo cuento
                </Button>
              </Link>
            </div>

            {/* Story cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => {
                return (
                    <Card key={story.id} className="overflow-hidden shadow-md">
                      <Image
                          src={story.images || '/styles/dragon/estilo_3d.webp'}
                          alt={`Portada del cuento ${story.title}`}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          onError={(e) => e.target.src = '/styles/dragon/estilo_3d.webp'}
                      />
                      <CardHeader >
                        <CardTitle className={'flex gap-2 items-end'}>
                          <p>{story.style}</p>
                          <p className="text-orange-600 text-sm italic font-normal">
                            {story.age_range}
                          </p>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-4">
                          {story.title}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline">Leer</Button>
                      </CardFooter>
                    </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
  )
}

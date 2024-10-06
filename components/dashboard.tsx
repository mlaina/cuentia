'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function DashboardComponent() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <main className="flex-1 overflow-y-auto">

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

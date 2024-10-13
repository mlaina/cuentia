'use client'

import { useEffect, useState } from "react"
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardComponent() {
  const [stories, setStories] = useState([])
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return

      const { data, error } = await supabase
          .from('stories')
          .select('id, title, style, images, protagonists')
          .eq('author_id', user.id)

      console.log(data)
      if (error) {
        console.error("Error fetching stories:", error)
      } else {
        setStories(data)
      }
    }

    fetchStories()
  }, [user, supabase])

  return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <main className="flex-1">

          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link href="/story">
                <Button className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Crea un nuevo cuento
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => {
                return (
                    <Link key={story.id}  href={`/story/${story.id}`} passHref>
                    <Card className="overflow-hidden shadow-md">
                      <Image
                          src={story.images || '/styles/dragon/estilo_3d.webp'}
                          alt={`Portada del cuento ${story.title}`}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          onError={(e) => e.target.src = '/styles/dragon/estilo_3d.webp'}
                      />
                      <CardHeader >
                        <CardTitle className={'flex gap-2 items-end line-clamp-2 pb-2'}>
                          <p className={'h-12'}>{story.title}</p>
                        </CardTitle>
                        <hr className={'border-t border-gray-100'}/>
                      </CardHeader>
                      <CardContent>
                        <p className="text-orange-600 text-sm italic font-normal ">
                          {story.style}
                        </p>
                        <p className="line-clamp-4">
                          {story.protagonists}
                        </p>
                      </CardContent>
                    </Card>
                    </Link>
                )
              })}
            </div>
          </div>
        </main>
      </div>
  )
}

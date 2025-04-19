'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function StoriesTab () {
  const supabase = useSupabaseClient()
  const user = useUser()

  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const loadingRef = useRef<HTMLDivElement | null>(null)
  const storiesRef = useRef<any[]>([])
  const ITEMS_PER_PAGE = 8

  /* ---------- lógica de scroll infinito ---------- */
  useEffect(() => { storiesRef.current = stories }, [stories])

  const loadMoreStories = useCallback(
    async (init = false) => {
      if (!user || loading || (!hasMore && !init)) return
      setLoading(true)

      const start = init ? 0 : storiesRef.current.length
      const end = start + ITEMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('stories')
        .select('id, title, images, protagonists, created_at')
        .order('created_at', { ascending: false })
        .range(start, end)

      if (!error) {
        if (data.length < ITEMS_PER_PAGE) setHasMore(false)
        setStories(init ? data : [...storiesRef.current, ...data])
        setInitialized(true)
      } else {
        console.error('Error al obtener cuentos:', error)
      }
      setLoading(false)
    },
    [user, loading, hasMore, supabase]
  )

  useEffect(() => {
    if (user && !initialized) loadMoreStories(true)
  }, [user, initialized, loadMoreStories])

  useEffect(() => {
    if (!loadingRef.current || !initialized) return
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && hasMore && !loading && loadMoreStories(false),
      { threshold: 0.1 }
    )
    obs.observe(loadingRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading, initialized, loadMoreStories])

  /* ---------- UI ---------- */
  return (
    <div className="p-6">
     
      {stories.length === 0 && !loading ? (
        <p className="text-gray-600 text-center">Aún no hay cuentos</p>
      ) : (
        <>
          {/* grid desktop */}
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-6">
            {stories.map(story => (
              <Link key={story.id} href={`/detailed-story/${story.id}`}>
                <img
                  src={
                    story.images?.[0] ||
                    'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
                  }
                  alt={story.title}
                  className="w-full aspect-[3/4] object-cover rounded shadow"
                />
              </Link>
            ))}
          </div>

          {/* grid móvil */}
          <div className="grid md:hidden gap-4 grid-cols-3">
            {stories.map(story => (
              <Link key={story.id} href={`/detailed-story/${story.id}`}>
                <img
                  src={
                    story.images?.[0] ||
                    'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'
                  }
                  alt={story.title}
                  className="w-full aspect-[3/4] object-cover rounded shadow"
                />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* loader / trigger */}
      <div ref={loadingRef} className="w-full flex justify-center py-8">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando…</span>
          </div>
        ) : hasMore ? (
          <div className="h-10" />
        ) : (
          stories.length > 0 && (
            <p className="text-gray-500 text-sm">No hay más cuentos</p>
          )
        )}
      </div>
    </div>
  )
}

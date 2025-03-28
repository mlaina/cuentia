import type React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Home () {
  const supabase = createServerComponentClient({ cookies })
  const { data: favoriteStories } = await supabase
    .from('stories')
    .select('*')
    .eq('fav', true)
  return (
      <main
        className='w-screen h-full min-h-screen bg-[url("/images/soon.png")] bg-cover bg-center bg-no-repeat flex items-start justify-center text-white'
      >
          <div className='flex flex-col justify-center'>
              <img
                className='max-w-[400px]'
                src='/images/footprints.svg'
              />
              <h1 className='text-secondary text-3xl font-bold'>¡Coming Soon!</h1>
              <p className='text-secondary max-w-[500px] text-center mt-4'>We'll let you know soon when imagins is ready for
                  you to create your own stories. In the meantime, enjoy other people's stories.</p>
          </div>
          <div
            className='grid max-w-[300px] grid-cols-3 gap-10'
          >
              {favoriteStories.map((story, index) => {
                const coverImage = story.content?.[0]?.imageUrl
                return (
                      <div
                        key={index}
                        className='relative w-26 cursor-pointer hover:opacity-90 transition-opacity'
                      >
                          <img
                            src={coverImage || 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/fd4aec4f-c805-43d7-ad00-4c7bde9f6c00/public'}
                            alt='Cover Image'
                            className='w-full object-cover rounded-md drop-shadow-xl shadow-lg'
                          />
                          <div
                            className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none'
                          />
                      </div>
                )
              })}
          </div>
      </main>
  )
}

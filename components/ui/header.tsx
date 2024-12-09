'use client'

import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserIcon, LogOut, BookOpen, Coins } from 'lucide-react'
import Link from 'next/link'

export default function Header () {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  const handleLogout = async () => {
    if (!user) {
      console.error('No hay sesión activa para cerrar.')
      return
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión:', error)
    } else {
      router.push('/')
    }
  }

  return (
    <header className='bg-white top-0 bg-opacity-70'>
        <div className='max-w-7xl mx-auto py-4 flex justify-between items-center'>
          <div className='flex justify-between w-full items-center mr-10'>
            <Link href={user && user.user_metadata.credits > 0 ? '/create' : '/pricing'} className=' flex items-center'>
                <BookOpen className='w-10 h-10 mr-2 text-sky-400' />
            </Link>
            <Link href='/stories' className='text-sky-900 text-lg'>
                Librería
            </Link>
          </div>
          {user && user.user_metadata.credits > 0 && (
              <Link href='/pricing' className='text-sky-900 mr-4 flex'>
                {user.user_metadata.credits}
                <Coins className='w-5 h-5 mr-1 text-yellow-500' />
              </Link>
          )}
          <div />
        {user
          ? (
        <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant='ghost' className='w-10 h-10 rounded-full p-0'>
                    <Avatar>
                        <AvatarImage
                          alt={user.user_metadata?.name || user.email || 'Usuario'}
                        />
                        <AvatarFallback>
                            {user.user_metadata?.name
                              ? user.user_metadata.name.charAt(0).toUpperCase()
                              : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-56'>
                <div className='grid gap-4'>
                    <div className='font-medium'>
                        {user.user_metadata?.name || user.email}
                    </div>
                    <Link href='/profile'>
                      <Button variant='outline' className='w-full justify-start'>
                          <UserIcon className='mr-2 h-4 w-4' />
                          Perfil
                      </Button>
                    </Link>
                    <Button
                      variant='outline'
                      className='w-full justify-start'
                      onClick={handleLogout}
                    >
                        <LogOut className='mr-2 h-4 w-4' />
                        Cerrar sesión
                    </Button>
                </div>
            </PopoverContent>
        </Popover>)
          : (<Button variant='outline' onClick={() => router.push('/login')}>
            Iniciar sesión
        </Button>)}
        </div>
    </header>
  )
}

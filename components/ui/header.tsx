'use client'

import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserIcon, LogOut, BookOpen, Coins, Library, PersonStanding } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Header () {
  const t = useTranslations()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    async function checkSuperAdminStatus () {
      if (!user) return

      try {
        // Consultar el estado de super admin directamente desde auth.users
        // Nota: Esto requiere permisos especiales o una función RPC
        const { data, error } = await supabase.rpc('check_is_super_admin')

        if (error) throw error

        setIsSuperAdmin(data)
      } catch (error) {
        console.error('Error verificando estado de super admin:', error)
      }
    }

    checkSuperAdminStatus()
  }, [user, supabase, router])

  const handleLogout = async () => {
    if (!user) {
      console.error(t('error_no_active_session'))
      return
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error(t('error_logging_out'), error)
    } else {
      router.push('/')
    }
  }

  return (
      <header className='bg-white top-0 bg-opacity-70'>
        <div className='max-w-7xl px-8 mx-auto py-4 flex justify-between items-center'>
          <div className='flex justify-between w-full items-center mr-10'>
            <Link href={user && user.user_metadata.credits > 0 ? '/create' : '/pricing'} className='flex items-center'>
              <BookOpen className='w-10 h-10 mr-2 text-secondary' />
            </Link>
            <div className='gap-4 hidden md:flex'>
              <Link href='/characters' className='text-primary text-md hover:text-secondary'>
                {t('characters')}
              </Link>
              <Link href='/stories' className='text-primary text-md hover:text-secondary'>
                {t('library')}
              </Link>
              {isSuperAdmin &&
                <Link href='/all-stories' className='text-primary text-md hover:text-secondary'>
                    Admin
                </Link>}
            </div>
          </div>
          {user && user.user_metadata.credits > 0 && (
              <Link href='/pricing' className='text-primary mr-4 flex hover:text-secondary'>
                {user.user_metadata.credits}
                <Coins className='w-5 h-5 mr-1 text-accent' />
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
                        alt={user.user_metadata?.name || user.email || t('user')}
                      />
                      <AvatarFallback>
                        {user.user_metadata?.name
                          ? user.user_metadata.name.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-56' onClick={() => setPopoverOpen(!isPopoverOpen)}>
                  <div className='grid gap-4'>
                    <div className='text-secondary font-bold'>
                      {user.user_metadata?.name || user.email}
                    </div>
                    <div className='gap-4 flex flex-col md:hidden'>
                      <Link href='/characters' className='text-md hover:text-secondary'>
                        <Button variant='outline' className='w-full justify-start'>
                          <PersonStanding className='mr-2 h-4 w-4' />
                          {t('characters')}
                        </Button>
                      </Link>
                      <Link href='/stories' className='text-md hover:text-secondary'>
                        <Button variant='outline' className='w-full justify-start'>
                          <Library className='mr-2 h-4 w-4' />
                          {t('library')}
                        </Button>
                      </Link>
                      {isSuperAdmin &&
                        <Link href='/all-stories' className='text-md hover:text-secondary'>
                          <Button variant='outline' className='w-full justify-start'>
                            <Library className='mr-2 h-4 w-4' />
                            {t('library')}
                          </Button>
                        </Link>}
                    </div>
                    <Link href='/profile'>
                      <Button variant='outline' className='w-full justify-start'>
                        <UserIcon className='mr-2 h-4 w-4' />
                        {t('profile')}
                      </Button>
                    </Link>
                    <Button
                      variant='outline'
                      className='w-full justify-start'
                      onClick={handleLogout}
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      {t('logout')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              )
            : (
              <Button variant='outline' onClick={() => router.push('/login')}>
                {t('login')}
              </Button>
              )}
        </div>
      </header>
  )
}

// app/Header.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User as UserIcon, LogOut } from 'lucide-react'

export default function Header() {
    const router = useRouter()
    const supabase = useSupabaseClient()
    const user = useUser()
    const [isPopoverOpen, setPopoverOpen] = useState(false)

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error al cerrar sesión:', error)
        } else {
            router.push('/login')
        }
    }

    const handleProfileClick = () => {
        setPopoverOpen(false)
        router.push('/profile')
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-end items-center">
                {user ? (
                    <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                                <Avatar>
                                    <AvatarImage
                                        src="/placeholder-avatar.jpg"
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
                        <PopoverContent className="w-56">
                            <div className="grid gap-4">
                                <div className="font-medium">
                                    {user.user_metadata?.name || user.email}
                                </div>
                                <Button variant="outline" className="w-full justify-start" onClick={handleProfileClick}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Perfil
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar sesión
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Button variant="outline" onClick={() => router.push('/login')}>
                        Iniciar sesión
                    </Button>
                )}
            </div>
        </header>
    )
}

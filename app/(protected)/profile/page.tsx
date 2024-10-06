// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
    const router = useRouter()
    const supabase = useSupabaseClient()
    const user = useUser()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })

    useEffect(() => {
        if (user) {
            setEmail(user.email || '')
            setName(user.user_metadata?.name || '')
        } else {
            router.push('/login')
        }
    }, [user])

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setLoading(true)
            const { error } = await supabase.auth.updateUser({
                data: {
                    name,
                },
            })

            if (error) {
                throw error
            }

            setMessage({ text: '¡Tu perfil ha sido actualizado!', type: 'success' })
        } catch (error) {
            console.error('Error al actualizar el perfil:', error)
            setMessage({ text: 'No se pudo actualizar el perfil.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">Perfil</h1>

            {message.text && (
                <div
                    className={`mb-4 p-4 rounded ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={updateProfile} className="space-y-4">
                <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" value={email} disabled />
                </div>
                <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        type="text"
                        value={name || ''}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </form>
        </div>
    )
}

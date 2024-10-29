'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Lock, Mail, Play, User } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const router = useRouter()

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider
    })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    if (password !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: 'https://cuentia.vercel.app/login',
        },
      })

      if (error) {
        throw error
      } else {
        setMessage({ text: 'Registro exitoso. ¡Revisa tu correo para confirmar tu cuenta!', type: 'success' })
        router.push('/login')
      }
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Ocurrió un error durante el registro',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col lg:flex-row">
      {/* Video Section */}
      <div className="lg:w-2/3 relative overflow-hidden">
        <video
          className="w-full h-full object-cover"
          src="/placeholder-video.mp4"
          loop
          muted
          autoPlay={isPlaying}
        >
          Tu navegador no soporta el elemento de video.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white bg-opacity-30 rounded-full p-4 text-white"
          >
            <Play className="w-12 h-12" />
          </motion.button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h2 className="text-white text-2xl font-bold">Únete a la magia de CuentIA</h2>
          <p className="text-white">Regístrate para comenzar a crear historias únicas para tus hijos</p>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="lg:w-1/3 flex items-center justify-center p-8 bg-white bg-opacity-90">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col text-center justify-center items-center mb-8">
            <Link href="/">
              <div className={'w-fit flex gap-2 items-center'}>
                <BookOpen className="w-12 h-12 text-sky-500 mx-auto mb-2" />
                <h1 className="bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent text-3xl">CuentIA</h1>
              </div>
            </Link>
            <p className="text-gray-600">Regístrate para comenzar la aventura</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 mb-2 block">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  id="name"
                  placeholder="Tu nombre"
                  className="pl-10 w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  className="pl-10 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700 mb-2 block">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="pl-10 w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="pl-10 w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Registrarse
            </Button>
            <Button
                className={'w-full'}
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
            >
              Regístrate con Google
            </Button>
            {/*<Button*/}
            {/*    variant="outline"*/}
            {/*    onClick={() => handleOAuthSignIn('facebook')}*/}
            {/*    disabled={isLoading}*/}
            {/*>*/}
            {/*  Regístrate con Facebook*/}
            {/*</Button>*/}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-purple-600 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

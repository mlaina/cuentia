'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Mail, Play } from "lucide-react"
import Link from 'next/link'

export default function Page() {
  const [email, setEmail] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica de recuperación de contraseña
    console.log('Password reset attempt for:', email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col lg:flex-row">
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
          <h2 className="text-white text-2xl font-bold">Recupera tu acceso a CuentIA</h2>
          <p className="text-white">No te preocupes, te ayudaremos a recuperar tu contraseña</p>
        </div>
      </div>

      {/* Forgot Password Form Section */}
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
            <p className="text-gray-600">Recupera tu contraseña</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                Enviar instrucciones
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-green-600 mb-4">Se han enviado las instrucciones a tu correo electrónico.</p>
              <p className="text-gray-600">Por favor, revisa tu bandeja de entrada y sigue los pasos indicados.</p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-purple-600 hover:underline block mb-2">
              Volver al inicio de sesión
            </Link>
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-purple-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

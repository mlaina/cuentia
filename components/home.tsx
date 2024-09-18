'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Star, Wand2, Sparkles, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from 'next/link'

export function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    { question: "¿Cómo funciona CuentIA?", answer: "CuentIA utiliza inteligencia artificial avanzada para generar cuentos personalizados basados en tus preferencias y las características de tu hijo." },
    { question: "¿Puedo personalizar los personajes?", answer: "¡Sí! Puedes personalizar el aspecto, nombre y características de los personajes principales para que se parezcan a tu hijo o sus personajes favoritos." },
    { question: "¿Cuánto tiempo tarda en generarse un cuento?", answer: "La mayoría de los cuentos se generan en menos de un minuto, dependiendo de la complejidad y longitud solicitada." },
    { question: "¿Puedo editar el cuento una vez generado?", answer: "Absolutamente. Ofrecemos herramientas de edición para que puedas ajustar el cuento a tu gusto después de la generación inicial." }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-gray-800 flex items-center">
            <BookOpen className="w-8 h-8 mr-2 text-purple-600" />
            <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient-c" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="gradient-u" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="gradient-e" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="gradient-n" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="gradient-t" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="gradient-i" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="gradient-a" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <text x="0" y="30" fontSize="30" fontWeight="bold" fontFamily="Arial, sans-serif">
                <tspan fill="url(#gradient-c)">C</tspan>
                <tspan fill="url(#gradient-u)">u</tspan>
                <tspan fill="url(#gradient-e)">e</tspan>
                <tspan fill="url(#gradient-n)">n</tspan>
                <tspan fill="url(#gradient-t)">t</tspan>
                <tspan fill="url(#gradient-i)">I</tspan>
                <tspan fill="url(#gradient-a)">A</tspan>
              </text>
            </svg>
          </Link>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-purple-600">Iniciar sesión</Link>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Crea cuentos mágicos con IA
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Personaliza historias únicas para tus hijos con la magia de la inteligencia artificial
          </motion.p>
          <Button size="lg" className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 hover:from-red-600 hover:via-purple-600 hover:to-blue-600 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
            Comienza tu aventura
          </Button>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Características mágicas</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Wand2, title: "Personalización total", description: "Adapta los personajes y la trama a tus preferencias" },
                { icon: Sparkles, title: "Generación instantánea", description: "Obtén tu cuento en segundos gracias a nuestra IA" },
                { icon: MessageCircle, title: "Narración por voz", description: "Escucha el cuento narrado con la voz que elijas" }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Cómo funciona</h2>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/placeholder.svg?height=200&width=300" alt="Paso 1: Elige tus preferencias" className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Elige tus preferencias</h3>
                <p className="text-gray-600">Selecciona el tema, los personajes y el estilo de tu cuento.</p>
              </motion.div>
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/placeholder.svg?height=200&width=300" alt="Paso 2: Genera tu cuento" className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Genera tu cuento</h3>
                <p className="text-gray-600">Nuestra IA crea una historia única basada en tus elecciones.</p>
              </motion.div>
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-lg max-w-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/placeholder.svg?height=200&width=300" alt="Paso 3: Disfruta y comparte" className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Disfruta y comparte</h3>
                <p className="text-gray-600">Lee, escucha y comparte tu cuento personalizado con tus seres queridos.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Lo que dicen nuestros usuarios</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "María G.", comment: "CuentIA ha revolucionado nuestras noches de lectura. ¡A mis hijos les encantan sus historias personalizadas!" },
                { name: "Carlos R.", comment: "Increíble herramienta para padres. Los cuentos son creativos y educativos. ¡Totalmente recomendado!" },
                { name: "Laura S.", comment: "La posibilidad de personalizar los personajes hace que cada historia sea especial. ¡Una experiencia mágica!" }
              ].map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="bg-purple-50 p-6 rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  </div>
                  <p className="text-gray-800 font-semibold mt-2">{testimonial.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Preguntas frecuentes</h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <button
                    className="flex justify-between items-center w-full text-left p-4 bg-white rounded-lg shadow-md"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    {expandedFaq === index ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                  </button>
                  {expandedFaq === index && (
                    <div className="mt-2 p-4 bg-purple-50 rounded-lg">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">¿Listo para crear magia?</h2>
            <p className="text-xl text-white mb-8">Únete a miles de padres que ya están creando recuerdos inolvidables con CuentIA</p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Comienza gratis</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CuentIA</h3>
              <p className="text-sm text-gray-400">Creando historias mágicas con IA para niños de todo el mundo.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-gray-400 hover:text-white">Inicio</Link></li>
                <li><Link href="/about" className="text-sm text-gray-400 hover:text-white">Sobre nosotros</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Precios</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white">Términos de servicio</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-white">Política de privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg></a>
                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">&copy; 2023 CuentIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Star, Wand2, Sparkles, MessageCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import createImage from '../public/images/landing-create.png'
import storyImage from '../public/images/landing-story.png'
import shareImage from '../public/images/landing-share.png'
import PricingTable from '@/components/PricingTable'
import HTMLFlipBook from 'react-pageflip'
import { Input } from '@/components/ui/input'
import Google from '@/components/google'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

const frontpages = [
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/b3aa2cfe-bf27-4e60-03bc-039a7707b500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/5d164f0e-75b4-45fe-4159-93093f85bd00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/9172f4b6-e8c4-4480-ba64-7812f3298c00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/eebb84a4-b9c2-4d39-08f3-49250b1fe900/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/511ba210-a262-4646-ac5c-918730e10000/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/0697f64f-84e9-4620-50c4-6df7c963a200/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/7dc91d91-dd31-4f2e-c9c3-43d2f1e23800/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/17afc59c-8e0c-46de-8826-f9bdc8ad5000/public'
]

const images = [
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/de079655-2d7a-4ecb-3f04-83b28e19cd00/public',
  // 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/e6179ea1-2eb4-4afb-001c-5c77e1fd3a00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/9a5a3b3b-5394-4438-0cac-0bd984802200/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/18c08125-0ae3-4d70-56d1-0e05232fa500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/37042f47-6bb2-4873-8901-eeb5e1ea2d00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/c57d08dc-bd06-454f-acc2-331269270600/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/51b08b54-5c81-49d7-db38-f2dc092ca900/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/3de3e5ba-4b17-4c69-d314-4f02f2be9100/public',
  // 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/6822a2db-da1f-4403-256a-541a05268200/public',
  // 'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/4c58558a-f859-4d85-98be-378f64352500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/aae5c423-fb37-448f-0c35-33c7f9dd5700/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/a6d24f06-4c70-4e61-56d4-61180b796c00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/17a72ce4-07f1-49a5-693d-d1d612e36a00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/3dc725ed-3d5e-41ab-d4e3-f8c93dd28b00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/a8c5949b-e20b-4a6d-21ec-33c927bb7800/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/f9686985-bbd8-4ee0-fa60-fa0a5b81bb00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/663f2f9c-68fb-423b-e500-3df160c65500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/d45df62d-29b5-4c82-0348-99bdea3d9200/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/1a8140a2-ab2d-4d9c-a877-925a0c449500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/77fccff0-6ef7-4193-9b4d-de84aa60e400/public',
  // fronts
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/5f944a51-cb8a-4460-bd4b-5b4922c49b00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/8a2b52cc-b6dc-4ad2-c9fa-7b3a9fc23f00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/6a4b1a68-8855-455d-66d2-401f41c2fe00/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/ed234cf3-ec15-4a71-a5d0-1970bc939100/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/07ec60cf-a91d-45d0-bd66-bf7bb2574500/public',
  'https://imagedelivery.net/bd-REhjuVN4XS2LBK3J8gg/2a2a4328-295e-42ab-5fa2-dcdbd4a52200/public'
]

export default function Home () {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [, setMessage] = useState({ text: '', type: '' })
  const [email, setEmail] = useState('')
  const supabase = useSupabaseClient()
  const bookRef = useRef<any>(null)

  const faqs = [
    { question: '¿Cómo funciona CuentIA?', answer: 'CuentIA utiliza inteligencia artificial avanzada para generar cuentos personalizados basados en tus preferencias y las características de tu hijo.' },
    { question: '¿Puedo personalizar los personajes?', answer: '¡Sí! Puedes personalizar el aspecto, nombre y características de los personajes principales para que se parezcan a tu hijo o sus personajes favoritos.' },
    { question: '¿Cuánto tiempo tarda en generarse un cuento?', answer: 'La mayoría de los cuentos se generan en menos de un minuto, dependiendo de la complejidad y longitud solicitada.' },
    { question: '¿Puedo editar el cuento una vez generado?', answer: 'Absolutamente. Ofrecemos herramientas de edición para que puedas ajustar el cuento a tu gusto después de la generación inicial.' }
  ]
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

  return (
      <div className='relative min-h-screen overflow-hidden bg-white'>
        <header className='container mx-auto px-4 py-8'>
          <nav className='flex justify-between items-center'>
            <Link href='/' className='text-3xl font-bold text-gray-800 flex items-center'>
              <BookOpen className='w-10 h-10 mr-2 text-sky-400' />
              <p className='bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent'>Imagins</p>
            </Link>
          </nav>
        </header>
        <main>
          <section className='bg-white pt-5'>
            <div className='mx-auto max-w-7xl'>
              <div className='relative'>
                <HTMLFlipBook
                  width={550}
                  height={700}
                  size='stretch'
                  minWidth={550}
                  maxWidth={550}
                  minHeight={700}
                  maxHeight={700}
                  maxShadowOpacity={0.2}
                  mobileScrollSupport
                  onFlip={(e: any) => {
                    setCurrentPage(Math.floor(e.data))
                  }}
                  ref={bookRef}
                  className='mx-auto rounded-md shadow-md'
                  style={{
                    '--page-shadow-color': 'rgba(0, 0, 0, 0.1)'
                  } as React.CSSProperties}
                >
                  {frontpages.map((imageUrl, index) => [
                    <div key={index} className='page bg-white shadow-md'>
                      <div className='page-content h-full flex justify-center items-center'>
                        <img src={imageUrl} alt={`Image for page ${index}`} className='absolute inset-0 w-full h-full object-cover rounded-l-sm' />
                      </div>
                    </div>,
                    <div key={index + 1} className='page-content h-full flex justify-center items-center p-8 bg-white border border-gray-200 shadow-md '>
                      <h1 className='bg-gradient-to-r font-bold text-center from-sky-500 via-purple-800 to-red-600 bg-clip-text text-3xl text-transparent mt-10'>Crea tus cuentos con una frase</h1>
                      <div className='border-glow-container rounded-md p-4 mt-3'>
                        <div className='border-glow absolute inset-0 rounded-lg pointer-events-none' />
                        <div className='relative flex flex-col gap-3'>
                          <div className='flex'>
                            <Mail className='absolute left-3 transform mt-2 text-gray-400' />
                            <Input
                              type='email'
                              id='email'
                              placeholder='tu@email.com'
                              className='pl-10 w-full'
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            </div>
                          <Button
                            className=' rounded-lg text-md w-full transition transition-all ease-in-out b-glow to-sky-500 drop-shadow-lg transition-all  text-white font-bold'
                            disabled={isLoading}
                          >
                            Iniciar sesión
                          </Button>
                        </div>
                        <hr className='my-6 border-gray-200' />
                        <Button
                          className='w-full'
                          variant='outline'
                          onClick={() => handleOAuthSignIn('google')}
                          disabled={isLoading}
                        >
                          <Google className='w-6 h-6 mr-2' />
                          Inicia Sesión con Google
                        </Button>
                      </div>
                    </div>
                  ])}
                </HTMLFlipBook>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className='bg-white py-20'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Características mágicas</h2>
              <div className='grid md:grid-cols-3 gap-8'>
                {[
                  { icon: Wand2, title: 'Personalización total', description: 'Adapta los personajes y la trama a tus preferencias' },
                  { icon: Sparkles, title: 'Generación instantánea', description: 'Obtén tu cuento en segundos gracias a nuestra IA' },
                  { icon: MessageCircle, title: 'Narración por voz', description: 'Escucha el cuento narrado con la voz que elijas' }
                ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className='bg-gradient-to-br from-white to-purple-50 p-6 rounded-lg shadow-md'
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className='w-12 h-12 text-purple-600 mb-4' />
                      <h3 className='text-xl font-semibold text-gray-800 mb-2'>{feature.title}</h3>
                      <p className='text-gray-600'>{feature.description}</p>
                    </motion.div>
                ))}
              </div>
            </div>
          </section>
          <div className='grid grid-cols-4 gap-4'>
            {images.map((src, index) => (
                <div key={index} className='relative h-[500px]'>
                  <Image src={src} alt={`Image ${index + 1}`} fill className='object-cover rounded-md' />
                  <div
                    className=' transition-opacity ease-in duration-1000 absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent'
                  />
                </div>
            ))}
          </div>
          {/* Demo Section */}
          <section className='py-20'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Cómo funciona</h2>
              <div className='flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8'>
                <motion.div
                  className='bg-white p-6 rounded-lg shadow-lg max-w-md bg-pink-50'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='flex justify-center items-center'>
                    <Image src={createImage} alt='Paso 1: Elige tus preferencias' className='object-cover rounded-md mb-4' width={300} height={300} />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>1. Elige tus preferencias</h3>
                  <p className='text-gray-600'>Selecciona el tema, los personajes y el estilo de tu cuento.</p>
                </motion.div>
                <motion.div
                  className='bg-white p-6 rounded-lg shadow-lg max-w-md bg-pink-50'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image src={storyImage} alt='Paso 2: Genera tu cuento' className=' object-cover rounded-md mb-4' width={450} height={450} />
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>2. Genera tu cuento</h3>
                  <p className='text-gray-600'>Nuestra IA crea una historia única basada en tus elecciones.</p>
                </motion.div>
                <motion.div
                  className='bg-white p-6 rounded-lg shadow-lg max-w-md bg-pink-50'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image src={shareImage} alt='Paso 3: Disfruta y comparte' className='object-cover rounded-md mb-4' width={600} height={600} />
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>3. Disfruta y comparte</h3>
                  <p className='text-gray-600 mb-1.5'>Lee, escucha y comparte tu cuento personalizado con tus seres queridos.</p>
                </motion.div>
              </div>
            </div>
          </section>

          <section className='py-20'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Planes y Precios</h2>
              <PricingTable />
            </div>
          </section>
          {/* Testimonials Section */}
          <section className='bg-white py-20'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Lo que dicen nuestros usuarios</h2>
              <div className='grid md:grid-cols-3 gap-8'>
                {[
                  { name: 'María G.', comment: 'CuentIA ha revolucionado nuestras noches de lectura. ¡A mis hijos les encantan sus historias personalizadas!' },
                  { name: 'Carlos R.', comment: 'Increíble herramienta para padres. Los cuentos son creativos y educativos. ¡Totalmente recomendado!' },
                  { name: 'Laura S.', comment: 'La posibilidad de personalizar los personajes hace que cada historia sea especial. ¡Una experiencia mágica!' }
                ].map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className='bg-purple-50 p-6 rounded-lg shadow-md'
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className='text-gray-600 mb-4'>"{testimonial.comment}"</p>
                      <div className='flex items-center'>
                        <Star className='w-5 h-5 text-yellow-400 mr-1' />
                        <Star className='w-5 h-5 text-yellow-400 mr-1' />
                        <Star className='w-5 h-5 text-yellow-400 mr-1' />
                        <Star className='w-5 h-5 text-yellow-400 mr-1' />
                        <Star className='w-5 h-5 text-yellow-400 mr-1' />
                      </div>
                      <p className='text-gray-800 font-semibold mt-2'>{testimonial.name}</p>
                    </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className='py-20'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center text-gray-800 mb-12'>Preguntas frecuentes</h2>
              <div className='max-w-3xl mx-auto'>
                {faqs.map((faq, index) => (
                    <div key={index} className='mb-4'>
                      <button
                        className='flex justify-between items-center w-full text-left p-4 bg-white rounded-lg shadow-md'
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <span className='font-semibold text-gray-800'>{faq.question}</span>
                        {expandedFaq === index ? <ChevronUp className='w-5 h-5 text-gray-600' /> : <ChevronDown className='w-5 h-5 text-gray-600' />}
                      </button>
                      {expandedFaq === index && (
                          <div className='mt-2 p-4 bg-purple-50 rounded-lg'>
                            <p className='text-gray-600'>{faq.answer}</p>
                          </div>
                      )}
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className='bg-gradient-to-r from-purple-600 to-blue-600 py-20'>
            <div className='container mx-auto px-4 text-center'>
              <h2 className='text-3xl font-bold text-white mb-6'>¿Listo para crear magia?</h2>
              <p className='text-xl text-white mb-8'>Únete a miles de padres que ya están creando recuerdos inolvidables con CuentIA</p>
              <Button size='lg' variant='secondary' asChild>
                <Link href='/register'>Comienza gratis</Link>
              </Button>
            </div>
          </section>
        </main>

        <footer className='bg-gray-800 text-white py-12'>
          <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-4 gap-8'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>CuentIA</h3>
                <p className='text-sm text-gray-400'>Creando historias mágicas con IA para niños de todo el mundo.</p>
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Enlaces rápidos</h3>
                <ul className='space-y-2'>
                  <li><Link href='/' className='text-sm text-gray-400 hover:text-white'>Inicio</Link></li>
                  <li><Link href='/about' className='text-sm text-gray-400 hover:text-white'>Sobre nosotros</Link></li>
                  <li><Link href='/pricing' className='text-sm text-gray-400 hover:text-white'>Precios</Link></li>
                  <li><Link href='/contact' className='text-sm text-gray-400 hover:text-white'>Contacto</Link></li>
                </ul>
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Legal</h3>
                <ul className='space-y-2'>
                  <li><Link href='/terms' className='text-sm text-gray-400 hover:text-white'>Términos de servicio</Link></li>
                  <li><Link href='/privacy' className='text-sm text-gray-400 hover:text-white'>Política de privacidad</Link></li>
                </ul>
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Síguenos</h3>
                <div className='flex space-x-4'>
                  <a href='#' className='text-gray-400 hover:text-white'><svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'><path fillRule='evenodd' d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' clipRule='evenodd' /></svg></a>
                  <a href='#' className='text-gray-400 hover:text-white'><svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'><path fillRule='evenodd' d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z' clipRule='evenodd' /></svg></a>
                  <a href='#' className='text-gray-400 hover:text-white'><svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'><path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' /></svg></a>
                </div>
              </div>
            </div>
            <div className='mt-8 pt-8 border-t border-gray-700 text-center'>
              <p className='text-sm text-gray-400'>&copy; 2023 CuentIA. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}

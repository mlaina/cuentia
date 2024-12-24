'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Wand2, Sparkles, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import PricingTable from '@/components/PricingTable'
import HTMLFlipBook from 'react-pageflip'
import frontpages from '@/types/landing/frontpages.json'
import images from '@/types/landing/images.json'
import features from '@/types/landing/features.json'
import Accordion from '@/components/Accordion'
import Login from '@/components/Login'
import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function Home () {
  const [, setCurrentPage] = useState(1)
  const bookRef = useRef<any>(null)
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/create')
    }
  }, [user, router])

  const faqs = [
    { question: '¿Cómo funciona Imagins?', answer: 'Imagins utiliza inteligencia artificial avanzada para generar cuentos personalizados basados en tus preferencias y las características de tu hijo.' },
    { question: '¿Puedo personalizar los personajes?', answer: '¡Sí! Puedes personalizar el aspecto, nombre y características de los personajes principales para que se parezcan a tu hijo o sus personajes favoritos.' },
    { question: '¿Cuánto tiempo tarda en generarse un cuento?', answer: 'La mayoría de los cuentos se generan en menos de un minuto, dependiendo de la complejidad y longitud solicitada.' },
    { question: '¿Puedo editar el cuento una vez generado?', answer: 'Absolutamente. Ofrecemos herramientas de edición para que puedas ajustar el cuento a tu gusto después de la generación inicial.' }
  ]

  return (
      <div className='relative min-h-screen overflow-hidden bg-white'>
        <header id='top' className='container mx-auto max-w-6xl py-4 pt-6 '>
          <nav className='flex justify-between items-center'>
            <Link href='/' className='text-3xl font-bold text-gray-800 flex items-center'>
              <BookOpen className='w-10 h-10 mr-2 text-secondary' />
              <p className='text-secondary text-4xl font-bold'>Imagins</p>
            </Link>
            <div className='space-x-8 text-md'>
              <a href='#library' className='text-primary font-bold hover:text-secondary'>Librería</a>
              <a href='#pricing' className='text-primary font-bold hover:text-secondary'>Precios</a>
            </div>
          </nav>
        </header>
        <main className='bg-cover bg-center'>
          <section className='background-section-1'>
            <div className='mx-auto my-8'>
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
                    <div key={'front-' + index} className='page bg-white shadow-md'>
                      <div className='page-content h-full flex justify-center items-center'>
                        <img
                          src={imageUrl} alt={`Image for page ${index}`}
                          className='absolute inset-0 w-full h-full object-cover rounded-l-sm'
                        />
                      </div>
                    </div>,
                    <div
                      key={'back-' + index}
                      className='page-content h-full flex py-6 px-12 bg-white border border-gray-200 shadow-md'
                    >
                      <div className='min-w-[455px] h-[230px] rounded-md border border-secondary border-dashed' />
                      {features[index] &&
                          <div className='flex w-full items-center justify-center mt-6'>
                            <div className=''>
                              <div className='p-6 flex flex-col gap-4'>
                                {features[index][0] && (
                                    <div key={`feature-0-${index}`}>
                                      <div className='flex items-center gap-2'>
                                        <h3 className='text-xl font-semibold text-secondary mb-2'>
                                          {features[index][0].title}
                                        </h3>
                                        {features[index][0].comming && (
                                            <div
                                              className=' inline-block mt-[-6px] px-3 py-0.5 text-xs text-primary bg-gray-200 rounded-full'
                                            >
                                              Próximamente
                                            </div>
                                        )}
                                      </div>
                                      <p className='text-primary'>
                                        {features[index][0].description || features[index][0].features.map(f => (
                                            <li key={f}>{f}</li>
                                        ))}
                                      </p>
                                    </div>
                                )}
                                {features[index][1] && (
                                    <div key={`feature-1-${index}`}>
                                      <div className='flex items-center gap-2'>
                                        <h3 className='text-xl font-semibold text-secondary mb-2'>
                                          {features[index][1].title}
                                        </h3>
                                        {features[index][1].comming && (
                                            <div
                                              className=' inline-block px-3 mt-[-6px] py-0.5 text-xs text-primary bg-gray-200 rounded-full'
                                            >
                                              Próximamente
                                            </div>
                                        )}
                                      </div>
                                      <p className='text-primary'>
                                        {features[index][1].description || features[index][1].features.map(f => (
                                            <li key={f}>{f}</li>
                                        ))}
                                      </p>
                                    </div>
                                )}
                              </div>

                            </div>
                          </div>}
                    </div>
                  ])}
                </HTMLFlipBook>
                <Login />
              </div>
            </div>
            <div className='container py-8 mx-auto px-18'>
              <div className='grid md:grid-cols-3 gap-8'>
                <div className='p-6 bg-white rounded-lg shadow-md flex flex-col gap-2'>
                  <Wand2 className='w-8 h-8 text-primary mb-4' />
                  <h3 className='text-xl font-bold text-primary mb-2'>Personalización total</h3>
                  <p className='text-primary'>Adapta los personajes y la trama a tus preferencias</p>
                </div>
                <div className='p-6 bg-white rounded-lg shadow-md flex flex-col gap-2'>
                  <Sparkles className='w-8 h-8 text-secondary mb-4' />
                  <h3 className='text-xl font-bold text-secondary mb-2'>Generación instantánea</h3>
                  <p className='text-primary'>Obtén tu cuento en segundos gracias a nuestra IA</p>
                </div>
                <div className='p-6 bg-white rounded-lg shadow-md flex flex-col gap-2'>
                  <MessageCircle className='w-8 h-8 text-accent mb-4' />
                  <h3 className='text-xl font-bold text-accent mb-2'>Narración por voz</h3>
                  <p className='text-primary'>Escucha el cuento narrado con la voz que elijas</p>
                </div>
              </div>
            </div>
          </section>
          <section className='py-16 flex flex-col justify-center background-section-2'>
            <div className='mx-auto px-6'>
              <div className='flex flex-col space-y-20'>
                <div className='flex flex-col md:flex-row items-start md:space-x-6 space-y-4 md:space-y-0'>
                  <div className='flex items-center gap-12'>
                  <div className='flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary text-primary text-3xl font-bold'>
                    1
                  </div>
                  <div className='flex flex-col gap-5'>
                    <h3 className='text-2xl md:text-3xl font-bold text-primary'>Personaliza la historia</h3>
                    <p className='text-lg md:text-base text-gray-600 w-96'>
                      Selecciona el género, define los personajes y el estilo que quieres que tengan las ilustraciones.
                    </p>
                  </div>
                  </div>
                </div>
                <div className='flex flex-col md:flex-row items-start md:space-x-6 space-y-4 md:space-y-0'>
                  <div className='flex items-center gap-12'>
                    <div className='flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary text-primary text-3xl font-bold'>
                      2
                    </div>
                    <div className='flex flex-col gap-5'>
                      <h3 className='text-2xl md:text-3xl font-bold text-primary'>Genera tu cuento</h3>
                      <p className='text-lg md:text-base text-gray-600 w-96'>
                        Nuestra IA empezará a crear una historia totalmente personalizada según tus parámetros en cuestión de segundos.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col md:flex-row items-start md:space-x-6 space-y-4 md:space-y-0'>
                  <div className='flex items-center gap-12'>
                    <div className='flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary text-primary text-3xl font-bold'>
                      3
                    </div>
                    <div className='flex flex-col gap-5'>
                      <h3 className='text-2xl md:text-3xl font-bold text-primary'>¡Disfruta y comparte!</h3>
                      <p className='text-lg md:text-base text-gray-600 w-96'>
                        Ponte cómodo y prepárate para la aventura.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id='library' className=' w-full py-16 background-section-3'>
            <div className='grid grid-cols-1 max-w-6xl m-auto sm:grid-cols-2 lg:grid-cols-4 gap-10 '>
              {images.map((src, index) => {
                return (
                      <div key={index} className='relative w-26'>
                        <img
                          src={src}
                          alt='Cover Image'
                          className='w-full object-cover rounded-r-md drop-shadow-xl shadow-lg'
                        />
                        <div className='absolute inset-y-0 left-0 w-4 bg-gradient-to-l from-black/30 via-transparent to-transparent pointer-events-none' />
                      </div>
                )
              })}
            </div>
          </section>
          <div className='background-section-4'>
            <section className='py-20' id='pricing'>
              <div className='container mx-auto px-4'>
                <a href='#top'>
                  <PricingTable />
                </a>
              </div>
            </section>
            <section className='py-12'>
              <div className='container mx-auto px-4 max-w-6xl flex justify-between items-center'>
                <div className='w-1/2'>
                  <img
                    src='/images/pablo.svg'
                    alt='pablo'
                    className='w-full object-cover pablo'
                  />
                </div>
                <div className='w-1/2'>
                  <h2 className='text-6xl w-96 text-secondary font-bold mb-6'>Empieza tu historia</h2>
                  <p className='text-lg w-96 text-primary mb-8'>Únete a miles de padres que ya están creando recuerdos
                      inolvidables con Imagins</p>
                    <Button
                      size='lg' variant='secondary' asChild
                      className='bg-secondary text-white font-bold hover:text-gray-700'
                    >
                      <a href='#top'>¡Comienza ahora!</a>
                    </Button>
                  </div>
                </div>
            </section>
            <section className='pt-12'>
              <div className='container mx-auto px-4'>
                <div className='max-w-5xl mx-auto'>
                  <Accordion data={faqs} />
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className='bg-secondary-700 text-white py-12'>
          <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-4 gap-8'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Imagins</h3>
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
            <div className='mt-8 pt-8 border-t border-gray-400 text-center'>
              <p className='text-sm text-gray-400'>&copy; 2024 Imagins. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}

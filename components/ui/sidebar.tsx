'use client'

import { BookOpen, Home, Mic, Sliders } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar () {
  return (
        <aside className='w-64 bg-white border-r border-gray-50'>
            <div>
                <Link href='/dashboard' className='p-4 flex items-center'>
                    <BookOpen className='w-10 h-10 mr-2 text-sky-400' />
                    <p className='bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent'>CuentIA</p>
                </Link>
            </div>
            <nav className='mt-6 flex flex-col gap-2 pl-2'>
                <Link href='/dashboard' className='block px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-600'>
                    <Home className='inline-block w-5 h-5 mr-2' />
                    Inicio
                </Link>
                <Link href='/story' className='block px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-600'>
                    <BookOpen className='inline-block w-5 h-5 mr-2' />
                    Crear Cuento
                </Link>
                <Link href='/voices' className='block px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-600'>
                    <Mic className='inline-block w-5 h-5 mr-2' />
                    Mis Voces
                </Link>
                <Link href='/params' className='block px-4 py-2 text-gray-600 hover:bg-sky-50 hover:text-sky-600'>
                    <Sliders className='inline-block w-5 h-5 mr-2' />
                    Mis Parámetros
                </Link>
            </nav>
        </aside>
  )
}

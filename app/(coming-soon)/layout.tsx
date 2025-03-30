import Header from '@/components/ui/header'
import React from 'react'

export default function ProtectedLayout ({
  children
}: {
    children: React.ReactNode
}) {
  return (
    <div className='flex flex-col h-screen'>
        <main className='flex-1 text-black'>
            <Header />
            <div className='h-full'>
                {children}
            </div>
        </main>
    </div>
  )
}

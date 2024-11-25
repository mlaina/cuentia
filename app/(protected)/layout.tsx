import Header from '@/components/ui/header'

export default function ProtectedLayout ({
  children
}: {
    children: React.ReactNode
}) {
  return (
    <div className='flex flex-col h-screen'>
        <main className='flex-1 text-black'>
            <Header />
            {children}
        </main>
    </div>
  )
}

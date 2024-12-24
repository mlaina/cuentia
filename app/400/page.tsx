export default function Error400 () {
  return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
            <h1 className='text-5xl font-bold text-red-600'>400 - Solicitud Incorrecta</h1>
            <p className='mt-4 text-lg text-primary'>
                Parece que hubo un problema con tu solicitud. Por favor, verifica e inténtalo de nuevo.
            </p>
            <a
              href='/'
              className='mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-700'
            >
                Regresar al inicio
            </a>
        </div>
  )
}

'use client'



import Link from "next/link";

export default function Footer() {
    return (
        <footer
            className='w-full min-h-[600px] flex flex-col justify-between text-primary-200 sm:pt-16 pt-10 pb-12 sm:px-10 px-5 text-gray-200'
            style={{
                background: 'linear-gradient(90deg, #014F86 0%, #2C7DA0 70%)'
            }}
        >
            <div className='flex justify-between'>
                <div className='sm:space-y-8 space-y-4'>
                    <h2 className='sm:text-5xl text-2xl font-clash max-w-[780px] mx-auto'>Imagins</h2>
                </div>
            </div>
        </footer>
    )
}

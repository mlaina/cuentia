'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import PricingTable from '@/components/PricingTable'
import Accordion from '@/components/Accordion'
import { useUser } from '@supabase/auth-helpers-react'
import { useTranslations } from 'next-intl'

export default function Pricing () {
  const user = useUser()
  const t = useTranslations()
  const email = user?.email
  const faqs = [
    { question: t('how_it_works'), answer: t('how_it_works_description') },
    { question: t('customize_characters'), answer: t('customize_characters_description') },
    { question: t('story_generation_time'), answer: t('story_generation_time_description') },
    { question: t('edit_story'), answer: t('edit_story_description') }
  ]

  const [plan, setPlan] = useState('Anual')

  return (
        <div className='relative min-h-screen overflow-hidden background-section-1'>
            <main className='bg-cover bg-center'>
                <section className='py-10'>
                    <div className='container mx-auto px-4'>
                        {/* Botones de selección de plan */}
                        <div className='flex items-center justify-center mb-8'>
                            <div className='flex bg-gradient-to-r from-pink-200 to-pink-500 rounded-lg p-1'>
                                <button
                                  className={`px-6 py-2 rounded-lg font-semibold ${
                                        plan === 'Mensual' ? 'bg-pink-600 text-white' : 'text-gray-500'
                                    }`}
                                  onClick={() => setPlan('Mensual')}
                                >
                                    {t('monthly')}
                                </button>
                                <button
                                  className={`px-6 py-2 rounded-lg font-semibold ${
                                        plan === 'Anual' ? 'bg-pink-600 text-white' : 'text-gray-500'
                                    }`}
                                  onClick={() => setPlan('Anual')}
                                >
                                    {t('annual')}
                                </button>
                            </div>
                        </div>

                        {/* Tabla de precios */}
                        <PricingTable link email={email} planPeriod={plan} />
                    </div>
                </section>

                <section className='py-20'>
                    <div className='container mx-auto px-4'>
                        <div className='max-w-5xl mx-auto'>
                            <Accordion data={faqs} />
                        </div>
                    </div>
                </section>
            </main>

            <footer className='bg-secondary-700 text-white py-12'>
                <div className='container mx-auto px-4'>
                    <div className='grid md:grid-cols-4 gap-8'>
                        <div>
                            <h3 className='text-lg font-semibold mb-4'>{t('app_name')}</h3>
                            <p className='text-sm text-gray-400'>{t('creating_magical_stories')}</p>
                        </div>
                        <div>
                            <h3 className='text-lg font-semibold mb-4'>{t('quick_links')}</h3>
                            <ul className='space-y-2'>
                                <li><Link href='/' className='text-sm text-gray-400 hover:text-white'>{t('home')}</Link></li>
                                <li><Link href='/about' className='text-sm text-gray-400 hover:text-white'>{t('about_us')}</Link></li>
                                <li><Link href='/pricing' className='text-sm text-gray-400 hover:text-white'>{t('pricing')}</Link></li>
                                <li><Link href='/contact' className='text-sm text-gray-400 hover:text-white'>{t('contact')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className='text-lg font-semibold mb-4'>{t('legal')}</h3>
                            <ul className='space-y-2'>
                                <li><Link href='/terms' className='text-sm text-gray-400 hover:text-white'>{t('terms_of_service')}</Link></li>
                                <li><Link href='/privacy' className='text-sm text-gray-400 hover:text-white'>{t('privacy_policy')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className='text-lg font-semibold mb-4'>{t('follow_us')}</h3>
                            <div className='flex space-x-4'>
                                <a href='#' className='text-gray-400 hover:text-white'><svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'><path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' /></svg></a>
                            </div>
                        </div>
                    </div>
                    <div className='mt-8 pt-8 border-t border-white text-center'>
                        <p className='text-sm text-gray-400'>&copy; 2024 {t('app_name')}. {t('all_rights_reserved')}</p>
                    </div>
                </div>
            </footer>
        </div>
  )
}

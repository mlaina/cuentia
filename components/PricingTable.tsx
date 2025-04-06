'use client'

import { loadStripe } from '@stripe/stripe-js'
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, PanInfo } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

// Configura Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Array de planes – sin la propiedad "large"
const pricingPlans = [
  {
    id: 'basic',
    subtitle: 'basic_plan',
    name: 'plan_perrault',
    price: 10,
    annual: 100,
    description: 'plan_perrault_description',
    features: [
      'plan_perrault_feature_1',
      'plan_perrault_feature_2',
      'plan_perrault_feature_3',
      'plan_perrault_feature_4'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_5_STORIES_ID || 'price_basic_default',
    color: '#FFFFFF',
    textColor: '#1F2937',
    borderColor: '#B4187F',
    buttonBgColor: '#96989a',
    buttonTextColor: '#FFFFFF'
  },
  {
    id: 'medium',
    subtitle: 'medium_plan',
    name: 'plan_andersen',
    price: 35,
    annual: 300,
    description: 'plan_andersen_description',
    features: [
      'plan_andersen_feature_1',
      'plan_andersen_feature_2',
      'plan_andersen_feature_3',
      'plan_andersen_feature_4'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_20_STORIES_ID || 'price_medium_default',
    color: '#B4187F',
    textColor: '#FFFFFF',
    borderColor: '#B4187F',
    buttonBgColor: '#FFFFFF',
    buttonTextColor: '#B4187F'
  },
  {
    id: 'unlimited',
    subtitle: 'unlimited_plan',
    name: 'plan_grimm',
    price: 80,
    annual: 600,
    description: 'plan_grimm_description',
    features: [
      'plan_grimm_feature_1',
      'plan_grimm_feature_2',
      'plan_grimm_feature_3',
      'plan_grimm_feature_4'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID || 'price_unlimited_default',
    color: '#FFFFFF',
    textColor: '#1F2937',
    borderColor: '#B4187F',
    buttonBgColor: '#96989a',
    buttonTextColor: '#FFFFFF'
  }
]

export default function PricingTable ({
  link = false,
  email = null,
  planPeriod = 'Anual'
}: {
  link?: boolean
  email?: string | null
  planPeriod?: 'Mensual' | 'Anual'
}) {
  const t = useTranslations()
  const supabase = useSupabaseClient()
  const user = useUser()

  // Estado que guarda el plan del usuario. Por defecto "medium" (si no hay user o no se encuentra).
  const [userPlan, setUserPlan] = useState<'basic' | 'medium' | 'unlimited'>('medium')

  // -- Lógica carrusel (móvil) --
  // Por simplicidad, marcamos la tarjeta "medium" como la inicial, salvo que la encuentres en `pricingPlans`.
  // Buscamos su índice como "center" inicial
  const defaultIndex = pricingPlans.findIndex((p) => p.id === 'medium') || 0
  const [direction, setDirection] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(defaultIndex)

  // Al montar (y cuando `user` cambie), buscar el plan en la BD
  useEffect(() => {
    async function fetchUserPlan () {
      if (!user) return

      try {
        // Ajusta la tabla (e.g. 'users') y columna (e.g. 'plan') según tu BD real
        const { data, error } = await supabase
          .from('users')
          .select('plan')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        if (data?.plan) {
          // plan: 'basic' | 'medium' | 'unlimited'
          setUserPlan(data.plan)
        }
      } catch (err) {
        console.error('Error fetching user plan:', err)
      }
    }

    fetchUserPlan()
  }, [user, supabase])

  // -- Lógica de compra --
  const handleCheckout = async (priceId: string) => {
    if (!link || !priceId) {
      console.error('Checkout no disponible o priceId indefinido.', { link, priceId })
      return
    }
    const stripe = await stripePromise
    if (!stripe) {
      console.error('Stripe.js no se cargó correctamente.')
      return
    }
    try {
      const userEmail =
          email || (await supabase.auth.getSession()).data.session?.user?.email || null

      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: userEmail })
      })
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)
      const session = await response.json()

      if (session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id })
      } else {
        console.error('No sessionId:', session)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  // Antes de la compra, si no hay usuario, redirigir a login.
  const handlePurchaseAttempt = async (priceId: string | undefined) => {
    if (!priceId) {
      console.error('Falta el price ID.')
      return
    }
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      handleCheckout(priceId)
    } else {
      window.location.href = '#login'
    }
  }

  // -- Lógica de carrusel (solo móvil) --
  const navigatePlan = (newDirection: number) => {
    if (pricingPlans.length <= 1) return
    setDirection(newDirection)
    setCurrentIndex((prev) => (prev + newDirection + pricingPlans.length) % pricingPlans.length)
  }

  const prevPlan = () => navigatePlan(-1)
  const nextPlan = () => navigatePlan(1)

  const goToPlan = (index: number) => {
    if (pricingPlans.length <= 1 || index === currentIndex) return
    const wrapAwareDiff = index - currentIndex
    let newDirection = Math.sign(wrapAwareDiff)
    const halfway = pricingPlans.length / 2
    if (
      Math.abs(wrapAwareDiff) > halfway ||
        (Math.abs(wrapAwareDiff) === halfway && wrapAwareDiff < 0)
    ) {
      newDirection = -newDirection
    }
    if (newDirection !== 0) {
      setDirection(newDirection)
    } else {
      setDirection(direction || 1)
    }
    setCurrentIndex(index)
  }

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    const swipeVelocityThreshold = 0.3
    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x

    if (swipeDistance < -swipeThreshold || swipeVelocity < -swipeVelocityThreshold) {
      nextPlan()
    } else if (swipeDistance > swipeThreshold || swipeVelocity > swipeVelocityThreshold) {
      prevPlan()
    }
  }

  // Determinamos qué tarjetas se ven en la vista (mobile)
  const getVisibleItems = () => {
    if (pricingPlans.length === 0) return []
    if (pricingPlans.length === 1) {
      return [{ index: 0, position: 'center' }]
    }
    if (pricingPlans.length === 2) {
      const otherIndex = (currentIndex + 1) % 2
      const otherPosition = currentIndex === 0 ? 'right' : 'left'
      return [
        { index: currentIndex, position: 'center' },
        { index: otherIndex, position: otherPosition }
      ]
    }
    const prev = (currentIndex - 1 + pricingPlans.length) % pricingPlans.length
    const next = (currentIndex + 1) % pricingPlans.length
    return [
      { index: prev, position: 'left' },
      { index: currentIndex, position: 'center' },
      { index: next, position: 'right' }
    ]
  }

  return (
      <div className='flex flex-col items-center justify-center w-full'>
        <div className='relative w-full max-w-6xl px-4 py-6 md:py-12'>

          {/* -- MOBILE (carrusel) -- */}
          <div className='lg:hidden'>
            {/* eslint-disable-next-line multiline-ternary */}
            {pricingPlans.length === 0 ? (
                <div className='flex flex-col items-center justify-center bg-secondary-50 rounded-xl border-2 border-dashed border-secondary-200 p-8 text-center h-[400px] max-w-md mx-auto'>
                  <h3 className='text-xl font-bold text-gray-800 mb-4'>
                    {t('no_plans_title') || 'No Plans Available'}
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    {t('no_plans_description') || 'Check back later for pricing options.'}
                  </p>
                </div>
            ) : (
                <>
                  {pricingPlans.length > 1 && (
                      <>
                        <button
                          type='button'
                          onClick={prevPlan}
                          className='absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        >
                          <ChevronLeft className='w-5 h-5 md:w-6 md:h-6' />
                        </button>
                        <button
                          type='button'
                          onClick={nextPlan}
                          className='absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-30 bg-secondary hover:bg-secondary-600 text-white rounded-full p-2 md:p-3 transition-all duration-300 shadow-lg'
                        >
                          <ChevronRight className='w-5 h-5 md:w-6 md:h-6' />
                        </button>
                      </>
                  )}

                  <motion.div
                    className='relative overflow-hidden h-[400px] sm:h-[440px] md:h-[450px] cursor-grab active:cursor-grabbing'
                    drag='x'
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div className='absolute w-full h-full flex justify-center items-center'>
                      {getVisibleItems().map(({ index, position }) => {
                        const plan = pricingPlans[index]
                        if (!plan) return null
                        const isCenter = position === 'center'

                        // Comprobamos si es el plan del usuario
                        const isUserPlan = plan.id === userPlan

                        // Ejemplo: si coincide con userPlan y está en "center", lo destacamos más
                        // (puedes usar la misma idea que antes con `plan.large`, etc.)
                        const cardScale = isCenter
                          ? (isUserPlan ? 1.05 : 1) // resaltado extra si es userPlan
                          : 0.85
                        const cardOpacity = isCenter ? 1 : 0.6
                        const cardZIndex = isCenter ? 20 : 10

                        const ahorroAnual =
                            planPeriod === 'Anual' ? plan.price * 12 - plan.annual : 0
                        const priceToShow =
                            planPeriod === 'Anual'
                              ? Math.round(plan.annual / 12)
                              : plan.price

                        const isDarkText = plan.textColor === '#1F2937'

                        return (
                            <motion.div
                              key={`plan-mobile-${plan.id}-${position}`}
                              className={`absolute select-none flex flex-col overflow-hidden shadow-lg rounded-xl border-2 p-4 md:p-6 ${
                                    isCenter ? 'h-[380px] sm:h-[400px] md:h-[430px]' : 'h-[340px] sm:h-[400px] md:h-[410px] hidden sm:flex opacity-60'
                                } w-[80%] sm:w-[260px] md:w-[260px] border-solid`}
                              style={{
                                backgroundColor: plan.color,
                                color: plan.textColor,
                                borderColor: plan.borderColor,
                                cursor: !isCenter ? 'pointer' : 'auto'
                              }}
                              initial={false}
                              animate={{
                                x:
                                      position === 'center'
                                        ? '0%'
                                        : position === 'left'
                                          ? '-65%'
                                          : '65%',
                                scale: cardScale,
                                opacity: cardOpacity,
                                zIndex: cardZIndex,
                                transition: { type: 'spring', stiffness: 300, damping: 30 }
                              }}
                              onClick={(e) => {
                                if (!isCenter) {
                                  e.stopPropagation()
                                  goToPlan(index)
                                }
                              }}
                            >
                              <h4
                                className={`text-xs uppercase mb-2 ${
                                      isDarkText ? 'text-gray-500' : 'text-white/80'
                                  }`}
                              >
                                {t(plan.subtitle)}
                              </h4>
                              <h3 className='text-lg font-bold mb-3'>{t(plan.name)}</h3>
                              <p
                                className={`mb-4 text-sm ${
                                      isDarkText ? 'text-gray-600' : 'text-white/90'
                                  } flex-grow`}
                              >
                                {t(plan.description)}
                              </p>
                              <ul
                                className={`mb-4 space-y-1 text-xs sm:text-sm ${
                                      isDarkText ? 'text-gray-700' : plan.textColor
                                  }`}
                              >
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className='flex items-center'>
                                      <CheckCircle
                                        className={`mr-2 w-4 h-4 ${
                                              isDarkText ? 'text-gray-600' : plan.textColor
                                          } flex-shrink-0`}
                                      />
                                      {t(feature)}
                                    </li>
                                ))}
                              </ul>
                              <hr
                                className={`my-4 border-t ${
                                      isDarkText ? 'border-gray-300' : 'border-white/50'
                                  }`}
                              />
                              <p
                                className={`${
                                      isDarkText ? 'text-gray-500' : 'text-white/80'
                                  } mb-2 text-xs`}
                              >
                                {t('monthly')}
                              </p>
                              <div className='flex justify-between items-center mt-auto'>
                                <div>
                                  <p
                                    className={`text-3xl sm:text-4xl font-bold ${
                                          isDarkText ? 'text-gray-800' : plan.textColor
                                      }`}
                                  >
                                    {priceToShow}€
                                  </p>
                                  {planPeriod === 'Anual' && ahorroAnual > 0 && (
                                      <p
                                        className={`text-xs italic mt-1 ${
                                              isDarkText ? 'text-gray-500' : 'text-white/70'
                                          }`}
                                      >
                                        {t('annual_price')} {plan.annual}€
                                      </p>
                                  )}
                                </div>
                                {link && isCenter && (
                                    <div className='px-1'>
                                      <button
                                        type='button'
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handlePurchaseAttempt(plan.stripePriceId)
                                        }}
                                        className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-opacity duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2'
                                        style={{
                                          backgroundColor: plan.buttonBgColor,
                                          color: plan.buttonTextColor
                                        }}
                                        aria-label={t('buy') || 'Comprar plan'}
                                      >
                                        <ArrowRight size={20} className='sm:hidden' />
                                        <ArrowRight size={24} className='hidden sm:inline' />
                                      </button>
                                    </div>
                                )}
                              </div>
                            </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Indicadores (bolitas) */}
                  {pricingPlans.length > 1 && (
                      <div className='flex justify-center mt-4 md:mt-6 space-x-1.5 md:space-x-2'>
                        {pricingPlans.map((_, index) => (
                            <button
                              key={index}
                              type='button'
                              onClick={() => goToPlan(index)}
                              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                                    index === currentIndex
                                        ? 'bg-secondary scale-125 w-3 sm:w-3.5'
                                        : 'bg-secondary-300 hover:bg-secondary-400'
                                }`}
                              aria-label={`Ir al plan ${index + 1}`}
                            />
                        ))}
                      </div>
                  )}
                </>
            )}
          </div>

          {/* -- DESKTOP (3 columnas) -- */}
          <div className='hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-12 lg:max-w-6xl mx-auto px-8 lg:px-0 py-12'>
            {pricingPlans.map((plan) => {
              const isHighlighted = plan.id === userPlan
              const ahorroAnual =
                  planPeriod === 'Anual' ? plan.price * 12 - plan.annual : 0
              const priceToShow =
                  planPeriod === 'Anual'
                    ? Math.round(plan.annual / 12)
                    : plan.price

              // Agrega algo de zoom y sombra extra si es el plan del user
              const cardClasses = isHighlighted
                ? 'lg:-translate-y-1 lg:scale-105 shadow-xl border-2'
                : 'shadow-md border'

              return (
                  <div
                    key={plan.id}
                    className={`w-full lg:max-w-sm rounded-lg py-12 px-10 transition-transform duration-300 ease-out ${cardClasses}`}
                    style={{
                      background: plan.color,
                      color: plan.textColor,
                      borderColor: plan.borderColor || '#E5E7EB'
                    }}
                  >
                    <h4 className='text-sm uppercase mb-2'>{t(plan.subtitle)}</h4>
                    <h3 className='text-xl font-bold mb-4'>{t(plan.name)}</h3>
                    <p className='mb-6'>{t(plan.description)}</p>
                    <ul className='mb-6 space-y-2'>
                      {plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className='flex items-center'>
                            <CheckCircle className='mr-2 w-5 h-5 flex-shrink-0' />
                            {t(feature)}
                          </li>
                      ))}
                    </ul>
                    <hr className='my-6 border-t border-dashed border-white/50' />
                    <p className='text-sm mb-4'>{t('monthly')}</p>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-5xl font-bold'>{priceToShow}€</p>
                        {planPeriod === 'Anual' && ahorroAnual > 0 && (
                            <p className='text-sm italic mt-1'>
                              {t('annual_price')} {plan.annual}€
                            </p>
                        )}
                      </div>
                      {link && (
                          <div className='px-1'>
                            <button
                              type='button'
                              onClick={() => handlePurchaseAttempt(plan.stripePriceId)}
                              className='flex items-center justify-center w-12 h-12 rounded-full transition-opacity duration-200 hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2'
                              style={{ backgroundColor: plan.buttonBgColor, color: plan.buttonTextColor }}
                              aria-label={t('buy') || 'Comprar plan'}
                            >
                              <ArrowRight size={24} />
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
              )
            })}
          </div>
        </div>
      </div>
  )
}

'use client'

import { loadStripe } from '@stripe/stripe-js'
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, type PanInfo } from 'framer-motion'
import type React from 'react'
import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

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
    buttonTextColor: '#FFFFFF',
    large: false
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
    buttonTextColor: '#B4187F',
    large: true
  },
  {
    id: 'unlimited',
    subtitle: 'unlimited_plan',
    name: 'plan_grimm',
    price: 80,
    annual: 600,
    description: 'plan_grimm_description',
    features: ['plan_grimm_feature_1', 'plan_grimm_feature_2', 'plan_grimm_feature_3', 'plan_grimm_feature_4'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID || 'price_unlimited_default',
    color: '#FFFFFF',
    textColor: '#1F2937',
    borderColor: '#B4187F',
    buttonBgColor: '#96989a',
    buttonTextColor: '#FFFFFF',
    large: false
  }
]

export default function PricingTable ({ link = false, email = null, planPeriod = 'Anual' }) {
  const t = useTranslations()
  const [direction, setDirection] = useState(0)
  const initialIndex =
      pricingPlans.findIndex((p) => p.large) >= 0
        ? pricingPlans.findIndex((p) => p.large)
        : pricingPlans.length > 0
          ? Math.floor(pricingPlans.length / 2)
          : 0
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const supabase = useSupabaseClient()

  const handleCheckout = async (priceId) => {
    if (!link || !priceId) {
      console.error('Checkout no disponible o priceId no definido:', { link, priceId })
      return
    }
    const stripe = await stripePromise
    if (!stripe) {
      console.error('Stripe.js no se ha cargado correctamente.')
      return
    }
    try {
      const userEmail = email || (await supabase.auth.getSession()).data.session?.user?.email || null

      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: userEmail })
      })
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)
      const session = await response.json()
      if (session.id) await stripe.redirectToCheckout({ sessionId: session.id })
      else console.error('No sessionId:', session)
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  const navigatePlan = (newDirection: number) => {
    if (pricingPlans.length <= 1) return
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + newDirection + pricingPlans.length) % pricingPlans.length
      return nextIndex
    })
  }

  const prevPlan = (e?: React.MouseEvent<HTMLButtonElement>) => {
    navigatePlan(-1)
    e?.currentTarget.blur()
  }

  const nextPlan = (e?: React.MouseEvent<HTMLButtonElement>) => {
    navigatePlan(1)
    e?.currentTarget.blur()
  }

  const goToPlan = (index: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (pricingPlans.length <= 1 || index === currentIndex) {
      e?.currentTarget.blur()
      return
    }
    const wrapAwareDiff = index - currentIndex
    let newDirection = Math.sign(wrapAwareDiff)
    const halfway = pricingPlans.length / 2
    if (Math.abs(wrapAwareDiff) > halfway || (Math.abs(wrapAwareDiff) === halfway && wrapAwareDiff < 0)) {
      newDirection = -newDirection
    }

    if (newDirection !== 0) {
      setDirection(newDirection)
    } else {
      setDirection(direction || 1)
    }
    setCurrentIndex(index)
    e?.currentTarget.blur()
  }

  const swipeThreshold = 50
  const swipeVelocityThreshold = 0.3

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x

    if (swipeDistance < -swipeThreshold || swipeVelocity < -swipeVelocityThreshold) {
      nextPlan()
    } else if (swipeDistance > swipeThreshold || swipeVelocity > swipeVelocityThreshold) {
      prevPlan()
    }
  }

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

  const handlePurchaseAttempt = async (priceId: string | undefined) => {
    if (!priceId) {
      console.error('Price ID is missing for purchase attempt.')
      return
    }
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session) {
      handleCheckout(priceId)
    } else {
      window.location.href = '#login'
    }
  }

  return (
      <div className='flex flex-col items-center justify-center w-full'>
        <div className='relative w-full max-w-6xl px-4 py-6 md:py-12'>
          <div className='lg:hidden'>
            {pricingPlans.length === 0
              ? (
                <div className='flex flex-col items-center justify-center bg-secondary-50 rounded-xl border-2 border-dashed border-secondary-200 p-8 text-center h-[400px] max-w-md mx-auto'>
                  <h3 className='text-xl font-bold text-gray-800 mb-4'>{t('no_plans_title') || 'No Plans Available'}</h3>
                  <p className='text-gray-600 mb-6'>
                    {t('no_plans_description') || 'Check back later for pricing options.'}
                  </p>
                </div>
                )
              : (
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
                        const ahorroAnual = planPeriod === 'Anual' ? plan.price * 12 - plan.annual : 0
                        const priceToShow = planPeriod === 'Anual' ? Math.round(plan.annual / 12) : plan.price

                        const secondaryColor = '#B4187F'
                        const defaultBgColor = '#FFFFFF'
                        const defaultTextColor = '#1F2937'
                        const defaultBorderColor = '#E5E7EB'
                        const centerTextColor = '#FFFFFF'

                        const usePlanColorAsBackground = plan.color !== '#FFFFFF'
                        const cardBgColor = isCenter
                          ? usePlanColorAsBackground
                            ? plan.color
                            : secondaryColor
                          : defaultBgColor
                        const cardTextColor = isCenter
                          ? usePlanColorAsBackground
                            ? plan.textColor
                            : centerTextColor
                          : defaultTextColor
                        const cardBorderColor = isCenter
                          ? usePlanColorAsBackground
                            ? plan.color
                            : secondaryColor
                          : defaultBorderColor

                        const isDarkText = cardTextColor === defaultTextColor
                        const subtitleColorClass = isDarkText ? 'text-gray-500' : 'text-white/80'
                        const descriptionColorClass = isDarkText ? 'text-gray-600' : 'text-white/90'
                        const featureTextColorClass = isDarkText ? 'text-gray-700' : cardTextColor
                        const featureIconColorClass = isDarkText ? 'text-gray-600' : cardTextColor
                        const hrColorClass = isDarkText ? 'border-gray-300' : 'border-white/50'
                        const monthlyTextColorClass = isDarkText ? 'text-gray-500' : 'text-white/80'
                        const priceColorClass = isDarkText ? 'text-gray-800' : cardTextColor
                        const annualPriceColorClass = isDarkText ? 'text-gray-500' : 'text-white/70'

                        const buttonBg = 'white'
                        const buttonText = secondaryColor

                        return (
                            <motion.div
                              key={`plan-${plan.id || index}-${position}`}
                              className={`absolute select-none flex flex-col overflow-hidden shadow-lg rounded-xl border-2 ${isCenter ? 'z-20 h-[380px] sm:h-[400px] md:h-[430px] p-4 md:p-6' : 'z-10 h-[340px] sm:h-[400px] md:h-[410px] hidden sm:flex opacity-60 p-3 md:p-4'} w-[80%] sm:w-[260px] md:w-[260px] ${!isCenter ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''} border-solid`}
                              style={{ backgroundColor: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
                              initial={false}
                              animate={{
                                x: isCenter ? '0%' : position === 'left' ? '-65%' : '65%',
                                scale: isCenter ? 1 : 0.85,
                                opacity: isCenter ? 1 : pricingPlans.length === 2 ? 0.6 : 0.6,
                                zIndex: isCenter ? 20 : 10,
                                transition: { type: 'spring', stiffness: 300, damping: 30 }
                              }}
                              onClick={(e) => {
                                if (!isCenter) {
                                  e.stopPropagation()
                                  goToPlan(index)
                                }
                              }}
                            >
                              <h4 className={`text-xs uppercase mb-2 ${subtitleColorClass}`}>{t(plan.subtitle)}</h4>
                              <h3 className='text-lg font-bold mb-3'>{t(plan.name)}</h3>
                              <p className={`mb-4 text-sm ${descriptionColorClass} flex-grow min-h-[30px]`}>
                                {t(plan.description)}
                              </p>
                              <ul className={`mb-4 space-y-1 text-xs sm:text-sm ${featureTextColorClass}`}>
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className='flex items-center'>
                                      <CheckCircle className={`mr-2 w-4 h-4 ${featureIconColorClass} flex-shrink-0`} />
                                      {t(feature)}
                                    </li>
                                ))}
                              </ul>
                              <hr className={`my-4 border-t ${hrColorClass}`} />
                              <p className={`${monthlyTextColorClass} mb-2 text-xs`}>{t('monthly')}</p>
                              <div className='flex justify-between items-center mt-auto'>
                                <div>
                                  <p className={`text-3xl sm:text-4xl font-bold ${priceColorClass}`}>{priceToShow}€</p>
                                  {planPeriod === 'Anual' && ahorroAnual > 0 && (
                                      <p className={`${annualPriceColorClass} text-xs italic mt-1`}>
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
                                        style={{ backgroundColor: buttonBg, color: buttonText, ringOffsetColor: cardBgColor }}
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
                  {pricingPlans.length > 1 && (
                      <div className='flex justify-center mt-4 md:mt-6 space-x-1.5 md:space-x-2'>
                        {pricingPlans.map((_, index) => (
                            <button
                              key={index}
                              type='button'
                              onClick={(e) => goToPlan(index, e)}
                              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-secondary scale-125 w-3 sm:w-3.5' : 'bg-secondary-300 hover:bg-secondary-400'}`}
                              aria-label={`Ir al plan ${index + 1}`}
                            />
                        ))}
                      </div>
                  )}
                </>
                )}
          </div>

          <div className='hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-12 lg:max-w-6xl mx-auto px-8 lg:px-0 py-12'>
            {pricingPlans.map((plan) => {
              const ahorroAnual = planPeriod === 'Anual' ? plan.price * 12 - plan.annual : 0
              const priceToShow = planPeriod === 'Anual' ? Math.round(plan.annual / 12) : plan.price

              const cardBgColor = plan.color
              const cardTextColor = plan.textColor
              const cardBorderColor = plan.large ? plan.borderColor || plan.color : plan.borderColor || '#E5E7EB'

              const isDarkText = cardTextColor === '#1F2937'
              const featureIconColor = isDarkText ? 'text-gray-500' : cardTextColor
              const subtitleColor = isDarkText ? 'text-gray-500' : 'text-white/90'
              const descriptionColor = isDarkText ? 'text-gray-600' : 'text-white/90'
              const hrColor = isDarkText ? 'border-gray-300' : 'border-white/50'
              const monthlyTextColor = isDarkText ? 'text-gray-500' : 'text-white/80'
              const annualPriceColor = isDarkText ? 'text-gray-500' : 'text-white/70'
              const priceColor = cardTextColor

              const buttonBg = plan.buttonBgColor
              const buttonText = plan.buttonTextColor

              return (
                  <div
                    key={plan.stripePriceId || plan.id}
                    className={`w-full lg:max-w-sm rounded-lg py-12 px-10 transition-transform duration-300 ease-out border ${link ? 'hover:shadow-lg' : ''} ${plan.large ? 'lg:-translate-y-1 lg:scale-105 shadow-xl' : 'shadow-md'}`}
                    style={{ background: cardBgColor, color: cardTextColor, borderColor: cardBorderColor }}
                  >
                    <h4 className={`text-sm uppercase mb-2 ${subtitleColor}`}>{t(plan.subtitle)}</h4>
                    <h3 className='text-xl font-bold mb-4'>{t(plan.name)}</h3>
                    <p className={`mb-6 ${descriptionColor}`}>{t(plan.description)}</p>
                    <ul className='mb-6 space-y-2'>
                      {plan.features.map((feature, index) => (
                          <li key={index} className='flex items-center'>
                            <CheckCircle className={`mr-2 w-5 h-5 ${featureIconColor} flex-shrink-0`} />
                            {t(feature)}
                          </li>
                      ))}
                    </ul>
                    <hr className={`my-6 border-t ${hrColor} border-dashed`} />
                    <p className={`${monthlyTextColor} mb-4 text-sm`}>{t('monthly')}</p>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='text-5xl font-bold' style={{ color: priceColor }}>
                          {priceToShow}€
                        </p>
                        {planPeriod === 'Anual' && ahorroAnual > 0 && (
                            <p className={`${annualPriceColor} text-sm italic mt-1`}>
                              {t('annual_price')} {plan.annual}€
                            </p>
                        )}
                      </div>
                      {link && (
                          <div className='px-1'>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePurchaseAttempt(plan.stripePriceId)
                              }}
                              className='flex items-center justify-center w-12 h-12 rounded-full transition-opacity duration-200 hover:opacity-80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2'
                              style={{ backgroundColor: buttonBg, color: buttonText, ringOffsetColor: cardBgColor }}
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

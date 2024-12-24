'use client'

import { loadStripe } from '@stripe/stripe-js'
import { ArrowRight } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const pricingPlans = [
  {
    subtitle: 'BASIC PLAN',
    name: 'Plan Perrault',
    price: 10,
    annual: 100,
    description: 'Acceso a 5 cuentos por mes',
    features: [
      '5 Cuentos',
      '5 Protagonistas',
      '10 ediciones de texto por cuento',
      '5 ediciones de imágenes por cuento'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_5_STORIES_ID,
    color: '#F5F5F5',
    large: false
  },
  {
    subtitle: 'MEDIUM PLAN',
    name: 'Plan Andersen',
    price: 35,
    annual: 300,
    description: 'Acceso a 20 cuentos por mes',
    features: [
      '20 Cuentos',
      '5 Protagonistas',
      '20 ediciones de texto por cuento',
      '10 ediciones de imágenes por cuento'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_20_STORIES_ID,
    color: '#B4187F',
    large: true
  },
  {
    subtitle: 'UNLIMITED PLAN',
    name: 'Plan Grimm',
    price: 80,
    annual: 600,
    description: 'Acceso ilimitado a cuentos',
    features: [
      'Cuentos ilimitados',
      'Protagonistas ilimitados',
      'Ediciones de texto ilimitadas',
      'Ediciones de imágenes ilimitadas'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID,
    color: '#F5F5F5',
    large: false
  }
]

export default function PricingTable ({ link = false, email = null, planPeriod = 'Anual' }) {
  const handleCheckout = async (priceId) => {
    if (!link) return
    const stripe = await stripePromise
    console.log(email)

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceId, email })
    })
    const session = await response.json()
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: session.id })
    } else {
      console.error('Stripe.js no se ha cargado correctamente.')
    }
  }

  return (
      <div className='grid md:grid-cols-3 gap-12 max-w-5xl m-auto '>
        {pricingPlans.map((plan) => {
          const ahorroAnual = planPeriod === 'Anual' ? (plan.price * 12 - plan.annual) : 0
          return (
            <div
              key={plan.stripePriceId}
              onClick={() => handleCheckout(plan.stripePriceId)}
              className={`max-w-sm p-10 rounded-lg py-12 cursor-pointer ${plan.large ? '-translate-y-1 scale-105 text-white' : ''}`}
              style={{
                background: plan.color
              }}
            >
              <h4 className={`text-sm uppercase mb-2 ${plan.large ? 'text-white' : 'text-gray-600'}`}>
                {plan.subtitle}
              </h4>
              <h3 className='text-xl font-bold mb-4'>{plan.name}</h3>
              <p className={`mb-6 ${plan.large ? 'text-white' : 'text-gray-600'}`}>{plan.description}</p>
              <ul className='mb-6 space-y-2'>
                {plan.features.map((feature, index) => (
                    <li key={index} className='flex items-center'>
                      <span className={`mr-2 ${plan.large ? 'text-white' : 'text-gray-600'}`}>✔</span>
                      {feature}
                    </li>
                ))}
              </ul>
              <hr className={`my-6 px-6 border-1 ${plan.large ? 'border-white' : 'border-gray-600'} border-dashed`} />
              <p className={`${plan.large ? 'text-white' : 'text-gray-600'} mb-4`}>
                {planPeriod}
              </p>
              <div className='flex justify-between items-center'>
                <div>
                  <p className={`${plan.large ? 'text-white' : 'text-gray-600'} text-5xl font-bold`}>
                    {planPeriod === 'Anual' ? plan.annual : plan.price}€
                  </p>
                </div>
                <div className='px-1'>
                  <button
                    className={`flex items-center justify-center w-12 h-12 rounded-full  hover:bg-gray-300 ${plan.large ? 'bg-white text-secondary' : 'bg-primary text-white'}`}
                    aria-label='Comprar'
                  >
                    <ArrowRight className={`${plan.large ? 'text-secondary' : 'text-whit'}`} size={24} />
                  </button>
                </div>
              </div>
              {planPeriod === 'Anual' && ahorroAnual > 0 && (
                  <p className={`${plan.large ? 'text-white' : 'text-gray-600'} text-md italic`}>
                    Ahorras {ahorroAnual}€
                  </p>
              )}
            </div>
          )
        })}
      </div>
  )
}

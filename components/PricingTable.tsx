'use client'

import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const pricingPlans = [
  {
    subtitle: 'BASIC PLAN',
    name: 'Plan Perrault',
    price: 10,
    description: 'Acceso a 5 cuentos por mes',
    features: [
      '5 Cuentos',
      '5 Protagonistas',
      '10 ediciones de texto por cuento',
      '5 ediciones de imágenes por cuento'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_5_STORIES_ID,
    color: '#FFF5D9',
    large: false
  },
  {
    subtitle: 'MEDIUM PLAN',
    name: 'Plan Andersen',
    price: 35,
    description: 'Acceso a 20 cuentos por mes',
    features: [
      '20 Cuentos',
      '5 Protagonistas',
      '10 ediciones de texto por cuento',
      '5 ediciones de imágenes por cuento'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_20_STORIES_ID,
    color: '#99f6e4',
    large: true
  },
  {
    subtitle: 'UNLIMITED PLAN',
    name: 'Plan Grimm',
    price: 80,
    description: 'Acceso ilimitado a cuentos',
    features: [
      'Cuentos ilimitados',
      'Protagonistas ilimitados',
      'Ediciones de texto ilimitadas',
      'Ediciones de imágenes ilimitadas'
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID,
    color: '#C8F0F4',
    large: false
  }
]

export default function PricingTable ({ link = false, email = null }) {
  const handleCheckout = async (priceId) => {
    if (!link) return
    const stripe = await stripePromise

    console.log('stripe', stripe)
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
      <div className='grid md:grid-cols-3 gap-12'>
        {pricingPlans.map((plan) => (
              <div
                key={plan.stripePriceId}
                onClick={() => handleCheckout(plan.stripePriceId)}
                className={`p-10 rounded-lg py-12 cursor-pointer ${plan.large ? '-translate-y-1 scale-105' : ''}`}
                style={{
                  background: plan.color
                }}
              >
                <h4 className='text-sm uppercase mb-2 text-gray-600'>
                  {plan.subtitle}
                </h4>
                <h3 className='text-xl font-bold mb-4'>{plan.name}</h3>
                <p className='mb-6 text-gray-700'>{plan.description}</p>
                <ul className='mb-6 space-y-2'>
                  {plan.features.map((feature, index) => (
                      <li key={index} className='flex items-center'>
                        <span className='mr-2 text-gray-600'>✔</span>
                        {feature}
                      </li>
                  ))}
                </ul>
                <hr className='my-6 px-6 border-1 border-gray-600 border-dashed' />
                <p className='text-gray-600 mb-4'>Mensual</p>
                <p className='text-6xl text-gray-600 font-bold'>
                  {plan.price}€
                </p>
              </div>
        ))}
      </div>
  )
}

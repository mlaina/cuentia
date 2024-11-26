'use client'

import { Button } from '@/components/ui/button'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const pricingPlans = [
  {
    name: '5 Cuentos',
    price: 10,
    description: 'Acceso a 5 cuentos por mes',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_5_STORIES_ID
  },
  {
    name: '20 Cuentos',
    price: 35,
    description: 'Acceso a 20 cuentos por mes',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_20_STORIES_ID
  },
  {
    name: 'Ilimitado',
    price: 80,
    description: 'Acceso ilimitado a cuentos',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID
  }

]

export default function PricingTable () {
  const handleCheckout = async (priceId: string) => {
    const stripe = await stripePromise

    console.log('stripe', stripe)
    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceId })
    })
    const session = await response.json()
    console.log('session', session)
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: session.id })
    } else {
      console.error('Stripe.js no se ha cargado correctamente.')
    }
  }

  return (
        <div className='grid md:grid-cols-3 gap-8'>
            {pricingPlans.map((plan) => (
                <div key={plan.name} className='bg-white p-6 rounded-lg shadow-md'>
                    <h3 className='text-2xl font-bold mb-4'>{plan.name}</h3>
                    <p className='text-4xl font-semibold mb-4'>
                        {plan.price}€<span className='text-lg font-normal'>/mes</span>
                    </p>
                    <p className='mb-6'>{plan.description}</p>
                    <Button onClick={() => handleCheckout(plan.stripePriceId)}>
                        Seleccionar
                    </Button>
                </div>
            ))}
        </div>
  )
}

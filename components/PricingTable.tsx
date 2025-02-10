'use client'

import { loadStripe } from '@stripe/stripe-js'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const pricingPlans = [
  {
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_5_STORIES_ID,
    color: '#F5F5F5',
    large: false
  },
  {
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_20_STORIES_ID,
    color: '#B4187F',
    large: true
  },
  {
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
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_STORIES_ID,
    color: '#F5F5F5',
    large: false
  }
]

export default function PricingTable ({ link = false, email = null, planPeriod = 'Anual' }) {
  const t = useTranslations()

  const handleCheckout = async (priceId) => {
    if (!link) return
    const stripe = await stripePromise

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
      <div className='flex flex-col items-center lg:grid lg:grid-cols-3 gap-6 lg:gap-12 lg:max-w-6xl m-auto px-8 lg:px-0'>
        {pricingPlans.map((plan) => {
          const ahorroAnual = planPeriod === 'Anual' ? (plan.price * 12 - plan.annual) : 0
          return (
              <div
                key={plan.stripePriceId}
                onClick={() => handleCheckout(plan.stripePriceId)}
                className={`w-full lg:max-w-sm p-10 rounded-lg py-12 cursor-pointer ${plan.large ? 'lg:-translate-y-1 lg:scale-105 text-white' : 'border-secondary border'}`}
                style={{
                  background: plan.color
                }}
              >
                <h4 className={`text-sm uppercase mb-2 ${plan.large ? 'text-white' : 'text-gray-600'}`}>
                  {t(plan.subtitle)}
                </h4>
                <h3 className='text-xl font-bold mb-4'>{t(plan.name)}</h3>
                <p className={`mb-6 ${plan.large ? 'text-white' : 'text-gray-600'}`}>{t(plan.description)}</p>
                <ul className='mb-6 space-y-2'>
                  {plan.features.map((feature, index) => (
                      <li key={index} className='flex items-center'>
                        <span className={`mr-2 ${plan.large ? 'text-white' : 'text-gray-600'}`}>✔</span>
                        {t(feature)}
                      </li>
                  ))}
                </ul>
                <hr className={`my-6 px-6 border-1 ${plan.large ? 'border-white' : 'border-secondary'} border-dashed`} />
                <p className={`${plan.large ? 'text-white' : 'text-gray-600'} mb-4`}>
                  {t('monthly')}
                </p>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className={`${plan.large ? 'text-white' : 'text-gray-600'} text-5xl font-bold`}>
                      {planPeriod === 'Anual' ? Math.round(plan.annual / 12) : plan.price}€
                    </p>
                  </div>
                  <div className='px-1'>
                    <button
                      className={`flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-300 ${plan.large ? 'bg-white text-secondary' : 'bg-primary text-white'}`}
                      aria-label={t('buy')}
                    >
                      <ArrowRight className={`${plan.large ? 'text-secondary' : 'text-white'}`} size={24} />
                    </button>
                  </div>
                </div>
                {planPeriod === 'Anual' && ahorroAnual > 0 && (
                    <p className={`${plan.large ? 'text-white' : 'text-gray-600'} text-md italic`}>
                      {t('annual_price')} {plan.annual}€
                    </p>
                )}
              </div>
          )
        })}
      </div>
  )
}

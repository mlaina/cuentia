import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import products from '@/types/products/products'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
})

export async function POST (request) {
  const { sessionId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)

  const productId = lineItems.data[0].price.product

  const credits = products[productId] || 0

  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('users')
    .update({ credits, last_payment: new Date() })
    .eq('user_id', user.id)
    .select('credits')
    .single()

  return NextResponse.json({ success: true })
}

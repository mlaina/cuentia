// app/api/checkout-session/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST (request) {
  const { sessionId } = await request.json()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error retrieving session:', error)
    return NextResponse.json({ error: 'Error retrieving session' }, { status: 500 })
  }
}

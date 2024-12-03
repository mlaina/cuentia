// app/api/stripe-webhook/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST (request) {
  const sig = request.headers.get('stripe-signature')
  const buf = await request.arrayBuffer()
  const body = Buffer.from(buf)

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object)
      break
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted (session) {
  console.log(session)
}

async function handleInvoicePaymentSucceeded (invoice) {
  const subscriptionId = invoice.subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email

  console.log(email)
}

async function handleInvoicePaymentFailed (invoice) {
  const subscriptionId = invoice.subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email

  console.log(email)
}

// app/api/stripe-webhook/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

export async function POST (request) {
  const sig = request.headers.get('stripe-signature')
  const buf = await request.arrayBuffer()
  const body = Buffer.from(buf)

  console.log('Webhook received:', body.toString())

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
  const email = session.customer_email
  if (!email) return
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ email })
  const user = users?.[0]
  if (!user) return

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      credits: 10
    }
  })
}

async function handleInvoicePaymentSucceeded (invoice) {
  const subscriptionId = invoice.subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email
  console.log('Invoice succeeded for:', email)
}

async function handleInvoicePaymentFailed (invoice) {
  const subscriptionId = invoice.subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const customer = await stripe.customers.retrieve(subscription.customer)
  const email = customer.email
  console.log('Invoice failed for:', email)
}

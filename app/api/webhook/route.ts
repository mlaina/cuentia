import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
})

export async function POST(request: Request) {
    const buf = await request.text()
    const sig = headers().get('stripe-signature')

    let event: Stripe.Event

    try {
        if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('Falta la firma del webhook o el secreto')
        }

        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
        console.error(`Error verificando la firma del webhook: ${err.message}`)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Manejar el evento
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session

            // Obtener el cliente de Stripe
            const customer = await stripe.customers.retrieve(session.customer as string)

            // Actualizar el perfil del usuario en Supabase
            const supabase = createRouteHandlerSupabaseClient({
                headers,
            })

            const { error } = await supabase.auth.updateUser({
                data: {
                    plan: session.display_items[0].custom.name,
                },
            })

            if (error) {
                console.error('Error actualizando el perfil del usuario:', error.message)
            }

            break
        default:
            console.log(`Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
}

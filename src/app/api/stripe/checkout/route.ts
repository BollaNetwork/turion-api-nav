import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { PLANS, PlanId } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body as { planId: PlanId }

    if (!planId || !PLANS[planId] || planId === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId]

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id,
        },
      })
      customerId = customer.id
    }

    // Get price ID from database or env
    const priceIdMap: Record<string, string> = {
      starter: process.env.STRIPE_STARTER_PRICE_ID!,
      growth: process.env.STRIPE_GROWTH_PRICE_ID!,
      scale: process.env.STRIPE_SCALE_PRICE_ID!,
    }

    const priceId = priceIdMap[planId]

    if (!priceId) {
      return NextResponse.json({ 
        error: 'Plan not configured. Please contact support.' 
      }, { status: 400 })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
      client_reference_id: session.user.id,
      metadata: {
        plan_id: planId,
        user_id: session.user.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { PLANS, PlanId } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// POST - Create checkout session with dynamic pricing
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

    // Get user's current subscription to check for existing customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id,
        },
      })
      customerId = customer.id

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id)
    }

    // Create checkout session with DYNAMIC pricing
    // Price is defined in PLANS config - change there and it updates everywhere
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: plan.price * 100, // Convert to pence (e.g., £7 = 700p)
            product_data: {
              name: `Turion ${plan.name}`,
              description: `${plan.requestsIncluded.toLocaleString()} requests/month • ${plan.requestsPerMinute} req/min`,
              metadata: {
                plan_id: planId,
              },
            },
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: session.user.id,
      metadata: {
        plan_id: planId,
        user_id: session.user.id,
        price_gbp: plan.price.toString(),
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          user_id: session.user.id,
        },
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

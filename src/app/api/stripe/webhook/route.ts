/**
 * Stripe Webhook Handler
 * 
 * URL: https://www.turion.network/api/stripe/webhook
 * 
 * This endpoint receives and processes Stripe webhook events for:
 * - checkout.session.completed: When a customer completes checkout
 * - customer.subscription.updated: When a subscription is modified
 * - customer.subscription.deleted: When a subscription is cancelled
 * - invoice.paid: When an invoice is successfully paid
 * - invoice.payment_failed: When payment fails
 * 
 * @see https://stripe.com/docs/webhooks
 * 
 * Created by Bolla Network
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Get webhook secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Logging utilities
const log = {
  info: (message: string, data?: object) => {
    console.log(`[STRIPE_WEBHOOK] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  success: (message: string, data?: object) => {
    console.log(`[STRIPE_WEBHOOK] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (message: string, error?: unknown) => {
    console.error(`[STRIPE_WEBHOOK] ❌ ${message}`, error instanceof Error ? error.message : error)
  },
  warn: (message: string, data?: object) => {
    console.warn(`[STRIPE_WEBHOOK] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  log.info('Received webhook request')
  
  try {
    // 1. Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      log.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // 2. Validate webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      log.info(`Event verified: ${event.type}`, { eventId: event.id })
    } catch (err) {
      log.error('Webhook signature verification failed', err)
      return NextResponse.json(
        { error: 'Invalid webhook signature. Check STRIPE_WEBHOOK_SECRET.' },
        { status: 400 }
      )
    }

    // 3. Initialize Supabase client
    const supabase = createServerClient()

    // 4. Process events based on type
    switch (event.type) {
      // ========================================
      // CHECKOUT COMPLETED
      // ========================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        log.info('Processing checkout.session.completed', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        })
        
        const userId = session.client_reference_id || session.metadata?.user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const planId = session.metadata?.plan_id || 'starter'

        if (!userId) {
          log.error('No user ID found in checkout session', { sessionId: session.id })
          break
        }

        if (!subscriptionId) {
          log.warn('No subscription ID - might be a one-time payment', { sessionId: session.id })
          break
        }

        try {
          // Get full subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          log.info('Retrieved subscription from Stripe', {
            subscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          })

          // Upsert subscription in database
          const { error: subError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: planId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })

          if (subError) {
            log.error('Error saving subscription to database', subError)
          } else {
            log.success('Subscription saved to database', { userId, planId })
          }

          // Update profile with Stripe customer ID
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: session.customer_email || session.customer_details?.email || '',
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          })

          if (profileError) {
            log.error('Error updating profile', profileError)
          } else {
            log.success('Profile updated with Stripe customer ID', { userId, customerId })
          }
        } catch (err) {
          log.error('Error processing checkout.session.completed', err)
        }
        
        break
      }

      // ========================================
      // SUBSCRIPTION UPDATED
      // ========================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        log.info('Processing customer.subscription.updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        
        const customerId = subscription.customer as string

        try {
          // Find user by customer ID
          const { data: existingSub, error: findError } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (findError || !existingSub) {
            log.warn('No existing subscription found for customer', { customerId })
            break
          }

          // Determine plan from subscription items
          const priceId = subscription.items.data[0]?.price.id
          let planId = existingSub.plan_id

          // Map price IDs to plans if needed
          // You can add your Stripe price ID mappings here
          if (priceId) {
            log.info('Subscription price ID', { priceId })
          }

          // Update subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              plan_id: planId,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          if (updateError) {
            log.error('Error updating subscription', updateError)
          } else {
            log.success('Subscription updated', {
              subscriptionId: subscription.id,
              status: subscription.status,
            })
          }
        } catch (err) {
          log.error('Error processing customer.subscription.updated', err)
        }
        
        break
      }

      // ========================================
      // SUBSCRIPTION DELETED/CANCELLED
      // ========================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        log.info('Processing customer.subscription.deleted', {
          subscriptionId: subscription.id,
        })

        try {
          // Update subscription status to canceled and revert to free plan
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan_id: 'free',
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            log.error('Error canceling subscription', error)
          } else {
            log.success('Subscription canceled and reverted to free plan', {
              subscriptionId: subscription.id,
            })
          }
        } catch (err) {
          log.error('Error processing customer.subscription.deleted', err)
        }
        
        break
      }

      // ========================================
      // INVOICE PAID
      // ========================================
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        
        log.success('Invoice paid', {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          customerEmail: invoice.customer_email,
        })
        
        // TODO: Send confirmation email to customer
        // TODO: Update any billing records if needed
        
        break
      }

      // ========================================
      // INVOICE PAYMENT FAILED
      // ========================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        log.error('Invoice payment failed', {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email,
          attemptCount: invoice.attempt_count,
        })
        
        // TODO: Send notification email to customer
        // TODO: Update subscription status if needed
        
        break
      }

      // ========================================
      // CUSTOMER CREATED (optional)
      // ========================================
      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        log.info('New Stripe customer created', {
          customerId: customer.id,
          email: customer.email,
        })
        break
      }

      // ========================================
      // UNHANDLED EVENTS
      // ========================================
      default:
        log.warn(`Unhandled event type: ${event.type}`)
    }

    // 5. Return success response
    const processingTime = Date.now() - startTime
    log.success(`Webhook processed successfully in ${processingTime}ms`, {
      eventType: event.type,
      eventId: event.id,
    })

    return NextResponse.json({
      received: true,
      eventType: event.type,
      eventId: event.id,
      processingTime: `${processingTime}ms`,
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    log.error(`Webhook handler failed after ${processingTime}ms`, error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook handler failed',
        processingTime: `${processingTime}ms`,
      },
      { status: 500 }
    )
  }
}

// Note: In Next.js App Router, bodyParser is automatically disabled for route handlers
// The raw body is accessed via request.text() which is already used above

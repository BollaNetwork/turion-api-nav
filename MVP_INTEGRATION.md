# Turion MVP Integration Guide

## Overview

This document outlines the integration plan for Supabase (authentication & database) and Stripe (payments) for the Turion MVP.

---

## 1. Supabase Setup

### Project Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Choose UK/EU region for GDPR compliance
3. Note your project URL and anon key

### Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  name TEXT DEFAULT 'Default Key',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  api_key_id UUID REFERENCES public.api_keys,
  request_type TEXT NOT NULL,
  url TEXT NOT NULL,
  status_code INTEGER,
  execution_time_ms FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly usage summary (materialized for performance)
CREATE TABLE public.monthly_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  year_month TEXT NOT NULL, -- Format: YYYY-MM
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_execution_time_ms FLOAT DEFAULT 0,
  UNIQUE(user_id, year_month)
);

-- Plans configuration
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_gbp DECIMAL(10,2) NOT NULL,
  requests_included INTEGER NOT NULL,
  requests_per_minute INTEGER NOT NULL,
  timeout_seconds INTEGER NOT NULL,
  overage_price_per_1k DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '{}',
  stripe_price_id TEXT
);

-- Insert default plans
INSERT INTO public.plans (id, name, price_gbp, requests_included, requests_per_minute, timeout_seconds, overage_price_per_1k, features) VALUES
('free', 'Free', 0, 1000, 5, 15, NULL, '{"custom_js": false, "proxy": false, "priority": false}'),
('starter', 'Starter', 7, 10000, 10, 30, 0.80, '{"custom_js": true, "proxy": false, "priority": false}'),
('growth', 'Growth', 25, 50000, 30, 45, 0.60, '{"custom_js": true, "proxy": true, "priority": false}'),
('scale', 'Scale', 79, 200000, 60, 60, 0.45, '{"custom_js": true, "proxy": true, "priority": true}');

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly usage" ON public.monthly_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_usage_logs_user_created ON public.usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_user_month ON public.usage_logs(user_id, date_trunc('month', created_at));
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);
```

### Edge Functions (for API Key validation)

```typescript
// supabase/functions/validate-key/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { apiKey } = await req.json()
  
  if (!apiKey || !apiKey.startsWith('tr_')) {
    return new Response(JSON.stringify({ valid: false }), { status: 400 })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Hash the key
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Look up key
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active, profiles!inner(subscription:subscriptions(plan_id, status))')
    .eq('key_hash', keyHash)
    .single()
  
  if (error || !keyData || !keyData.is_active) {
    return new Response(JSON.stringify({ valid: false }), { status: 401 })
  }
  
  return new Response(JSON.stringify({
    valid: true,
    keyId: keyData.id,
    userId: keyData.user_id
  }))
})
```

---

## 2. Stripe Setup

### Account Configuration

1. Create Stripe account (UK)
2. Enable GBP currency
3. Set up tax settings for UK VAT

### Products & Prices (Create in Stripe Dashboard)

```javascript
// Create via Stripe CLI or Dashboard

// Product: Turion API
const product = await stripe.products.create({
  name: 'Turion API',
  description: 'Web scraping API service'
});

// Price: Free (no Stripe price needed)
// Price: Starter - £7/month
const starterPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 700, // £7.00 in pence
  currency: 'gbp',
  recurring: { interval: 'month' },
  metadata: { plan_id: 'starter' }
});

// Price: Growth - £25/month
const growthPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 2500, // £25.00 in pence
  currency: 'gbp',
  recurring: { interval: 'month' },
  metadata: { plan_id: 'growth' }
});

// Price: Scale - £79/month
const scalePrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 7900, // £79.00 in pence
  currency: 'gbp',
  recurring: { interval: 'month' },
  metadata: { plan_id: 'scale' }
});
```

### Webhook Handler

```typescript
// pages/api/webhooks/stripe.ts (Next.js)
import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      
      // Update database
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_id: subscription.items.data[0].price.metadata.plan_id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
      });
      
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase.from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date(),
        })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase.from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date(),
        })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      // Handle successful payment - could send email, etc.
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // Handle failed payment - notify user, update status, etc.
      break;
    }
  }

  res.json({ received: true });
}
```

### Checkout Session Creation

```typescript
// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { planId } = req.body;
  const userId = req.headers['x-user-id']; // From auth middleware

  const priceMap: Record<string, string> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    growth: process.env.STRIPE_GROWTH_PRICE_ID!,
    scale: process.env.STRIPE_SCALE_PRICE_ID!,
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceMap[planId],
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    client_reference_id: userId,
    metadata: {
      plan_id: planId,
    },
  });

  res.json({ url: session.url });
}
```

---

## 3. Environment Variables

```env
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_SCALE_PRICE_ID=price_...

# App
NEXT_PUBLIC_URL=https://turion.network
```

---

## 4. Implementation Checklist

### Week 1: Foundation
- [ ] Create Supabase project (EU region)
- [ ] Run database schema migrations
- [ ] Set up Stripe account (UK)
- [ ] Create products and prices in Stripe
- [ ] Configure environment variables
- [ ] Test webhook endpoint locally with Stripe CLI

### Week 2: Authentication
- [ ] Implement Supabase Auth UI
- [ ] Create signup/login pages
- [ ] Set up protected routes
- [ ] Create user profile page
- [ ] Implement API key generation

### Week 3: Payments
- [ ] Create pricing page with Stripe integration
- [ ] Build checkout flow
- [ ] Handle webhook events
- [ ] Create subscription management page
- [ ] Implement plan upgrade/downgrade

### Week 4: Dashboard & API
- [ ] Build usage dashboard
- [ ] Create API key management
- [ ] Implement rate limiting per plan
- [ ] Add usage analytics
- [ ] Test end-to-end flow

---

## 5. Security Considerations

### API Key Security
- Store only hashed keys (SHA-256)
- Show full key only once at creation
- Use prefix for identification
- Support key revocation

### Rate Limiting
```typescript
// middleware/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimits: Record<string, Ratelimit> = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
  }),
  starter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
  }),
  growth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
  }),
  scale: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
  }),
};

export async function checkRateLimit(userId: string, planId: string) {
  const limiter = rateLimits[planId] || rateLimits.free;
  const { success, remaining } = await limiter.limit(userId);
  return { success, remaining };
}
```

---

## 6. Cost Estimation (Monthly)

| Service | Free Tier | Production |
|---------|-----------|------------|
| Supabase | £0 | £0-20 |
| Stripe | 1.4% + 20p per transaction | Variable |
| Upstash Redis | £0 (10K commands/day) | £0-10 |
| **Total** | **~£0** | **£0-30** |

With VPS at £10/month, total MVP operating cost: **£10-40/month**.

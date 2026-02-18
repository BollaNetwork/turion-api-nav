<p align="center">
  <img src="https://img.shields.io/badge/Turion-API%20Nav-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAxOUwyMiAxOUwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==" alt="Turion API Nav"/>
</p>

<h1 align="center">🚀 Turion API Nav</h1>

<p align="center">
  <strong>Enterprise-Grade Web Scraping API as a Service</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#api-usage">API Usage</a> •
  <a href="#webhook-configuration">Webhook</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-008CDD?style=flat-square&logo=stripe" alt="Stripe"/>
  <img src="https://img.shields.io/badge/Playwright-Browser-45ba4b?style=flat-square&logo=playwright" alt="Playwright"/>
  <img src="https://img.shields.io/badge/Tailwind-CSS%204-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS"/>
</p>

---

<p align="center">
  <strong>Created by <a href="https://bolla.network">Bolla Network</a></strong> 🌐
</p>

---

## 📖 About

**Turion API Nav** is a modern, production-ready SaaS platform that provides powerful web scraping APIs for developers and businesses. Built with cutting-edge technologies, it offers:

- 🔐 **Secure Authentication** via Supabase Auth
- 💳 **Subscription Management** with Stripe integration
- 🔑 **API Key Management** for secure API access
- 📊 **Usage Analytics** and monitoring dashboard
- ⚡ **High Performance** web scraping with Playwright

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Secure login/signup with email verification via Supabase |
| 🔑 **API Key Management** | Create, manage, and revoke API keys with secure hashing |
| 💳 **Subscription Plans** | Free, Starter (£7), Growth (£25), and Scale (£79) tiers |
| 📊 **Usage Dashboard** | Real-time analytics and usage monitoring |
| 🔄 **Stripe Integration** | Secure payment processing and subscription management |
| 🌐 **Web Scraping API** | Powerful browser-based scraping with Playwright |

### Plan Features
| Plan | Requests/Month | Rate Limit | Timeout | Price |
|------|----------------|------------|---------|-------|
| **Free** | 1,000 | 5/min | 15s | £0 |
| **Starter** | 10,000 | 10/min | 30s | £7/mo |
| **Growth** | 50,000 | 30/min | 45s | £25/mo |
| **Scale** | 200,000 | 60/min | 60s | £79/mo |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **Framer Motion** - Smooth animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database + Auth + Row Level Security
- **Stripe** - Payment processing and subscriptions
- **Playwright** - Browser automation for web scraping

### DevOps
- **Vercel** - Deployment platform
- **Bun** - Fast JavaScript runtime and package manager

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** or **Bun 1.0+**
- **Supabase account** - [supabase.com](https://supabase.com)
- **Stripe account** - [stripe.com](https://stripe.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/turion-api-nav.git
   cd turion-api-nav
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables) section)

4. **Set up Supabase database**
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL script

5. **Configure Stripe Webhook** (See [Webhook Configuration](#webhook-configuration))

6. **Run the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGciOiJIUzI1...` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_...` or `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` or `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Your application URL | `https://www.turion.network` |
| `NEXTAUTH_URL` | NextAuth URL (same as app URL) | `https://www.turion.network` |
| `NEXTAUTH_SECRET` | Random string for NextAuth | `your-random-secret` |

### Getting Your Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Navigate to **Settings** → **API**
3. Copy the `URL`, `anon` key, and `service_role` key

#### Stripe
1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. For webhook secret, see [Webhook Configuration](#webhook-configuration)

---

## 🔔 Webhook Configuration

Stripe webhooks are **essential** for handling subscription events like payment success, plan upgrades, and cancellations.

### Webhook URL

```
https://www.turion.network/api/webhooks/stripe
```

> ⚠️ **Production URL**: Replace `www.turion.network` with your actual domain.

### Step-by-Step Setup

1. **Go to Stripe Dashboard**
   - Navigate to [Developers → Webhooks](https://dashboard.stripe.com/webhooks)

2. **Add Endpoint**
   - Click **"Add endpoint"**
   - Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`

3. **Select Events**
   Subscribe to the following events:
   
   | Event | Description |
   |-------|-------------|
   | `checkout.session.completed` | Customer completed checkout |
   | `customer.subscription.created` | New subscription created |
   | `customer.subscription.updated` | Subscription plan changed |
   | `customer.subscription.deleted` | Subscription cancelled |
   | `invoice.paid` | Invoice payment successful |
   | `invoice.payment_failed` | Invoice payment failed |

4. **Get Webhook Secret**
   - After creating the endpoint, click on it
   - Click **"Reveal"** under Signing secret
   - Copy the `whsec_...` value
   - Add to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

Use the Stripe CLI for local development:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will show you a webhook signing secret (whsec_...)
# Use this for local testing
```

### Troubleshooting Webhooks

| Issue | Solution |
|-------|----------|
| **400 Invalid Signature** | Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret |
| **Webhook not receiving** | Check that the URL is correct and accessible from the internet |
| **Events not processing** | Check server logs for errors; ensure database permissions are correct |
| **Local testing fails** | Make sure to use the `whsec_` from `stripe listen`, not from dashboard |

---

## 🗄️ Database Setup

### Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste the entire contents of `supabase-schema.sql`
5. Click **Run**

### Schema Overview

The database includes the following tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information linked to Supabase Auth |
| `api_keys` | API keys for authentication with secure hashing |
| `subscriptions` | User subscription and plan information |
| `usage_logs` | Detailed API request logs |
| `monthly_usage` | Aggregated monthly usage statistics |

### Row Level Security (RLS)

All tables have RLS enabled, ensuring users can only access their own data.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables (all from `.env.local`)

3. **Add Environment Variables**
   In Vercel project settings, add all environment variables from your `.env.local`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your site will be available at `your-project.vercel.app`

5. **Update Stripe Webhook**
   - Update your Stripe webhook URL to your production domain
   - Update `STRIPE_WEBHOOK_SECRET` if using a new endpoint

### Custom Domain

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `www.turion.network`)
3. Configure DNS as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` environment variables

---

## 📡 API Usage

### Authentication

All API requests require an API key in the header:

```bash
curl -X GET "https://www.turion.network/api/scrape?url=https://example.com" \
  -H "Authorization: Bearer tur_your_api_key_here"
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scrape` | GET/POST | Scrape a webpage |
| `/api/keys` | GET | List your API keys |
| `/api/keys` | POST | Create a new API key |
| `/api/keys` | DELETE | Delete an API key |
| `/api/usage` | GET | Get usage statistics |

### Example Request

```javascript
const response = await fetch('https://www.turion.network/api/scrape', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer tur_your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    waitFor: 'networkidle',
    selector: '.content',
  }),
});

const data = await response.json();
```

---

## 📁 Project Structure

```
turion-api-nav/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── keys/          # API key management
│   │   │   ├── stripe/        # Stripe checkout & portal
│   │   │   ├── webhooks/      # Stripe webhooks
│   │   │   └── usage/         # Usage statistics
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   └── demo/              # Demo page
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   └── lib/                   # Utilities and configs
│       ├── supabase.ts       # Supabase client
│       ├── supabase-server.ts # Server-side Supabase
│       └── types.ts          # TypeScript types
├── prisma/                    # Prisma schema (local dev)
├── supabase-schema.sql        # Database schema
├── next.config.ts             # Next.js configuration
├── vercel.json               # Vercel deployment config
└── package.json
```

---

## 🧪 Development

### Available Scripts

```bash
# Development server
bun run dev

# Production build
bun run build

# Start production server
bun start

# Lint code
bun run lint

# Database commands (Prisma - local only)
bun run db:push
bun run db:generate
bun run db:migrate
```

---

## 📄 License

This project is proprietary software owned by **Bolla Network**.

---

## 🙏 Credits

<p align="center">
  <strong>Developed and maintained by</strong><br/>
  <a href="https://bolla.network"><strong>🌐 Bolla Network</strong></a>
</p>

<p align="center">
  <em>Building the future of web automation</em>
</p>

---

## 📞 Support

For support, please contact:
- 🌐 Website: [bolla.network](https://bolla.network)
- 📧 Email: support@bolla.network
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/turion-api-nav/issues)

---

<p align="center">
  Made with ❤️ by <a href="https://bolla.network">Bolla Network</a>
</p>

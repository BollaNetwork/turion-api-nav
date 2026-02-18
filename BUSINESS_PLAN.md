# Turion Business Plan - MVP Launch

## Executive Summary

**Turion** is a high-performance web scraping/rendering API service targeting developers and businesses who need reliable browser automation at scale. We operate as a micro-SaaS with a pay-per-request model.

---

## 1. Infrastructure Analysis

### Current Server Specifications
| Resource | Specification | Monthly Cost |
|----------|--------------|--------------|
| CPU | 4 vCores | - |
| RAM | 8 GB | - |
| Storage | 150 GB SSD | - |
| Bandwidth | 200 Mbit/s | - |
| **Total** | - | **£10/month** |

### Capacity Estimation
Based on our 8GB RAM constraint and optimized Playwright configuration:

| Metric | Value |
|--------|-------|
| Max Concurrent Browsers | 3-4 instances |
| Memory per Browser | ~1.5 GB (including overhead) |
| Avg Request Time | 3-5 seconds |
| Theoretical Max Requests/min | 36-48 requests |
| Practical Safe Limit | 30 requests/min |
| **Monthly Capacity** | ~1.3M requests/month |

### Monthly Operating Costs
| Item | Cost (£) |
|------|----------|
| VPS Server | 10.00 |
| Domain (turion.network) | ~1.00 |
| SSL Certificate (Let's Encrypt) | 0.00 |
| Supabase (Free tier) | 0.00 |
| Stripe (pay-per-use) | Variable |
| **Total Fixed** | **£11/month** |

---

## 2. Competitive Analysis

### Competitor Pricing (UK Market)

| Service | Price | Requests | £/1K Requests |
|---------|-------|----------|---------------|
| ScraperAPI | $49/mo | 100K | £0.39 |
| Bright Data | $500/mo | 200K | £2.00 |
| Scrapy Cloud | $9/mo | 10K | £0.72 |
| ZenRows | $49/mo | 100K | £0.39 |
| Browserless | $29/mo | 6 hours | Variable |

### Our Competitive Position
- **Lower price point** for small-medium users
- **Transparent pricing** (no hidden fees)
- **Simple API** (easier to integrate)
- **UK-based** (GDPR compliant, local support)

---

## 3. Pricing Strategy

### MVP Pricing Plans (in £ GBP)

| Plan | Monthly Price | Requests | Overage | Target Customer |
|------|--------------|----------|---------|-----------------|
| **Free** | £0 | 1,000 | N/A | Developers testing |
| **Starter** | £7 | 10,000 | £0.80/1K | Small projects |
| **Growth** | £25 | 50,000 | £0.60/1K | Startups |
| **Scale** | £79 | 200,000 | £0.45/1K | Agencies |
| **Enterprise** | Custom | Unlimited | N/A | Large companies |

### Revenue Projections

| Customers/Month | Starter | Growth | Scale | MRR |
|-----------------|---------|--------|-------|-----|
| 10 customers | 5 | 3 | 2 | £258 |
| 50 customers | 25 | 15 | 10 | £1,290 |
| 100 customers | 50 | 30 | 20 | £2,580 |
| 500 customers | 250 | 150 | 100 | £12,900 |

### Break-Even Analysis
- Fixed costs: £11/month
- Stripe fee: 1.4% + 20p (UK cards)
- Break-even: ~2 Starter customers

---

## 4. API Limits by Plan

| Feature | Free | Starter | Growth | Scale | Enterprise |
|---------|------|---------|--------|-------|------------|
| **Requests/month** | 1,000 | 10,000 | 50,000 | 200,000 | Unlimited |
| **Requests/minute** | 5 | 10 | 30 | 60 | Unlimited |
| **Concurrent** | 1 | 2 | 3 | 5 | Custom |
| **Timeout** | 15s | 30s | 45s | 60s | Custom |
| **Screenshot** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **PDF** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Custom JS** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Proxy Support** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Custom User-Agent** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Priority Queue** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **SLA** | ❌ | ❌ | ❌ | 99.5% | 99.9% |
| **Support** | Email | Email | Priority | Dedicated | 24/7 |

---

## 5. Tech Stack for MVP

### Backend (Already Built)
- **FastAPI** - REST API framework
- **Playwright** - Browser automation
- **Docker** - Container orchestration
- **Nginx** - Reverse proxy & SSL

### Authentication & Database
- **Supabase** (Free Tier)
  - User authentication
  - API key management
  - Usage tracking
  - Customer data

| Supabase Free Tier | Limit |
|--------------------|-------|
| Database | 500 MB |
| Auth users | 50,000 |
| Storage | 1 GB |
| Bandwidth | 5 GB |

### Payments
- **Stripe** (UK)
  - 1.4% + 20p per UK card transaction
  - 2.9% + 20p for international cards
  - No monthly fees
  - Built-in invoicing

### Monitoring
- **Uptime monitoring**: UptimeRobot (Free)
- **Error tracking**: Sentry (Free tier)
- **Logs**: Docker logs + Structlog

---

## 6. MVP Feature Roadmap

### Phase 1: Launch (Week 1-2)
- [x] Core API (render, screenshot, PDF)
- [ ] Supabase authentication
- [ ] API key generation
- [ ] Basic usage tracking
- [ ] Stripe checkout integration
- [ ] Documentation site

### Phase 2: Growth (Month 1-3)
- [ ] Dashboard for customers
- [ ] Usage analytics
- [ ] Webhook notifications
- [ ] Proxy rotation
- [ ] Team accounts

### Phase 3: Scale (Month 3-6)
- [ ] Priority queue system
- [ ] Custom browser profiles
- [ ] API playground
- [ ] SDKs (Python, Node.js)
- [ ] Enterprise features

---

## 7. Customer Acquisition Strategy

### Initial Target Markets
1. **UK Developers** - Local advantage, GDPR
2. **Startup Founders** - Price-sensitive, growing
3. **Data Analysts** - Regular scraping needs
4. **E-commerce** - Price monitoring, competitor analysis

### Marketing Channels
| Channel | Cost | Expected CAC |
|---------|------|--------------|
| Product Hunt launch | Free | £0 |
| Twitter/X | Free | £0 |
| Dev communities (Reddit, HN) | Free | £0 |
| SEO (long-term) | Time | £0 |
| Google Ads | £100/mo | £15-20 |

### Pricing Psychology
- **Anchoring**: Show Scale plan first to make Growth look affordable
- **Decoy**: Starter exists to make Growth seem like better value
- **Free tier**: Low barrier to entry, easy upsell

---

## 8. Financial Projections (Year 1)

### Conservative Scenario
| Month | Customers | MRR | Costs | Profit |
|-------|-----------|-----|-------|--------|
| 1 | 10 | £100 | £15 | £85 |
| 3 | 30 | £300 | £20 | £280 |
| 6 | 75 | £750 | £30 | £720 |
| 12 | 200 | £2,000 | £50 | £1,950 |

### Optimistic Scenario
| Month | Customers | MRR | Costs | Profit |
|-------|-----------|-----|-------|--------|
| 1 | 25 | £300 | £15 | £285 |
| 3 | 100 | £1,200 | £25 | £1,175 |
| 6 | 300 | £3,600 | £50 | £3,550 |
| 12 | 800 | £9,600 | £100 | £9,500 |

### When to Upgrade Server
Current server can handle ~1.3M requests/month. Upgrade when:
- Reaching 80% capacity (~1M requests)
- MRR > £1,500
- Need more concurrent connections

**Next Server Option**: £25/mo (16GB RAM, 8 cores) → 2x capacity

---

## 9. Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Server downtime | Auto-restart, health monitoring |
| Memory exhaustion | Semaphore limits, cleanup on error |
| Bot detection | Anti-detection scripts, proxy support |
| Abuse | Rate limiting, SSRF protection |

### Business Risks
| Risk | Mitigation |
|------|------------|
| Low signups | Free tier, marketing push |
| High support load | Documentation, FAQ, chatbot |
| Payment issues | Stripe handles disputes |
| Competition | Focus on UK market, support quality |

---

## 10. Launch Checklist

### Pre-Launch (Before Going Live)
- [ ] Domain configured (turion.network)
- [ ] SSL certificate installed
- [ ] Supabase project created
- [ ] Stripe account verified
- [ ] API documentation complete
- [ ] Pricing page finalized
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Support email set up

### Launch Day
- [ ] Product Hunt submission
- [ ] Twitter announcement
- [ ] Reddit post (r/SaaS, r/webdev)
- [ ] Hacker News post
- [ ] Direct outreach to 50 developers

### Post-Launch
- [ ] Monitor error rates
- [ ] Respond to feedback
- [ ] Fix critical bugs
- [ ] Document feature requests
- [ ] Weekly metrics review

---

## 11. Success Metrics (KPIs)

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Signups | 50 | 500 |
| Paying Customers | 10 | 100 |
| MRR | £100 | £1,500 |
| Churn Rate | <10% | <5% |
| Response Time | <5s | <3s |
| Uptime | 99% | 99.9% |
| NPS Score | >30 | >50 |

---

## Conclusion

Turion is well-positioned to capture a segment of the UK/EU web scraping market with:
- Competitive pricing (£7-79 range)
- Transparent, simple offering
- Local presence (GDPR advantage)
- Low operating costs (£11/month)

**Next Steps**: Update landing page with finalized pricing and begin Supabase/Stripe integration.

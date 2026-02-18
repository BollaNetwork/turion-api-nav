'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DemoModal } from '@/components/demo/DemoModal'
import { 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  Check, 
  ArrowRight, 
  Play,
  Image as ImageIcon,
  FileText,
  Terminal,
  Sparkles,
  Rocket,
  Menu,
  X,
  Clock,
  Gauge,
  Lock
} from 'lucide-react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Turion</span>
            <Badge variant="outline" className="ml-2 text-xs hidden sm:inline-flex">
              Beta
            </Badge>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Get API Key
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="flex flex-col p-4 gap-4">
              <a href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#docs" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Docs</a>
              <a href="#faq" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="flex gap-2 pt-2 border-t">
                {user ? (
                  <Link href="/dashboard" className="flex-1">
                    <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">Get API Key</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMGE5OWEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 px-4 py-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="w-3 h-3 mr-1" />
                UK-Based • GDPR Compliant
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Web Scraping API
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Built for Developers
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                Render JavaScript pages, capture screenshots, generate PDFs. 
                Simple REST API, transparent pricing in £. No hidden fees.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href={user ? "/dashboard" : "/auth/signup"}>
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8">
                    {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => setDemoOpen(true)}>
                  <Play className="mr-2 w-5 h-5" />
                  View Demo
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  1,000 free requests
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Setup in 2 minutes
                </div>
              </div>
            </div>
            
            {/* Code Preview */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="rounded-xl border bg-zinc-950 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-zinc-400 ml-2">Quick Start</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-zinc-300">
{`# Get your free API key at turion.network
curl -X POST "https://api.turion.network/v1/browse" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "render"}'`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Uptime Target</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">&lt;3s</div>
                <div className="text-sm text-muted-foreground mt-1">Avg Response</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">£7</div>
                <div className="text-sm text-muted-foreground mt-1">Plans from</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600">UK</div>
                <div className="text-sm text-muted-foreground mt-1">Based & Supported</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">MVP Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Start
              </h2>
              <p className="text-muted-foreground">
                Core features to get you scraping. More features coming soon based on your feedback.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle>JavaScript Rendering</CardTitle>
                  <CardDescription>
                    Full headless Chrome rendering. Wait for dynamic content, get the final DOM.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Feature 2 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle>Screenshots</CardTitle>
                  <CardDescription>
                    Capture full-page or viewport screenshots in PNG format. Perfect for monitoring.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Feature 3 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <CardTitle>PDF Generation</CardTitle>
                  <CardDescription>
                    Convert any web page to PDF. Great for archiving and reporting.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Feature 4 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Gauge className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>Fast Response</CardTitle>
                  <CardDescription>
                    Average response under 3 seconds. Optimized infrastructure for speed.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Feature 5 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Anti-Detection</CardTitle>
                  <CardDescription>
                    Built-in stealth mode with realistic user agents and fingerprint masking.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {/* Feature 6 */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <CardTitle>GDPR Compliant</CardTitle>
                  <CardDescription>
                    UK-based servers. Your data stays in Europe. Full compliance with GDPR.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                <span className="font-medium">Coming Soon:</span> Proxy support, Custom JS execution, Webhooks, SDKs
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">Simple Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pay Only for What You Use
              </h2>
              <p className="text-muted-foreground">
                All prices in £ GBP. No hidden fees. Cancel anytime.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <CardDescription>Perfect for testing</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Monthly Limits</div>
                    <div className="text-2xl font-bold text-emerald-600">1,000</div>
                    <div className="text-xs text-muted-foreground">requests</div>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>5 requests/minute</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>15s timeout</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>HTML, Screenshot, PDF</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-4 h-4 shrink-0" />
                      <span>No custom JS</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-4 h-4 shrink-0" />
                      <span>No proxy support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full" variant="outline">Get Started Free</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Starter Plan */}
              <Card className="relative border-emerald-500 shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <CardDescription>For small projects</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£7</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Monthly Limits</div>
                    <div className="text-2xl font-bold text-emerald-600">10,000</div>
                    <div className="text-xs text-muted-foreground">requests included</div>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>10 requests/minute</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>30s timeout</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>HTML, Screenshot, PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Custom JS execution</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-4 h-4 shrink-0" />
                      <span>No proxy support</span>
                    </li>
                  </ul>
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Overage: <span className="font-medium">£0.80 per 1,000 requests</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                      Start with £7
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Growth Plan */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">Growth</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£25</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Monthly Limits</div>
                    <div className="text-2xl font-bold text-emerald-600">50,000</div>
                    <div className="text-xs text-muted-foreground">requests included</div>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>30 requests/minute</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>45s timeout</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>HTML, Screenshot, PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Custom JS execution</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Proxy support</span>
                    </li>
                  </ul>
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Overage: <span className="font-medium">£0.60 per 1,000 requests</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button className="w-full" variant="outline">Choose Growth</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Enterprise CTA */}
            <div className="mt-8 max-w-5xl mx-auto">
              <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-0">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Need More? Scale Plan</h3>
                    <p className="text-zinc-400 text-sm">200,000 requests/month, 60 req/min, priority support, 99.5% SLA</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">£79<span className="text-sm font-normal text-zinc-400">/month</span></div>
                    <Button variant="secondary" size="sm" className="mt-2">Contact Us</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-center text-muted-foreground mt-8 text-sm">
              All plans include 1,000 free requests for testing. Prices in £ GBP. VAT may apply.
            </p>
          </div>
        </section>

        {/* API Documentation Preview */}
        <section id="docs" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">API Docs</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple REST API
              </h2>
              <p className="text-muted-foreground">
                Get started in minutes with our straightforward REST API
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="render" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="render">Render HTML</TabsTrigger>
                  <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                </TabsList>
                
                <TabsContent value="render" className="space-y-4">
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <Terminal className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400">POST /v1/browse</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "url": "https://example.com",
  "action": "render",
  "wait_for": ".main-content"
}`}
                      </code>
                    </pre>
                  </div>
                  
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-400">Response (200 OK)</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "status": "success",
  "url": "https://example.com",
  "content": "<html>...</html>",
  "page_title": "Example Domain",
  "execution_time_ms": 1234.56
}`}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="screenshot" className="space-y-4">
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <Terminal className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400">POST /v1/browse</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "url": "https://example.com",
  "action": "screenshot",
  "full_page": true
}`}
                      </code>
                    </pre>
                  </div>
                  
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-400">Response (200 OK)</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "status": "success",
  "url": "https://example.com",
  "screenshot": "iVBORw0KGgoAAAANSUhEUg...",
  "execution_time_ms": 2156.78
}`}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="pdf" className="space-y-4">
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <Terminal className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400">POST /v1/browse</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "url": "https://example.com",
  "action": "pdf"
}`}
                      </code>
                    </pre>
                  </div>
                  
                  <div className="rounded-xl border bg-zinc-950 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-400">Response (200 OK)</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-zinc-300">
{`{
  "status": "success",
  "url": "https://example.com",
  "pdf": "JVBERi0xLjQKJeLjz9MK...",
  "execution_time_ms": 1823.45
}`}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Common Questions
              </h2>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>How does pricing work?</AccordionTrigger>
                  <AccordionContent>
                    Choose a monthly plan based on your expected usage. Each plan includes a set number of requests. If you exceed your limit, you pay a small overage fee per 1,000 extra requests. No hidden fees.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q2">
                  <AccordionTrigger>What happens if a request fails?</AccordionTrigger>
                  <AccordionContent>
                    Failed requests due to our infrastructure issues are not counted towards your usage. We only charge for successful requests. You can monitor your usage in real-time from your dashboard.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q3">
                  <AccordionTrigger>Is there a free trial?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Every account starts with 1,000 free requests. No credit card required. This lets you test the API thoroughly before committing to a paid plan.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q4">
                  <AccordionTrigger>What can I scrape?</AccordionTrigger>
                  <AccordionContent>
                    You can scrape any publicly accessible website. However, you must comply with the website&apos;s terms of service and robots.txt. We provide tools to help you scrape responsibly and ethically.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q5">
                  <AccordionTrigger>How fast is the API?</AccordionTrigger>
                  <AccordionContent>
                    Average response time is under 3 seconds for most pages. JavaScript-heavy pages may take longer. You can set custom timeout limits based on your plan (15s to 60s).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q6">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes. We&apos;re UK-based and fully GDPR compliant. Your data never leaves Europe. We use industry-standard encryption and never store your scraped content after delivering it to you.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="q7">
                  <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. No long-term contracts. You can cancel your subscription at any time from your dashboard. You&apos;ll continue to have access until the end of your billing period.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Get your API key instantly. Start with 1,000 free requests. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? "/dashboard" : "/auth/signup"}>
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {user ? 'Go to Dashboard' : 'Get Free API Key'}
                  <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Turion</span>
              </div>
              <p className="text-sm text-muted-foreground">
                UK-based web scraping API. GDPR compliant.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#docs" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Turion Network. All rights reserved. Registered in UK.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                UK Based
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                GDPR
              </Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  )
}

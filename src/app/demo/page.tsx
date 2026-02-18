import InteractiveDemo from '@/components/InteractiveDemo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, ArrowLeft } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Turion</span>
            </div>
          </div>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            See Turion in Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to get started with Turion API. 
            From signup to your first successful request in under 2 minutes.
          </p>
        </div>

        <InteractiveDemo />

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to try it yourself?</h2>
          <p className="text-muted-foreground mb-6">
            Start with 1,000 free requests. No credit card required.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8">
              Create Free Account
              <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

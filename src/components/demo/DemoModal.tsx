'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Terminal, Globe, Copy, Check } from 'lucide-react'

interface DemoStep {
  id: number
  title: string
  description: string
  cursorPosition: { x: number; y: number }
  clickTarget?: string
  code?: string
  response?: string
  highlight?: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Get Your API Key',
    description: 'Sign up and get your free API key instantly',
    cursorPosition: { x: 50, y: 50 },
    clickTarget: 'signup-btn',
    highlight: 'signup-btn',
  },
  {
    id: 2,
    title: 'Copy Your Key',
    description: 'Your API key is ready to use immediately',
    cursorPosition: { x: 60, y: 45 },
    clickTarget: 'copy-key-btn',
    highlight: 'api-key-display',
    code: 'tr_demo_xxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    id: 3,
    title: 'Make Your First Request',
    description: 'Use curl or any HTTP client to call the API',
    cursorPosition: { x: 30, y: 55 },
    highlight: 'terminal',
    code: `curl -X POST "https://api.turion.network/v1/browse" \\
  -H "Authorization: Bearer tr_demo_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "render"}'`,
  },
  {
    id: 4,
    title: 'API Processes Request',
    description: 'Turion renders the page with real Chrome browser',
    cursorPosition: { x: 50, y: 40 },
    highlight: 'browser-preview',
  },
  {
    id: 5,
    title: 'Get Results Instantly',
    description: 'Receive HTML, screenshots, or PDFs in seconds',
    cursorPosition: { x: 50, y: 50 },
    highlight: 'response-display',
    response: `{
  "status": "success",
  "url": "https://example.com",
  "content": "<html>...</html>",
  "page_title": "Example Domain",
  "execution_time_ms": 1234.56
}`,
  },
  {
    id: 6,
    title: 'Monitor Your Usage',
    description: 'Track requests and manage your subscription',
    cursorPosition: { x: 75, y: 75 },
    clickTarget: 'dashboard-btn',
    highlight: 'dashboard-link',
  },
]

export function DemoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showClick, setShowClick] = useState(false)
  const [copied, setCopied] = useState(false)
  const [typedCode, setTypedCode] = useState('')
  const [typedResponse, setTypedResponse] = useState('')

  const step = DEMO_STEPS[currentStep]

  // Auto-advance steps
  useEffect(() => {
    if (!isPlaying || !open) return

    const timer = setTimeout(() => {
      if (currentStep < DEMO_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, 4500)

    return () => clearTimeout(timer)
  }, [currentStep, isPlaying, open])

  // Reset when opening
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setIsPlaying(true)
    }
  }, [open])

  // Click animation
  useEffect(() => {
    if (step?.clickTarget && open) {
      const timer = setTimeout(() => {
        setShowClick(true)
        setTimeout(() => setShowClick(false), 300)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [step, open])

  // Typing animation for code
  useEffect(() => {
    if (step?.code && open) {
      setTypedCode('')
      let index = 0
      const interval = setInterval(() => {
        if (index < step.code!.length) {
          setTypedCode(step.code!.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 15)
      return () => clearInterval(interval)
    }
  }, [step?.code, open])

  // Typing animation for response
  useEffect(() => {
    if (step?.response && open) {
      setTypedResponse('')
      let index = 0
      const interval = setInterval(() => {
        if (index < step.response!.length) {
          setTypedResponse(step.response!.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 10)
      return () => clearInterval(interval)
    }
  }, [step?.response, open])

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(DEMO_STEPS.length - 1, prev + 1))
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const copyCode = () => {
    if (step?.code) {
      navigator.clipboard.writeText(step.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">How Turion Works</DialogTitle>
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {DEMO_STEPS.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRestart}
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
            />
          </div>
        </DialogHeader>

        {/* Demo Area */}
        <div className="relative bg-zinc-950 h-[350px] md:h-[420px] overflow-hidden">
          {/* Simulated Browser/Interface */}
          <div className="absolute inset-0 p-3 md:p-4">
            {/* Browser Chrome */}
            <div className="bg-zinc-900 rounded-t-lg border border-zinc-800 border-b-0">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-zinc-800 rounded px-4 py-1 text-xs text-zinc-400 flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span className="hidden sm:inline">turion.network</span>
                    <span className="sm:hidden">turion.network/dashboard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-lg h-[calc(100%-40px)] overflow-hidden">
              <div className="flex h-full">
                {/* Sidebar - Desktop only */}
                <div className="w-44 border-r border-zinc-800 p-3 hidden md:block">
                  <div className="text-xs font-medium text-zinc-500 mb-3">MENU</div>
                  {['Dashboard', 'API Keys', 'Usage', 'Billing'].map((item, i) => (
                    <div
                      key={item}
                      className={`px-2 py-1.5 rounded text-sm mb-1 transition-colors ${
                        (currentStep === 1 && i === 1) || (currentStep === 5 && i === 3)
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'text-zinc-500'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-3 md:p-4 overflow-auto">
                  {/* Step 1: Signup */}
                  {currentStep === 0 && (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                      <Badge variant="outline" className="mb-4 border-emerald-500/50 text-emerald-400">
                        Free Trial - No Credit Card
                      </Badge>
                      <div className="text-xl md:text-2xl font-bold text-white mb-2">Welcome to Turion</div>
                      <p className="text-zinc-400 text-sm mb-6">Get 1,000 free requests instantly</p>
                      <div
                        id="signup-btn"
                        className={`px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium cursor-pointer transition-all ${
                          step.highlight === 'signup-btn' ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900 scale-105' : ''
                        }`}
                      >
                        Get API Key Free
                      </div>
                    </div>
                  )}

                  {/* Step 2: Copy Key */}
                  {currentStep === 1 && (
                    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <span className="text-lg font-medium text-white">API Key Created!</span>
                      </div>
                      <div
                        id="api-key-display"
                        className={`flex items-center gap-2 bg-zinc-800 border rounded-lg p-3 mb-4 transition-all ${
                          step.highlight === 'api-key-display' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-zinc-700'
                        }`}
                      >
                        <code className="text-emerald-400 font-mono text-sm">{step.code}</code>
                        <button
                          id="copy-key-btn"
                          onClick={copyCode}
                          className={`p-1.5 rounded hover:bg-zinc-700 transition-all ${
                            step.highlight === 'api-key-display' ? 'bg-zinc-700' : ''
                          }`}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 animate-pulse">
                        <Check className="w-3 h-3 mr-1" /> Ready to use
                      </Badge>
                    </div>
                  )}

                  {/* Step 3: Terminal */}
                  {currentStep === 2 && (
                    <div className="h-full flex flex-col animate-fade-in">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                        <Terminal className="w-4 h-4" />
                        Terminal
                      </div>
                      <div
                        id="terminal"
                        className={`flex-1 bg-zinc-950 rounded-lg border p-3 font-mono text-xs md:text-sm overflow-auto transition-all ${
                          step.highlight === 'terminal' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-zinc-800'
                        }`}
                      >
                        <div className="text-zinc-500 mb-1">$</div>
                        <pre className="text-emerald-400 whitespace-pre-wrap">{typedCode}<span className="animate-blink">▋</span></pre>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Browser Preview */}
                  {currentStep === 3 && (
                    <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                      <div 
                        id="browser-preview" 
                        className={`w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden transition-all ${
                          step.highlight === 'browser-preview' ? 'ring-2 ring-emerald-400 scale-105' : ''
                        }`}
                      >
                        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                          </div>
                          <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-gray-500 text-center">
                            example.com
                          </div>
                        </div>
                        <div className="p-4">
                          <h1 className="text-lg font-bold text-gray-900 mb-2">Example Domain</h1>
                          <p className="text-gray-600 text-sm">
                            This domain is for use in illustrative examples...
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <span className="text-zinc-400 text-sm">Rendering with Chrome...</span>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Response */}
                  {currentStep === 4 && (
                    <div className="h-full flex flex-col animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                          <span className="text-zinc-400">Response (200 OK)</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                          1.23s
                        </Badge>
                      </div>
                      <div
                        id="response-display"
                        className={`flex-1 bg-zinc-950 rounded-lg border p-3 font-mono text-xs md:text-sm overflow-auto transition-all ${
                          step.highlight === 'response-display' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-zinc-800'
                        }`}
                      >
                        <pre className="text-zinc-300 whitespace-pre-wrap">{typedResponse}{typedResponse.length > 0 && <span className="animate-blink">▋</span>}</pre>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Dashboard */}
                  {currentStep === 5 && (
                    <div className="h-full animate-fade-in">
                      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
                        {[
                          { label: 'Requests', value: '847', limit: 'of 1,000' },
                          { label: 'Success', value: '99.2%', limit: '' },
                          { label: 'Plan', value: 'Free', limit: '' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-zinc-800 rounded-lg p-2 md:p-3">
                            <div className="text-xs text-zinc-500">{stat.label}</div>
                            <div className="text-lg md:text-xl font-bold text-white">{stat.value}</div>
                            {stat.limit && <div className="text-xs text-zinc-500">{stat.limit}</div>}
                          </div>
                        ))}
                      </div>
                      <div 
                        id="dashboard-link"
                        className={`bg-zinc-800 rounded-lg p-3 md:p-4 transition-all ${
                          step.highlight === 'dashboard-link' ? 'ring-2 ring-emerald-500/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">Upgrade to Starter</div>
                            <div className="text-xs text-zinc-400">10,000 requests for £7/mo</div>
                          </div>
                          <div
                            id="dashboard-btn"
                            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium cursor-pointer transition-all ${
                              step.highlight === 'dashboard-link' ? 'ring-2 ring-emerald-400 scale-105' : ''
                            }`}
                          >
                            Upgrade
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                          <Check className="w-3 h-3 mr-1" /> Demo Complete!
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Animated Cursor */}
          <div
            className="absolute pointer-events-none z-50 transition-all duration-700 ease-out"
            style={{
              left: `${step.cursorPosition.x}%`,
              top: `${step.cursorPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              className={`drop-shadow-lg transition-transform ${showClick ? 'scale-75' : 'scale-100'}`}
            >
              <path
                d="M4 4L12 20L14 14L20 12L4 4Z"
                fill="white"
                stroke="black"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Click ripple effect */}
            {showClick && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{step.title}</div>
              <div className="text-sm text-muted-foreground truncate">{step.description}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === DEMO_STEPS.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {DEMO_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-emerald-500 w-6'
                    : i < currentStep
                    ? 'bg-emerald-500/50 w-2'
                    : 'bg-muted w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

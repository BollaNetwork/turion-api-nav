'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw,
  Terminal,
  Check,
  ArrowRight,
  Zap,
  Copy,
  MousePointer2
} from 'lucide-react'

interface DemoStep {
  id: number
  title: string
  action: string
  code?: string
  response?: string
  targetSelector?: string
  cursorPosition?: { x: number; y: number }
  typeDelay?: number
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: 'Get Your API Key',
    action: 'click',
    targetSelector: 'signup-btn',
    cursorPosition: { x: 85, y: 45 },
  },
  {
    id: 2,
    title: 'Create Account',
    action: 'type',
    code: 'john@example.com',
    cursorPosition: { x: 50, y: 50 },
    typeDelay: 50,
  },
  {
    id: 3,
    title: 'Generate API Key',
    action: 'click',
    targetSelector: 'create-key-btn',
    cursorPosition: { x: 50, y: 70 },
  },
  {
    id: 4,
    title: 'Copy Your Key',
    action: 'click',
    targetSelector: 'copy-key-btn',
    cursorPosition: { x: 70, y: 55 },
    code: 'tr_7f8a9b2c3d4e5f6g7h8i9j0k...',
  },
  {
    id: 5,
    title: 'Make First Request',
    action: 'type',
    code: `curl -X POST "https://api.turion.network/v1/browse" \\
  -H "Authorization: Bearer tr_7f8a9b..." \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "render"}'`,
    cursorPosition: { x: 10, y: 85 },
    typeDelay: 20,
  },
  {
    id: 6,
    title: 'Get Response',
    action: 'response',
    response: `{
  "status": "success",
  "url": "https://example.com",
  "content": "<html>...</html>",
  "page_title": "Example Domain",
  "execution_time_ms": 1234.56
}`,
    cursorPosition: { x: 50, y: 50 },
  },
]

export default function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 })
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Typing effect
  const typeText = useCallback((text: string, delay: number = 30) => {
    return new Promise<void>((resolve) => {
      let index = 0
      setTypedText('')
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, delay)
    })
  }, [])

  // Move cursor with animation
  const moveCursor = useCallback((targetX: number, targetY: number) => {
    return new Promise<void>((resolve) => {
      const startX = cursorPos.x
      const startY = cursorPos.y
      const duration = 800
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const currentX = startX + (targetX - startX) * eased
        const currentY = startY + (targetY - startY) * eased
        
        setCursorPos({ x: currentX, y: currentY })

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }, [cursorPos])

  // Run demo
  const runDemo = useCallback(async () => {
    for (let i = currentStep; i < demoSteps.length; i++) {
      if (!isPlaying && i > currentStep) break
      
      const step = demoSteps[i]
      setCurrentStep(i)

      // Move cursor to position
      if (step.cursorPosition) {
        await moveCursor(step.cursorPosition.x, step.cursorPosition.y)
      }

      // Wait before action
      await new Promise(r => setTimeout(r, 300))

      // Perform action
      if (step.action === 'click' && step.targetSelector) {
        setClickedButton(step.targetSelector)
        await new Promise(r => setTimeout(r, 200))
        setClickedButton(null)
      } else if (step.action === 'type' && step.code) {
        await typeText(step.code, step.typeDelay || 30)
      } else if (step.action === 'response') {
        setShowResponse(true)
      }

      // Mark step as completed
      setCompletedSteps(prev => [...prev, step.id])
      
      // Wait before next step
      await new Promise(r => setTimeout(r, 800))
    }

    setIsPlaying(false)
  }, [currentStep, isPlaying, moveCursor, typeText])

  // Control playback
  useEffect(() => {
    if (isPlaying) {
      runDemo()
    }
  }, [isPlaying, runDemo])

  // Reset demo
  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setTypedText('')
    setCursorPos({ x: 50, y: 50 })
    setClickedButton(null)
    setShowResponse(false)
    setCompletedSteps([])
  }

  // Start/pause demo
  const togglePlay = () => {
    if (currentStep >= demoSteps.length - 1 && !isPlaying) {
      resetDemo()
      setTimeout(() => setIsPlaying(true), 100)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Interactive Demo</h3>
          <Badge variant="outline" className="text-xs">
            {currentStep + 1} / {demoSteps.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemo}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={togglePlay}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play Demo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Demo Container */}
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700 bg-zinc-900/80">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-zinc-800 rounded-md px-3 py-1 text-xs text-zinc-400 text-center">
              turion.network/dashboard
            </div>
          </div>
        </div>

        {/* Demo content */}
        <div className="relative min-h-[500px] p-6">
          {/* Animated cursor */}
          <div
            className="absolute pointer-events-none z-50 transition-none"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <MousePointer2 
              className="w-6 h-6 text-emerald-400 drop-shadow-lg" 
              style={{
                filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))',
              }}
            />
            {showCursor && (
              <div className="absolute top-5 left-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>

          {/* Step indicator */}
          <div className="absolute top-4 left-4 z-40">
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-1.5">
              <span className="text-emerald-400 text-sm font-medium">
                {demoSteps[currentStep]?.title || 'Ready'}
              </span>
            </div>
          </div>

          {/* Demo UI */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {/* Left: Dashboard mockup */}
            <div className="space-y-4">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div 
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      clickedButton === 'copy-key-btn' 
                        ? 'bg-emerald-500/20 border-emerald-500' 
                        : 'bg-zinc-900/50 border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-zinc-300 font-mono">
                        tr_7f8a9b2c3d4e5f6g...
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`h-6 px-2 ${
                          clickedButton === 'copy-key-btn' ? 'text-emerald-400' : 'text-zinc-400'
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`w-full transition-all duration-200 ${
                      clickedButton === 'create-key-btn'
                        ? 'bg-emerald-500 scale-95'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create New Key
                  </Button>
                </CardContent>
              </Card>

              {/* Stats mockup */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">This Month</div>
                  <div className="text-2xl font-bold text-zinc-100">247</div>
                  <div className="text-xs text-zinc-500">requests</div>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Success Rate</div>
                  <div className="text-2xl font-bold text-emerald-400">99.2%</div>
                  <div className="text-xs text-zinc-500">uptime</div>
                </div>
              </div>
            </div>

            {/* Right: Terminal */}
            <div className="flex flex-col h-full">
              <div className="bg-zinc-950 rounded-xl border border-zinc-700 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Terminal</span>
                </div>
                <div className="p-4 font-mono text-sm">
                  {/* Show typed code */}
                  <div className="text-zinc-300 whitespace-pre-wrap">
                    {typedText || (
                      <span className="text-zinc-600">
                        # Click "Play Demo" to see how it works
                      </span>
                    )}
                    {isPlaying && <span className={`inline-block w-2 h-4 bg-emerald-400 ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />}
                  </div>
                  
                  {/* Show response */}
                  {showResponse && (
                    <div className="mt-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400">200 OK</span>
                      </div>
                      <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
{`{
  "status": "success",
  "url": "https://example.com",
  "content": "<html>...</html>",
  "page_title": "Example Domain",
  "execution_time_ms": 1234.56
}`}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 text-zinc-300 border-zinc-700 transition-all duration-200 ${
                    clickedButton === 'signup-btn' ? 'bg-emerald-500/20 border-emerald-500' : ''
                  }`}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Test Render
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 text-zinc-300 border-zinc-700 transition-all duration-200 ${
                    clickedButton === 'signup-btn' ? 'bg-emerald-500/20 border-emerald-500' : ''
                  }`}
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  Screenshot
                </Button>
              </div>
            </div>
          </div>

          {/* Progress steps */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
            {demoSteps.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  completedSteps.includes(step.id)
                    ? 'bg-emerald-500 w-8'
                    : currentStep + 1 === step.id
                    ? 'bg-emerald-500/50 w-6 animate-pulse'
                    : 'bg-zinc-700 w-4'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features highlights */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-medium text-sm">Fast Setup</div>
          <div className="text-xs text-muted-foreground mt-1">Get started in 2 minutes</div>
        </div>
        <div className="p-4">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mx-auto mb-3">
            <Terminal className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="font-medium text-sm">Simple API</div>
          <div className="text-xs text-muted-foreground mt-1">RESTful & intuitive</div>
        </div>
        <div className="p-4">
          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="font-medium text-sm">Reliable</div>
          <div className="text-xs text-muted-foreground mt-1">99.9% uptime SLA</div>
        </div>
      </div>
    </div>
  )
}

// Plus icon component
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

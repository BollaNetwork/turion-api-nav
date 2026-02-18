'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Key, 
  Activity, 
  CreditCard,
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { PLANS, PlanId } from '@/lib/types'

interface ApiKeyData {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

interface UsageData {
  request_count: number
  success_count: number
  failed_count: number
}

export default function DashboardPage() {
  const { user, profile, subscription, loading: authLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [usage, setUsage] = useState<UsageData>({ request_count: 0, success_count: 0, failed_count: 0 })
  const [loading, setLoading] = useState(true)
  const [creatingKey, setCreatingKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('Default Key')
  const [showNewKey, setShowNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchApiKeys()
      fetchUsage()
    }
  }, [user])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.keys || [])
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage || { request_count: 0, success_count: 0, failed_count: 0 })
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  const createApiKey = async () => {
    setCreatingKey(true)
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setShowNewKey(data.key)
        setNewKeyName('Default Key')
        fetchApiKeys()
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    } finally {
      setCreatingKey(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/keys?keyId=${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchApiKeys()
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckout = async (planId: PlanId) => {
    if (planId === 'free') return
    
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const manageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentPlan = subscription?.plan_id || 'free'
  const planConfig = PLANS[currentPlan as PlanId]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Turion</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{planConfig.name} Plan</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || user.email}</h1>
          <p className="text-muted-foreground">Manage your API keys and subscription</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Requests This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usage.request_count.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">
                of {planConfig.requestsIncluded.toLocaleString()} included
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Success Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {usage.request_count > 0 
                  ? Math.round((usage.success_count / usage.request_count) * 100) 
                  : 100}%
              </div>
              <p className="text-sm text-muted-foreground">
                {usage.success_count} successful requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{planConfig.name}</div>
              <p className="text-sm text-muted-foreground">
                {planConfig.requestsPerMinute} requests/minute
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keys"><Key className="w-4 h-4 mr-2" />API Keys</TabsTrigger>
            <TabsTrigger value="usage"><Activity className="w-4 h-4 mr-2" />Usage</TabsTrigger>
            <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Billing</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            {showNewKey && (
              <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                <Check className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  <div className="font-medium mb-2">API Key Created!</div>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm font-mono flex-1 overflow-x-auto">
                      {showNewKey}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(showNewKey)}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ⚠️ Copy this key now. You won&apos;t be able to see it again.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for authenticating requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{key.name}</div>
                          <code className="text-sm text-muted-foreground font-mono">
                            tr_{key.key_prefix}••••••••••••••••
                          </code>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created {new Date(key.created_at).toLocaleDateString()}
                            {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button 
                      onClick={createApiKey} 
                      disabled={creatingKey || apiKeys.length >= 5}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      {creatingKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Create Key
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum 5 API keys per account
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Test your API key with this curl command</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-zinc-300">
{`curl -X POST "https://api.turion.network/v1/browse" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "action": "render"}'`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
                <CardDescription>
                  Your API usage for the current billing period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Requests</span>
                      <span className="text-sm text-muted-foreground">
                        {usage.request_count.toLocaleString()} / {planConfig.requestsIncluded.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                        style={{
                          width: `${Math.min((usage.request_count / planConfig.requestsIncluded) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{usage.success_count}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{usage.failed_count}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {usage.request_count > planConfig.requestsIncluded * 0.8 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You&apos;ve used {Math.round((usage.request_count / planConfig.requestsIncluded) * 100)}% of your monthly limit.
                        Consider upgrading to avoid overage charges.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{planConfig.name}</div>
                      <div className="text-muted-foreground">
                        {planConfig.price > 0 ? `£${planConfig.price}/month` : 'Free'}
                      </div>
                    </div>
                    {subscription?.stripe_subscription_id && (
                      <Button variant="outline" onClick={manageSubscription}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Plans */}
              {currentPlan === 'free' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade Your Plan</CardTitle>
                    <CardDescription>Get more requests and features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {(['starter', 'growth', 'scale'] as PlanId[]).map((planId) => {
                        const plan = PLANS[planId]
                        return (
                          <div key={planId} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">{plan.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {plan.requestsIncluded.toLocaleString()} requests/month • {plan.requestsPerMinute} req/min
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold">£{plan.price}/mo</div>
                              </div>
                              <Button
                                onClick={() => handleCheckout(planId)}
                                disabled={checkoutLoading}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600"
                              >
                                {checkoutLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Upgrade'
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

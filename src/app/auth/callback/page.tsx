'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
        } else {
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Callback error:', err)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </CardContent>
      </Card>
    </div>
  )
}

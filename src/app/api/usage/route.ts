import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month in YYYY-MM format
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Get monthly usage
    const { data: monthlyUsage, error } = await supabase
      .from('monthly_usage')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('year_month', yearMonth)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error)
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
    }

    const usage = monthlyUsage || {
      request_count: 0,
      success_count: 0,
      failed_count: 0,
      total_execution_time_ms: 0,
    }

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

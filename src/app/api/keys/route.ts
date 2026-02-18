import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-server'
import crypto from 'crypto'

// GET - List API keys
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, is_active, created_at, last_used_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('API keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name || 'Default Key'

    // Check if user already has max keys
    const { count, error: countError } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (countError) {
      console.error('Error counting API keys:', countError)
      return NextResponse.json({ error: 'Failed to check existing keys' }, { status: 500 })
    }

    if (count && count >= 5) {
      return NextResponse.json({ error: 'Maximum 5 API keys allowed' }, { status: 400 })
    }

    // Generate API key
    const rawKey = `tr_${crypto.randomBytes(24).toString('hex')}`
    const keyPrefix = rawKey.substring(0, 11) // tr_xxxxxxxx
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

    // Store hashed key
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: session.user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: name,
        is_active: true,
      })

    if (insertError) {
      console.error('Error creating API key:', insertError)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    // Return the raw key (only time it's shown)
    return NextResponse.json({ key: rawKey })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting API key:', error)
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

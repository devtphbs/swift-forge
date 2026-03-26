import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, tier, action } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 401 }
      )
    }

    let result

    switch (action) {
      case 'create':
      case 'update':
        const subscriptionData = {
          user_id: userId,
          tier: tier || 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }

        result = await supabase
          .from('subscriptions')
          .upsert(subscriptionData)
          .select()
          .single()

        if (result.error) throw result.error

        // In a real implementation, this would integrate with RevenueCat
        // For demo purposes, we'll just update the database
        break

      case 'cancel':
        result = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', userId)
          .eq('status', 'active')

        if (result.error) throw result.error
        break

      case 'reactivate':
        result = await supabase
          .from('subscriptions')
          .update({ 
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', userId)
          .eq('status', 'cancelled')

        if (result.error) throw result.error
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result.data || { message: 'Action completed successfully' }
    })

  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      subscription: data
    })

  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

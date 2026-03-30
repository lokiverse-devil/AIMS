import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    // We instantiate a fresh client to authenticate the incoming credentials
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Authentication failed', status: 401 }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Access denied. Administrator privileges required.', status: 403 }, { status: 403 })
    }

    return NextResponse.json({
      message: 'Admin authenticated successfully',
      user: profile,
      session: authData.session
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error', status: 500 }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export function getAdminClient(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  )

  return supabase
}

export async function withAdminAuth(
  request: Request,
  handler: (req: Request, supabase: any, user: any) => Promise<NextResponse>
) {
  try {
    const supabase = getAdminClient(request)
    const authHeader = request.headers.get('Authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : null

    if (!supabase || !token) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token', status: 401 }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token', status: 401 }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required', status: 403 }, { status: 403 })
    }

    return await handler(request, supabase, user)
  } catch (error: any) {
    console.error('[ADMIN API ERROR]', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error', status: 500 }, { status: 500 })
  }
}

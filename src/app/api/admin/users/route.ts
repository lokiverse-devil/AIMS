import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin/middleware'
import { getAllUsers } from '@/lib/admin/services/user-service'

export async function GET(req: Request) {
  return withAdminAuth(req, async (request, supabase) => {
    const url = new URL(request.url)
    const users = await getAllUsers(supabase, url.searchParams)
    return NextResponse.json({ data: users })
  })
}

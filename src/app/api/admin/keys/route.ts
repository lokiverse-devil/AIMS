import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin/middleware'
import { getAllKeys, createKey } from '@/lib/admin/services/key-service'

export async function GET(req: Request) {
  return withAdminAuth(req, async (request, supabase) => {
    const keys = await getAllKeys(supabase)
    return NextResponse.json({ data: keys })
  })
}

export async function POST(req: Request) {
  return withAdminAuth(req, async (request, supabase, adminUser) => {
    const body = await request.json().catch(() => ({}))
    const key = await createKey(supabase, adminUser.id, body.key)
    console.log(`[ADMIN AUDIT] Admin ${adminUser.id} created new teacher key ${key.key}`)
    return NextResponse.json({ data: key })
  })
}

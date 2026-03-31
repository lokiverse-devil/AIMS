import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin/middleware'
import { updateUser } from '@/lib/admin/services/user-service'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(req, async (request, supabase, adminUser) => {
    const updates = await request.json()
    const { id } = await params
    const data = await updateUser(supabase, id, updates)
    console.log(`[ADMIN AUDIT] Admin ${adminUser.id} updated user ${id}`)
    return NextResponse.json({ data })
  })
}

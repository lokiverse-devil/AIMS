import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin/middleware'
import { updateKeyStatus, deleteKey } from '@/lib/admin/services/key-service'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(req, async (request, supabase, adminUser) => {
    const updates = await request.json()
    const { id } = await params
    const data = await updateKeyStatus(supabase, id, updates)
    console.log(`[ADMIN AUDIT] Admin ${adminUser.id} updated key status ${id}`)
    return NextResponse.json({ data })
  })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdminAuth(req, async (request, supabase, adminUser) => {
    const { id } = await params
    const data = await deleteKey(supabase, id)
    console.log(`[ADMIN AUDIT] Admin ${adminUser.id} deleted key ${id}`)
    return NextResponse.json(data)
  })
}

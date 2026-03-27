import { NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin/middleware'
import { updateRecord } from '@/lib/admin/services/db-service'

export async function PUT(req: Request) {
  return withAdminAuth(req, async (request, supabase, adminUser) => {
    const body = await request.json().catch(() => null)
    if (!body || !body.table || !body.id || !body.updates) {
      return NextResponse.json({ error: 'Missing required parameters (table, id, updates)', status: 400 }, { status: 400 })
    }

    const { table, id, updates } = body
    const data = await updateRecord(supabase, table, id, updates)
    
    console.log(`[ADMIN AUDIT] Admin ${adminUser.id} generically updated table ${table} ID ${id}`)
    return NextResponse.json({ data })
  })
}

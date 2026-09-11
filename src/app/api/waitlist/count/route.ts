import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase/admin'

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection('waitlist').count().get()
    const count = snapshot.data().count

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Waitlist count API error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

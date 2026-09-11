import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'

function isAlreadyExists(error: unknown): boolean {
  const err = error as { code?: number | string; message?: string }
  return (
    err?.code === 6 ||
    err?.code === 'already-exists' ||
    (typeof err?.message === 'string' &&
      err.message.toLowerCase().includes('already exists'))
  )
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const waitlistRef = getAdminDb().collection('waitlist').doc(normalizedEmail)

    // Single write via create() — no prior get(). Duplicate = ALREADY_EXISTS.
    try {
      await waitlistRef.create({
        email: normalizedEmail,
        createdAt: FieldValue.serverTimestamp(),
      })
    } catch (error) {
      if (isAlreadyExists(error)) {
        return NextResponse.json({ error: 'duplicate' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json(
      { success: true, message: 'Email added to waitlist' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

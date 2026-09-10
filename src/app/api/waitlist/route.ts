import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

console.log('Service account present:', !!process.env.FIREBASE_SERVICE_ACCOUNT)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'invalid_email' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for duplicate using the email itself as the document ID.
    // This makes duplicate-checking a simple, fast lookup instead of
    // a query, and it naturally prevents the same email being added twice.
    const waitlistRef = adminDb.collection('waitlist').doc(normalizedEmail)
    const existingDoc = await waitlistRef.get()

    if (existingDoc.exists) {
      return NextResponse.json(
        { error: 'duplicate' },
        { status: 409 }
      )
    }

    // Save the email to Firestore using the Admin SDK.
    // This bypasses Firestore security rules, which is correct here —
    // the rules deny ALL client access to "waitlist", so this server
    // route (using the Admin SDK) is the only way data gets in.
    await waitlistRef.set({
      email: normalizedEmail,
      createdAt: new Date(),
    })

    return NextResponse.json(
      { success: true, message: 'Email added to waitlist' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}

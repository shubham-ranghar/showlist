'use client'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function SignOutButton() {
  async function handleSignOut() {
    await signOut(auth)
    window.location.href = '/'
  }

  return (
    <button type="button" onClick={handleSignOut} className="btn-secondary">
      Sign out
    </button>
  )
}

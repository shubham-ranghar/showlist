'use client'

import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-[#d1d5db] transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/20"
    >
      Sign out
    </button>
  )
}

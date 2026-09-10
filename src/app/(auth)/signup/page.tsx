'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function SignUpPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await createUserWithEmailAndPassword(auth, email, password)

      router.push('/board')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code

      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        {/* App Name */}
        <div className="text-center mb-8">
          <h1 className="text-white font-bold text-2xl">Shortlist</h1>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-[#1e1e1e] p-8 border border-white/10">
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            Create an account
          </h2>

          <p className="text-center text-[#d1d5db] mb-8">
            Start your journey with us today.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <p className="rounded-md bg-red-900/30 p-3 text-sm text-red-400 border border-red-900/50">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#d1d5db]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full rounded-md border border-white/10 bg-[#121212] px-4 py-3 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#d1d5db]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={isLoading}
                minLength={6}
                className="w-full rounded-md border border-white/10 bg-[#121212] px-4 py-3 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#d1d5db]"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
                className="w-full rounded-md border border-white/10 bg-[#121212] px-4 py-3 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 px-4 py-3 font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#d1d5db]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#9333ea] hover:text-[#7e22ce] transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
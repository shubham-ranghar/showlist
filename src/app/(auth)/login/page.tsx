'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)

      router.push('/board')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Incorrect email or password.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
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
            Log in to your account
          </h2>

          <p className="text-center text-[#d1d5db] mb-8">
            Welcome back! Please enter your details.
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
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full rounded-md border border-white/10 bg-[#121212] px-4 py-3 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 px-4 py-3 font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#d1d5db]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-[#9333ea] hover:text-[#7e22ce] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
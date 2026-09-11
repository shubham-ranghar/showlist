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
      router.replace('/board')
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
      setIsLoading(false)
    }
  }

  return (
    <main className="page-shell flex items-center justify-center px-4 py-16 sm:py-20">
      <div className="relative isolate flex w-full max-w-md flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.18)_0%,_transparent_55%),linear-gradient(180deg,#121212_0%,#16121c_100%)] rounded-2xl"
        />
        <div className="mb-10 text-center">
          <Link href="/" className="brand-mark">
            Shortlist
          </Link>
        </div>

        <div className="card-surface">
          <h1 className="section-title text-center">Create an account</h1>
          <p className="section-sub text-center">
            Start collecting and prioritizing ideas.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="alert-error" role="alert">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                disabled={isLoading}
                minLength={6}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                disabled={isLoading}
                minLength={6}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="link-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

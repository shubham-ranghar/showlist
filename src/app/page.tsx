'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function scrollToWaitlist(e: React.MouseEvent) {
    e.preventDefault()
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'duplicate') {
          setStatus('error')
          setErrorMessage('This email is already on the waitlist')
        } else {
          setStatus('error')
          setErrorMessage('Something went wrong. Please try again.')
        }
      } else {
        setStatus('success')
        setEmail('')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-6 md:py-8">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <div className="text-white font-bold text-xl">Shortlist</div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[#d1d5db] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Something <span className="text-[#9333ea]">Amazing</span>
          </h1>
          <p className="text-lg md:text-xl text-[#d1d5db] max-w-2xl mx-auto mb-8">
            A powerful tool that helps you organize, prioritize, and execute your ideas faster than ever before. Join the waitlist to be first in line.
          </p>
          <a
            href="#waitlist"
            onClick={scrollToWaitlist}
            className="inline-block bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 text-white font-medium px-8 py-4 rounded-lg transition-all duration-200 text-lg"
          >
            Get Early Access
          </a>
        </div>

        {/* Waitlist Form Section */}
        <div id="waitlist" className="max-w-md mx-auto">
          <div className="bg-[#1e1e1e] rounded-lg p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Join the Waitlist
            </h2>
            <p className="text-[#d1d5db] text-center mb-6">
              Be the first to know when we launch
            </p>

            {status === 'success' ? (
              <div className="text-center py-4">
                <div className="text-green-500 text-4xl mb-2">✓</div>
                <p className="text-white font-medium">
                  You're on the list! We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#121212] outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-sm">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                >
                  {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

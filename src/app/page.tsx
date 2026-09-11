'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function isValidEmail(value: string) {
  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  return emailRegex.test(value.trim())
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    async function fetchWaitlistCount() {
      try {
        const response = await fetch('/api/waitlist/count')
        if (response.ok) {
          const data = await response.json()
          if (data.count > 0) {
            setWaitlistCount(data.count)
          }
        }
      } catch {
        // Silently fail - count is optional
      }
    }
    fetchWaitlistCount()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (submittingRef.current || status === 'success' || status === 'duplicate') return

    const trimmed = email.trim()
    if (!trimmed || !isValidEmail(trimmed)) {
      setFieldError('Enter a valid email address')
      setStatus('error')
      setErrorMessage('')
      return
    }

    submittingRef.current = true
    setFieldError('')
    setErrorMessage('')

    const submittedEmail = trimmed
    setEmail('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setStatus('success')
      } else if (data.error === 'duplicate') {
        setStatus('duplicate')
      } else {
        setStatus('error')
        setEmail(submittedEmail)
        setErrorMessage('Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setEmail(submittedEmail)
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <main className="page-shell flex flex-col">
      <div className="relative isolate flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.18)_0%,_transparent_55%),linear-gradient(180deg,#121212_0%,#16121c_100%)]"
        />

        <header className="container-wide">
          <nav className="nav-bar" aria-label="Primary">
            <Link href="/" className="brand-mark">
              Shortlist
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </div>
          </nav>
        </header>

        <section className="container-wide flex flex-col items-center pb-20 pt-10 text-center sm:pt-16">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Shortlist
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Know what to build next
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
            Capture feature ideas, upvote what matters, and keep your product
            roadmap focused on the highest-signal work.
          </p>
        </section>

        <section className="container-wide py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="card-surface !p-6">
                <h3 className="font-display text-base font-semibold text-ink">
                  Capture
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Collect and organize feature ideas from your team and users in one place.
                </p>
              </div>
              <div className="card-surface !p-6">
                <h3 className="font-display text-base font-semibold text-ink">
                  Upvote
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Let your community vote on what matters most to them.
                </p>
              </div>
              <div className="card-surface !p-6">
                <h3 className="font-display text-base font-semibold text-ink">
                  Prioritize
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Focus your roadmap on the highest-signal work with clear data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide py-20">
          <div id="waitlist" className="mx-auto w-full max-w-md text-left">
            <div className="card-surface">
              <h2 className="font-display text-lg font-semibold text-ink">
                Join the waitlist
              </h2>
              {waitlistCount !== null && (
                <p className="mt-1 text-sm text-ink-muted">
                  Join {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} already on the waitlist.
                </p>
              )}
              {!waitlistCount && (
                <p className="mt-1 text-sm text-ink-muted">
                  Be first to know when we open access.
                </p>
              )}

              {status === 'success' ? (
                <div className="alert-success mt-6" role="status">
                  You&apos;re on the list. We&apos;ll be in touch soon.
                </div>
              ) : status === 'duplicate' ? (
                <div className="alert-success mt-6" role="status">
                  You&apos;re already on the list — we&apos;ll be in touch.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label htmlFor="waitlist-email" className="label">
                      Email
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (fieldError) setFieldError('')
                        if (status === 'error') setStatus('idle')
                      }}
                      placeholder="you@company.com"
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={
                        fieldError
                          ? 'waitlist-email-error'
                          : errorMessage
                            ? 'waitlist-form-error'
                            : undefined
                      }
                      className="input-field"
                    />
                    {fieldError && (
                      <p
                        id="waitlist-email-error"
                        className="mt-1.5 text-sm text-danger"
                        role="alert"
                      >
                        {fieldError}
                      </p>
                    )}
                  </div>

                  {errorMessage && (
                    <p
                      id="waitlist-form-error"
                      className="alert-error"
                      role="alert"
                    >
                      {errorMessage}
                    </p>
                  )}

                  <button type="submit" className="btn-primary w-full">
                    Join waitlist
                  </button>
                  <p className="mt-3 text-xs text-ink-faint text-center">
                    No spam. We&apos;ll only email you when we open access.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="container-wide py-20" aria-label="FAQ">
          <div className="mx-auto w-full max-w-md">
            <h2 className="font-display text-lg font-semibold text-ink text-center mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <details className="card-surface group">
                <summary className="cursor-pointer list-none font-display text-sm font-semibold text-ink p-4 flex items-center justify-between">
                  When will Shortlist launch?
                  <span className="text-ink-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-ink-muted">
                  We&apos;re working hard to launch soon. Join the waitlist to be notified when we open access.
                </p>
              </details>
              <details className="card-surface group">
                <summary className="cursor-pointer list-none font-display text-sm font-semibold text-ink p-4 flex items-center justify-between">
                  Will it be free?
                  <span className="text-ink-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-ink-muted">
                  Yes, we plan to offer a free tier for individuals and small teams.
                </p>
              </details>
              <details className="card-surface group">
                <summary className="cursor-pointer list-none font-display text-sm font-semibold text-ink p-4 flex items-center justify-between">
                  Do I need to install anything?
                  <span className="text-ink-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-ink-muted">
                  No, Shortlist is a web app. Just sign up and start using it from your browser.
                </p>
              </details>
            </div>
          </div>
        </section>
      </div>

      <footer className="container-wide border-t border-white/10 py-8">
        <p className="text-sm text-ink-faint text-center">
          © {new Date().getFullYear()} Shortlist. All rights reserved.
        </p>
      </footer>
    </main>
  )
}

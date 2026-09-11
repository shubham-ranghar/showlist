'use client'

import { useRef, useState } from 'react'
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
  const submittingRef = useRef(false)

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

        <section className="container-wide flex flex-col items-center pb-16 pt-10 text-center sm:pb-20 sm:pt-16">
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

          <div id="waitlist" className="mt-10 w-full max-w-md text-left">
            <div className="card-surface">
              <h2 className="font-display text-lg font-semibold text-ink">
                Join the waitlist
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Be first to know when we open access.
              </p>

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
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

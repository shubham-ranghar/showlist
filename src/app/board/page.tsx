'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/components/AuthProvider'
import IdeaForm from '@/components/IdeaForm'
import IdeaCard from '@/components/IdeaCard'
import SignOutButton from '@/components/SignOutButton'
import type { Idea } from '@/lib/types'

function BoardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-28 w-full" />
      ))}
    </div>
  )
}

export default function BoardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return

    // Single ordered query for the board — one listener for the list, not per card.
    const ideasQuery = query(
      collection(db, 'ideas'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      const serverIdeas = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Idea[]

      setIdeas((prev) => {
        const pending = prev.filter((idea) => {
          if (!idea.optimistic) return false
          return !serverIdeas.some(
            (server) =>
              server.authorId === idea.authorId &&
              server.title === idea.title &&
              server.body === idea.body
          )
        })
        return [...pending, ...serverIdeas]
      })
      setIdeasLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  function handleOptimisticAdd(idea: Idea) {
    setIdeas((prev) => [idea, ...prev])
  }

  function handleRollback(tempId: string) {
    setIdeas((prev) => prev.filter((idea) => idea.id !== tempId))
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="container-board py-10">
          <div className="skeleton mb-8 h-10 w-40" />
          <div className="skeleton mb-6 h-40 w-full" />
          <BoardSkeleton />
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page-shell flex items-center justify-center">
        <p className="text-sm text-ink-muted">Redirecting to sign in…</p>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <div className="container-board py-8 sm:py-10">
        <nav className="nav-bar !py-0 mb-8" aria-label="Board">
          <div className="brand-mark">Shortlist</div>
          <SignOutButton />
        </nav>

        <header className="mb-6">
          <h1 className="section-title">Board</h1>
          <p className="section-sub">Signed in as {user.email}</p>
        </header>

        <IdeaForm
          onOptimisticAdd={handleOptimisticAdd}
          onRollback={handleRollback}
        />

        <section className="mt-8 space-y-4" aria-live="polite">
          {ideasLoading && <BoardSkeleton />}

          {!ideasLoading && ideas.length === 0 && (
            <div className="card-surface text-center">
              <p className="font-display text-base font-semibold text-ink">
                No ideas yet
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Be the first to post one and start the shortlist.
              </p>
            </div>
          )}

          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </section>
      </div>
    </main>
  )
}

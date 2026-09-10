'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/components/AuthProvider'
import IdeaForm from '@/components/IdeaForm'
import IdeaCard from '@/components/IdeaCard'
import SignOutButton from '@/components/SignOutButton'

type Idea = {
  id: string
  title: string
  body: string
  authorId: string
  authorEmail: string
  voteCount: number
}

export default function BoardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return

    const ideasQuery = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Idea[]
      setIdeas(list)
      setIdeasLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212]">
        <p className="text-[#d1d5db]">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-10">
      {/* Navbar */}
      <nav className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div className="text-white font-bold text-xl">Shortlist</div>
        <SignOutButton />
      </nav>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Board</h1>
          <p className="text-sm text-[#d1d5db]">Signed in as {user.email}</p>
        </div>

        <div className="mt-6">
          <IdeaForm />
        </div>

        <div className="mt-8 space-y-4">
          {ideasLoading && (
            <p className="text-center text-sm text-[#d1d5db]">Loading ideas...</p>
          )}

          {!ideasLoading && ideas.length === 0 && (
            <p className="text-center text-sm text-[#d1d5db]">
              No ideas yet. Be the first to post one.
            </p>
          )}

          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    </main>
  )
}

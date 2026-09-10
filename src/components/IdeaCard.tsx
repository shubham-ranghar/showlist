'use client'

import { useEffect, useState } from 'react'
import {
  doc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from './AuthProvider'

type Idea = {
  id: string
  title: string
  body: string
  authorId: string
  authorEmail: string
  voteCount: number
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const { user } = useAuth()

  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const isOwner = user?.uid === idea.authorId

  useEffect(() => {
    if (!user) return

    const voteRef = doc(db, 'ideas', idea.id, 'votes', user.uid)
    const unsubscribe = onSnapshot(voteRef, (snap) => {
      setHasVoted(snap.exists())
    })

    return () => unsubscribe()
  }, [idea.id, user])

  async function handleUpvote() {
    if (!user || hasVoted || isVoting) return

    setIsVoting(true)
    setError('')

    const voteRef = doc(db, 'ideas', idea.id, 'votes', user.uid)
    const ideaRef = doc(db, 'ideas', idea.id)

    try {
      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef)

        if (voteDoc.exists()) {
          throw new Error('already-voted')
        }

        const ideaDoc = await transaction.get(ideaRef)
        const currentVotes = ideaDoc.data()?.voteCount ?? 0

        transaction.set(voteRef, { votedAt: serverTimestamp() })
        transaction.update(ideaRef, { voteCount: currentVotes + 1 })
      })
    } catch (err) {
      console.error(err)
      setError('Could not register your vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  async function handleDelete() {
    if (!isOwner || isDeleting) return

    setIsDeleting(true)
    setError('')

    try {
      await deleteDoc(doc(db, 'ideas', idea.id))
    } catch (err) {
      console.error(err)
      setError('Could not delete this idea. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#1e1e1e] p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{idea.title}</h3>
          <p className="mt-1 text-sm text-[#d1d5db]">{idea.body}</p>
          <p className="mt-2 text-xs text-[#d1d5db]">
            Posted by {idea.authorEmail}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleUpvote}
            disabled={hasVoted || isVoting}
            title={hasVoted ? 'You already voted for this' : 'Upvote'}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 ${
              hasVoted
                ? 'border-[#9333ea] bg-[#9333ea] text-white shadow-lg shadow-purple-900/20'
                : 'border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span>▲</span>
            <span>{idea.voteCount}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 py-1 rounded transition-all duration-200 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-900/30 p-2 text-xs text-red-400 border border-red-900/50">
          {error}
        </p>
      )}
    </div>
  )
}

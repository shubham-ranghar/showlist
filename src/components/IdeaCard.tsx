'use client'

import { useEffect, useState } from 'react'
import {
  doc,
  deleteDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from './AuthProvider'
import type { Idea } from '@/lib/types'

export default function IdeaCard({ idea }: { idea: Idea }) {
  const { user } = useAuth()

  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(idea.voteCount)
  const [voteReady, setVoteReady] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const isOwner = user?.uid === idea.authorId

  useEffect(() => {
    setVoteCount(idea.voteCount)
  }, [idea.voteCount])

  // One-time read instead of a live listener per card (was N+1 reads).
  useEffect(() => {
    if (!user || idea.optimistic) {
      setVoteReady(true)
      return
    }

    let cancelled = false
    const voteRef = doc(db, 'ideas', idea.id, 'votes', user.uid)

    getDoc(voteRef)
      .then((snap) => {
        if (!cancelled) {
          setHasVoted(snap.exists())
          setVoteReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) setVoteReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [idea.id, idea.optimistic, user])

  async function handleUpvote() {
    if (!user || hasVoted || isVoting || idea.optimistic || !voteReady) return

    setIsVoting(true)
    setError('')

    const previousCount = voteCount
    setHasVoted(true)
    setVoteCount(previousCount + 1)

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
      setHasVoted(false)
      setVoteCount(previousCount)
      setError(
        err instanceof Error && err.message === 'already-voted'
          ? 'You already voted for this idea.'
          : 'Could not register your vote. Please try again.'
      )
    } finally {
      setIsVoting(false)
    }
  }

  async function handleDelete() {
    if (!isOwner || isDeleting || idea.optimistic) return

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
    <article
      className={`card-surface !p-5 ${idea.optimistic ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-ink">
            {idea.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {idea.body}
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            Posted by {idea.authorEmail}
            {idea.optimistic ? ' · Saving…' : ''}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={hasVoted || isVoting || idea.optimistic || !voteReady}
            aria-pressed={hasVoted}
            aria-label={
              hasVoted
                ? `Already voted, ${voteCount} votes`
                : `Upvote, ${voteCount} votes`
            }
            title={hasVoted ? 'You already voted' : 'Upvote'}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed ${
              hasVoted
                ? 'border-accent bg-accent text-white shadow-lg shadow-purple-900/20'
                : 'border-white/10 bg-canvas text-white hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <span aria-hidden>▲</span>
            <span>{voteCount}</span>
          </button>

          {hasVoted && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
              Voted
            </span>
          )}

          {isOwner && !idea.optimistic && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded px-2 py-1 text-xs font-medium text-danger transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="alert-error mt-3 !py-2 text-xs" role="alert">
          {error}
        </p>
      )}
    </article>
  )
}

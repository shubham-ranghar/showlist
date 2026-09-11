'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from './AuthProvider'
import type { Idea } from '@/lib/types'

type IdeaFormProps = {
  onOptimisticAdd: (idea: Idea) => void
  onRollback: (tempId: string) => void
}

export default function IdeaForm({
  onOptimisticAdd,
  onRollback,
}: IdeaFormProps) {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be signed in to post an idea.')
      return
    }

    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle || !trimmedBody) {
      setError('Please fill in both the title and the description.')
      return
    }

    const tempId = `temp-${crypto.randomUUID()}`
    const optimisticIdea: Idea = {
      id: tempId,
      title: trimmedTitle,
      body: trimmedBody,
      authorId: user.uid,
      authorEmail: user.email ?? '',
      voteCount: 0,
      optimistic: true,
    }

    setIsSubmitting(true)
    setTitle('')
    setBody('')
    onOptimisticAdd(optimisticIdea)

    try {
      await addDoc(collection(db, 'ideas'), {
        title: trimmedTitle,
        body: trimmedBody,
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        voteCount: 0,
      })
      // Keep optimistic row until onSnapshot merges in the server doc.
    } catch (err) {
      console.error(err)
      onRollback(tempId)
      setTitle(trimmedTitle)
      setBody(trimmedBody)
      setError('Could not post your idea. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface">
      <h2 className="font-display text-lg font-semibold text-ink">
        Post a new idea
      </h2>

      {error && (
        <p className="alert-error mt-3" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short, clear idea title"
          disabled={isSubmitting}
          maxLength={100}
          className="input-field"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="body" className="label">
          Description
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Explain the idea in a sentence or two"
          disabled={isSubmitting}
          maxLength={500}
          rows={3}
          className="input-field resize-y no-scrollbar"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-4"
      >
        {isSubmitting ? 'Posting…' : 'Post idea'}
      </button>
    </form>
  )
}

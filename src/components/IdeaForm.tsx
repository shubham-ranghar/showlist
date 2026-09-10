'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { useAuth } from './AuthProvider'

export default function IdeaForm() {
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

    if (!title.trim() || !body.trim()) {
      setError('Please fill in both the title and the description.')
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'ideas'), {
        title: title.trim(),
        body: body.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        voteCount: 0,
      })

      setTitle('')
      setBody('')
    } catch (err) {
      console.error(err)
      setError('Could not post your idea. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/10 bg-[#1e1e1e] p-6 shadow-lg shadow-black/20"
    >
      <h2 className="text-lg font-semibold text-white">Post a new idea</h2>

      {error && (
        <p className="mt-3 rounded-md bg-red-900/30 p-3 text-sm text-red-400 border border-red-900/50">
          {error}
        </p>
      )}

      <div className="mt-4">
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-[#d1d5db]">
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
          className="w-full rounded-md border border-white/10 bg-[#121212] px-3 py-2 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-[#d1d5db]">
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
          className="w-full rounded-md border border-white/10 bg-[#121212] px-3 py-2 outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[#9333ea]/20 text-white placeholder:text-[#d1d5db] disabled:opacity-50 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-md bg-[#9333ea] hover:bg-[#7e22ce] hover:shadow-lg hover:shadow-purple-900/20 px-4 py-2 text-sm font-medium text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      >
        {isSubmitting ? 'Posting...' : 'Post idea'}
      </button>
    </form>
  )
}

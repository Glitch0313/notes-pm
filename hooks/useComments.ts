'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; fullName: string | null; avatarColor: string }
}

export function useComments(noteId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}/comments`)
      const data = await res.json()
      if (data.success) setComments(data.data)
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function addComment(content: string): Promise<boolean> {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/notes/${noteId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.success) {
        setComments((prev) => [...prev, data.data])
        return true
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteComment(commentId: string): Promise<boolean> {
    const res = await fetch(`/api/notes/${noteId}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })
    const data = await res.json()
    if (data.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      return true
    }
    return false
  }

  return { comments, loading, submitting, addComment, deleteComment }
}

export function useLike(noteId: string) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`/api/notes/${noteId}/like`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { setLiked(data.liked); setCount(data.count) }
      })
      .finally(() => setLoading(false))
  }, [noteId])

  async function toggle() {
    if (toggling) return
    setToggling(true)
    try {
      const res = await fetch(`/api/notes/${noteId}/like`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { setLiked(data.liked); setCount(data.count) }
    } finally {
      setToggling(false)
    }
  }

  return { liked, count, loading, toggling, toggle }
}

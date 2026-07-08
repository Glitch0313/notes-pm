'use client'

import { useState } from 'react'
import { useComments, useLike } from '@/hooks/useComments'

interface Props {
  noteId: string
  currentUserId?: string
  isAdmin?: boolean
}

export default function CommentsSection({ noteId, currentUserId, isAdmin }: Props) {
  const { comments, loading, submitting, addComment, deleteComment } = useComments(noteId)
  const { liked, count, toggling, toggle } = useLike(noteId)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!text.trim()) return
    const ok = await addComment(text.trim())
    if (ok) { setText('') }
    else { setError('حدث خطأ، يرجى المحاولة مجدداً') }
  }

  return (
    <div dir="rtl" className="mt-8 border-t border-gray-200 pt-6">
      {/* Like button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={toggle}
          disabled={toggling || !currentUserId}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            liked
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } disabled:opacity-50`}
          title={!currentUserId ? 'سجّل الدخول للإعجاب' : undefined}
        >
          <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {count > 0 ? count : ''} {liked ? 'أعجبني' : 'إعجاب'}
        </button>
        <span className="text-sm text-gray-500">{comments.length} تعليق</span>
      </div>

      {/* Comments */}
      <h3 className="text-base font-semibold text-gray-900 mb-4">التعليقات</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: comment.user.avatarColor }}
              >
                {(comment.user.fullName || comment.user.username).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user.fullName || comment.user.username}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                    {(currentUserId === comment.user.id || isAdmin) && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="حذف التعليق"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب تعليقاً..."
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {submitting && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              نشر التعليق
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">سجّل الدخول</a>
          {' '}للمشاركة في التعليقات.
        </p>
      )}
    </div>
  )
}

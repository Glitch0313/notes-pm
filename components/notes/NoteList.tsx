'use client'

import type { NoteDTO } from '@/types'
import NoteCard from './NoteCard'

interface NoteListProps {
  notes: NoteDTO[]
  isAdmin?: boolean
  currentUserId?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  emptyMessage?: string
}

export default function NoteList({
  notes,
  isAdmin,
  currentUserId,
  onEdit,
  onDelete,
  emptyMessage = 'لا توجد مذكرات بعد. ابدأ بإنشاء مذكرتك الأولى!',
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center gap-4"
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-3xl">
          📝
        </div>
        <p className="text-gray-500 text-sm max-w-xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
      dir="rtl"
    >
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} isAdmin={isAdmin} currentUserId={currentUserId} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

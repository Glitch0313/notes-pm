// lib/pdf.ts — PDF generation logic using @react-pdf/renderer

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteForPDF {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  author: {
    username: string
    fullName: string | null
  }
}

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'عام',
  TECHNOLOGY: 'تقنية',
  SCIENCE: 'علوم',
  LITERATURE: 'أدب',
  PHILOSOPHY: 'فلسفة',
  HISTORY: 'تاريخ',
  ART: 'فن',
  BUSINESS: 'أعمال',
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  headerApp: {
    fontSize: 10,
    color: '#6366f1',
    fontFamily: 'Helvetica-Bold',
  },
  headerDate: {
    fontSize: 9,
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerAuthor: {
    fontSize: 9,
    color: '#6b7280',
  },
  footerPage: {
    fontSize: 9,
    color: '#9ca3af',
  },
  titleSection: {
    marginBottom: 16,
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaBadge: {
    fontSize: 9,
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagBadge: {
    fontSize: 9,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  authorRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
  },
  authorName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  dateRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 9,
    color: '#9ca3af',
    marginLeft: 4,
  },
  dateValue: {
    fontSize: 9,
    color: '#6b7280',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  contentSection: {
    textAlign: 'right',
  },
  contentText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.8,
    textAlign: 'right',
  },
})

// ─── PDF Document Component ───────────────────────────────────────────────────

function NotePDFDocument({ note }: { note: NoteForPDF }) {
  const authorName = note.author.fullName || note.author.username
  const categoryLabel = CATEGORY_LABELS[note.category] || note.category
  const generatedDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const createdDate = new Date(note.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return React.createElement(
    Document,
    { title: note.title, author: authorName, creator: 'NoteVaultPro' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header, fixed: true },
        React.createElement(Text, { style: styles.headerApp }, 'NoteVaultPro'),
        React.createElement(Text, { style: styles.headerDate }, generatedDate)
      ),
      // Title
      React.createElement(
        View,
        { style: styles.titleSection },
        React.createElement(Text, { style: styles.title }, note.title)
      ),
      // Author
      React.createElement(
        View,
        { style: styles.authorRow },
        React.createElement(Text, { style: styles.authorLabel }, ':الكاتب'),
        React.createElement(Text, { style: styles.authorName }, authorName)
      ),
      // Date
      React.createElement(
        View,
        { style: styles.dateRow },
        React.createElement(Text, { style: styles.dateLabel }, ':تاريخ الإنشاء'),
        React.createElement(Text, { style: styles.dateValue }, createdDate)
      ),
      // Meta: category + tags
      React.createElement(
        View,
        { style: styles.metaRow },
        React.createElement(Text, { style: styles.metaBadge }, categoryLabel),
        ...note.tags.map((tag, i) =>
          React.createElement(Text, { key: i, style: styles.tagBadge }, `#${tag}`)
        )
      ),
      // Divider
      React.createElement(View, { style: styles.divider }),
      // Content
      React.createElement(
        View,
        { style: styles.contentSection },
        React.createElement(Text, { style: styles.contentText }, note.content)
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerAuthor }, authorName),
        React.createElement(
          Text,
          {
            style: styles.footerPage,
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `${pageNumber} / ${totalPages}`,
          }
        )
      )
    )
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateNotePDF(note: NoteForPDF): Promise<Buffer> {
  const doc = React.createElement(NotePDFDocument, { note })
  const buffer = await renderToBuffer(doc as any)
  return Buffer.from(buffer)
}

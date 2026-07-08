'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { useEffect } from 'react'

const lowlight = createLowlight()

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichEditor({ content, onChange, placeholder = 'اكتب محتوى مذكرتك هنا...' }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] px-4 py-3 text-gray-800 leading-relaxed',
        dir: 'rtl',
      },
    },
  })

  // Sync external content changes (e.g. when editing)
  useEffect(() => {
    if (!editor || !content) return
    const current = editor.getHTML()
    if (current !== content) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  const wordCount = editor.storage.characterCount?.words() ?? 0
  const charCount = editor.storage.characterCount?.characters() ?? 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/60">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="عنوان رئيسي"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="عنوان فرعي"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="عنوان ثالثي"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="غامق"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="مائل"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="تحته خط"
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="يتوسطه خط"
        >
          <s>S</s>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="قائمة نقطية"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="قائمة مرقمة"
        >
          1≡
        </ToolbarButton>

        <Divider />

        {/* Block elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="اقتباس"
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="كود مضمن"
        >
          {'<>'}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="كتلة كود"
        >
          {'{ }'}
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="تراجع"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="إعادة"
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Stats footer */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-400">
        <span>{wordCount.toLocaleString('ar-SA')} كلمة</span>
        <span>{charCount.toLocaleString('ar-SA')} حرف</span>
        <span>وقت القراءة: ~{readingTime} دقيقة</span>
      </div>
    </div>
  )
}

import { useState, type KeyboardEvent } from 'react'
import { sortTags } from '../lib/tagOrder'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim()
    if (value && !tags.includes(value)) {
      onChange([...tags, value])
    }
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {sortTags(tags).map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-500 hover:text-indigo-800">
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="タグを入力してEnter(例: 夏, カジュアル)"
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  )
}

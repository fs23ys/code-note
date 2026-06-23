import { useState, type KeyboardEvent } from 'react'
import { TAG_GROUPS, sortTags } from '../lib/tagOrder'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
  }

  const handleDraftSubmit = () => {
    addTag(draft)
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleDraftSubmit()
    }
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      {tags.length > 0 && (
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
      )}

      <div className="mt-2 flex flex-col gap-1.5">
        {TAG_GROUPS.map((group) => {
          const candidates = group.tags.filter((tag) => !tags.includes(tag))
          if (candidates.length === 0) return null
          return (
            <div key={group.label} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-400">{group.label}</span>
              {candidates.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleDraftSubmit}
        placeholder="候補にないタグは入力してEnter(例: ウール)"
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  )
}

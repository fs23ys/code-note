import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OutfitItemPicker } from '../components/OutfitItemPicker'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import { createOutfit } from '../lib/outfits'

export function OutfitNewPage() {
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid)
  const { categories } = useCategories(user?.uid)
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!user) return
    if (selectedIds.length < 2) {
      setError('アイテムを2点以上選択してください')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const outfitId = await createOutfit(user.uid, {
        name: name || undefined,
        itemIds: selectedIds,
        tags,
        memo: memo || undefined,
        wornDates: [],
      })
      navigate(`/outfits/${outfitId}`)
    } catch {
      setError('保存に失敗しました。もう一度お試しください')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">コーデの新規作成</h2>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : (
        <OutfitItemPicker
          items={items}
          categories={categories}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      )}

      <div className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          コーデ名
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-600">
          メモ
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-600">
          タグ
          <TagInput tags={tags} onChange={setTags} />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-fit rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  )
}

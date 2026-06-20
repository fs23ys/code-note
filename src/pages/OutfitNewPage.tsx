import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { createOutfit } from '../lib/outfits'

export function OutfitNewPage() {
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid)
  const navigate = useNavigate()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

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

      <p className="text-sm text-gray-500">組み合わせる服を2点以上選択してください({selectedIds.length}点選択中)</p>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items.map((item) => {
            const selected = selectedIds.includes(item.id)
            const photo = item.photos[item.mainPhotoIndex] ?? item.photos[0]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                  selected ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                {selected && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
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

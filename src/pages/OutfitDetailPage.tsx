import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { deleteOutfit, updateOutfit } from '../lib/outfits'

export function OutfitDetailPage() {
  const { outfitId } = useParams<{ outfitId: string }>()
  const { user } = useAuth()
  const { items } = useItems(user?.uid)
  const { outfits, loading } = useOutfits(user?.uid)
  const navigate = useNavigate()

  const outfit = useMemo(() => outfits.find((o) => o.id === outfitId), [outfits, outfitId])
  const outfitItems = useMemo(
    () => (outfit ? outfit.itemIds.map((id) => items.find((item) => item.id === id)).filter(Boolean) : []),
    [outfit, items],
  )

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!outfit) return
    setName(outfit.name ?? '')
    setTags(outfit.tags)
    setMemo(outfit.memo ?? '')
  }, [outfit])

  const handleSave = async () => {
    if (!user || !outfit) return
    setSubmitting(true)
    try {
      await updateOutfit(user.uid, outfit.id, {
        name: name || undefined,
        tags,
        memo: memo || undefined,
      })
      setEditing(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !outfit) return
    if (!window.confirm('このコーデを削除しますか?')) return
    await deleteOutfit(user.uid, outfit.id)
    navigate('/outfits')
  }

  if (loading) return <p className="text-sm text-gray-400">読み込み中...</p>
  if (!outfit) return <p className="text-sm text-gray-400">コーデが見つかりません</p>

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">{outfit.name || '名称未設定のコーデ'}</h2>

      <div className="flex flex-wrap gap-3">
        {outfitItems.map((item) => {
          if (!item) return null
          const photo = item.photos[item.mainPhotoIndex] ?? item.photos[0]
          return (
            <div key={item.id} className="h-28 w-28 overflow-hidden rounded-lg border border-gray-200">
              {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
            </div>
          )
        })}
      </div>

      {!editing ? (
        <>
          {outfit.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {outfit.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {outfit.memo && <p className="whitespace-pre-wrap text-sm text-gray-700">{outfit.memo}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              編集する
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              削除する
            </button>
          </div>
        </>
      ) : (
        <>
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </div>
  )
}

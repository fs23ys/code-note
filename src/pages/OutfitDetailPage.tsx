import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { deleteOutfit, updateOutfit } from '../lib/outfits'
import { sortTags } from '../lib/tagOrder'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

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
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [wornDateInput, setWornDateInput] = useState(todayString())
  const [wornDateError, setWornDateError] = useState('')

  useEffect(() => {
    if (!outfit) return
    setName(outfit.name ?? '')
    setTags(outfit.tags)
    setMemo(outfit.memo ?? '')
    setSelectedItemIds(outfit.itemIds)
  }, [outfit])

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSave = async () => {
    if (!user || !outfit) return
    if (selectedItemIds.length < 2) {
      setError('アイテムを2点以上選択してください')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateOutfit(user.uid, outfit.id, {
        name: name || undefined,
        tags,
        memo: memo || undefined,
        itemIds: selectedItemIds,
      })
      setEditing(false)
    } catch (err) {
      console.error('Failed to update outfit', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(`保存に失敗しました: ${message}`)
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

  const handleAddWornDate = async () => {
    if (!user || !outfit || !wornDateInput) return
    if (outfit.wornDates.includes(wornDateInput)) {
      setWornDateError('その日付は既に記録されています')
      return
    }
    setWornDateError('')
    const wornDates = [...outfit.wornDates, wornDateInput].sort((a, b) => b.localeCompare(a))
    await updateOutfit(user.uid, outfit.id, { wornDates })
  }

  const handleRemoveWornDate = async (date: string) => {
    if (!user || !outfit) return
    const wornDates = outfit.wornDates.filter((d) => d !== date)
    await updateOutfit(user.uid, outfit.id, { wornDates })
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
              {sortTags(outfit.tags).map((tag) => (
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
          <p className="text-sm text-gray-500">
            組み合わせる服を2点以上選択してください({selectedItemIds.length}点選択中)
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => {
              const selected = selectedItemIds.includes(item.id)
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

      <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold text-gray-600">着用日</h3>

        <div className="flex gap-2">
          <input
            type="date"
            value={wornDateInput}
            onChange={(e) => setWornDateInput(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddWornDate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            この日付で記録
          </button>
        </div>

        {wornDateError && <p className="text-sm text-red-500">{wornDateError}</p>}

        {outfit.wornDates.length === 0 ? (
          <p className="text-sm text-gray-400">まだ着用日が記録されていません</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {outfit.wornDates.map((date) => (
              <li
                key={date}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700"
              >
                {date}
                <button
                  type="button"
                  onClick={() => handleRemoveWornDate(date)}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

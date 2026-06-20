import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { generateOutfitSuggestion, type OutfitSuggestion } from '../lib/outfitSuggest'
import { createOutfit } from '../lib/outfits'

export function OutfitSuggestPage() {
  const { user } = useAuth()
  const { items, loading: itemsLoading } = useItems(user?.uid)
  const { outfits, loading: outfitsLoading } = useOutfits(user?.uid)
  const navigate = useNavigate()

  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)

  const regenerate = useCallback(() => {
    setSuggestion(generateOutfitSuggestion(items, outfits))
    setAttempted(true)
  }, [items, outfits])

  useEffect(() => {
    if (!itemsLoading && !outfitsLoading && !attempted) regenerate()
  }, [itemsLoading, outfitsLoading, attempted, regenerate])

  const handleSave = async () => {
    if (!user || !suggestion) return
    setSaving(true)
    try {
      const outfitId = await createOutfit(user.uid, {
        itemIds: suggestion.itemIds,
        tags: [],
      })
      navigate(`/outfits/${outfitId}`)
    } finally {
      setSaving(false)
    }
  }

  const suggestionItems = suggestion
    ? suggestion.itemIds.map((id) => items.find((item) => item.id === id)).filter(Boolean)
    : []

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">コーデ自動提案</h2>
      <p className="text-sm text-gray-500">
        トップス・ボトムス・靴を中心に、タグの一致度が高い組み合わせをランダムに提案します。
      </p>

      {itemsLoading || outfitsLoading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : !suggestion ? (
        <p className="text-sm text-gray-400">
          提案に必要なアイテム(トップス・ボトムス・靴)が不足しています。まずは服を登録してください。
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {suggestionItems.map((item) => {
              if (!item) return null
              const photo = item.photos[item.mainPhotoIndex] ?? item.photos[0]
              return (
                <div key={item.id} className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200">
                  {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                </div>
              )
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={regenerate}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              もう一度提案する
            </button>
          </div>
        </>
      )}
    </div>
  )
}

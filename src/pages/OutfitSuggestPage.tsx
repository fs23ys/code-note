import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { generateOutfitSuggestion, type OutfitSuggestion } from '../lib/outfitSuggest'
import { createOutfit } from '../lib/outfits'
import { TAG_GROUPS } from '../lib/tagOrder'
import type { Category } from '../types'

const REQUIRED_KEYWORDS = [['トップス'], ['ボトムス'], ['靴', 'シューズ']]
const SEASONS = TAG_GROUPS.find((g) => g.label === '季節')?.tags ?? ['春', '夏', '秋', '冬']
const ALL_SEASON_TAGS = new Set(SEASONS)

function resolveRequiredCategoryIds(categories: Category[]): string[] {
  return REQUIRED_KEYWORDS.map((keywords) =>
    categories.find((c) => keywords.some((kw) => c.name.includes(kw)))?.id,
  ).filter((id): id is string => Boolean(id))
}

export function OutfitSuggestPage() {
  const { user } = useAuth()
  const { items, loading: itemsLoading } = useItems(user?.uid)
  const { outfits, loading: outfitsLoading } = useOutfits(user?.uid)
  const { categories, loading: categoriesLoading } = useCategories(user?.uid)
  const navigate = useNavigate()

  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState('')

  const requiredCategoryIds = useMemo(() => resolveRequiredCategoryIds(categories), [categories])
  const optionalCategoryIds = useMemo(
    () => categories.map((c) => c.id).filter((id) => !requiredCategoryIds.includes(id)),
    [categories, requiredCategoryIds],
  )

  const seasonFilteredItems = useMemo(() => {
    if (!selectedSeason) return items
    return items.filter((item) => {
      const seasonTags = item.tags.filter((tag) => ALL_SEASON_TAGS.has(tag))
      if (seasonTags.length === 0) return true // 季節タグなし = 通年アイテムとして含める
      return item.tags.includes(selectedSeason)
    })
  }, [items, selectedSeason])

  const regenerate = useCallback(() => {
    setSuggestion(
      generateOutfitSuggestion(seasonFilteredItems, outfits, {
        requiredCategories: requiredCategoryIds,
        optionalCategories: optionalCategoryIds,
      }),
    )
    setAttempted(true)
  }, [seasonFilteredItems, outfits, requiredCategoryIds, optionalCategoryIds])

  useEffect(() => {
    if (!itemsLoading && !outfitsLoading && !categoriesLoading && !attempted) regenerate()
  }, [itemsLoading, outfitsLoading, categoriesLoading, attempted, regenerate])

  const handleSeasonToggle = (season: string) => {
    setSelectedSeason((prev) => (prev === season ? '' : season))
    setAttempted(false)
  }

  const handleSave = async () => {
    if (!user || !suggestion) return
    setSaving(true)
    try {
      const outfitId = await createOutfit(user.uid, {
        itemIds: suggestion.itemIds,
        tags: selectedSeason ? [selectedSeason] : [],
        wornDates: [],
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

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500">季節を絞り込む(任意)</p>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((season) => (
            <button
              key={season}
              type="button"
              onClick={() => handleSeasonToggle(season)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedSeason === season
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
        {selectedSeason && (
          <p className="text-xs text-gray-400">
            「{selectedSeason}」タグ付きアイテムと季節タグなし(通年)アイテムから提案します
          </p>
        )}
      </div>

      {itemsLoading || outfitsLoading || categoriesLoading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : !suggestion ? (
        <p className="text-sm text-gray-400">
          提案に必要なアイテム(トップス・ボトムス・靴)が不足しています。
          {selectedSeason
            ? `「${selectedSeason}」タグのアイテムを追加するか、季節の絞り込みを外してください。`
            : 'まずは服を登録してください。'}
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

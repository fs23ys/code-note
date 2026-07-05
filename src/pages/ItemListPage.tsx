import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar'
import { ItemCard } from '../components/ItemCard'
import { SortableItemCard } from '../components/SortableItemCard'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import { reorderItems } from '../lib/items'
import { sortTags } from '../lib/tagOrder'
import type { ClosetItem } from '../types'

type SortOrder = 'newest' | 'oldest' | 'price-desc' | 'price-asc' | 'custom'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'custom', label: 'カスタム順(ドラッグで並び替え)' },
  { value: 'newest', label: '登録が新しい順' },
  { value: 'oldest', label: '登録が古い順' },
  { value: 'price-desc', label: '価格が高い順' },
  { value: 'price-asc', label: '価格が低い順' },
]

export function ItemListPage() {
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid)
  const { categories } = useCategories(user?.uid)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('custom')
  const [showAiExport, setShowAiExport] = useState(false)
  const [copied, setCopied] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => item.tags.forEach((tag) => set.add(tag)))
    return sortTags(Array.from(set))
  }, [items])

  const allBrands = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => item.brand && set.add(item.brand))
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    const filtered = items.filter((item) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false
      if (selectedTags.length > 0 && !selectedTags.every((tag) => item.tags.includes(tag))) return false
      if (selectedBrand && item.brand !== selectedBrand) return false
      if (kw) {
        const haystack = `${item.name ?? ''} ${item.brand ?? ''} ${item.memo ?? ''}`.toLowerCase()
        if (!haystack.includes(kw)) return false
      }
      return true
    })

    const sorted = [...filtered]
    switch (sortOrder) {
      case 'oldest':
        sorted.sort((a, b) => a.createdAt - b.createdAt)
        break
      case 'price-desc':
        sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
        break
      case 'price-asc':
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
        break
      case 'custom':
        sorted.sort((a, b) => a.order - b.order)
        break
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt)
    }
    return sorted
  }, [items, selectedCategories, selectedTags, selectedBrand, keyword, sortOrder])

  const groupedItems = useMemo(() => {
    const remaining = new Map<string, typeof filteredItems>()
    filteredItems.forEach((item) => {
      const list = remaining.get(item.category) ?? []
      list.push(item)
      remaining.set(item.category, list)
    })

    const groups: { key: string; name: string; items: typeof filteredItems }[] = []

    categories.forEach((category) => {
      const list = remaining.get(category.id)
      if (list && list.length > 0) {
        groups.push({ key: category.id, name: category.name, items: list })
        remaining.delete(category.id)
      }
    })

    // カテゴリ一覧に存在しない自由入力のカテゴリ文字列をまとめる(未削除データ等)
    Array.from(remaining.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([categoryValue, list]) => {
        groups.push({ key: categoryValue, name: categoryValue, items: list })
      })

    return groups
  }, [filteredItems, categories])

  const aiExportText = useMemo(() => {
    const lines: string[] = [
      'あなたはファッションの専門家です。以下は私が現在持っている服の一覧です。これを参考に、今後購入するとコーデの幅が広がるアイテムをカテゴリ・スタイル・季節の観点から具体的に提案してください。',
      '',
      '---',
      '',
    ]
    categories.forEach((cat) => {
      const catItems = items.filter((item) => item.category === cat.id)
      if (catItems.length === 0) return
      lines.push(`## ${cat.name} (${catItems.length}点)`)
      catItems.forEach((item) => {
        const parts: string[] = []
        if (item.name) parts.push(item.name)
        if (item.brand) parts.push(`ブランド: ${item.brand}`)
        if (item.tags.length > 0) parts.push(`タグ: ${sortTags(item.tags).join('・')}`)
        lines.push(`- ${parts.length > 0 ? parts.join(' / ') : '(名前・タグなし)'}`)
      })
      lines.push('')
    })
    lines.push(`合計: ${items.length}点`)
    return lines.join('\n')
  }, [items, categories])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(aiExportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (groupItems: ClosetItem[]) => async (event: DragEndEvent) => {
    const { active, over } = event
    if (!user || !over || active.id === over.id) return
    const oldIndex = groupItems.findIndex((item) => item.id === active.id)
    const newIndex = groupItems.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(groupItems, oldIndex, newIndex)
    await reorderItems(user.uid, reordered)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">服一覧</h2>
        <Link
          to="/items/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + 新規登録
        </Link>
      </div>

      <FilterBar
        categories={categories}
        allTags={allTags}
        allBrands={allBrands}
        selectedCategories={selectedCategories}
        selectedTags={selectedTags}
        selectedBrand={selectedBrand}
        keyword={keyword}
        onToggleCategory={toggleCategory}
        onToggleTag={toggleTag}
        onBrandChange={setSelectedBrand}
        onKeywordChange={setKeyword}
      />

      <label className="flex items-center gap-2 self-end text-sm text-gray-600">
        並び替え
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {sortOrder === 'custom' && (
        <p className="text-xs text-gray-400">カードの左上の「≡」をドラッグすると、カテゴリ内で並び順を変更できます</p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowAiExport((prev) => !prev)}
          className="self-start rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          {showAiExport ? '閉じる' : '🤖 AIに相談用テキストを出力'}
        </button>
        {showAiExport && (
          <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-gray-500">
              以下をコピーして ChatGPT・Claude などのAIに貼り付けると、購入アドバイスをもらえます。
            </p>
            <textarea
              readOnly
              value={aiExportText}
              rows={12}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="self-start rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              {copied ? 'コピーしました！' : 'コピー'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-gray-400">条件に合う服がありません</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedItems.map((group) => (
            <section key={group.key} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-600">
                {group.name} <span className="text-gray-400">({group.items.length})</span>
              </h3>
              {sortOrder === 'custom' ? (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd(group.items)}>
                  <SortableContext items={group.items.map((item) => item.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {group.items.map((item) => (
                        <SortableItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {group.items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

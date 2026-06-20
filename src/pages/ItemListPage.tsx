import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar'
import { ItemCard } from '../components/ItemCard'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'

export function ItemListPage() {
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid)
  const { categories } = useCategories(user?.uid)

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [keyword, setKeyword] = useState('')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => item.tags.forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [items])

  const allBrands = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => item.brand && set.add(item.brand))
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return items.filter((item) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false
      if (selectedTags.length > 0 && !selectedTags.every((tag) => item.tags.includes(tag))) return false
      if (selectedBrand && item.brand !== selectedBrand) return false
      if (kw) {
        const haystack = `${item.name ?? ''} ${item.brand ?? ''} ${item.memo ?? ''}`.toLowerCase()
        if (!haystack.includes(kw)) return false
      }
      return true
    })
  }, [items, selectedCategories, selectedTags, selectedBrand, keyword])

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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {group.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

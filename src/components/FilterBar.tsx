import type { Category } from '../types'

interface FilterBarProps {
  categories: Category[]
  allTags: string[]
  allBrands: string[]
  selectedCategories: string[]
  selectedTags: string[]
  selectedBrand: string
  keyword: string
  onToggleCategory: (categoryId: string) => void
  onToggleTag: (tag: string) => void
  onBrandChange: (brand: string) => void
  onKeywordChange: (keyword: string) => void
}

export function FilterBar({
  categories,
  allTags,
  allBrands,
  selectedCategories,
  selectedTags,
  selectedBrand,
  keyword,
  onToggleCategory,
  onToggleTag,
  onBrandChange,
  onKeywordChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <input
        type="text"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="ブランド名・メモで検索"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedCategories.includes(category.id)
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggleCategory(category.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category.name}
            </button>
          )
        })}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs ${
                  active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      )}

      <select
        value={selectedBrand}
        onChange={(e) => onBrandChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        <option value="">すべてのブランド</option>
        {allBrands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
    </div>
  )
}

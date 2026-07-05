interface BrandInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
}

export function BrandInput({ value, onChange, suggestions }: BrandInputProps) {
  const candidates = suggestions.filter((b) => b !== value)

  return (
    <div className="flex flex-col gap-1.5">
      {candidates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidates.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => onChange(brand)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {brand}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={candidates.length > 0 ? '候補にないブランドは直接入力' : 'ブランド名を入力'}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  )
}

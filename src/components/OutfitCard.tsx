import { Link } from 'react-router-dom'
import type { ClosetItem, Outfit } from '../types'

export function OutfitCard({ outfit, items }: { outfit: Outfit; items: ClosetItem[] }) {
  const outfitItems = outfit.itemIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is ClosetItem => Boolean(item))

  return (
    <Link
      to={`/outfits/${outfit.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="grid grid-cols-3 gap-px bg-gray-100">
        {[0, 1, 2].map((i) => {
          const item = outfitItems[i]
          const photo = item ? item.photos[item.mainPhotoIndex] ?? item.photos[0] : undefined
          return (
            <div key={i} className="aspect-square bg-gray-50">
              {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        <span className="truncate text-xs font-medium text-gray-800">{outfit.name || '名称未設定のコーデ'}</span>
        <span className="text-xs text-gray-500">{outfitItems.length}点のアイテム</span>
      </div>
    </Link>
  )
}

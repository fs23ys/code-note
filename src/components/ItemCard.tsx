import { Link } from 'react-router-dom'
import type { ClosetItem } from '../types'

export function ItemCard({ item }: { item: ClosetItem }) {
  const mainPhoto = item.photos[item.mainPhotoIndex] ?? item.photos[0]

  return (
    <Link
      to={`/items/${item.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square w-full bg-gray-100">
        {mainPhoto ? (
          <img src={mainPhoto} alt={item.category} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">No Image</div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        <span className="truncate text-xs font-medium text-gray-800">{item.category}</span>
        {item.brand && <span className="truncate text-xs text-gray-500">{item.brand}</span>}
      </div>
    </Link>
  )
}

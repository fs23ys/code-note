import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ClosetItem } from '../types'
import { ItemCard } from './ItemCard'

export function SortableItemCard({ item }: { item: ClosetItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <ItemCard item={item} />
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="ドラッグして並び替え"
        className="absolute left-1 top-1 flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded-full bg-black/50 text-xs text-white active:cursor-grabbing"
      >
        ≡
      </button>
    </div>
  )
}

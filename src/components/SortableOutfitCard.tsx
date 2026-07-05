import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { OutfitCard } from './OutfitCard'
import type { ClosetItem, Outfit } from '../types'

export function SortableOutfitCard({ outfit, items }: { outfit: Outfit; items: ClosetItem[] }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: outfit.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <OutfitCard outfit={outfit} items={items} />
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded bg-white/80 text-sm text-gray-500 shadow-sm hover:bg-white"
      >
        ≡
      </button>
    </div>
  )
}

import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Category, ClosetItem } from '../types'

function SortableThumb({ item, onRemove }: { item: ClosetItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const photo = item.photos[item.mainPhotoIndex] ?? item.photos[0]
  return (
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0">
      <div
        {...attributes}
        {...listeners}
        className="h-16 w-16 cursor-grab touch-none overflow-hidden rounded-lg border-2 border-indigo-400"
      >
        {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-xs leading-none text-white hover:bg-red-500"
      >
        ×
      </button>
    </div>
  )
}

interface OutfitItemPickerProps {
  items: ClosetItem[]
  categories: Category[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function OutfitItemPicker({ items, categories, selectedIds, onChange }: OutfitItemPickerProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const selectedItems = selectedIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is ClosetItem => Boolean(item))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = selectedIds.indexOf(active.id as string)
    const newIndex = selectedIds.indexOf(over.id as string)
    onChange(arrayMove(selectedIds, oldIndex, newIndex))
  }

  const toggleItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onChange(selectedIds.filter((id) => id !== itemId))
    } else {
      onChange([...selectedIds, itemId])
    }
  }

  // カテゴリ順にグループ化
  const itemsByCategory = new Map<string, ClosetItem[]>()
  items.forEach((item) => {
    const list = itemsByCategory.get(item.category) ?? []
    list.push(item)
    itemsByCategory.set(item.category, list)
  })

  const groups: { id: string; name: string; items: ClosetItem[] }[] = []
  categories.forEach((cat) => {
    const catItems = itemsByCategory.get(cat.id)
    if (catItems && catItems.length > 0) {
      groups.push({ id: cat.id, name: cat.name, items: catItems })
      itemsByCategory.delete(cat.id)
    }
  })
  itemsByCategory.forEach((catItems, key) => {
    groups.push({ id: key, name: key, items: catItems })
  })

  return (
    <div className="flex flex-col gap-4">
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-500">選択中 {selectedIds.length}点 — ドラッグで並び替え</p>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedIds} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {selectedItems.map((item) => (
                  <SortableThumb key={item.id} item={item} onRemove={() => toggleItem(item.id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500">{group.name}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7">
              {group.items.map((item) => {
                const selected = selectedIds.includes(item.id)
                const photo = item.photos[item.mainPhotoIndex] ?? item.photos[0]
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                      selected ? 'border-indigo-500' : 'border-gray-200'
                    }`}
                  >
                    {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                    {selected && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

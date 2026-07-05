import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { OutfitCard } from '../components/OutfitCard'
import { SortableOutfitCard } from '../components/SortableOutfitCard'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'
import { reorderOutfits } from '../lib/outfits'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function formatYearMonth(year: number, month: number) {
  return `${year}年${month + 1}月`
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function OutfitListPage() {
  const { user } = useAuth()
  const { items } = useItems(user?.uid)
  const { outfits, loading } = useOutfits(user?.uid)

  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const sortedOutfits = useMemo(() => [...outfits].sort((a, b) => a.order - b.order), [outfits])

  const wornDateMap = useMemo(() => {
    const map = new Map<string, string[]>()
    outfits.forEach((outfit) => {
      outfit.wornDates.forEach((date) => {
        const list = map.get(date) ?? []
        list.push(outfit.id)
        map.set(date, list)
      })
    })
    return map
  }, [outfits])

  const displayedOutfits = useMemo(() => {
    if (!selectedDate) return sortedOutfits
    return outfits.filter((o) => o.wornDates.includes(selectedDate))
  }, [selectedDate, sortedOutfits, outfits])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!user || !over || active.id === over.id) return
    const oldIndex = sortedOutfits.findIndex((o) => o.id === active.id)
    const newIndex = sortedOutfits.findIndex((o) => o.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorderOutfits(user.uid, arrayMove(sortedOutfits, oldIndex, newIndex))
  }

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1) }
    else setCalendarMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1) }
    else setCalendarMonth((m) => m + 1)
  }

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay()
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">コーデ一覧</h2>
        <div className="flex gap-2">
          <Link
            to="/outfits/suggest"
            className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            🎲 自動提案
          </Link>
          <Link
            to="/outfits/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 新規作成
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => { setShowCalendar((v) => !v); setSelectedDate(null) }}
        className="self-start rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
      >
        {showCalendar ? 'カレンダーを閉じる' : '📅 着用カレンダー'}
      </button>

      {showCalendar && (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="rounded p-1 hover:bg-gray-100 text-gray-600">‹</button>
            <span className="text-sm font-bold text-gray-700">{formatYearMonth(calendarYear, calendarMonth)}</span>
            <button type="button" onClick={nextMonth} className="rounded p-1 hover:bg-gray-100 text-gray-600">›</button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`pb-1 text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />
              const dateStr = toDateString(calendarYear, calendarMonth, day)
              const hasOutfit = wornDateMap.has(dateStr)
              const isSelected = selectedDate === dateStr
              const dow = (firstDayOfWeek + day - 1) % 7
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate((prev) => (prev === dateStr ? null : dateStr))}
                  className={`flex flex-col items-center rounded-lg py-1 text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100'
                  } ${!isSelected && dow === 0 ? 'text-red-400' : ''} ${!isSelected && dow === 6 ? 'text-blue-400' : ''}`}
                >
                  {day}
                  {hasOutfit && (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-600">{selectedDate} 着用のコーデ {(wornDateMap.get(selectedDate) ?? []).length}件</span>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-xs text-gray-400 hover:text-gray-600">
                選択解除
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-xs text-gray-400">左上の「≡」をドラッグすると並び順を変更できます</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : displayedOutfits.length === 0 ? (
        <p className="text-sm text-gray-400">
          {selectedDate ? `${selectedDate} に着用したコーデはありません` : '保存済みのコーデがありません'}
        </p>
      ) : selectedDate ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayedOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} items={items} />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedOutfits.map((o) => o.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {sortedOutfits.map((outfit) => (
                <SortableOutfitCard key={outfit.id} outfit={outfit} items={items} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

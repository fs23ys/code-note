import { Link } from 'react-router-dom'
import { OutfitCard } from '../components/OutfitCard'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useOutfits } from '../hooks/useOutfits'

export function OutfitListPage() {
  const { user } = useAuth()
  const { items } = useItems(user?.uid)
  const { outfits, loading } = useOutfits(user?.uid)

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

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : outfits.length === 0 ? (
        <p className="text-sm text-gray-400">保存済みのコーデがありません</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} items={items} />
          ))}
        </div>
      )}
    </div>
  )
}

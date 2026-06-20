import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth()

  if (!loading && user) {
    return <Navigate to="/items" replace />
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <h1 className="text-2xl font-bold text-gray-800">Code Note</h1>
      <p className="text-sm text-gray-500">クローゼット管理アプリ</p>
      <button
        onClick={() => loginWithGoogle()}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
      >
        Googleでログイン
      </button>
    </div>
  )
}

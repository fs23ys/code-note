import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/items', label: '服一覧', icon: '👕' },
  { to: '/outfits', label: 'コーデ', icon: '🧥' },
  { to: '/outfits/suggest', label: '提案', icon: '🎲' },
  { to: '/settings', label: '設定', icon: '⚙️' },
]

function navLinkClass(isActive: boolean) {
  return [
    'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
    'md:flex-row md:gap-2 md:text-sm md:rounded-lg md:px-3 md:py-2',
    isActive ? 'text-indigo-600 md:bg-indigo-50' : 'text-gray-500 hover:text-indigo-500',
  ].join(' ')
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full min-h-screen flex-col bg-gray-50 md:flex-row">
      <header className="hidden border-r border-gray-200 bg-white px-4 py-6 md:flex md:w-56 md:flex-col md:gap-6">
        <h1 className="px-2 text-lg font-bold text-gray-800">Code Note</h1>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClass(isActive)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
            <p className="truncate px-2 text-xs text-gray-500">{user.displayName}</p>
            <button
              onClick={logout}
              className="rounded-lg px-2 py-1 text-left text-xs text-gray-500 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </div>
        )}
      </header>

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <h1 className="text-base font-bold text-gray-800">Code Note</h1>
        {user && (
          <button onClick={logout} className="text-xs text-gray-500">
            ログアウト
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-gray-200 bg-white md:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex-1 py-2 ${navLinkClass(isActive)}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

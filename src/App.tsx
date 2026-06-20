import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { ItemListPage } from './pages/ItemListPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { ItemNewPage } from './pages/ItemNewPage'
import { OutfitListPage } from './pages/OutfitListPage'
import { OutfitDetailPage } from './pages/OutfitDetailPage'
import { OutfitNewPage } from './pages/OutfitNewPage'
import { OutfitSuggestPage } from './pages/OutfitSuggestPage'
import { SettingsPage } from './pages/SettingsPage'

function Protected({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/items" replace />} />
      <Route
        path="/items"
        element={
          <Protected>
            <ItemListPage />
          </Protected>
        }
      />
      <Route
        path="/items/new"
        element={
          <Protected>
            <ItemNewPage />
          </Protected>
        }
      />
      <Route
        path="/items/:itemId"
        element={
          <Protected>
            <ItemDetailPage />
          </Protected>
        }
      />
      <Route
        path="/outfits"
        element={
          <Protected>
            <OutfitListPage />
          </Protected>
        }
      />
      <Route
        path="/outfits/new"
        element={
          <Protected>
            <OutfitNewPage />
          </Protected>
        }
      />
      <Route
        path="/outfits/suggest"
        element={
          <Protected>
            <OutfitSuggestPage />
          </Protected>
        }
      />
      <Route
        path="/outfits/:outfitId"
        element={
          <Protected>
            <OutfitDetailPage />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected>
            <SettingsPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  )
}

export default App

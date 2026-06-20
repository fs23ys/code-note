export interface ClosetItem {
  id: string
  photos: string[]
  mainPhotoIndex: number
  category: string
  brand?: string
  store?: string
  price?: number
  memo?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type ClosetItemInput = Omit<ClosetItem, 'id' | 'createdAt' | 'updatedAt'>

export interface Outfit {
  id: string
  name?: string
  itemIds: string[]
  tags: string[]
  memo?: string
  createdAt: number
  updatedAt: number
}

export type OutfitInput = Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>

export interface Category {
  id: string
  name: string
  order: number
}

export const DEFAULT_CATEGORY_NAMES = [
  'トップス',
  'ボトムス',
  'アウター',
  '靴',
  'バッグ',
  '帽子',
  'アクセサリー',
  'その他',
] as const

export const UNCATEGORIZED_NAME = 'その他'

import { describe, expect, it } from 'vitest'
import { generateOutfitSuggestion } from '../outfitSuggest'
import type { ClosetItem, Outfit } from '../../types'

function makeItem(overrides: Partial<ClosetItem> & { id: string; category: string }): ClosetItem {
  return {
    photos: ['photo.jpg'],
    mainPhotoIndex: 0,
    tags: [],
    order: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

function sequentialRng(values: number[]): () => number {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
}

describe('generateOutfitSuggestion', () => {
  const items: ClosetItem[] = [
    makeItem({ id: 'top1', category: 'トップス', tags: ['夏', 'カジュアル'] }),
    makeItem({ id: 'top2', category: 'トップス', tags: ['冬'] }),
    makeItem({ id: 'bottom1', category: 'ボトムス', tags: ['夏', 'カジュアル'] }),
    makeItem({ id: 'bottom2', category: 'ボトムス', tags: ['冬'] }),
    makeItem({ id: 'shoe1', category: '靴', tags: ['夏', 'カジュアル'] }),
    makeItem({ id: 'shoe2', category: '靴', tags: ['冬'] }),
  ]

  it('必須カテゴリ(トップス/ボトムス/靴)が不足している場合はnullを返す', () => {
    const partialItems = items.filter((item) => item.category !== '靴')
    const result = generateOutfitSuggestion(partialItems, [])
    expect(result).toBeNull()
  })

  it('必須カテゴリそれぞれから1着ずつ選出される', () => {
    const result = generateOutfitSuggestion(items, [], { rng: Math.random })
    expect(result).not.toBeNull()
    expect(result!.itemIds).toHaveLength(3)
    const categories = result!.itemIds.map(
      (id) => items.find((item) => item.id === id)!.category,
    )
    expect(new Set(categories)).toEqual(new Set(['トップス', 'ボトムス', '靴']))
  })

  it('既存コーデと完全に同じ組み合わせは提案されない', () => {
    // 任意カテゴリが無い状態なので、必須カテゴリの組み合わせは2通り(夏セット/冬セット)のみ
    const existingOutfits: Outfit[] = [
      {
        id: 'o1',
        itemIds: ['top1', 'bottom1', 'shoe1'],
        tags: [],
        wornDates: [],
        order: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    ]

    for (let trial = 0; trial < 20; trial++) {
      const result = generateOutfitSuggestion(items, existingOutfits, {
        candidateCount: 50,
      })
      expect(result).not.toBeNull()
      expect([...result!.itemIds].sort().join('|')).not.toBe(['top1', 'bottom1', 'shoe1'].sort().join('|'))
    }
  })

  it('タグの一致数が多い組み合わせほど高いスコアになる', () => {
    // 夏セット(top1/bottom1/shoe1)は3着ともタグが2つ一致するため、冬セットよりスコアが高い
    const rng = sequentialRng([
      0, 0, 0, // 候補1: top1, bottom1, shoe1 (夏セット, index0)
      0.99, 0.99, 0.99, // 候補2: top2, bottom2, shoe2 (冬セット, index1)
    ])
    const result = generateOutfitSuggestion(items, [], {
      requiredCategories: ['トップス', 'ボトムス', '靴'],
      optionalCategories: [],
      candidateCount: 2,
      topPoolSize: 1,
      rng,
    })
    expect(result).not.toBeNull()
    expect([...result!.itemIds].sort()).toEqual(['bottom1', 'shoe1', 'top1'].sort())
    expect(result!.score).toBeGreaterThan(0)
  })

  it('アイテムが十分にあればnullにならない', () => {
    for (let i = 0; i < 10; i++) {
      const result = generateOutfitSuggestion(items, [])
      expect(result).not.toBeNull()
    }
  })
})

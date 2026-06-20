import type { ClosetItem, Outfit } from '../types'

export interface SuggestOptions {
  /** これらのカテゴリから必ず1着ずつ選出する */
  requiredCategories: string[]
  /** これらのカテゴリは抽選で追加するかどうかを決める */
  optionalCategories: string[]
  /** 各任意カテゴリを追加する確率(0〜1) */
  optionalProbability: number
  /** 内部で生成する候補の数(多いほどスコアの高い組み合わせを見つけやすい) */
  candidateCount: number
  /** スコア上位何件からランダムに1つ選ぶか */
  topPoolSize: number
  /** 乱数生成器。テスト時は決定的な関数を注入できる */
  rng: () => number
}

const defaultOptions: SuggestOptions = {
  requiredCategories: ['トップス', 'ボトムス', '靴'],
  optionalCategories: ['アウター', 'バッグ', '帽子', 'アクセサリー'],
  optionalProbability: 0.5,
  candidateCount: 30,
  topPoolSize: 5,
  rng: Math.random,
}

export interface OutfitSuggestion {
  itemIds: string[]
  score: number
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function groupByCategory(items: ClosetItem[]): Map<string, ClosetItem[]> {
  const map = new Map<string, ClosetItem[]>()
  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }
  return map
}

function scoreCombination(items: ClosetItem[]): number {
  let score = 0
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const tagsA = new Set(items[i].tags)
      const common = items[j].tags.filter((tag) => tagsA.has(tag))
      score += common.length
    }
  }
  return score
}

function signature(itemIds: string[]): string {
  return [...itemIds].sort().join('|')
}

/**
 * トップス/ボトムス/靴などの必須カテゴリから1着ずつ、アウター等の任意カテゴリから
 * 抽選で選んだ服を組み合わせ、タグの一致度でスコアリングした上位候補からランダムに1つ返す。
 * 既存の保存済みコーデと完全に一致する組み合わせは除外する。
 */
export function generateOutfitSuggestion(
  items: ClosetItem[],
  existingOutfits: Outfit[],
  options?: Partial<SuggestOptions>,
): OutfitSuggestion | null {
  const opts: SuggestOptions = { ...defaultOptions, ...options }
  const byCategory = groupByCategory(items)

  for (const category of opts.requiredCategories) {
    if (!byCategory.get(category)?.length) return null
  }

  const existingSignatures = new Set(existingOutfits.map((outfit) => signature(outfit.itemIds)))

  const candidates: OutfitSuggestion[] = []
  const seenSignatures = new Set<string>()

  for (let i = 0; i < opts.candidateCount; i++) {
    const chosen: ClosetItem[] = []

    for (const category of opts.requiredCategories) {
      chosen.push(pickRandom(byCategory.get(category)!, opts.rng))
    }

    for (const category of opts.optionalCategories) {
      const candidatesInCategory = byCategory.get(category)
      if (!candidatesInCategory?.length) continue
      if (opts.rng() < opts.optionalProbability) {
        chosen.push(pickRandom(candidatesInCategory, opts.rng))
      }
    }

    const itemIds = chosen.map((item) => item.id)
    const sig = signature(itemIds)

    if (existingSignatures.has(sig) || seenSignatures.has(sig)) continue
    seenSignatures.add(sig)

    candidates.push({ itemIds, score: scoreCombination(chosen) })
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => b.score - a.score)
  const topPool = candidates.slice(0, Math.max(1, opts.topPoolSize))
  return pickRandom(topPool, opts.rng)
}

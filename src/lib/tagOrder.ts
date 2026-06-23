export const TAG_GROUPS = [
  { label: 'シーン', tags: ['オフィス', 'デート', 'お出かけ', '旅行'] },
  { label: '季節', tags: ['春', '夏', '秋', '冬'] },
  { label: 'スタイル', tags: ['きれいめ', 'ストリート', 'モノトーン', 'シンプル', '甘め'] },
]

const TAG_PRIORITY = TAG_GROUPS.flatMap((group) => group.tags)

const PRIORITY_INDEX = new Map(TAG_PRIORITY.map((tag, index) => [tag, index]))

/** あらかじめ決めたシーン→季節→スタイルの順で並べ、それ以外のタグは末尾に50音順で続ける */
export function sortTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const indexA = PRIORITY_INDEX.get(a)
    const indexB = PRIORITY_INDEX.get(b)
    if (indexA !== undefined && indexB !== undefined) return indexA - indexB
    if (indexA !== undefined) return -1
    if (indexB !== undefined) return 1
    return a.localeCompare(b, 'ja')
  })
}

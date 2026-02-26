import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })
const DATABASE_ID = process.env.NOTION_DATABASE_ID

// category 名 -> 目录路径（固定映射，其余自动生成）
const CATEGORY_MAP = {
  'Steam':  'guide/steam',
  'VPS':    'guide/vps',
  'Docker': 'guide/docker',
  '资源':   'resources',
}

function categoryToDir(category) {
  if (CATEGORY_MAP[category]) return CATEGORY_MAP[category]
  // 未知分类：直接用分类名作为目录（保留中文）
  return `posts/${category}`
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-') || 'misc'
}

async function resolveBlocks(mdBlocks, pageId) {
  // 如果 notion-to-md 返回空（synced_block 等），直接用 blocks API 读原始内容
  const str = n2m.toMarkdownString(mdBlocks)
  if (str && str.parent && str.parent.trim()) return str.parent

  // fallback：直接读 block children 转文本
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId })
    const lines = []
    for (const block of blocks.results) {
      const text = extractText(block)
      if (text) lines.push(text)

      // synced_block：读其 source 的 children
      if (block.type === 'synced_block') {
        const sourceId = block.synced_block?.synced_from?.block_id || block.id
        try {
          const inner = await notion.blocks.children.list({ block_id: sourceId })
          for (const b of inner.results) {
            const t = extractText(b)
            if (t) lines.push(t)
          }
        } catch {}
      }
    }
    return lines.join('\n\n') || '*（暂无内容）*'
  } catch {
    return '*（暂无内容）*'
  }
}

function extractText(block) {
  const type = block.type
  const content = block[type]
  if (!content) return ''
  const richText = content.rich_text || []
  const text = richText.map(t => t.plain_text).join('')
  if (!text) return ''

  switch (type) {
    case 'heading_1': return `# ${text}`
    case 'heading_2': return `## ${text}`
    case 'heading_3': return `### ${text}`
    case 'bulleted_list_item': return `- ${text}`
    case 'numbered_list_item': return `1. ${text}`
    case 'code': return `\`\`\`\n${text}\n\`\`\``
    case 'quote': return `> ${text}`
    default: return text
  }
}

async function sync() {
  console.log('Fetching pages from Notion...')

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: { property: '状态', checkbox: { equals: true } },
  })

  console.log(`Found ${response.results.length} published pages`)

  // 收集所有文章信息，按目录分组
  const dirMap = {}  // dir -> [{ title, slug, file }]

  for (const page of response.results) {
    const props = page.properties
    const title = props['名称']?.title?.[0]?.plain_text || 'untitled'
    const slug = props['Slug']?.rich_text?.[0]?.plain_text || slugify(title)
    const category = props['Category']?.select?.name || '其他'
    const dir = categoryToDir(category)

    // 处理 synced_block：先展开再转换
    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const resolved = await resolveBlocks(mdBlocks, page.id)
    const mdContent = resolved || '*（暂无内容）*'

    const output = `# ${title}\n\n${mdContent}`

    const outDir = path.resolve(__dirname, dir)
    fs.mkdirSync(outDir, { recursive: true })
    const outFile = path.join(outDir, `${slug}.md`)
    fs.writeFileSync(outFile, output, 'utf-8')
    console.log(`Written: ${dir}/${slug}.md`)

    if (!dirMap[dir]) dirMap[dir] = { category, items: [] }
    dirMap[dir].items.push({ title, slug, dir })
  }

  // 更新 config.mts 侧边栏
  updateConfig(dirMap)
  console.log('Sync complete.')
}

function updateConfig(dirMap) {
  const configPath = path.resolve(__dirname, '.vitepress/config.mts')
  let config = fs.readFileSync(configPath, 'utf-8')

  // 构建新的侧边栏对象
  // 先提取固定侧边栏（非 posts 目录）
  const fixedSidebars = {
    '/guide/steam/': buildSidebarItems('guide/steam', 'Steam'),
    '/guide/vps/': buildSidebarItems('guide/vps', 'VPS'),
    '/guide/docker/': buildSidebarItems('guide/docker', 'Docker'),
    '/resources/': buildSidebarItems('resources', '资源'),
  }

  // 动态生成 posts 子目录侧边栏
  const dynamicSidebars = {}
  for (const [dir, info] of Object.entries(dirMap)) {
    if (dir.startsWith('posts/')) {
      const key = `/${dir}/`
      dynamicSidebars[key] = buildSidebarItems(dir, info.category)
    }
  }

  const allSidebars = { ...fixedSidebars, ...dynamicSidebars }

  // 生成侧边栏代码字符串
  const sidebarStr = JSON.stringify(allSidebars, null, 6)
    .replace(/"([^"]+)":/g, "'$1':")   // key 用单引号
    .replace(/"/g, "'")                 // value 用单引号

  // 替换 config 里的 sidebar 块
  const newConfig = config.replace(
    /sidebar:\s*\{[\s\S]*?\n    \},/,
    `sidebar: ${sidebarStr},`
  )

  if (newConfig !== config) {
    fs.writeFileSync(configPath, newConfig, 'utf-8')
    console.log('Updated config.mts sidebar')
  }
}

function buildSidebarItems(dir, label) {
  const fullDir = path.resolve(__dirname, dir)
  if (!fs.existsSync(fullDir)) return [{ text: label, items: [] }]

  const files = fs.readdirSync(fullDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const slug = f.replace('.md', '')
      const content = fs.readFileSync(path.join(fullDir, f), 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)/m)
      const title = titleMatch ? titleMatch[1] : slug
      return { text: title, link: `/${dir}/${slug === 'index' ? '' : slug}` }
    })

  // index 放第一个
  const index = files.find(f => f.link === `/${dir}/`)
  const rest = files.filter(f => f.link !== `/${dir}/`)
  const items = index ? [{ text: '概览', link: `/${dir}/` }, ...rest] : rest

  return [{ text: label, items }]
}

sync().catch(err => {
  console.error(err)
  process.exit(1)
})

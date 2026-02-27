import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })
const DATABASE_ID = process.env.NOTION_DATABASE_ID

const CATEGORY_MAP = {
  'Steam':    'guide/steam',
  'VPS':      'guide/vps',
  'Docker':   'guide/docker',
  '资源':     'resources',
  '__about__': '__about__',
}

// 不出现在教程下拉栏的分类
const NAV_EXCLUDE = ['资源']

function categoryToDir(category) {
  return CATEGORY_MAP[category] || `posts/${category}`
}
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '').replace(/\-+/g, '-') || 'untitled'
}

// ── 解析 Notion blocks ──────────────────────────────────────
async function resolveBlocks(mdBlocks, pageId) {
  const str = n2m.toMarkdownString(mdBlocks)
  if (str && str.parent && str.parent.trim()) {
    return await enrichWithTables(str.parent, pageId)
  }
  return await blocksToMarkdown(pageId)
}

// 按原始块顺序重建 Markdown，表格插入正确位置
async function enrichWithTables(md, pageId) {
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId })
    const hasTable = blocks.results.some(b => b.type === 'table')
    if (!hasTable) return md

    // 重新按顺序构建，n2m 输出的非表格内容 + 表格按位置插入
    const parts = []
    for (const block of blocks.results) {
      if (block.type === 'table') {
        parts.push(await tableToMarkdown(block.id))
      } else {
        // 用 n2m 单独转换此 block
        try {
          const mdBlocks = await n2m.blocksToMarkdown([block])
          const str = n2m.toMarkdownString(mdBlocks)
          if (str?.parent?.trim()) parts.push(str.parent.trim())
        } catch {
          const t = extractText(block)
          if (t) parts.push(t)
        }
      }
    }
    return parts.join('\n\n') || md
  } catch {
    return md
  }
}

async function tableToMarkdown(tableBlockId) {
  const rows = await notion.blocks.children.list({ block_id: tableBlockId })
  const lines = []
  rows.results.forEach((row, i) => {
    const cells = row.table_row.cells.map(cell =>
      cell.map(rt => {
        let text = rt.plain_text
        if (rt.href) text = `[${text}](${rt.href})`
        if (rt.annotations?.bold) text = `**${text}**`
        if (rt.annotations?.code) text = `\`${text}\``
        return text
      }).join('')
    )
    lines.push(`| ${cells.join(' | ')} |`)
    if (i === 0) lines.push(`| ${cells.map(() => '---').join(' | ')} |`)
  })
  return lines.join('\n')
}

async function blocksToMarkdown(pageId) {
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId })
    const lines = []
    for (const block of blocks.results) {
      if (block.type === 'table') {
        lines.push(await tableToMarkdown(block.id))
      } else if (block.type === 'synced_block') {
        const sourceId = block.synced_block?.synced_from?.block_id || block.id
        try {
          const inner = await notion.blocks.children.list({ block_id: sourceId })
          for (const b of inner.results) {
            if (b.type === 'table') {
              lines.push(await tableToMarkdown(b.id))
            } else {
              const t = extractText(b)
              if (t) lines.push(t)
            }
          }
        } catch {}
      } else {
        const t = extractText(block)
        if (t) lines.push(t)
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

// 需要管理的目录（同步时会做删除检查）
const MANAGED_DIRS = [
  'guide/steam',
  'guide/vps',
  'guide/docker',
  'resources',
]

// 这些文件不会被自动删除（手写的，不来自 Notion）
const PROTECTED_FILES = new Set([
  'guide/steam/index.md',
  'guide/vps/index.md',
  'guide/docker/index.md',
  'posts/index.md',
])

// ── 主同步逻辑 ───────────────────────────────────────────────
async function sync() {
  console.log('Fetching pages from Notion...')

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: { property: '状态', checkbox: { equals: true } },
  })

  console.log(`Found ${response.results.length} published pages`)

  const dirMap = {}
  // 记录本次 Notion 里有的文件路径
  const notionFiles = new Set()

  for (const page of response.results) {
    const props = page.properties
    const title    = props['名称']?.title?.[0]?.plain_text || 'untitled'
    const slug     = props['Slug']?.rich_text?.[0]?.plain_text || slugify(title)
    const category = props['Category']?.select?.name || '其他'
    const dir      = categoryToDir(category)

    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdContent = await resolveBlocks(mdBlocks, page.id)

    // 站长页特殊处理
    if (category === '__about__') {
      writeAboutPage(mdContent)
      continue
    }

    const output = `# ${title}\n\n${mdContent}`

    const outDir = path.resolve(__dirname, dir)
    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, `${slug}.md`), output, 'utf-8')
    console.log(`Written: ${dir}/${slug}.md`)

    notionFiles.add(`${dir}/${slug}.md`)
    if (!dirMap[dir]) dirMap[dir] = { category, items: [] }
    dirMap[dir].items.push({ title, slug, dir })
  }

  // 删除 Notion 里已不存在的文件
  deleteStaleFiles(notionFiles, dirMap)

  updateConfig(dirMap)
  generateIndex(dirMap)
  console.log('Sync complete.')
}

// ── 站长页模板渲染 ────────────────────────────────────────────
function writeAboutPage(notionContent) {
  const bioMatch     = notionContent.match(/简介[:：]\s*(.+)/m)
  const tagsMatch    = notionContent.match(/标签[:：]\s*(.+)/m)
  const idMatch      = notionContent.match(/ID[:：]\s*(.+)/m)
  const avatarMatch  = notionContent.match(/头像[:：]\s*(.+)/m)
  const aboutMatch   = notionContent.match(/## 关于这个站\n+([\s\S]+?)(?=\n##|$)/)
  const contactMatch = notionContent.match(/## 联系方式\n+([\s\S]+?)(?=\n##|$)/)
  const techMatch    = notionContent.match(/## 技术栈\n+([\s\S]+?)(?=\n##|$)/)

  const bio     = bioMatch?.[1]?.trim()  || '折腾是第一生产力。喜欢把复杂的东西搞清楚，然后用最简单的话写出来。'
  const tags    = (tagsMatch?.[1]?.split(/[,，\s]+/).filter(Boolean)) || ['全栈开发', 'Linux', '自托管', '开源']
  const uid     = idMatch?.[1]?.trim()   || '阿巴'
  const avatar  = avatarMatch?.[1]?.trim() || '/avatar.png'
  const about   = aboutMatch?.[1]?.trim() || 'aba-aba 是一个记录折腾过程的地方。'
  const contact = contactMatch?.[1]?.trim() || '| GitHub | [github.com/aba-aba-de](https://github.com/aba-aba-de) |\n| Email | hi@aba-aba.de |'
  const tech    = techMatch?.[1]?.trim() || '- [VitePress](https://vitepress.dev) — 静态站点生成器\n- [Cloudflare Pages](https://pages.cloudflare.com) — 托管与 CDN'

  const tagSpans = tags.map(t => `  <span class="tag">${t.trim()}</span>`).join('\n')

  const output = `# 站长

<div class="about-page">

<div class="profile">
  <img class="avatar" src="${avatar}" alt="${uid}" />
  <div class="profile-info">
    <h2 class="name">${uid}</h2>
    <p class="bio">${bio}</p>
    <div class="tags">
${tagSpans}
    </div>
  </div>
</div>

---

## 关于这个站

${about}

---

## 联系方式

| 平台 | 地址 |
|---|---|
${contact}

---

## 本站构建于

${tech}

</div>

<style>
.about-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
}
.profile {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--vp-c-bg-soft);
}
.profile-info { flex: 1; }
.name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 0.5rem;
  border: none;
  padding: 0;
}
.bio {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.75;
  margin: 0 0 1rem;
}
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag {
  font-size: 0.78rem;
  padding: 0.25rem 0.65rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: monospace;
}
@media (max-width: 480px) {
  .profile { flex-direction: column; gap: 1.25rem; }
  .about-page { padding: 2rem 1.25rem 4rem; }
}
</style>
`
  fs.writeFileSync(path.resolve(__dirname, 'about.md'), output, 'utf-8')
  console.log('Written: about.md')
}

// ── 删除已从 Notion 移除的文件 ───────────────────────────────
function deleteStaleFiles(notionFiles, dirMap) {
  // 扫描固定目录
  const dirsToCheck = [
    ...MANAGED_DIRS,
    ...Object.keys(dirMap).filter(d => d.startsWith('posts/')),
  ]

  for (const dir of dirsToCheck) {
    const fullDir = path.resolve(__dirname, dir)
    if (!fs.existsSync(fullDir)) continue
    for (const file of fs.readdirSync(fullDir)) {
      if (!file.endsWith('.md')) continue
      const relPath = `${dir}/${file}`
      if (PROTECTED_FILES.has(relPath)) continue
      if (!notionFiles.has(relPath)) {
        fs.unlinkSync(path.resolve(__dirname, relPath))
        console.log(`Deleted: ${relPath}`)
      }
    }
  }

  // 扫描 posts/* 动态目录，清理空目录
  const postsDir = path.resolve(__dirname, 'posts')
  if (fs.existsSync(postsDir)) {
    for (const sub of fs.readdirSync(postsDir)) {
      if (sub === 'index.md') continue
      const subDir = path.join(postsDir, sub)
      if (!fs.statSync(subDir).isDirectory()) continue
      const remaining = fs.readdirSync(subDir).filter(f => f.endsWith('.md'))
      if (remaining.length === 0) {
        fs.rmdirSync(subDir)
        console.log(`Removed empty dir: posts/${sub}`)
      }
    }
  }
}

// ── 生成全站索引页 ────────────────────────────────────────────
function generateIndex(dirMap) {
  const fixedSections = [
    { dir: 'guide/steam',  label: 'Steam' },
    { dir: 'guide/vps',    label: 'VPS' },
    { dir: 'guide/docker', label: 'Docker' },
  ]

  let md = `---\nlayout: page\n---\n\n# 所有文章\n\n`

  // 固定分类
  for (const { dir, label } of fixedSections) {
    const fullDir = path.resolve(__dirname, dir)
    if (!fs.existsSync(fullDir)) continue
    const files = getFiles(dir)
    if (!files.length) continue
    md += `## ${label}\n\n`
    for (const { title, link } of files) {
      md += `- [${title}](${link})\n`
    }
    md += '\n'
  }

  // 动态分类
  for (const [dir, info] of Object.entries(dirMap)) {
    if (dir.startsWith('posts/')) {
      const files = getFiles(dir)
      if (!files.length) continue
      md += `## ${info.category}\n\n`
      for (const { title, link } of files) {
        md += `- [${title}](${link})\n`
      }
      md += '\n'
    }
  }

  fs.mkdirSync(path.resolve(__dirname, 'posts'), { recursive: true })
  fs.writeFileSync(path.resolve(__dirname, 'posts/index.md'), md, 'utf-8')
  console.log('Generated posts/index.md')
}

function getFiles(dir) {
  const fullDir = path.resolve(__dirname, dir)
  if (!fs.existsSync(fullDir)) return []
  return fs.readdirSync(fullDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => {
      const slug = f.replace('.md', '')
      const content = fs.readFileSync(path.join(fullDir, f), 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)/m)
      const title = titleMatch ? titleMatch[1].trim() : slug
      return { title, link: `/${dir}/${slug}` }
    })
}

// ── 更新 config.mts ──────────────────────────────────────────
function updateConfig(dirMap) {
  const configPath = path.resolve(__dirname, '.vitepress/config.mts')
  let config = fs.readFileSync(configPath, 'utf-8')

  // ── 侧边栏（全局数组，支持折叠）
  const fixedSections = [
    { dir: 'guide/steam',  label: 'Steam' },
    { dir: 'guide/vps',    label: 'VPS' },
    { dir: 'guide/docker', label: 'Docker' },
    { dir: 'resources',    label: '资源' },
  ]

  const sidebar = []

  for (const { dir, label } of fixedSections) {
    const section = buildSidebarSection(dir, label)
    if (section) sidebar.push(section)
  }

  for (const [dir, info] of Object.entries(dirMap)) {
    if (dir.startsWith('posts/')) {
      const section = buildSidebarSection(dir, info.category)
      if (section) sidebar.push(section)
    }
  }

  const sidebarStr = JSON.stringify(sidebar, null, 6)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")

  config = config.replace(
    /sidebar:\s*\[[\s\S]*?\],/,
    `sidebar: ${sidebarStr},`
  )

  // ── 导航栏教程下拉（动态）
  const navTutorialItems = [
    ...fixedSections
      .filter(s => !NAV_EXCLUDE.includes(s.label))
      .map(s => `{ text: '${s.label}', link: '/${s.dir}/' }`),
    ...Object.entries(dirMap)
      .filter(([dir]) => dir.startsWith('posts/'))
      .map(([dir, info]) => `{ text: '${info.category}', link: '/${dir}/' }`),
  ]

  const navItemsStr = navTutorialItems.join(',\n          ')

  config = config.replace(
    /\{\s*text:\s*['"]教程['"]\s*,\s*items:\s*\[[\s\S]*?\]\s*\}/,
    `{ text: '教程', items: [\n          ${navItemsStr},\n        ] }`
  )

  fs.writeFileSync(configPath, config, 'utf-8')
  console.log('Updated config.mts')
}

function buildSidebarSection(dir, label) {
  const fullDir = path.resolve(__dirname, dir)
  if (!fs.existsSync(fullDir)) return null

  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'))
  if (!files.length) return null

  const items = files.map(f => {
    const slug = f.replace('.md', '')
    const content = fs.readFileSync(path.join(fullDir, f), 'utf-8')
    const titleMatch = content.match(/^#\s+(.+)/m)
    const title = titleMatch ? titleMatch[1].trim() : slug
    const link = slug === 'index' ? `/${dir}/` : `/${dir}/${slug}`
    return { text: slug === 'index' ? '概览' : title, link }
  })

  // index 排最前
  const index = items.find(i => i.link === `/${dir}/`)
  const rest = items.filter(i => i.link !== `/${dir}/`)
  const sorted = index ? [index, ...rest] : items

  return { text: label, collapsed: false, items: sorted }
}

sync().catch(err => {
  console.error(err)
  process.exit(1)
})

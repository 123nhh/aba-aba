import { Client } from '@notionhq/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DATABASE_ID = process.env.NOTION_DATABASE_ID

// 目录 -> Category 名映射
const DIR_CATEGORY_MAP = {
  'guide/steam':  'Steam',
  'guide/vps':    'VPS',
  'guide/docker': 'Docker',
  'resources':    '资源',
}

// 扫描所有 md 文件
function scanFiles() {
  const result = []
  for (const [dir, category] of Object.entries(DIR_CATEGORY_MAP)) {
    const fullDir = path.resolve(__dirname, dir)
    if (!fs.existsSync(fullDir)) continue
    for (const file of fs.readdirSync(fullDir)) {
      if (!file.endsWith('.md')) continue
      const slug = file.replace('.md', '')
      const content = fs.readFileSync(path.join(fullDir, file), 'utf-8')
      const titleMatch = content.match(/^#\s+(.+)/m)
      const title = titleMatch ? titleMatch[1].trim() : slug
      // 去掉第一行标题，剩余为正文
      const body = content.replace(/^#\s+.+\n?/, '').trim()
      result.push({ title, slug, category, body, dir })
    }
  }
  return result
}

// 把 markdown 文本拆成 Notion blocks
function mdToBlocks(md) {
  const lines = md.split('\n')
  const blocks = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      blocks.push(heading(3, line.slice(4)))
    } else if (line.startsWith('## ')) {
      blocks.push(heading(2, line.slice(3)))
    } else if (line.startsWith('# ')) {
      blocks.push(heading(1, line.slice(2)))
    } else if (line.startsWith('> ')) {
      blocks.push(quote(line.slice(2)))
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push(bullet(line.slice(2)))
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push(numbered(line.replace(/^\d+\.\s/, '')))
    } else if (line.startsWith('```')) {
      // 代码块：收集到下一个 ```
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(code(codeLines.join('\n')))
    } else if (line.startsWith('---')) {
      blocks.push(divider())
    } else if (line.trim() === '') {
      // 空行跳过
    } else {
      blocks.push(paragraph(line))
    }
  }

  return blocks
}

function richText(text) {
  // 简单处理 **bold** 和 `code`
  return [{ type: 'text', text: { content: text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1') } }]
}

function heading(level, text) {
  const type = `heading_${level}`
  return { object: 'block', type, [type]: { rich_text: richText(text) } }
}

function paragraph(text) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: richText(text) } }
}

function bullet(text) {
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(text) } }
}

function numbered(text) {
  return { object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: richText(text) } }
}

function quote(text) {
  return { object: 'block', type: 'quote', quote: { rich_text: richText(text) } }
}

function code(text) {
  return { object: 'block', type: 'code', code: { rich_text: [{ type: 'text', text: { content: text } }], language: 'plain text' } }
}

function divider() {
  return { object: 'block', type: 'divider', divider: {} }
}

async function push() {
  const files = scanFiles()
  console.log(`Found ${files.length} files to push`)

  // 查询已有页面，避免重复创建
  const existing = await notion.databases.query({ database_id: DATABASE_ID })
  const existingSlugs = new Set(
    existing.results.map(p => p.properties['Slug']?.rich_text?.[0]?.plain_text).filter(Boolean)
  )

  for (const { title, slug, category, body } of files) {
    if (existingSlugs.has(slug)) {
      console.log(`Skip (exists): ${slug}`)
      continue
    }

    // 创建 Database 条目
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        '名称': { title: [{ text: { content: title } }] },
        'Slug':     { rich_text: [{ text: { content: slug } }] },
        'Category': { select: { name: category } },
        '状态':     { checkbox: true },
      },
    })

    // 写入正文 blocks（每次最多 100 个）
    const blocks = mdToBlocks(body)
    for (let i = 0; i < blocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: blocks.slice(i, i + 100),
      })
    }

    console.log(`Pushed: [${category}] ${title}`)
  }

  console.log('Done.')
}

push().catch(err => {
  console.error(err)
  process.exit(1)
})

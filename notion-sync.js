const { Client } = require('@notionhq/client')
const { NotionToMarkdown } = require('notion-to-md')
const fs = require('fs')
const path = require('path')

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

const DATABASE_ID = process.env.NOTION_DATABASE_ID

// Category -> 输出目录映射
const CATEGORY_MAP = {
  'Steam':  'guide/steam',
  'VPS':    'guide/vps',
  'Docker': 'guide/docker',
  '资源':   'resources',
  '其他':   'posts',
}

async function sync() {
  console.log('Fetching pages from Notion...')

  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
  })

  console.log(`Found ${response.results.length} published pages`)

  for (const page of response.results) {
    const props = page.properties

    // 读取字段
    const title = props.Name?.title?.[0]?.plain_text || 'untitled'
    const slug = props.Slug?.rich_text?.[0]?.plain_text || slugify(title)
    const category = props.Category?.select?.name || '其他'
    const dir = CATEGORY_MAP[category] || 'posts'

    // 转换 Notion 页面为 Markdown
    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdContent = n2m.toMarkdownString(mdBlocks).parent

    // 拼接 frontmatter
    const output = `# ${title}\n\n${mdContent}`

    // 写入文件
    const outDir = path.resolve(__dirname, dir)
    fs.mkdirSync(outDir, { recursive: true })
    const outFile = path.join(outDir, `${slug}.md`)
    fs.writeFileSync(outFile, output, 'utf-8')
    console.log(`Written: ${outFile}`)
  }

  console.log('Sync complete.')
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-+/g, '-')
}

sync().catch(err => {
  console.error(err)
  process.exit(1)
})

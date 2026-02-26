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

    const title = props.Name?.title?.[0]?.plain_text || 'untitled'
    const slug = props.Slug?.rich_text?.[0]?.plain_text || slugify(title)
    const category = props.Category?.select?.name || '其他'
    const dir = CATEGORY_MAP[category] || 'posts'

    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdContent = n2m.toMarkdownString(mdBlocks).parent

    const output = `# ${title}\n\n${mdContent}`

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

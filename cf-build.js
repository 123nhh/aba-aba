const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, '.vitepress/dist')
const dest = path.resolve(__dirname, 'dist')

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, entry.name)
    const destPath = path.join(to, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyDir(src, dest)
console.log('Copied .vitepress/dist -> dist')

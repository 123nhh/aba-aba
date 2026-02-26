import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "aba-aba",
  description: "技术折腾与资源指南",
  base: '/',

  themeConfig: {
    // ─── 导航栏 ───────────────────────────────────────
    nav: [
      { text: '首页', link: '/' },
      {
        text: '教程',
        items: [
          { text: 'Steam', link: '/guide/steam/' },
          { text: 'VPS', link: '/guide/vps/' },
          { text: 'Docker', link: '/guide/docker/' },
        ]
      },
      { text: '资源', link: '/resources/awesome-list' },
      { text: '站长', link: '/about' },
    ],

    // ─── 侧边栏（按路径分组）──────────────────────────
    sidebar: {
      '/guide/steam/': [
        {
          text: 'Steam',
          items: [
            { text: '概览', link: '/guide/steam/' },
            { text: '下载与安装', link: '/guide/steam/install' },
            { text: '加速方案对比', link: '/guide/steam/accelerator' },
            { text: '购买避坑指南', link: '/guide/steam/purchase' },
          ]
        }
      ],
      '/guide/vps/': [
        {
          text: 'VPS',
          items: [
            { text: '概览', link: '/guide/vps/' },
            { text: '选购指南', link: '/guide/vps/buy' },
            { text: '初始化服务器', link: '/guide/vps/setup' },
          ]
        }
      ],
      '/guide/docker/': [
        {
          text: 'Docker',
          items: [
            { text: '概览', link: '/guide/docker/' },
            { text: '安装 Docker', link: '/guide/docker/install' },
            { text: '常用命令速查', link: '/guide/docker/commands' },
          ]
        }
      ],
      '/resources/': [
        {
          text: '资源',
          items: [
            { text: '精选资源', link: '/resources/awesome-list' },
          ]
        }
      ],
    },

    // ─── 其他配置 ──────────────────────────────────────
    socialLinks: [
      { icon: 'github', link: 'https://github.com/aba-aba-de' }
    ],

    footer: {
      message: '用阿巴阿巴的方式讲清楚',
      copyright: 'aba-aba'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '本页目录',
      level: [2, 3]
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  }
})

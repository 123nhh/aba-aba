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

    // ─── 侧边栏（全局，显示所有分类）─────────────────
    sidebar: [
      {
            text: 'Steam',
            items: [
                  {
                        text: '概览',
                        link: '/guide/steam/'
                  },
                  {
                        text: 'Steam 加速方案对比',
                        link: '/guide/steam/accelerator'
                  },
                  {
                        text: '如何下载并安装 Steam',
                        link: '/guide/steam/install'
                  },
                  {
                        text: 'Steam 购买游戏避坑指南',
                        link: '/guide/steam/purchase'
                  }
            ]
      },
      {
            text: 'VPS',
            items: [
                  {
                        text: '概览',
                        link: '/guide/vps/'
                  },
                  {
                        text: 'VPS 选购指南',
                        link: '/guide/vps/buy'
                  },
                  {
                        text: '初始化服务器',
                        link: '/guide/vps/setup'
                  }
            ]
      },
      {
            text: 'Docker',
            items: [
                  {
                        text: '概览',
                        link: '/guide/docker/'
                  },
                  {
                        text: 'Docker 常用命令速查',
                        link: '/guide/docker/commands'
                  },
                  {
                        text: '安装 Docker',
                        link: '/guide/docker/install'
                  }
            ]
      },
      {
            text: '资源',
            items: [
                  {
                        text: '精选资源',
                        link: '/resources/awesome-list'
                  }
            ]
      },
      {
            text: '建站',
            items: [
                  {
                        text: 'cf SssS优选',
                        link: '/posts/建站/SaaS'
                  }
            ]
      }
],

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  }
})

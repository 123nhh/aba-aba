---
layout: page
---

<div class="posts-page">
  <div class="posts-header">
    <h1 class="posts-title">所有文章</h1>
    <p class="posts-desc">记录折腾的过程，沉淀可复用的知识。</p>
  </div>

  <div class="posts-section">
    <h2 class="section-label">Steam</h2>
    <div class="posts-grid">
      <a href="/guide/steam/accelerator" class="post-card">
        <span class="post-card-title">Steam 加速方案对比</span>
        <span class="post-card-arrow">→</span>
      </a>
      <a href="/guide/steam/install" class="post-card">
        <span class="post-card-title">如何下载并安装 Steam</span>
        <span class="post-card-arrow">→</span>
      </a>
      <a href="/guide/steam/purchase" class="post-card">
        <span class="post-card-title">Steam 购买游戏避坑指南</span>
        <span class="post-card-arrow">→</span>
      </a>
    </div>
  </div>

  <div class="posts-section">
    <h2 class="section-label">VPS</h2>
    <div class="posts-grid">
      <a href="/guide/vps/buy" class="post-card">
        <span class="post-card-title">VPS 选购指南</span>
        <span class="post-card-arrow">→</span>
      </a>
      <a href="/guide/vps/setup" class="post-card">
        <span class="post-card-title">初始化服务器</span>
        <span class="post-card-arrow">→</span>
      </a>
    </div>
  </div>

  <div class="posts-section">
    <h2 class="section-label">Docker</h2>
    <div class="posts-grid">
      <a href="/guide/docker/commands" class="post-card">
        <span class="post-card-title">Docker 常用命令速查</span>
        <span class="post-card-arrow">→</span>
      </a>
      <a href="/guide/docker/install" class="post-card">
        <span class="post-card-title">安装 Docker</span>
        <span class="post-card-arrow">→</span>
      </a>
    </div>
  </div>

  <div class="posts-section">
    <h2 class="section-label">建站</h2>
    <div class="posts-grid">
      <a href="/posts/建站/SaaS" class="post-card">
        <span class="post-card-title">cf SssS优选</span>
        <span class="post-card-arrow">→</span>
      </a>
    </div>
  </div>
</div>

<style>
.VPPage {
  background-color: var(--bg);
  min-height: 100vh;
}

.posts-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 5rem 2rem 6rem;  /* 80px / 32px / 96px */
}

.posts-header {
  margin-bottom: 4rem;  /* 64px */
  border-bottom: 1px solid var(--border);
  padding-bottom: 2rem;  /* 32px */
}

.posts-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 0.5rem;  /* 8px */
  letter-spacing: 0.02em;
}

.posts-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
  font-weight: 300;
}

.posts-section {
  margin-bottom: 2.5rem;  /* 40px — 8px grid */
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-family: var(--font-mono, monospace);
  margin: 0 0 0.75rem;  /* 12px */
  border: none;
  padding: 0;
}

.posts-grid {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
}

.post-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;  /* 14px — close to 8px grid */
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  /* transform 代替 padding-left，避免 layout reflow */
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateX(6px);
}

.post-card-title {
  font-size: 0.95rem;
  color: var(--text-main);
  font-weight: 400;
  line-height: 1.5;
}

.post-card-arrow {
  font-size: 0.9rem;
  color: var(--text-dim);
  flex-shrink: 0;
  margin-left: 1rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.post-card:hover .post-card-arrow {
  transform: translateX(4px);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .posts-page {
    padding: 3.5rem 1.5rem 4rem;
  }

  .posts-title {
    font-size: 1.5rem;  /* 24px */
  }
}
</style>

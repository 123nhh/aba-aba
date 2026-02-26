# 站长

<div class="about-page">

<div class="profile">
  <img class="avatar" src="/avatar.png" alt="阿巴" />
  <div class="profile-info">
    <h2 class="name">阿巴</h2>
    <p class="bio">折腾是第一生产力。喜欢把复杂的东西搞清楚，然后用最简单的话写出来。</p>
    <div class="tags">
  <span class="tag">全栈开发</span>
  <span class="tag">Linux</span>
  <span class="tag">自托管</span>
  <span class="tag">开源</span>
    </div>
  </div>
</div>

---

## 关于这个站

aba-aba 是一个记录折腾过程的地方。内容没有固定方向，什么折腾了就写什么——可能是一篇部署教程，可能是一个用了很久才发现的好工具，也可能只是一个踩坑记录。


写作原则只有一条：写给一年前的自己看。那时候不懂的，现在写清楚。

---

## 联系方式

| 平台 | 地址 |
|---|---|
GitHub | [github.com/aba-aba-de](https://github.com/aba-aba-de)


Email | hi@aba-aba.de

---

## 本站构建于

- VitePress — 静态站点生成器
- Cloudflare Pages — 托管与 CDN
- 源码托管于 GitHub，每次 push 自动部署

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

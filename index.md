---
layout: page
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    const titleEl = document.querySelector('#hero-dynamic-text')
    if (!titleEl) return

    const words = ['阿巴阿巴', 'aba-aba', '探索与记录']
    let wordIndex = 0
    let charIndex = words[0].length
    let isDeleting = true

    const type = () => {
      const currentWord = words[wordIndex % words.length]
      if (isDeleting) {
        titleEl.textContent = currentWord.substring(0, charIndex - 1)
        charIndex--
      } else {
        titleEl.textContent = currentWord.substring(0, charIndex + 1)
        charIndex++
      }
      let typingSpeed = isDeleting ? 80 : 150
      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 3500
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        wordIndex++
        typingSpeed = 800
      }
      setTimeout(type, typingSpeed)
    }
    setTimeout(type, 1500)
  }, 100)
})
</script>

<div class="clean-hero">
  <div class="hero-content">
    <h1 class="hero-title">
      <span id="hero-dynamic-text">阿巴阿巴</span><span class="cursor">_</span>
    </h1>
    <p class="hero-subtitle">将折腾的乐趣与实用的资源，沉淀为清晰的知识脉络。</p>
    <div class="hero-actions">
      <a href="/posts/" class="btn-primary">开始阅读</a>
      <a href="/resources/awesome-list" class="btn-secondary">浏览资源</a>
    </div>
  </div>
</div>

<div class="clean-features">
  <div class="feature-card">
    <div class="feature-icon">01.</div>
    <h3>清晰指南</h3>
    <p>剥离冗余的修饰，回归内容本身。用最平实的语言记录每次开发与部署的真实过程。</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">02.</div>
    <h3>精选收录</h3>
    <p>整理散落的优质工具与脚本。保持克制，只分享那些真正能提升效率的实用资源。</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">03.</div>
    <h3>专注体验</h3>
    <p>摒弃繁杂的视觉干扰。运用大面积留白与舒适的对比度，如同摄影构图一般，让阅读保持专注与宁静。</p>
  </div>
</div>

<style>
.VPPage {
  background-color: var(--bg);
  min-height: 100vh;
}

/* ---------- Hero ---------- */
.clean-hero {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 7rem 1.5rem 5rem;
  text-align: center;
}

.hero-content {
  width: 100%;
  max-width: 720px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.05em;
  margin: 0 0 1.25rem;
  line-height: 1.2;
}

.cursor {
  font-weight: 300;
  color: var(--text-dim);
  animation: fade 2s step-end infinite;
}

@keyframes fade {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto 2.5rem;
  line-height: 1.9;
  font-weight: 300;
}

/* ---------- 按钮 ---------- */
.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-actions a {
  display: inline-block;
  padding: 0.65rem 1.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--btn-primary-bg);
}

.btn-primary:hover {
  background-color: var(--btn-primary-hover);
  border-color: var(--btn-primary-hover);
  color: var(--btn-primary-text);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: var(--btn-secondary-text);
  border-color: var(--btn-secondary-border);
}

.btn-secondary:hover {
  border-color: var(--btn-secondary-hover-border);
  color: var(--btn-secondary-text);
  background-color: rgba(128, 128, 128, 0.06);
}

/* ---------- Features ---------- */
.clean-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 3rem;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem 6rem;
}

.feature-card {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  transition: border-color 0.25s ease;
}

.feature-card:hover {
  border-top-color: var(--text-muted);
}

.feature-icon {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 1.25rem;
  font-family: monospace;
  letter-spacing: 0.05em;
}

.feature-card h3 {
  font-size: 1.05rem;
  color: var(--text-main);
  margin: 0 0 0.75rem;
  font-weight: 500;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.75;
  margin: 0;
}

/* ---------- 手机端响应式 ---------- */
@media (max-width: 768px) {
  .clean-hero {
    padding: 5rem 1.25rem 3.5rem;
  }

  .hero-title {
    font-size: 2rem;
    letter-spacing: 0.02em;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-actions a {
    width: 100%;
    max-width: 280px;
    text-align: center;
  }

  .clean-features {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1.25rem 4rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }
}
</style>

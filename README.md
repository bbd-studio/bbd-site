# bbd.sh — Build · Bootstrap · Deliver

> 极客孵化工作室的官网 + build log。Astro + Tailwind，SSG（静态生成），SEO 满分起点。

## 设计哲学

- **Anti-SaaS aesthetic**：终端 + 杂志混搭，不要紫蓝渐变 + 三栏 card
- **Mono + Display + Sans**：JetBrains Mono / Fraunces / Inter 三组字体反差
- **Color**：纯黑 + 暖白 + 电光绿（#00ff88）+ 炉火橙（#ff5e3a）—— 没有任何 indigo / purple
- **Motion**：极简，只有终端光标闪烁 + 状态点呼吸

## 启动

```bash
cd bbd-site
npm install   # or pnpm install / bun install
npm run dev   # → http://localhost:4321
```

## 部署到 Cloudflare Pages

1. 把项目 push 到 GitHub repo（推荐 `bbd-sh/bbd-site`）
2. Cloudflare Dashboard → Pages → Connect to Git → 选这个 repo
3. Build command: `npm run build`
4. Build output directory: `dist`
5. 把 `bbd.sh` 域名指向 Cloudflare Pages（CNAME）

完成后 5 分钟内全球 Edge 节点上线，HTTPS 自动配置。

## 文件结构

```
bbd-site/
├── astro.config.mjs              # Astro 配置（含 sitemap 自动生成）
├── tailwind.config.mjs           # Tailwind 自定义色 + 字体
├── package.json
├── public/
│   ├── robots.txt                # 含全部 AI 爬虫白名单
│   ├── llms.txt                  # AI 助手专用产品介绍
│   └── favicon.svg               # SVG 图标
└── src/
    ├── styles/global.css         # Tailwind + 自定义 utilities
    ├── layouts/Base.astro        # 含全套 SEO meta + Schema.org JSON-LD
    ├── components/
    │   ├── Header.astro
    │   └── Footer.astro
    └── pages/
        ├── index.astro           # 首页（Hero + Manifesto + Workflow + AI + Lab + Notebook + CTA）
        ├── work.astro            # 怎么干活
        ├── lab.astro             # 孵化中项目实时状态
        ├── about.astro           # 我们是谁
        ├── contact.astro         # 投递 idea
        └── notebook/
            ├── index.astro       # build log 列表
            └── day-zero.astro    # 第一篇博客
```

## SEO 已做的事

- [x] 完整 meta（title / description / OG / Twitter / canonical）
- [x] Schema.org JSON-LD（Organization + WebSite）
- [x] robots.txt（含 AI 爬虫白名单）
- [x] sitemap.xml（@astrojs/sitemap 自动生成）
- [x] llms.txt（AI 助手友好）
- [x] SSG 静态生成（不是 SPA，Google 一次抓取直接拿到完整 HTML）
- [x] 移动 friendly + 响应式
- [x] 自托管字体（preconnect + display=swap）
- [x] 语义化 HTML（h1/h2/h3 层级 + article/section）

## 上线后必做（24h 内）

1. **Google Search Console** 验证 https://search.google.com/search-console
2. **Bing Webmaster Tools** 验证 https://www.bing.com/webmasters
3. 提交 sitemap：`https://bbd.sh/sitemap-index.xml`
4. URL Inspection → "Request Indexing" 主页和 Day Zero 博客
5. **Wikidata** 创建 bbd.sh 实体（让 AI 助手认识我们）
6. **GitHub Org** `bbd-sh` 注册
7. **X handle** `@bbd_sh` 注册
8. **LinkedIn Company Page** 创建
9. **Crunchbase** 公司页提交（审核 1-2 周）

## 内容运营节奏

每周一发一篇 notebook update（数据 + 故事 + 下周计划）。连续 26 周不断。

---

Made by humans, with AI, for humans.

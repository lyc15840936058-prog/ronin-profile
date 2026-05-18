# RONIN.SYS — AI Native PM Portfolio

> 一个 ENFP 产品经理的源代码 —— 用作品本身证明 AI native。

[ronin](https://github.com/) / 李雨晨 的个人 web 简历。本站既是简历，也是想法本身的第一性证明：**未来的简历不是 PDF，是一个 web link，让公司的招聘 AI 可读**。

## 站点结构

| 页面 | 内容 |
|---|---|
| `/` | 主页 · Loading 入场 + 游戏化 hero |
| `/player` | 角色档案 · 身份 / Roadmap / 能力雷达 / 照片墙 |
| `/quest-log` | 工作经历 · 字节 / DJI / 小红书 |
| `/idea-lab` | 创业 idea · 已上线 + 草稿池 |
| `/ronin-agent` | 灵魂副本 · LLM 驱动的 ronin 对话 agent |
| `/sync-test` | 默契挑战 · 10 题人格 quiz |
| `/contact` | 联系方式 |
| `/llms.txt` | 给 AI 招聘 agent 的结构化站点摘要 |

## 技术栈

- **前端**：纯 HTML/CSS/JS，无框架。Tailwind ?  Nah —— 全手写 CSS。
- **后端**：Vercel Serverless Function (`/api/chat.js`)，调用 Anthropic Claude API
- **LLM**：Claude Sonnet 4.5，system prompt 是 `奇伢理念2.md`（ronin 的 10 章产品哲学）
- **字体**：Bebas Neue · Permanent Marker · Smokum · Special Elite · JetBrains Mono · Noto Sans SC
- **AI native 设计原则**：每页底部有 `▷ AI AGENT? START HERE` 折叠协议块；根目录有 `llms.txt`

## 本地开发

```bash
npm install -g vercel
vercel dev
```

打开 http://localhost:3000

## 部署

```bash
vercel --prod
```

**必须配置的环境变量**：
- `ANTHROPIC_API_KEY` — ronin 自己的 Anthropic API key，用来跑 `/ronin-agent` 的真实 LLM 对话

在 Vercel Dashboard → Settings → Environment Variables 添加。

## 致谢

- Powered by **Claude** & **Codex** & **vibecoding native**
- 设计灵感：prodmaverick / bensweet / vitex-tech / pengwei-portfolio / clawpair / Resident Evil 9 主菜单
- HTML/CSS/JS 全部由 ronin × Claude 在本机 vibecoding 出来

---

© 2026 RONIN · 李雨晨 · ALL RIGHTS RESERVED

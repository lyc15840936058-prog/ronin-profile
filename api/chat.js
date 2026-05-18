// Vercel serverless function: /api/chat
// Proxies user message to Anthropic Claude using ronin's persona prompt.
// Required env var: ANTHROPIC_API_KEY

import fs from 'fs';
import path from 'path';

const SYSTEM_PROMPT_TEMPLATE = `You are ronin's "soul echo" — an AI agent that talks like ronin (李雨晨), a 26-year-old AI-native product manager.

## 身份事实

- 中文名：李雨晨 / 英文名：Ronin / 小红书花名：奇伢
- 26 岁，2000 年生，ENFP + 双鱼
- 985 大连理工大学软件工程毕业（2018-2022）
- 字节抖音主架构 PM 实习（2021.05，本地生活 0→1）
- DJI 大疆 IBG 全栈 PM（2022.06 - 2025.05，3 年主线，To C/B/E 三栖）
- 小红书 企业智能部 + RPG 培训生（2025.06 - 至今）
- 荣誉：DJI-IBG 产品之星 · 13 次评估 1S + 9A · DJI uni 黑客松全场 2nd + 最佳创意奖 · 小红书 RPG 全司 10 人选拔
- 绩效：试用期 2 个月转正 3.75；半年 3.5+；全年（8 个月 vs 12 个月）3.5+
- 喜欢：HUNTER × HUNTER 奇伢、宝可梦振翼发、王者荣耀蚩尤、巴萨内马尔、滑雪、踢球、东北喜剧
- 有一只叫嘻嘻的猫

## 个性化能力体系

- AI 思维 95 / 亲手建造 (vibecoding) 93 / 产品判断 92 / 跨域抽象 90 / 数据洞察 88 / 设计审美 85
- 弱项坦白：系统理性 72（ENFP 双鱼，偶尔被 "vibe 对了" 绕过严谨论证）；长期耐心 78

## 语气样本（务必模仿这种说话方式）

- 直接、不装、有时候带兄弟味
- 聊产品时认真有锋，会用"先别急着做功能，先确认方向有没有站住"这种句式
- 经常说"我"，不要写得像第三人称介绍
- 不用拗口华丽的辞藻，多用大白话 + 关键概念
- 偶尔用括号小补充：( ´▽｀)
- 不要用"作为 AI"、"作为 ronin 的 agent"这种第三人称破壁话

## 产品理念底座（必须以下面这套理念为判断基础）

{{IDEOLOGY}}

## 回答规则

1. 用第一人称（"我"）说话，像 ronin 本人在聊
2. 保留多视角（理念 4.2 Plurality by Default）—— 不要给单一最大公约数答案
3. 涉及私人问题（弱点、弱项），回答真实、不漂亮化（理念 4.5 Reality Anchoring）
4. 简洁。一段话能说清的不要写五段
5. 用中文回答，除非用户用英文问
6. 不要每次都生硬地引用理念章节号，自然把观点融入回答
7. 如果问题与 ronin / 产品 / AI / 工作 / 价值观完全无关，礼貌引导回到他能聊的话题`;

let CACHED_SYSTEM = null;
function loadSystemPrompt() {
  if (CACHED_SYSTEM) return CACHED_SYSTEM;
  try {
    const md = fs.readFileSync(path.join(process.cwd(), '奇伢理念2.md'), 'utf-8');
    CACHED_SYSTEM = SYSTEM_PROMPT_TEMPLATE.replace('{{IDEOLOGY}}', md);
  } catch (e) {
    CACHED_SYSTEM = SYSTEM_PROMPT_TEMPLATE.replace('{{IDEOLOGY}}', '(理念文档加载失败 — 走简化 system prompt)');
  }
  return CACHED_SYSTEM;
}

export default async function handler(req, res) {
  // CORS — allow same origin and dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const message = body?.message?.trim();
  if (!message) return res.status(400).json({ error: 'Missing or empty `message`.' });
  if (message.length > 2000) return res.status(400).json({ error: 'Message too long (max 2000 chars).' });

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: loadSystemPrompt(),
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return res.status(502).json({ error: `Anthropic API error (${anthropicRes.status})` });
    }

    const data = await anthropicRes.json();
    const reply = data?.content?.[0]?.text || '(空回复)';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

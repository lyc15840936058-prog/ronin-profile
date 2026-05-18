#!/usr/bin/env bash
# RONIN.SYS — one-shot deploy script
# Usage: bash deploy.sh [github_repo_name]

set -e
cd "$(dirname "$0")"

REPO_NAME="${1:-ronin-sys}"

echo ""
echo "╭──────────────────────────────────────────────╮"
echo "│  RONIN.SYS · DEPLOY                          │"
echo "│  github repo  : $REPO_NAME                       "
echo "│  target       : vercel + anthropic claude   │"
echo "╰──────────────────────────────────────────────╯"
echo ""

# ============ STEP 0: tool check ============
need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "✘ 缺少 $1"
    echo "  安装：$2"
    MISSING=1
  else
    echo "✓ $1 已安装"
  fi
}
MISSING=0
echo "── STEP 0/4 · checking tools ──"
need git    "通常 macOS 自带，没有的话装 Xcode CLT: xcode-select --install"
need gh     "brew install gh   (或 https://cli.github.com/)"
need npm    "brew install node  (npm 跟 node 一起)"
need vercel "npm install -g vercel"
if [ "$MISSING" = "1" ]; then
  echo ""
  echo "请装完上面缺的工具再重跑这个脚本。"
  exit 1
fi
echo ""

# ============ STEP 1: git init + commit ============
echo "── STEP 1/4 · git init + commit ──"
if [ ! -d .git ]; then
  git init -b main
  echo "✓ git init"
else
  echo "✓ .git 已存在"
fi
git add -A
if git diff --cached --quiet; then
  echo "✓ 没有新改动"
else
  git commit -m "Initial commit: RONIN.SYS v1.0 — AI native PM portfolio" || true
  echo "✓ committed"
fi
echo ""

# ============ STEP 2: GitHub repo ============
echo "── STEP 2/4 · github repo ──"
if ! gh auth status >/dev/null 2>&1; then
  echo "需要先登录 GitHub:"
  gh auth login
fi

# create repo if it doesn't exist
if gh repo view "$REPO_NAME" >/dev/null 2>&1; then
  echo "✓ repo '$REPO_NAME' 已存在，跳过创建"
  # ensure remote is set
  if ! git remote get-url origin >/dev/null 2>&1; then
    OWNER=$(gh api user --jq .login)
    git remote add origin "git@github.com:$OWNER/$REPO_NAME.git" || \
      git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  fi
  git push -u origin main
else
  echo "创建 public repo: $REPO_NAME"
  gh repo create "$REPO_NAME" --public --source=. --push --description "ronin / 李雨晨 的 AI native PM portfolio"
fi
REPO_URL="https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo "✓ pushed to: $REPO_URL"
echo ""

# ============ STEP 3: Vercel deploy ============
echo "── STEP 3/4 · vercel deploy ──"
if [ ! -f .vercel/project.json ]; then
  echo "首次部署，需要 vercel login + 项目链接……"
  vercel --yes || true
fi
DEPLOY_URL=$(vercel --prod --yes 2>&1 | tail -1)
echo "✓ deployed: $DEPLOY_URL"
echo ""

# ============ STEP 4: ANTHROPIC_API_KEY ============
echo "── STEP 4/4 · 配 ANTHROPIC_API_KEY ──"
echo ""
echo "现在你需要配置 Anthropic API key 让 /api/chat 真正工作。"
echo ""
echo "选项 A · 命令行（会提示你粘贴 key，输入完按 Ctrl+D，然后选三个环境）："
echo ""
echo "    vercel env add ANTHROPIC_API_KEY"
echo ""
echo "    选环境时三个都勾上：Production / Preview / Development"
echo ""
echo "选项 B · 网页（更可视化）："
echo ""
echo "    打开 https://vercel.com 进入项目 → Settings → Environment Variables"
echo "    Key: ANTHROPIC_API_KEY"
echo "    Value: 你的 sk-ant-... key"
echo "    Environments: 全选"
echo ""
echo "配完之后再跑一次让环境变量生效："
echo ""
echo "    vercel --prod --yes"
echo ""
echo "╭──────────────────────────────────────────────╮"
echo "│  ✓ DONE                                       │"
echo "│  github : $REPO_URL"
echo "│  vercel : $DEPLOY_URL"
echo "╰──────────────────────────────────────────────╯"

name: "sync-config"
description: "Sync Claude Code config and skills to GitHub"
category: "Utility"

#!/bin/bash
# 同步 Claude Code 配置和技能到 GitHub

cd "$HOME/.claude"

# 检查是否有 Git
if ! command -v git &> /dev/null; then
    echo "Git not found"
    exit 1
fi

# 同步配置
if [ -d ".git" ]; then
    echo "Syncing config..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "No changes"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "Push failed"
fi

# 同步技能
if [ -d "skills/.git" ]; then
    echo "Syncing skills..."
    cd skills
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "No changes"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "Push failed"
fi

echo "Done!"

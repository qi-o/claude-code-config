# Claude Code 配置仓库

这是我的 Claude Code 个人配置仓库，包含自定义的 agents、commands、hooks、plugins 和 rules。

## 📁 仓库结构

```
claude-code-config/
├── CLAUDE.md                    # 全局配置文件（OMC + RTK 指令）
├── settings.json                # Claude Code 设置
├── agents/                      # 自定义 Agent 定义
│   ├── build-error-resolver.md
│   ├── crewai.md
│   ├── data-analyst.md
│   ├── gemini-search.md
│   ├── paper-miner.md
│   ├── rebuttal-writer.md
│   ├── security-reviewer.md
│   └── tdd-guide.md
├── commands/                    # 自定义命令
│   ├── audit.md
│   ├── commit.md
│   ├── normalize.md
│   ├── polish.md
│   └── sync-config.md
├── hooks/                       # Git hooks 和其他钩子
│   ├── gitnexus/               # GitNexus 代码知识图谱
│   ├── hooks.json              # Hook 配置
│   └── skill-forced-eval.js.ref
├── plugins/                     # 插件配置
│   ├── blocklist.json          # 插件黑名单
│   ├── installed_plugins.json  # 已安装插件列表
│   └── known_marketplaces.json # 已知插件市场
└── rules/                       # 编码规则和最佳实践
    ├── anti-patterns.md        # 反模式（禁止项）
    ├── coding-style.md         # 编码风格
    ├── independent-review.md   # 独立审查规则
    ├── security.md             # 安全规则
    ├── testing.md              # 测试规则
    └── writing-quality.md      # 写作质量规则
```

## 🚀 核心功能

### 1. oh-my-claudecode (OMC)
多代理编排系统，提供：
- 专门化 Agent 协调（analyst, architect, debugger, executor, verifier 等）
- 状态管理和持久化
- 团队协作和任务管理
- 项目记忆和笔记本功能

### 2. RTK (Rust Token Killer)
Token 优化命令系统，提供 60-90% 的 token 节省：
- Git 命令优化（59-80% 节省）
- 构建和编译输出过滤（80-90% 节省）
- 测试输出过滤（90-99% 节省）
- 文件和搜索优化（60-75% 节省）

### 3. 自定义 Agents
- **build-error-resolver**: 构建错误专家
- **crewai**: 多智能体协作框架
- **data-analyst**: 实验数据分析
- **gemini-search**: Gemini 搜索集成
- **paper-miner**: 学术论文知识提取
- **rebuttal-writer**: 学术论文审稿回复
- **security-reviewer**: 安全漏洞检测
- **tdd-guide**: TDD 开发指导

### 4. 规则系统
- **独立审查规则**: 产出者 ≠ 审查者原则
- **反模式检测**: 跨领域禁止项清单
- **安全规则**: OWASP Top 10 和最佳实践
- **写作质量**: 学术写作强制审查流程

## 🔧 使用方法

### 安装配置

1. 克隆仓库到本地：
```bash
git clone https://github.com/qi-o/claude-code-config.git
cd claude-code-config
```

2. 将配置文件链接到 Claude Code 配置目录：
```bash
# Windows
mklink /D "C:\Users\<你的用户名>\.claude\config-repo" "路径\到\claude-code-config"

# macOS/Linux
ln -s /path/to/claude-code-config ~/.claude/config-repo
```

3. 更新 `settings.json` 中的 API token：
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "你的_API_KEY"
  }
}
```

### 启用插件

仓库配置了以下核心插件：
- **oh-my-claudecode@omc**: OMC 编排系统
- **superpowers@superpowers-marketplace**: Superpowers 技能市场
- **apify-ultimate-scraper@apify-agent-skills**: Apify 网页抓取

## 📝 自定义配置

### 添加新的 Agent

在 `agents/` 目录下创建新的 `.md` 文件：

```markdown
---
name: my-custom-agent
description: 我的自定义 Agent
model: sonnet
---

# Agent 说明

这里是 Agent 的详细说明...
```

### 添加新的规则

在 `rules/` 目录下创建或编辑 `.md` 文件，遵循现有格式。

### 配置 Hooks

编辑 `hooks/hooks.json` 添加自定义钩子：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": {
          "tool": "Bash",
          "command": "git push"
        },
        "command": "node -e \"console.log('提醒信息')\""
      }
    ]
  }
}
```

## 🔐 安全注意事项

- **不要提交敏感信息**: API keys、tokens、密码等应使用环境变量
- `settings.json` 中的 `ANTHROPIC_AUTH_TOKEN` 已替换为占位符
- 实际使用时需要在本地配置真实的 API token

## 📚 相关资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude/docs)
- [oh-my-claudecode GitHub](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Superpowers Marketplace](https://github.com/obra/superpowers-marketplace)

## 🤝 贡献

这是个人配置仓库，但欢迎参考和借鉴。如有建议或问题，请提 Issue。

## 📄 许可

MIT License

# Visualization Quality Gate

通用可视化输出前检查清单。适用于所有媒介（matplotlib, Graphviz, HTML/SVG, AI 生图）。
与 anti-patterns.md 互补——该文件覆盖代码/写作/测试，本文件覆盖视觉输出。

---

## 通用检查（所有媒介）

### Type Fit
- 选择的图表类型是否匹配信息结构？
- 表格/段落/列表是否能更好地传达？→ 是则不画
- 不要混合两种图表语法——选主轴

### Remove Test
- 能否删除任何元素而不损失理解？→ 能则删
- 能否合并始终一起出现的元素？→ 能则合
- 能否删除布局已暗示的关系线？→ 能则删
- 能否删除颜色/形状已传达的标签？→ 能则删

### Focal Hierarchy
- accent/强调色 ≤2 个元素（适用于概念图/架构图）
- Categorical 多系列数据图不受 accent 限制，但需色盲安全 palette
- 4+ 元素使用 accent = 焦点信号消失
- 彩虹调色板禁止 → 最多 3 色用途（背景、主色、强调色）

### Complexity Budget
- 主要元素 >9 → 拆分为 overview + detail
- 遵循媒介特定限制（见下）
- 超限时不要继续堆叠——拆分

### Universal Anti-Patterns

| Anti-Pattern | Why | Correct |
|---|---|---|
| dark neon cyan/purple glow 作为主美学 | 假"技术感" | 中性色 + 1-2 强调；克制 radial accent 允许 |
| Shadow on elements | 过时 | 1px border |
| border-radius >10px | 不专业 | Max 6-10px 或无 |
| 所有元素相同样式 | 层次消失 | 按语义角色变化 fill/stroke/opacity |
| 3 等宽 summary cards | 模板感 | 变化宽度 |
| Legend 浮在图表内部 | 碰撞 | 外部水平条 |
| Arrow labels 无 masking | 渗透线 | 加 opaque rect 背景 |
| Vertical writing-mode text | 不可读 | 水平标注 |

### Typography
- sans-serif → 人类可读名称/标签
- monospace → 技术内容（端口、URL、命令、字段类型）
- monospace 不作为 blanket "dev" 字体
- 最多 3 字体族（serif + sans + mono）
- Graphviz/matplotlib CJK → Microsoft YaHei / SimHei / Noto Sans CJK fallback stack

---

## 媒介特定检查

### HTML/SVG (触发: pre-render)
- 箭头标签必须有 opaque mask rect
- 箭头先于方框绘制（z-order）
- 禁止 vertical writing-mode
- Legend 底部水平条，不在图内
- 坐标可被 grid unit 整除

### matplotlib (触发: pre-export)
- 移除 top/right spines
- `bbox_inches='tight'` on save
- Panel labels 统一位置
- Publication ≥600 DPI
- 色盲友好调色板（Okabe-Ito or equivalent）

### Graphviz (触发: pre-render)
- cluster subgraph 分组
- `splines=ortho`（组织图）/ `splines=curved`（关系网）
- `ranksep`/`nodesep` 调优
- 中文需设 CJK 字体（Microsoft YaHei, SimHei, Noto Sans CJK）
- >50 节点 → 拆分为子图

### AI 生图 (触发: pre-generation + Level 4 human/vision review)
- 白/浅背景（非 dark+glow）
- Print ≥300 DPI, Screen ≥150 DPI
- Sans-serif ≥10pt 可读
- 色盲安全编码（shape/pattern 冗余）
- DPI 和 color 无法机械验证 → Level 4 人工检查

---

## Cross-References
- 颜色/排版令牌: `~/.claude/references/design-tokens.md`
- AI-slop 文本反模式: `anti-patterns.md`
- 上下文管理: `context-budget.md`

## Rules
- DO 在每次可视化输出前运行此清单
- DO 引用 design-tokens.md 语义角色名，而非 hex 值
- DO NOT 跳过 Remove Test（这是最常被忽略的检查）
- DO NOT 在 >9 元素时不拆分
- DO NOT 对 categorical 多系列数据图强制 accent ≤2 规则

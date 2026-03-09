---
name: crewai-multi-agent
description: 多智能体协作框架，用于自主 AI 协作。在构建专门化代理团队共同处理复杂任务时使用，当您需要基于角色的代理协作并具备记忆功能，或在需要顺序/层次执行的生产工作流中使用。构建时不依赖于 LangChain，以实现精简、快速的执行。
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, CrewAI, Multi-Agent, Orchestration, Collaboration, Role-Based, Autonomous, Workflows, Memory, Production]
dependencies: [crewai>=1.2.0, crewai-tools>=1.2.0]
---

# CrewAI - 多智能体协作框架

构建自主 AI 代理团队，共同协作解决复杂任务。

## 何时使用 CrewAI

**在以下情况下使用 CrewAI：**
- 构建具有专门角色的多智能体系统
- 需要代理之间的自主协作
- 希望基于角色的任务委派（研究员、撰稿人、分析师）
- 需要顺序或层次的过程执行
- 构建具有记忆和可观察性的生产工作流
- 需要比 LangChain/LangGraph 更简单的设置

**主要特性：**
- **独立运行**：无 LangChain 依赖，精简占用
- **基于角色**：代理具有角色、目标和背景故事
- **双重范式**：团队（自主）+ 流程（事件驱动）
- **50+ 工具**：网页抓取、搜索、数据库、AI 服务
- **记忆**：短期、长期和实体记忆
- **生产就绪**：追踪、企业特性

**替代方案：**
- **LangChain**：通用 LLM 应用，RAG 流水线
- **LangGraph**：具有循环的复杂状态工作流
- **AutoGen**：微软生态，多智能体对话
- **LlamaIndex**：文档问答，知识检索

## 快速开始

### 安装

```bash
# 核心框架
pip install crewai

# 包含 50+ 内置工具
pip install 'crewai[tools]'
```

### 使用 CLI 创建项目

```bash
# 创建新的团队项目
crewai create crew my_project
cd my_project

# 安装依赖
crewai install

# 运行团队
crewai run
```

### 简单团队（仅代码）

```python
from crewai import Agent, Task, Crew, Process

# 1. 定义代理
researcher = Agent(
    role="高级研究分析师",
    goal="发现 AI 的前沿发展",
    backstory="您是一位对新兴趋势有敏锐洞察力的专家分析师。",
    verbose=True
)

writer = Agent(
    role="技术撰稿人",
    goal="创建关于技术主题的清晰、引人入胜的内容",
    backstory="您擅长向普通观众解释复杂概念。",
    verbose=True
)

# 2. 定义任务
research_task = Task(
    description="研究 {topic} 的最新发展。找到 5 个关键趋势。",
    expected_output="一份包含 5 个关键趋势的详细报告。",
    agent=researcher
)

write_task = Task(
    description="根据研究结果撰写博客文章。",
    expected_output="一篇 500 字的 markdown 格式博客文章。",
    agent=writer,
    context=[research_task]  # 使用研究输出
)

# 3. 创建并运行团队
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,  # 任务按顺序运行
    verbose=True
)

# 4. 执行
result = crew.kickoff(inputs={"topic": "AI Agents"})
print(result.raw)
```

## 核心概念

### 代理 - 自主工作者

```python
from crewai import Agent

agent = Agent(
    role="数据科学家",                    # 职位/角色
    goal="分析数据以发现洞察",             # 他们的目标
    backstory="统计学博士...",             # 背景信息
    llm="gpt-4o",                         # 使用的 LLM
    tools=[],                             # 可用工具
    memory=True,                          # 启用记忆
    verbose=True,                         # 显示推理过程
    allow_delegation=True,                # 可以委托给他人
    max_iter=15,                          # 最大推理迭代次数
    max_rpm=10                            # 速率限制
)
```

### 任务 - 工作单元

```python
from crewai import Task

task = Task(
    description="分析 2024 年第四季度的销售数据。{context}",
    expected_output="一份包含关键指标和趋势的总结报告。",
    agent=analyst,                        # 指定的代理
    context=[previous_task],              # 来自其他任务的输入
    output_file="report.md",              # 保存到文件
    async_execution=False,                # 同步运行
    human_input=False                      # 不需要人工批准
)
```

### 团队 - 代理团队

```python
from crewai import Crew, Process

crew = Crew(
    agents=[researcher, writer, editor],  # 团队成员
    tasks=[research, write, edit],        # 要完成的任务
    process=Process.sequential,           # 或 Process.hierarchical
    verbose=True,
    memory=True,                          # 启用团队记忆
    cache=True,                           # 缓存工具结果
    max_rpm=10,                           # 速率限制
    share_crew=False                       # 选择加入遥测
)

# 使用输入执行
result = crew.kickoff(inputs={"topic": "AI trends"})

# 访问结果
print(result.raw)                        # 最终输出
print(result.tasks_output)               # 所有任务输出
print(result.token_usage)                # 令牌消耗
```

## 过程类型

### 顺序（默认）

任务按顺序执行，每个代理在下一个代理之前完成其任务：

```python
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential  # 任务 1 → 任务 2 → 任务 3
)
```

### 层次

自动创建一个管理代理，负责委托和协调：

```python
crew = Crew(
    agents=[researcher, writer, analyst],
    tasks=[research_task, write_task, analyze_task],
    process=Process.hierarchical,  # 管理者委托任务
    manager_llm="gpt-4o"           # 管理者使用的 LLM
)
```

## 使用工具

### 内置工具（50+）

```bash
pip install 'crewai[tools]'
```

```python
from crewai_tools import (
    SerperDevTool,           # 网络搜索
    ScrapeWebsiteTool,       # 网页抓取
    FileReadTool,            # 读取文件
    PDFSearchTool,           # 搜索 PDF
    WebsiteSearchTool,       # 搜索网站
    CodeDocsSearchTool,      # 搜索代码文档
    YoutubeVideoSearchTool,  # 搜索 YouTube
)

# 将工具分配给代理
researcher = Agent(
    role="研究员",
    goal="寻找准确的信息",
    backstory="擅长在线寻找数据的专家。",
    tools=[SerperDevTool(), ScrapeWebsiteTool()]
)
```

### 自定义工具

```python
from crewai.tools import BaseTool
from pydantic import Field

class CalculatorTool(BaseTool):
    name: str = "计算器"
    description: str = "执行数学计算。输入：表达式"

    def _run(self, expression: str) -> str:
        try:
            result = eval(expression)
            return f"结果: {result}"
        except Exception as e:
            return f"错误: {str(e)}"

# 使用自定义工具
agent = Agent(
    role="分析师",
    goal="执行计算",
    tools=[CalculatorTool()]
)
```

## YAML 配置（推荐）

### 项目结构

```
my_project/
├── src/my_project/
│   ├── config/
│   │   ├── agents.yaml    # 代理定义
│   │   └── tasks.yaml     # 任务定义
│   ├── crew.py            # 团队组装
│   └── main.py            # 入口点
└── pyproject.toml
```

### agents.yaml

```yaml
researcher:
  role: "{topic} 高级数据研究员"
  goal: "揭示 {topic} 的前沿发展"
  backstory: >
    您是一位经验丰富的研究员，擅长揭示
    {topic} 的最新发展。以寻找相关信息和清晰呈现而闻名。

reporting_analyst:
  role: "报告分析师"
  goal: "根据研究数据创建详细报告"
  backstory: >
    您是一位细致的分析师，通过结构良好的报告将原始数据转化为
    可操作的洞察。
```

### tasks.yaml

```yaml
research_task:
  description: >
    对 {topic} 进行深入研究。
    找到 {year} 的最相关信息。
  expected_output: >
    一份包含 10 个关于 {topic} 的最相关信息的要点列表。
  agent: researcher

reporting_task:
  description: >
    审查研究并创建综合报告。
    重点关注关键发现和建议。
  expected_output: >
    一份 markdown 格式的详细报告，包含执行摘要、发现和建议。
  agent: reporting_analyst
  output_file: report.md
```

### crew.py

```python
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool

@CrewBase
class MyProjectCrew:
    """我的项目团队"""

    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'],
            tools=[SerperDevTool()],
            verbose=True
        )

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_analyst'],
            verbose=True
        )

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config['research_task'])

    @task
    def reporting_task(self) -> Task:
        return Task(
            config=self.tasks_config['reporting_task'],
            output_file='report.md'
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )
```

### main.py

```python
from my_project.crew import MyProjectCrew

def run():
    inputs = {
        'topic': 'AI Agents',
        'year': 2025
    }
    MyProjectCrew().crew().kickoff(inputs=inputs)

if __name__ == "__main__":
    run()
```

## 流程 - 事件驱动的协作

对于具有条件逻辑的复杂工作流，使用流程：

```python
from crewai.flow.flow import Flow, listen, start, router
from pydantic import BaseModel

class MyState(BaseModel):
    confidence: float = 0.0

class MyFlow(Flow[MyState]):
    @start()
    def gather_data(self):
        return {"data": "collected"}

    @listen(gather_data)
    def analyze(self, data):
        self.state.confidence = 0.85
        return analysis_crew.kickoff(inputs=data)

    @router(analyze)
    def decide(self):
        return "high" if self.state.confidence > 0.8 else "low"

    @listen("high")
    def generate_report(self):
        return report_crew.kickoff()

# 运行流程
flow = MyFlow()
result = flow.kickoff()
```

请参阅 [Flows Guide](references/flows.md) 获取完整文档。

## 记忆系统

```python
# 启用所有记忆类型
crew = Crew(
    agents=[researcher],
    tasks=[research_task],
    memory=True,           # 启用记忆
    embedder={             # 自定义嵌入
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)
```

**记忆类型：** 短期（ChromaDB）、长期（SQLite）、实体（ChromaDB）

## LLM 提供者

```python
from crewai import LLM

llm = LLM(model="gpt-4o")                              # OpenAI（默认）
llm = LLM(model="claude-sonnet-4-5-20250929")         # Anthropic
llm = LLM(model="ollama/llama3.1", base_url="http://localhost:11434")  # 本地
llm = LLM(model="azure/gpt-4o", base_url="https://...")              # Azure

agent = Agent(role="分析师", goal="分析数据", llm=llm)
```

## CrewAI 与替代方案比较

| 特性 | CrewAI | LangChain | LangGraph |
|------|--------|-----------|-----------|
| **最佳用途** | 多智能体团队 | 通用 LLM 应用 | 有状态工作流 |
| **学习曲线** | 低 | 中 | 高 |
| **代理范式** | 基于角色 | 基于工具 | 基于图 |
| **记忆** | 内置 | 基于插件 | 自定义 |

## 最佳实践

1. **清晰角色** - 每个代理应具有独特的专业领域
2. **YAML 配置** - 更好地组织大型项目
3. **启用记忆** - 提高任务之间的上下文
4. **设置 max_iter** - 防止无限循环（默认 15）
5. **限制工具** - 每个代理最多 3-5 个工具
6. **速率限制** - 设置 max_rpm 以避免 API 限制

## 常见问题

**代理陷入循环：**
```python
agent = Agent(
    role="...",
    max_iter=10,           # 限制迭代次数
    max_rpm=5              # 速率限制
)
```

**任务未使用上下文：**
```python
task2 = Task(
    description="...",
    context=[task1],       # 明确传递上下文
    agent=writer
)
```

**记忆错误：**
```python
# 使用环境变量进行存储
import os
os.environ["CREWAI_STORAGE_DIR"] = "./my_storage"
```

## 参考文献

- **[Flows Guide](references/flows.md)** - 事件驱动工作流，状态管理
- **[Tools Guide](references/tools.md)** - 内置工具，自定义工具，MCP
- **[Troubleshooting](references/troubleshooting.md)** - 常见问题，调试

## 资源

- **GitHub**: https://github.com/crewAIInc/crewAI (25k+ stars)
- **文档**: https://docs.crewai.com
- **工具**: https://github.com/crewAIInc/crewAI-tools
- **示例**: https://github.com/crewAIInc/crewAI-examples
- **版本**: 1.2.0+
- **许可证**: MIT
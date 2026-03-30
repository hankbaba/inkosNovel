# InkOS CLI 命令参考

> InkOS — 多智能体小说创作系统完整命令手册

## 目录

1. [概述](#概述)
2. [核心命令](#核心命令)
3. [输入治理命令](#输入治理命令)
4. [配置命令](#配置命令)
5. [导入导出命令](#导入导出命令)
6. [辅助命令](#辅助命令)

---

## 概述

InkOS 是一个多智能体自主小说创作 CLI 系统，自动化小说生产的完整流程：规划、写作、审核、修订。支持多种题材（玄幻、仙侠、都市、科幻等）和多种创作形式（续写、同人、仿写）。

### 系统架构

```
用户指令 → CLI → PipelineRunner → 多智能体管道
                      ↓
              ┌─────────────────┐
              │  Radar (情报)   │
              ├─────────────────┤
              │  Planner (规划) │
              ├─────────────────┤
              │ Composer (编译) │
              ├─────────────────┤
              │Architect (架构) │
              ├─────────────────┤
              │  Writer (写作)  │
              ├─────────────────┤
              │Observer (观察)  │
              ├─────────────────┤
              │Reflector (反射) │
              ├─────────────────┤
              │Normalizer (规范)│
              ├─────────────────┤
              │ Auditor (审计)  │
              ├─────────────────┤
              │  Reviser (修订) │
              └─────────────────┘
```

### 长期记忆系统

每本书维护 7 个真相文件：

- `current_state.md` - 世界状态、角色位置、关系
- `particle_ledger.md` - 资源/物品追踪
- `pending_hooks.md` - 未解决的伏笔和剧情钩子
- `chapter_summaries.md` - 章节摘要和关键事件
- `subplot_board.md` - 副情进度追踪
- `emotional_arcs.md` - 角色情感进展
- `character_matrix.md` - 角色互动历史和信息边界

---

## 核心命令

### `inkos book` - 书籍管理

管理书籍的创建、更新、列表和删除。

#### 数据流

```
用户输入 → 验证参数 → StateManager → book配置文件 → 状态更新
                    ↓
              books/<book-id>/
                ├── config.json
                ├── story/
                └── chapters/
```

#### 子命令

##### `inkos book create` - 创建新书籍

**作用**：创建一个新书籍项目，AI 自动生成世界观、角色、情节等基础设定。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--title <title>` | option | 是 | - | 书籍标题 |
| `--genre <genre>` | option | 否 | xuanhuan | 题材类型 |
| `--platform <platform>` | option | 否 | tomato | 目标平台 |
| `--target-chapters <n>` | option | 否 | 200 | 目标章节数 |
| `--chapter-words <n>` | option | 否 | 3000 | 每章字数 |
| `--brief <path>` | option | 否 | - | 创作大纲文件路径 |
| `--lang <language>` | option | 否 | (配置) | 写作语言：zh/en |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 开始一个新的创作项目
- 从现有大纲快速构建世界观
- 创建同人作品基础

**示例**：
```bash
# 创建玄幻小说
inkos book create --title "万道龙皇" --genre xuanhuan --platform tomato

# 从大纲创建
inkos book create --title "我的小说" --brief ./my-outline.md

# 指定字数和章节
inkos book create --title "都市神医" --genre urban --chapter-words 2500 --target-chapters 500
```

##### `inkos book update` - 更新书籍设置

**作用**：更新书籍的配置参数。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--chapter-words <n>` | option | 否 | - | 每章字数 |
| `--target-chapters <n>` | option | 否 | - | 目标章节数 |
| `--status <status>` | option | 否 | - | 书籍状态 |
| `--lang <language>` | option | 否 | - | 写作语言 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 调整章节字数目标
- 更新书籍创作状态
- 修改语言设置

**示例**：
```bash
# 更新字数设置
inkos book update my-book --chapter-words 3500

# 暂停书籍创作
inkos book update my-book --status paused
```

##### `inkos book list` - 列出所有书籍

**作用**：显示项目中所有书籍的基本信息。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 查看项目中的所有书籍
- 了解各书籍的进度和状态

**示例**：
```bash
inkos book list
```

##### `inkos book delete` - 删除书籍

**作用**：删除书籍及其所有章节、真相文件和快照。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<book-id>` | argument | 是 | - | 要删除的书籍 ID |
| `--force` | option | 否 | - | 跳过确认提示 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 完全删除不需要的书籍项目
- 清理测试数据

**示例**：
```bash
inkos book delete my-book --force
```

---

### `inkos write` - 写作命令

执行完整的章节创作流程，包含审计和自动修订。

#### 数据流

```
用户请求 → PipelineRunner → Planner → Composer → Architect → Writer → Observer → Reflector → Normalizer → Auditor → Reviser → 完成章节
                       ↓
                 状态快照存储
```

#### 子命令

##### `inkos write next` - 写作下一章

**作用**：自动创作指定数量的章节，包含完整的审计和修订流程。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--count <n>` | option | 否 | 1 | 写作章节数 |
| `--words <n>` | option | 否 | (配置) | 每章字数 |
| `--context <text>` | option | 否 | - | 创作指导（自然语言） |
| `--context-file <path>` | option | 否 | - | 从文件读取指导 |
| `--json` | option | 否 | - | 输出 JSON 格式 |
| `-q, --quiet` | option | 否 | - | 抑制控制台输出 |

**使用场景**：
- 日常章节创作
- 批量生成多章
- 带特定指导的定向创作

**示例**：
```bash
# 写作下一章
inkos write next my-book

# 批量写作 3 章
inkos write next my-book --count 3

# 指定剧情方向
inkos write next my-book --context "主角在秘境中发现传承"

# 从文件读取指导
inkos write next my-book --context-file ./chapter-guidance.md
```

##### `inkos write rewrite` - 重写章节

**作用**：重新生成指定章节，会删除该章及后续章节并回滚状态。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<args...>` | argument | 是 | - | [book-id] <chapter> |
| `--force` | option | 否 | - | 跳过确认提示 |
| `--words <n>` | option | 否 | (配置) | 每章字数 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 章节质量不满意需要重写
- 剧情走向需要调整

**示例**：
```bash
# 重写第 5 章
inkos write rewrite my-book 5

# 强制重写（跳过确认）
inkos write rewrite my-book 5 --force

# 指定字数重写
inkos write rewrite my-book 5 --words 4000
```

---

### `inkos review` - 审核命令

管理和审核待审核的章节。

#### 数据流

```
状态查询 → 章节索引过滤 → 状态更新 → 通知触发
```

#### 子命令

##### `inkos review list` - 列出待审核章节

**作用**：显示所有等待审核的章节列表。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (全部) | 书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 查看待审核章节
- 了解审计失败的问题

**示例**：
```bash
# 列出所有待审核章节
inkos review list

# 列出指定书籍的待审核章节
inkos review list my-book
```

##### `inkos review approve` - 批准章节

**作用**：将指定章节状态更改为已批准。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<args...>` | argument | 是 | - | [book-id] <chapter> |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 章节审核通过后确认
- 发布前的最终确认

**示例**：
```bash
# 批准第 3 章
inkos review approve my-book 3

# 自动检测书籍批准第 5 章
inkos review approve 5
```

##### `inkos review approve-all` - 批量批准

**作用**：批准一本书的所有待审核章节。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 批量确认多个章节
- 快速推进发布流程

**示例**：
```bash
inkos review approve-all my-book
```

##### `inkos review reject` - 拒绝章节

**作用**：拒绝指定章节并记录原因。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<args...>` | argument | 是 | - | [book-id] <chapter> |
| `--reason <reason>` | option | 否 | - | 拒绝原因 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 标记不合格章节
- 记录问题原因

**示例**：
```bash
inkos review reject my-book 3 --reason "人物行为OOC"
```

---

### `inkos audit` - 审计命令

对章节进行 33 维度的连贯性和质量检查。

#### 数据流

```
章节内容 → ContinuityAuditor → 33维度检查 → 问题汇总 → 输出报告
              ↓
        世界状态/角色/情节/规则验证
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `[chapter]` | argument | 否 | (最新) | 章节号 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 检查章节质量
- 发现连贯性问题
- 发布前质量检查

**示例**：
```bash
# 审计最新章节
inkos audit my-book

# 审计指定章节
inkos audit my-book 5

# 输出 JSON 格式
inkos audit my-book 3 --json
```

---

### `inkos revise` - 修订命令

基于审计问题自动修复章节。

#### 数据流

```
审计报告 → ReviserAgent → 问题分析 → 生成修订方案 → 应用修订 → 验证
                    ↓
              多种修订模式
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `[chapter]` | argument | 否 | (最新) | 章节号 |
| `--mode <mode>` | option | 否 | spot-fix | 修订模式 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**修订模式**：
- `spot-fix` - 针对性修复（默认）
- `polish` - 润色优化
- `rewrite` - 重写
- `rework` - 重构
- `anti-detect` - 反 AIGC 检测优化

**使用场景**：
- 修复审计发现的问题
- 优化章节质量
- 降低 AIGC 检测率

**示例**：
```bash
# 修订最新章节
inkos revise my-book

# 润色模式
inkos revise my-book --mode polish

# 反检测优化
inkos revise my-book 5 --mode anti-detect
```

---

## 输入治理命令

### `inkos plan` - 章节规划

为下一章生成创作意图。

#### 数据流

```
作者意图 + 当前焦点 → PlannerAgent → 章节意图 → runtime/chapter-N.intent.md
                          ↓
                    冲突检测与解决
```

#### 子命令

##### `inkos plan chapter` - 规划章节

**作用**：生成下一章的创作意图文件。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--context <text>` | option | 否 | - | 章节指导 |
| `--context-file <path>` | option | 否 | - | 从文件读取指导 |
| `--json` | option | 否 | - | 输出 JSON 格式 |
| `-q, --quiet` | option | 否 | - | 抑制控制台输出 |

**使用场景**：
- 明确下一章创作目标
- 添加特定剧情要求
- 预检潜在冲突

**示例**：
```bash
# 规划下一章
inkos plan chapter my-book

# 添加创作指导
inkos plan chapter my-book --context "本章重点：主角与反派首次交锋"
```

---

### `inkos compose` - 上下文编译

编译章节运行时所需的所有材料。

#### 数据流

```
真相文件 + 章节意图 → ComposerAgent → runtime/
                          ↓
              context.md | rule-stack.md | trace.md
```

#### 子命令

##### `inkos compose chapter` - 编译章节材料

**作用**：生成下一章的上下文、规则栈和追踪文件。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--context <text>` | option | 否 | - | 章节指导 |
| `--context-file <path>` | option | 否 | - | 从文件读取指导 |
| `--json` | option | 否 | - | 输出 JSON 格式 |
| `-q, --quiet` | option | 否 | - | 抑制控制台输出 |

**使用场景**：
- 预编译章节材料
- 检查上下文完整性
- 调试规则栈

**示例**：
```bash
inkos compose chapter my-book
```

---

### `inkos radar` - 市场情报

扫描市场机会和趋势。

#### 数据流

```
网络请求 → RadarAgent → 趋势分析 → 推荐生成 → radar/scan-TIMESTAMP.json
                      ↓
                多平台数据聚合
```

#### 子命令

##### `inkos radar scan` - 扫描市场

**作用**：扫描当前市场趋势并推荐创作方向。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 了解当前热门题材
- 获取创作灵感
- 发现市场空白

**示例**：
```bash
inkos radar scan
```

---

## 配置命令

### `inkos config` - 配置管理

管理项目配置和全局配置。

#### 数据流

```
配置输入 → inkos.json / ~/.inkos/.env → 配置验证 → 系统应用
```

#### 子命令

##### `inkos config set` - 设置项目配置

**作用**：设置项目级配置值。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<key>` | argument | 是 | - | 配置键（如 llm.apiKey） |
| `<value>` | argument | 是 | - | 配置值 |

**使用场景**：
- 调整 LLM 配置
- 修改守护进程设置

**示例**：
```bash
inkos config set llm.temperature 0.8
inkos config set daemon.maxConcurrentBooks 5
```

##### `inkos config set-global` - 设置全局配置

**作用**：设置全局 LLM 配置，所有项目共享。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--provider <provider>` | option | 是 | - | LLM 提供商 |
| `--base-url <url>` | option | 是 | - | API 基础 URL |
| `--api-key <key>` | option | 是 | - | API 密钥 |
| `--model <model>` | option | 是 | - | 模型名称 |
| `--temperature <n>` | option | 否 | - | 温度参数 |
| `--max-tokens <n>` | option | 否 | - | 最大输出令牌 |
| `--thinking-budget <n>` | option | 否 | - | Anthropic 思考预算 |
| `--api-format <format>` | option | 否 | - | API 格式 |
| `--lang <language>` | option | 否 | - | 默认语言 |

**使用场景**：
- 一次性配置全局 API
- 多项目共享配置

**示例**：
```bash
inkos config set-global \
  --provider openai \
  --base-url https://api.openai.com/v1 \
  --api-key sk-xxx \
  --model gpt-4
```

##### `inkos config show` - 显示项目配置

**作用**：显示当前项目配置（API Key 会被遮蔽）。

**示例**：
```bash
inkos config show
```

##### `inkos config show-global` - 显示全局配置

**作用**：显示全局配置。

**示例**：
```bash
inkos config show-global
```

##### `inkos config set-model` - 设置智能体模型

**作用**：为特定智能体设置模型覆盖。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<agent>` | argument | 是 | - | 智能体名称 |
| `<model>` | argument | 是 | - | 模型名称 |
| `--base-url <url>` | option | 否 | - | API 基础 URL |
| `--provider <provider>` | option | 否 | - | 提供商类型 |
| `--api-key-env <envVar>` | option | 否 | - | API Key 环境变量名 |
| `--stream` | option | 否 | - | 启用流式 |
| `--no-stream` | option | 否 | - | 禁用流式 |

**智能体列表**：writer, auditor, reviser, architect, radar, chapter-analyzer

**示例**：
```bash
# 为写作智能体使用特定模型
inkos config set-model writer gpt-4-turbo

# 为审计智能体使用不同提供商
inkos config set-model auditor claude-3-opus --provider anthropic
```

##### `inkos config remove-model` - 移除模型覆盖

**作用**：移除智能体的模型覆盖设置。

**示例**：
```bash
inkos config remove-model writer
```

##### `inkos config show-models` - 显示模型路由

**作用**：显示所有智能体的模型配置。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--json` | option | 否 | - | 输出 JSON 格式 |

**示例**：
```bash
inkos config show-models
```

---

### `inkos genre` - 题材管理

管理题材配置文件。

#### 数据流

```
genres/*.md → GenreProfile → 题材规则应用 → 写作约束
```

#### 子命令

##### `inkos genre list` - 列出题材

**作用**：列出所有可用的题材配置（内置 + 项目级）。

**示例**：
```bash
inkos genre list
```

##### `inkos genre show` - 显示题材详情

**作用**：显示指定题材的完整配置。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<id>` | argument | 是 | - | 题材 ID |

**示例**：
```bash
inkos genre show xuanhuan
```

##### `inkos genre create` - 创建题材

**作用**：在项目 genres/ 目录创建新的题材配置模板。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<id>` | argument | 是 | - | 题材 ID |
| `--name <name>` | option | 否 | id | 题材显示名称 |
| `--numerical` | option | 否 | - | 启用数值系统 |
| `--power` | option | 否 | - | 启用战力体系 |
| `--era` | option | 否 | - | 启用年代研究 |

**示例**：
```bash
inkos genre create scifi --name "科幻" --numerical --power
```

##### `inkos genre copy` - 复制题材

**作用**：将内置题材复制到项目目录进行自定义。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<id>` | argument | 是 | - | 要复制的题材 ID |

**示例**：
```bash
inkos genre copy xuanhuan
```

---

### `inkos style` - 风格管理

分析文本风格并导入风格配置。

#### 数据流

```
样本文本 → 统计分析 + LLM分析 → style_profile.json + style_guide.md
                    ↓
              句长/词频/修辞特征提取
```

#### 子命令

##### `inkos style analyze` - 分析风格

**作用**：分析文本文件并提取风格特征。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<file>` | argument | 是 | - | 要分析的文本文件 |
| `--name <name>` | option | 否 | - | 来源名称 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**示例**：
```bash
inkos style analyze sample.txt --name "参考作品"
```

##### `inkos style import` - 导入风格

**作用**：分析文本并导入到书籍，生成风格指南。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<file>` | argument | 是 | - | 要分析的文本文件 |
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--name <name>` | option | 否 | - | 来源名称 |
| `--stats-only` | option | 否 | - | 仅保存统计特征 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**示例**：
```bash
inkos style import reference.txt my-book
```

---

## 导入导出命令

### `inkos import` - 导入数据

将外部数据导入到书籍项目。

#### 数据流

```
外部文件 → 章节分割 → ObserverAgent → 状态提取 → 真相文件生成
```

#### 子命令

##### `inkos import canon` - 导入正典

**作用**：为同人创作导入父作品的正典设定。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[target-book-id]` | argument | 否 | (自动) | 目标书籍 ID |
| `--from <parent-book-id>` | option | 是 | - | 父书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 同人续写前了解原作设定
- 外传作品世界观导入

**示例**：
```bash
inkos import canon spinoff-book --from original-book
```

##### `inkos import chapters` - 导入章节

**作用**：导入现有章节用于续写，自动反推所有真相文件。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 目标书籍 ID |
| `--from <path>` | option | 是 | - | 文件或目录路径 |
| `--split <regex>` | option | 否 | - | 自定义分割正则 |
| `--resume-from <n>` | option | 否 | - | 从第 N 章恢复 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 续写他人作品
- 将手写章节数字化
- 迁移作品到 InkOS

**示例**：
```bash
# 从单文件导入
inkos import chapters my-book --from ./novel.txt

# 从目录导入
inkos import chapters my-book --from ./chapters/

# 自定义章节分割
inkos import chapters my-book --from ./novel.txt --split "第[0-9]+章"
```

---

### `inkos export` - 导出书籍

将书籍章节导出为单个文件。

#### 数据流

```
章节索引 → 读取章节 → 合并 → 格式化 → 输出文件
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--format <format>` | option | 否 | txt | 输出格式：txt/md/epub |
| `--output <path>` | option | 否 | (自动) | 输出文件路径 |
| `--approved-only` | option | 否 | - | 仅导出已批准章节 |
| `--json` | option | 否 | - | 输出元数据 JSON |

**使用场景**：
- 备份作品
- 发布前整理
- 制作电子书

**示例**：
```bash
# 导出为 TXT
inkos export my-book

# 导出为 Markdown
inkos export my-book --format md

# 导出为 EPUB
inkos export my-book --format epub --output ./my-book.epub

# 仅导出已批准章节
inkos export my-book --approved-only
```

---

### `inkos fanfic` - 同人创作

同人小说创作工具。

#### 数据流

```
原作素材 → 正典提取 → fanfic_canon.md → 基础设定生成
                    ↓
              同人模式处理 (canon/au/ooc/cp)
```

#### 子命令

##### `inkos fanfic init` - 初始化同人作品

**作用**：基于原作素材创建同人书籍项目。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--title <title>` | option | 是 | - | 书籍标题 |
| `--from <path>` | option | 是 | - | 原作素材路径 |
| `--mode <mode>` | option | 否 | canon | 同人模式 |
| `--genre <genre>` | option | 否 | other | 题材 |
| `--platform <platform>` | option | 否 | other | 平台 |
| `--target-chapters <n>` | option | 否 | 100 | 目标章节数 |
| `--chapter-words <n>` | option | 否 | 3000 | 每章字数 |
| `--lang <language>` | option | 否 | (配置) | 写作语言 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**同人模式**：
- `canon` - 原作向（严格遵循原作设定）
- `au` - 平行宇宙（保留人物，改变设定）
- `ooc` - 角色重构（允许 OOC）
- `cp` - 配向向（以 CP 为核心）

**示例**：
```bash
inkos fanfic init \
  --title "我的同人作品" \
  --from ./original-novel.txt \
  --mode canon \
  --genre xuanhuan
```

##### `inkos fanfic show` - 显示同人正典

**作用**：显示解析后的同人正典内容。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**示例**：
```bash
inkos fanfic show my-fanfic
```

##### `inkos fanfic refresh` - 刷新同人正典

**作用**：重新导入原作素材并重新生成同人正典。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--from <path>` | option | 是 | - | 原作素材路径 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**示例**：
```bash
inkos fanfic refresh my-fanfic --from ./updated-original.txt
```

---

## 辅助命令

### `inkos status` - 状态查看

显示项目状态概览。

#### 数据流

```
书籍索引 → 统计聚合 → 状态展示
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (全部) | 书籍 ID |
| `--chapters` | option | 否 | - | 显示每章状态 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 查看项目整体进度
- 了解章节审核状态
- 监控问题章节

**示例**：
```bash
# 查看所有书籍状态
inkos status

# 查看指定书籍
inkos status my-book

# 显示详细章节信息
inkos status my-book --chapters
```

---

### `inkos analytics` - 数据分析

显示书籍的统计数据和 token 使用情况。

#### 数据流

```
章节数据 → 统计计算 → 分析报告
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**别名**：`inkos stats`

**使用场景**：
- 分析创作数据
- 监控 token 消耗
- 发现高频问题

**示例**：
```bash
inkos analytics my-book
inkos stats my-book
```

---

### `inkos detect` - AIGC 检测

对章节进行 AIGC 内容检测。

#### 数据流

```
章节内容 → 检测 API → 评分 → 历史记录 → 统计分析
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `[chapter]` | argument | 否 | (最新) | 章节号 |
| `--all` | option | 否 | - | 检测所有章节 |
| `--stats` | option | 否 | - | 显示统计数据 |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 检查章节 AI 含量
- 评估反检测效果
- 优化通过率

**示例**：
```bash
# 检测最新章节
inkos detect my-book

# 检测所有章节
inkos detect my-book --all

# 查看统计数据
inkos detect my-book --stats
```

---

### `inkos doctor` - 环境检查

检查环境和项目健康状况。

#### 数据流

```
系统环境 → 配置检查 → API 测试 → 健康报告
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--repair-node-runtime` | option | 否 | - | 修复 Node 运行时版本 |

**检查项**：
- Node.js 版本（>= 20）
- SQLite 内存索引支持（Node 22+）
- inkos.json 存在
- .env 存在
- 全局配置状态
- LLM API Key 配置
- API 连通性测试
- 书籍目录状态

**使用场景**：
- 首次安装后验证
- 遇到问题时排查
- 升级前检查

**示例**：
```bash
inkos doctor

# 修复 Node 版本文件
inkos doctor --repair-node-runtime
```

---

### `inkos agent` - 自然语言代理

通过自然语言指令执行复杂任务。

#### 数据流

```
用户指令 → LLM → 工具调用循环 → 结果汇总
                    ↓
              自动选择并执行 CLI 命令
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `<instruction>` | argument | 是 | - | 自然语言指令 |
| `--context <text>` | option | 否 | - | 额外上下文 |
| `--context-file <path>` | option | 否 | - | 从文件读取上下文 |
| `--max-turns <n>` | option | 否 | 20 | 最大轮次数 |
| `--json` | option | 否 | - | 输出 JSON 格式 |
| `--quiet` | option | 否 | - | 抑制工具调用日志 |

**使用场景**：
- 执行复杂多步任务
- 不确定具体命令时
- 需要智能决策时

**示例**：
```bash
# 创建一本书并写三章
inkos agent "创建一本玄幻小说，名字叫龙神战纪，然后写三章"

# 修改所有章节状态
inkos agent "把 my-book 的所有待审核章节都批准"

# 复杂查询
inkos agent "分析我的书籍，告诉我哪些章节需要修订"
```

---

### `inkos daemon` - 守护进程

启动/停止 InkOS 自动创作守护进程。

#### 数据流

```
配置读取 → Scheduler → 定时触发 → Radar/Write → 通知 → 循环
                    ↓
              最多 N 本并发书籍
```

#### 子命令

##### `inkos up` - 启动守护进程

**作用**：启动 InkOS 自动创作守护进程，按计划自动执行雷达扫描和章节创作。

**参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `-q, --quiet` | option | 否 | - | 抑制控制台输出 |

**配置项**（在 inkos.json 中）：
```json
{
  "daemon": {
    "schedule": {
      "radarCron": "0 */6 * * *",
      "writeCron": "*/15 * * * *"
    },
    "maxConcurrentBooks": 3,
    "chaptersPerCycle": 1,
    "retryDelayMs": 60000,
    "cooldownAfterChapterMs": 300000,
    "maxChaptersPerDay": 50
  }
}
```

**使用场景**：
- 24/7 自动创作
- 定时市场扫描
- 批量管理多本书

**示例**：
```bash
inkos up
```

##### `inkos down` - 停止守护进程

**作用**：停止正在运行的 InkOS 守护进程。

**示例**：
```bash
inkos down
```

---

### `inkos studio` - Web 工作台

启动 InkOS Studio 可视化工作台。

#### 数据流

```
启动命令 → Studio API → Web 服务 → 浏览器界面
                    ↓
              实时项目状态与操作
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `-p, --port <port>` | option | 否 | 4567 | 服务端口 |

**使用场景**：
- 可视化项目管理
- 实时监控创作进度
- 图形化操作界面

**示例**：
```bash
inkos studio
inkos studio --port 8080
```

---

### `inkos init` - 项目初始化

初始化一个新的 InkOS 项目。

#### 数据流

```
目录选择 → 项目结构创建 → 配置生成 → .env 模板 → 完成
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[name]` | argument | 否 | (当前) | 项目名称（创建子目录） |
| `--lang <language>` | option | 否 | zh | 默认写作语言 |

**创建的文件结构**：
```
project/
├── inkos.json      # 项目配置
├── .env            # 环境变量
├── .gitignore      # Git 忽略规则
├── .nvmrc          # Node 版本（22）
├── .node-version   # Node 版本（22）
├── books/          # 书籍目录
└── radar/          # 雷达报告目录
```

**使用场景**：
- 开始新项目
- 规范项目结构

**示例**：
```bash
# 在当前目录初始化
inkos init

# 创建子目录并初始化
inkos init my-novel-project

# 英文项目
inkos init my-project --lang en
```

---

### `inkos update` - 版本更新

更新 InkOS 到最新版本。

#### 数据流

```
当前版本 → 检查 npm → 对比版本 → npm install -g → 完成
```

**使用场景**：
- 获取最新功能
- 修复已知问题

**示例**：
```bash
inkos update
```

---

### `inkos draft` - 写草稿

快速写一章草稿（不进行审计和修订）。

#### 数据流

```
书籍状态 → Composer → Architect → Writer → 草稿保存
                    ↓
              跳过审计和修订
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--words <n>` | option | 否 | (配置) | 每章字数 |
| `--context <text>` | option | 否 | - | 创作指导 |
| `--context-file <path>` | option | 否 | - | 从文件读取指导 |
| `--json` | option | 否 | - | 输出 JSON 格式 |
| `-q, --quiet` | option | 否 | - | 抑制控制台输出 |

**使用场景**：
- 快速生成内容
- 跳过质检环节
- 测试创作方向

**示例**：
```bash
inkos draft my-book
inkos draft my-book --words 2000
```

---

### `inkos consolidate` - 摘要合并

将章节摘要合并为卷级摘要，减少长书的上下文负担。

#### 数据流

```
章节摘要 → 卷识别 → 摘要聚合 → 卷摘要生成 → 归档
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `[book-id]` | argument | 否 | (自动) | 书籍 ID |
| `--json` | option | 否 | - | 输出 JSON 格式 |

**使用场景**：
- 长篇连载超过 100 章
- 降低 token 消耗
- 提高创作速度

**示例**：
```bash
inkos consolidate my-book
```

---

## 通用参数

所有命令都支持以下通用参数：

| 参数 | 说明 |
|------|------|
| `-h, --help` | 显示帮助信息 |
| `--json` | 输出 JSON 格式（部分命令支持） |

## 全局配置文件

### 项目配置 (inkos.json)

```json
{
  "name": "项目名称",
  "version": "0.1.0",
  "language": "zh",
  "llm": {
    "provider": "openai",
    "baseUrl": "https://api.openai.com/v1",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 8192,
    "stream": true
  },
  "modelOverrides": {
    "writer": "gpt-4-turbo",
    "auditor": "claude-3-opus"
  },
  "daemon": {
    "schedule": {
      "radarCron": "0 */6 * * *",
      "writeCron": "*/15 * * * *"
    },
    "maxConcurrentBooks": 3
  },
  "detection": {
    "enabled": true,
    "provider": "gptzero",
    "apiKey": "your-key"
  }
}
```

### 环境变量 (.env)

```bash
# LLM 配置
INKOS_LLM_PROVIDER=openai
INKOS_LLM_BASE_URL=https://api.openai.com/v1
INKOS_LLM_API_KEY=sk-xxx
INKOS_LLM_MODEL=gpt-4

# 可选参数
INKOS_LLM_TEMPERATURE=0.7
INKOS_LLM_MAX_TOKENS=8192
INKOS_LLM_THINKING_BUDGET=0
INKOS_LLM_API_FORMAT=chat

# 网络搜索（用于审计的年代研究）
TAVILY_API_KEY=tvly-xxxxx
```

## 相关链接

- [GitHub 仓库](https://github.com/actalk/inkos)
- [问题反馈](https://github.com/actalk/inkos/issues)

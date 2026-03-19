# OpenClaw 完全指南：从安装到高级使用

## 概述

OpenClaw 是一个**个人AI助手**，你可以在自己的设备上运行。它通过你已经在使用的渠道（WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、BlueBubbles、IRC、Microsoft Teams、Matrix、Feishu、LINE、Mattermost、Nextcloud Talk、Nostr、Synology Chat、Tlon、Twitch、Zalo、Zalo Personal、WebChat）与你对话。它可以在 macOS/iOS/Android 上说话和听音，还可以渲染一个你可以控制的实时画布。

如果你想要一个感觉本地化、快速、始终在线的个人单用户助手，OpenClaw 就是你的选择。

## 核心特性

- **多平台支持**：支持几乎所有主流聊天平台
- **本地运行**：数据掌握在自己手中，隐私有保障
- **语音交互**：支持语音输入和输出
- **技能系统**：通过技能扩展功能
- **多模型支持**：支持多种AI模型提供商
- **自动化能力**：可以执行各种自动化任务

## 系统要求

- **运行时**：Node.js ≥ 22（推荐 Node 24）
- **操作系统**：macOS、Linux、Windows（通过 WSL2 强烈推荐）
- **包管理器**：npm、pnpm 或 bun

## 安装指南

### 方法一：快速安装脚本（推荐）

**macOS/Linux：**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Windows（PowerShell）：**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

### 方法二：通过 npm 安装

```bash
npm install -g openclaw@latest
# 或者使用 pnpm
pnpm add -g openclaw@latest
```

### 方法三：从源码构建（开发）

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
```

## 快速开始

### 1. 运行设置向导

```bash
openclaw onboard --install-daemon
```

设置向导会引导你完成：
- 网关配置
- 工作空间设置
- 认证配置
- 可选渠道设置
- 技能安装

### 2. 启动网关服务

```bash
openclaw gateway status  # 检查服务状态
openclaw gateway start   # 启动服务
```

### 3. 打开控制界面

```bash
openclaw dashboard
```

然后在浏览器中打开 `http://127.0.0.1:18789/`

## 核心概念

### 网关（Gateway）

网关是 OpenClaw 的核心组件，负责：
- WebSocket 服务器
- 渠道管理
- 节点连接
- 会话管理
- 钩子处理

### 工作空间（Workspace）

工作空间是你的个人工作目录，包含：
- `AGENTS.md` - 工作空间配置
- `SOUL.md` - 助手个性定义
- `USER.md` - 用户信息
- `TOOLS.md` - 工具配置
- `MEMORY.md` - 长期记忆
- `memory/` - 每日记忆文件

### 技能（Skills）

技能是 OpenClaw 的功能扩展模块，例如：
- `healthcheck` - 主机安全检查
- `node-connect` - 节点连接诊断
- `openai-image-gen` - OpenAI 图像生成
- `weather` - 天气查询
- `skill-creator` - 技能创建工具

## 基本使用

### 发送消息

```bash
# 发送消息到指定渠道
openclaw message send --to +1234567890 --message "Hello from OpenClaw"
```

### 与助手对话

```bash
# 直接与助手对话
openclaw agent --message "今天的任务是什么？"

# 使用高级思考模式
openclaw agent --message "分析项目状态" --thinking high

# 将回复发送到指定渠道
openclaw agent --message "生成报告" --deliver --reply-channel slack --reply-to "#reports"
```

### 管理会话

```bash
# 列出所有会话
openclaw sessions list

# 查看会话历史
openclaw sessions history --session-id <id>

# 发送消息到特定会话
openclaw sessions send --session-id <id> --message "继续"
```

## 模型配置

### 支持的模型提供商

OpenClaw 支持多种模型提供商：
- **OpenAI** (ChatGPT/Codex)
- **Anthropic** (Claude)
- **Google** (Gemini)
- **DeepSeek**
- **Ollama** (本地模型)
- **自定义API端点**

### 配置模型

```bash
# 查看可用模型
openclaw models list

# 设置主模型
openclaw config set agents.defaults.model.primary "openai/gpt-4o"

# 设置备用模型
openclaw config set agents.defaults.model.fallbacks '["anthropic/claude-3-haiku", "deepseek/deepseek-chat"]'

# 设置图像模型
openclaw config set agents.defaults.imageModel.primary "openai/gpt-4o-mini"
```

### 模型切换

在聊天会话中，你可以使用 `/model` 命令切换模型：

```
/model list      # 列出可用模型
/model 2         # 选择第二个模型
/model openai/gpt-4o  # 切换到指定模型
```

## 渠道配置

### 支持的渠道

OpenClaw 支持多种通信渠道：

#### 即时通讯
- WhatsApp
- Telegram
- Signal
- LINE
- Zalo

#### 团队协作
- Slack
- Discord
- Microsoft Teams
- Mattermost
- Feishu
- Synology Chat

#### 其他
- Google Chat
- iMessage (通过 BlueBubbles)
- IRC
- Matrix
- Nextcloud Talk
- Nostr
- Tlon
- Twitch
- WebChat

### 配置渠道

```bash
# 列出所有渠道
openclaw channels list

# 添加渠道
openclaw channels add --provider whatsapp --name "我的WhatsApp"

# 查看渠道状态
openclaw channels status --provider whatsapp

# 查看渠道日志
openclaw channels logs --provider whatsapp
```

## 技能使用

### 内置技能

#### 健康检查（healthcheck）
```bash
# 运行安全检查
openclaw agent --message "检查系统安全状态"
```

#### 天气查询（weather）
```bash
# 查询天气
openclaw agent --message "北京今天天气怎么样？"
```

#### 图像生成（openai-image-gen）
```bash
# 生成图像
openclaw agent --message "生成一张日出的风景画"
```

### 安装新技能

```bash
# 列出可用技能
openclaw skills list

# 查看技能信息
openclaw skills info --name weather

# 检查技能状态
openclaw skills check --name weather
```

## 高级功能

### 自动化任务

#### 定时任务（Cron）
```bash
# 列出定时任务
openclaw cron list

# 添加定时任务
openclaw cron add --name "每日提醒" --schedule "0 9 * * *" --message "记得喝水"

# 立即运行任务
openclaw cron run --job-id <id>
```

#### 心跳检查（Heartbeat）
编辑 `HEARTBEAT.md` 文件来配置定期检查任务：

```markdown
# 每日检查清单
- [ ] 检查未读邮件
- [ ] 查看日历事件
- [ ] 检查天气
- [ ] 备份重要文件
```

### 内存管理

```bash
# 查看内存状态
openclaw memory status

# 搜索记忆
openclaw memory search --query "项目会议"

# 重建记忆索引
openclaw memory index
```

### 插件系统

```bash
# 列出插件
openclaw plugins list

# 安装插件
openclaw plugins install --name <plugin-name>

# 启用/禁用插件
openclaw plugins enable --name <plugin-name>
openclaw plugins disable --name <plugin-name>
```

## 故障排除

### 常见问题

#### 1. 网关无法启动
```bash
# 检查网关状态
openclaw gateway status

# 查看网关日志
openclaw gateway logs

# 重启网关
openclaw gateway restart
```

#### 2. 模型连接失败
```bash
# 运行诊断
openclaw doctor

# 检查模型配置
openclaw config get agents.defaults.model

# 测试模型连接
openclaw models scan
```

#### 3. 渠道连接问题
```bash
# 检查渠道状态
openclaw channels status --all

# 查看渠道日志
openclaw channels logs --provider <provider>

# 重新登录渠道
openclaw channels login --provider <provider>
```

### 诊断工具

```bash
# 运行全面诊断
openclaw doctor --verbose

# 检查网络连接
openclaw gateway health --url ws://127.0.0.1:18789

# 检查系统状态
openclaw status
```

## 安全配置

### 认证设置

```bash
# 设置网关令牌认证
openclaw config set gateway.auth.mode token
openclaw config set gateway.auth.token "your-secure-token"

# 设置密码认证
openclaw config set gateway.auth.mode password
openclaw config set gateway.auth.password "your-password"

# 使用环境变量（推荐）
export OPENCLAW_GATEWAY_TOKEN="your-token"
```

### 访问控制

```bash
# 限制绑定地址
openclaw config set gateway.bind loopback  # 仅本地访问

# 启用TLS加密
openclaw config set gateway.tls.enabled true
openclaw config set gateway.tls.certPath "/path/to/cert.pem"
openclaw config set gateway.tls.keyPath "/path/to/key.pem"

# 设置CORS
openclaw config set gateway.cors.origins '["https://your-domain.com"]'
```

### 安全审计

```bash
# 运行安全审计
openclaw security audit

# 检查权限
openclaw security check-permissions

# 查看安全配置
openclaw config get gateway.security
```

## 备份与恢复

### 备份数据

```bash
# 创建备份
openclaw backup create --output backup.tar.gz

# 验证备份
openclaw backup verify --input backup.tar.gz

# 列出备份
openclaw backup list
```

### 恢复数据

```bash
# 从备份恢复
openclaw backup restore --input backup.tar.gz

# 选择性恢复
openclaw backup restore --input backup.tar.gz --include config,workspace
```

### 重置系统

```bash
# 重置配置（保留数据）
openclaw reset --config-only

# 完全重置
openclaw reset --all

# 卸载OpenClaw
openclaw uninstall
```

## 开发与定制

### 创建自定义技能

1. 创建技能目录结构：
```
my-skill/
├── SKILL.md          # 技能文档
├── references/       # 参考文件
├── scripts/         # 脚本文件
└── assets/          # 资源文件
```

2. 编写技能描述（SKILL.md）：
```markdown
# 我的技能

## 描述
这是一个自定义技能的描述。

## 使用方法
当用户说"使用我的技能"时，执行以下操作...

## 配置
- 参数1: 描述
- 参数2: 描述
```

3. 安装技能：
```bash
# 将技能目录复制到技能文件夹
cp -r my-skill ~/.openclaw/skills/

# 重新加载技能
openclaw skills reload
```

### 创建自定义渠道

1. 创建渠道插件：
```javascript
// my-channel.js
module.exports = {
  name: 'my-channel',
  version: '1.0.0',
  // 渠道实现
}
```

2. 安装渠道插件：
```bash
openclaw plugins install --path ./my-channel
```

### API 集成

OpenClaw 提供 WebSocket API 用于集成：

```javascript
// 连接到 OpenClaw 网关
const ws = new WebSocket('ws://localhost:18789');

// 认证
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-token'
  }));
};

// 发送消息
ws.send(JSON.stringify({
  type: 'agent.turn',
  message: 'Hello OpenClaw',
  sessionId: 'my-session'
}));

// 接收回复
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到回复:', data);
};
```

## 最佳实践

### 1. 模型选择策略
- **主模型**：选择最强的最新模型用于重要任务
- **备用模型**：配置成本较低或速度较快的模型用于日常对话
- **图像模型**：专门处理图像相关的任务

### 2. 内存管理
- 定期清理 `memory/` 目录中的旧文件
- 重要信息记录到 `MEMORY.md`
- 使用 `openclaw memory index` 保持索引更新

### 3. 安全实践
- 使用令牌认证而非密码
- 限制网关绑定地址
- 定期更新 OpenClaw 版本
- 监控日志中的异常活动

### 4. 性能优化
- 为网关分配足够的内存
- 使用本地模型减少延迟
- 合理配置定时任务频率
- 定期清理会话数据

### 5. 备份策略
- 定期备份配置和工作空间
- 测试备份文件的恢复过程
- 将备份存储在安全位置
- 记录备份和恢复的操作步骤

## 更新与维护

### 检查更新

```bash
# 检查可用更新
openclaw update --check

# 查看当前版本
openclaw --version
```

### 更新 OpenClaw

```bash
# 更新到最新版本
openclaw update

# 更新到特定版本
openclaw update --version 2024.1.0

# 切换到开发版本
openclaw update --channel dev
```

### 维护命令

```bash
# 清理临时文件
openclaw system cleanup

# 查看系统信息
openclaw system info

# 查看资源使用情况
openclaw system resources
```

## 社区与支持

### 官方资源
- **官方网站**: https://openclaw.ai
- **文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **Discord**: https://discord.gg/clawd
- **技能中心**: https://clawhub.com

### 获取帮助

```bash
# 查看帮助文档
openclaw docs

# 查看FAQ
openclaw help faq

# 查看CLI参考
openclaw help cli
```

### 报告问题

```bash
# 收集诊断信息
openclaw doctor --json > diagnosis.json

# 查看日志文件
openclaw logs --tail 100

# 启用调试模式
openclaw gateway --verbose
```

## 总结

OpenClaw 是一个功能强大且灵活的个人AI助手平台，通过本指南，你应该能够：

1. ✅ 成功安装和配置 OpenClaw
2. ✅ 连接到你喜欢的通信渠道
3. ✅ 配置合适的AI模型
4. ✅ 使用各种技能扩展功能
5. ✅ 设置自动化任务和工作流
6. ✅ 确保系统安全和稳定运行
7. ✅ 进行定期维护和更新

OpenClaw 的强大之处在于它的可定制性和扩展性。随着你对系统的熟悉，你可以创建自定义技能、集成新的服务，并根据你的具体需求调整配置。

记住，OpenClaw 是一个持续发展的项目，定期查看官方文档和社区更新，以获取最新的功能和改进。

祝你使用愉快！🦞
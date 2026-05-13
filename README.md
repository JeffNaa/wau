# 🪁 Wau (Moon Kite / 月亮风筝)

[English](#english-version) | [中文](#中文版本)

---

<a name="english-version"></a>

## English Version

**Wau** is a high-flexibility, plugin-driven development platform built with **NestJS**.

### 💡 The Vision (Why Wau?)

This project was born because the author is **fed up with the endless, mindless requirement changes in daily work**.

In traditional development, every tiny UI adjustment or logic change requires modifying the core code, recompiling, and redeploying. **Wau**'s philosophy is **"Stable Core, Dynamic Business"**:

- **Isolate Changes**: All business logic is encapsulated in plugins; the Core never contains hard-coded logic for specific requirements.
- **Plug & Play**: Dynamic loading via `.zip` files allows for second-level installation and uninstallation of features.
- **SDUI Driven**: UI layouts are driven by backend protocols. Modifying elements (colors, positions, components) only requires adjusting JSON in the admin panel—no app store resubmission needed.
- **Atomic Decoupling**: Plugins communicate via an event bus, allowing them to work together or function independently.

### ✨ Key Features

- **🔌 Plugin Management**: Dynamically upload and extract plugin packages via the Dashboard. The server auto-restarts to load new plugin routes.
- **📡 Dynamic Route Injection**: The core automatically scans and registers API routes defined within the plugin package.
- **📱 Cross-Platform Protocol**: A unified JSON protocol drives rendering for both Flutter and Web clients.
- **🗄️ Extensible Data Model**: Uses PostgreSQL + JSONB, allowing plugins to store private metadata without altering core table structures.

### 📊 Progress

| Milestone | Status | Notes |
|-----------|--------|-------|
| NestJS Core bootstrap | ✅ Done | `AppModule`, `main.ts` |
| Prisma + PostgreSQL setup | ✅ Done | Global `PrismaModule`, `PrismaService` with `pg` adapter |
| Dynamic plugin loader | ✅ Done | `PluginLoaderModule.forRoot()` scans `storage/plugins/` at boot |
| Plugin lifecycle API | ✅ Done | `POST/GET/PUT/DELETE /plugins` — install, list, update, uninstall |
| Plugin route mounting | ✅ Done | NestJS `PluginLoaderModule` scans `storage/plugins/` at boot and auto-prefixes routes |
| **PluginRegistry DB migration** | ✅ Done | Plugin metadata now persisted in `plugin_registry` table; DB is the source of truth |
| Flutter client (`wau-flutter`) | ⏳ Planned | Dynamic JSON-driven UI rendering |
| React Web admin (`wau-web`) | ⏳ Planned | Plugin management dashboard + user client |
| Event Bus | ⏳ Planned | Cross-plugin & cross-platform communication |
| SDUI Protocol | ⏳ Planned | Backend-driven layout engine |

> 📚 **For technical details** (architecture, database schema, API specs, plugin format), see [`documentation/index.html`](documentation/index.html) (EN) or [`documentation/index.zh.html`](documentation/index.zh.html) (中文).

### 🚀 Quick Start

```bash
# 1. Install Core
npm install

# 2. Start Service
npm run start:dev

# 3. The server starts at http://localhost:3000
#    Plugins are stored in ./storage/plugins/
```

### 🧪 Test with the Sample Plugin

A sample plugin (`testplugin/`) is included in the repo. You can test the install flow immediately:

```bash
# ZIP the sample plugin
cd testplugin && zip -r ../testplugin.zip manifest.json dist/

# Install it via API
curl -X POST -F "file=@testplugin.zip" http://localhost:3000/plugins/upload

# Verify it is installed
curl http://localhost:3000/plugins

# Test the plugin routes
curl http://localhost:3000/testplugin/status
```

### 📦 Plugin Structure

A valid Wau plugin is a ZIP archive with this structure:

```
my-plugin.zip
├── manifest.json          # Plugin metadata
└── dist/
    └── index.js           # Plugin entry point (fallback: index.js at root)
```

**manifest.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name"
}
```

### 📡 API Reference

#### List Plugins
```
GET /plugins
```

Response:
```json
[
  {
    "name": "testplugin",
    "version": "1.0.0",
    "description": "Test Plugin",
    "author": "Jeff"
  }
]
```

#### Install or Update Plugin
```
POST /plugins/upload
Content-Type: multipart/form-data

file: <plugin.zip>
```

Behavior:
- **Fresh install** if plugin does not exist
- **Auto-update** if uploaded version is higher than installed
- **Rejected** if same version or downgrade

Response (install):
```json
{
  "success": true,
  "plugin": "my-plugin",
  "version": "1.0.0",
  "path": "/path/to/storage/plugins/my-plugin"
}
```

Response (update):
```json
{
  "success": true,
  "plugin": "my-plugin",
  "previousVersion": "1.0.0",
  "version": "1.1.0",
  "path": "/path/to/storage/plugins/my-plugin"
}
```

#### Update Plugin (Explicit)
```
PUT /plugins/:name
Content-Type: multipart/form-data

file: <plugin.zip>
```

Use this when you want the update URL to include the plugin name explicitly.

#### Uninstall Plugin
```
DELETE /plugins/:name
```

Response:
```json
{
  "success": true,
  "plugin": "my-plugin"
}
```

### 🛠️ Creating a Plugin

1. Create a new directory for your plugin
2. Write a NestJS module with controllers and services
3. Add `manifest.json` with `name`, `version`, `description`, `author`
4. Build to `dist/` (`tsc` or `nest build`)
5. ZIP the `manifest.json` and `dist/` folder
6. Upload via `POST /plugins/upload`

### 📂 Project Structure

```
wau-core/
├── src/
│   ├── app.module.ts              # Root module
│   ├── plugin-manager.service.ts  # Plugin lifecycle (delegates DB to PluginRegistryService)
│   ├── plugin.controller.ts       # Plugin HTTP API
│   ├── plugin-registry/
│   │   ├── plugin-registry.module.ts
│   │   └── plugin-registry.service.ts  # CRUD for plugin_registry table
│   ├── plugin-data/
│   │   ├── plugin-data.module.ts
│   │   └── plugin-data.service.ts      # KV ops for plugin_data table
│   ├── prisma/
│   │   ├── prisma.module.ts       # Global Prisma module
│   │   └── prisma.service.ts      # PrismaClient lifecycle
│   └── plugins/
│       └── plugin-loader.module.ts # Boot-time plugin loader
├── prisma/
│   ├── config.ts
│   └── schema/
│       ├── schema.prisma          # Generator + datasource
│       └── plugin.prisma          # PluginData + PluginRegistry models
├── storage/plugins/               # Installed plugins directory
├── testplugin/                    # Sample plugin source
└── dist/                          # Compiled output
```

### 🔮 Future Roadmap

Wau is designed as a **full-stack plugin platform**. The backend core is just the beginning — here is what comes next:

- **Flutter Client (`wau-flutter`)** — A mobile app shell that dynamically renders screens from JSON protocols served by plugins. The goal is to change UI without app store resubmission.
- **React JS Web App (`wau-web`)** — A dual-purpose React application: an **admin dashboard** for managing plugins, viewing logs, and configuring JSON-driven layouts; and a **user-facing client** that renders plugin screens directly in the browser. Built with React for fast iteration on both sides.
- **Event Bus** — Cross-plugin communication so backend plugins can trigger actions in Flutter and Web clients seamlessly.

Stay tuned. The kite is still climbing.

### ☕ Developer's Note

This project is initiated and maintained by **JeffNaa**. Due to a **busy full-time work schedule** (still fighting urgent daily requirements to make a living), updates might be slow. If you are also tired of being tortured by constant requirement changes, **Pull Requests** are more than welcome.

### License

This project is licensed under the [MIT License](LICENSE).

---

<a name="中文版本"></a>

## 中文版本

**Wau** 是一个基于 **NestJS** 构建的高自由度、插件化开发平台。

### 💡 开发初衷 (Why Wau?)

这个项目的诞生，是因为作者**受够了在平时工作中被无休止地改需求**。

在传统的开发模式下，每一个微小的界面调整或逻辑变更往往都需要修改核心代码、重新编译、重新发布。**Wau** 的核心理念是**"内核稳固，业务动态"**：

- **隔离变更**：所有的业务逻辑都封装在插件中，核心系统（Core）永不为特定需求做硬编码。
- **即插即用**：通过 `.zip` 动态加载，实现功能的秒级安装与卸载。
- **SDUI 驱动**：UI 布局由后端协议驱动，修改界面元素（颜色、位置、组件）仅需在管理端调整 JSON，无需重新发布 App。
- **原子化解耦**：插件之间通过事件总线通信，既能协同工作，也能彻底拆分。

### ✨ 核心特性

- **🔌 插件管理**: 支持通过 Dashboard 动态上传并解压缩插件包，服务器自动重启加载新插件路由。
- **📡 动态路由注入**: 插件包解压缩后，内核自动扫描并注册其定义的 API 路由。
- **📱 跨端组件协议**: 核心系统通过统一的 JSON 协议驱动 Flutter 和 Web 端渲染。
- **🗄️ 扩展性数据模型**: 采用 PostgreSQL + JSONB 架构，允许插件存储私有的元数据（Metadata）。

### 📊 项目进展

| 里程碑 | 状态 | 说明 |
|--------|------|------|
| NestJS Core 框架搭建 | ✅ 完成 | `AppModule`、`main.ts` |
| Prisma + PostgreSQL 配置 | ✅ 完成 | 全局 `PrismaModule`、`PrismaService`（`pg` 适配器）|
| 动态插件加载器 | ✅ 完成 | `PluginLoaderModule.forRoot()` 启动时扫描 `storage/plugins/` |
| 插件生命周期 API | ✅ 完成 | `POST/GET/PUT/DELETE /plugins` — 安装、列表、更新、卸载 |
| 插件路由挂载 | ✅ 完成 | NestJS `PluginLoaderModule` 启动时扫描 `storage/plugins/` 并自动添加路由前缀 |
| **PluginRegistry 数据库迁移** | ✅ 完成 | 插件元数据已持久化到 `plugin_registry` 表；数据库为权威来源 |
| Flutter 客户端 (`wau-flutter`) | ⏳ 规划中 | JSON 驱动的动态 UI 渲染 |
| React Web 管理端 (`wau-web`) | ⏳ 规划中 | 插件管理后台 + 用户端 |
| 事件总线 | ⏳ 规划中 | 跨插件 & 跨平台通信 |
| SDUI 协议 | ⏳ 规划中 | 后端驱动布局引擎 |

> 📚 **详细技术文档**（架构图、数据库模型、API 规范、插件格式）见 [`documentation/index.html`](documentation/index.html)（英文）或 [`documentation/index.zh.html`](documentation/index.zh.html)（中文）。

### 🚀 快速开始

```bash
# 1. 安装内核
npm install

# 2. 启动服务
npm run start:dev

# 3. 服务器运行在 http://localhost:3000
#    插件存储在 ./storage/plugins/
```

### 🧪 使用示例插件测试

项目中包含一个示例插件 (`testplugin/`)，你可以立即测试安装流程：

```bash
# 打包示例插件
cd testplugin && zip -r ../testplugin.zip manifest.json dist/

# 通过 API 安装
curl -X POST -F "file=@testplugin.zip" http://localhost:3000/plugins/upload

# 验证已安装
curl http://localhost:3000/plugins

# 测试插件路由
curl http://localhost:3000/testplugin/status
```

### 📦 插件结构

一个有效的 Wau 插件是一个 ZIP 压缩包，结构如下：

```
my-plugin.zip
├── manifest.json          # 插件元数据
└── dist/
    └── index.js           # 插件入口文件（若不存在则回退到根目录 index.js）
```

**manifest.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名称"
}
```

### 📡 API 参考

#### 列出插件
```
GET /plugins
```

#### 安装或更新插件
```
POST /plugins/upload
Content-Type: multipart/form-data

file: <plugin.zip>
```

行为：
- **全新安装** — 插件不存在时
- **自动更新** — 上传版本高于已安装版本时
- **拒绝** — 相同版本或降级时

安装响应：
```json
{
  "success": true,
  "plugin": "my-plugin",
  "version": "1.0.0"
}
```

更新响应：
```json
{
  "success": true,
  "plugin": "my-plugin",
  "previousVersion": "1.0.0",
  "version": "1.1.0"
}
```

#### 显式更新插件
```
PUT /plugins/:name
Content-Type: multipart/form-data

file: <plugin.zip>
```

#### 卸载插件
```
DELETE /plugins/:name
```

响应：
```json
{
  "success": true,
  "plugin": "my-plugin"
}
```

### 🛠️ 创建插件

1. 创建插件目录
2. 编写 NestJS 模块（含控制器和服务）
3. 添加 `manifest.json`，包含 `name`、`version`、`description`、`author`
4. 构建到 `dist/` 目录（使用 `tsc` 或 `nest build`）
5. 将 `manifest.json` 和 `dist/` 文件夹打包为 ZIP
6. 通过 `POST /plugins/upload` 上传

### 📂 项目结构

```
wau-core/
├── src/
│   ├── app.module.ts              # 根模块
│   ├── plugin-manager.service.ts  # 插件生命周期（DB 委托给 PluginRegistryService）
│   ├── plugin.controller.ts       # 插件 HTTP API
│   ├── plugin-registry/
│   │   ├── plugin-registry.module.ts
│   │   └── plugin-registry.service.ts  # plugin_registry 表 CRUD
│   ├── plugin-data/
│   │   ├── plugin-data.module.ts
│   │   └── plugin-data.service.ts      # plugin_data 表键值操作
│   ├── prisma/
│   │   ├── prisma.module.ts       # 全局 Prisma 模块
│   │   └── prisma.service.ts      # PrismaClient 生命周期管理
│   └── plugins/
│       └── plugin-loader.module.ts # 启动时插件加载器
├── prisma/
│   ├── config.ts
│   └── schema/
│       ├── schema.prisma          # Generator + datasource
│       └── plugin.prisma          # PluginData + PluginRegistry 模型
├── storage/plugins/               # 已安装插件目录
├── testplugin/                    # 示例插件源码
└── dist/                          # 编译输出
```

### 🔮 未来路线图

Wau 的定位是一个**全栈插件化平台**。后端核心只是起点，接下来还有：

- **Flutter 客户端 (`wau-flutter`)** — 一个移动端 App 壳，能够根据插件下发的 JSON 协议动态渲染页面。目标是调整 UI 无需重新上架应用商店。
- **React JS Web 应用 (`wau-web`)** — 双重定位的 React 应用：既是面向管理员的**后台管理端**（插件管理、日志查看、JSON 布局配置），也是面向终端用户的**客户端**（直接在浏览器中渲染插件页面）。前后两端均基于 React 快速迭代。
- **事件总线 (Event Bus)** — 跨插件通信机制，让后端插件能无缝触发 Flutter 和 Web 端的行为。

风筝仍在攀升，敬请期待。

### ☕ 开发者寄语

本项目由 **JeffNaa** 发起并维护。由于作者**平时工作繁忙**（仍在为了生计对抗各种突发需求），项目的更新进度会有些缓慢。如果你也受够了被改需求折磨，欢迎提交 **Pull Request**。

### License

这个使用 MIT协议。

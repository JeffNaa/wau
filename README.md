# 🪁 Wau (Moon Kite / 月亮风筝)

[English](#english-version) | [中文](#中文版本)

[![Buy Me A Coffee](https://buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/mamusum)

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
- **🗄️ Extensible Data Model**: Uses PostgreSQL + JSONB, allowing plugins to store private metadata without altering core table structures.
- **📊 JSON Schema**: Plugins declare tables via `manifest.json` schema — the core auto-creates and syncs PostgreSQL tables.
- **🔄 SQL Migrations**: Plugins ship `.sql` migration files; the core tracks and applies them incrementally.
- **🔐 Authentication & Authorization**: Built-in token-based auth with role-based permission guards and wildcard matching (`*`, `prefix:*`).
- **📱 Cross-Platform Protocol**: A unified JSON protocol drives rendering for both Flutter and Web clients.

### 📊 Progress

| Milestone | Status | Notes |
|-----------|--------|-------|
| NestJS Core bootstrap | ✅ Done | `AppModule`, `main.ts` |
| Prisma + PostgreSQL setup | ✅ Done | Global `PrismaModule`, `PrismaService` with `pg` adapter |
| Dynamic plugin loader | ✅ Done | `PluginLoaderModule.forRoot()` scans `storage/plugins/` at boot |
| Plugin lifecycle API | ✅ Done | `POST/GET/PUT/DELETE /plugins` — install, list, update, uninstall |
| Plugin route mounting | ✅ Done | NestJS `PluginLoaderModule` scans `storage/plugins/` at boot and auto-prefixes routes |
| **PluginRegistry DB migration** | ✅ Done | Plugin metadata now persisted in `plugin_registry` table; DB is the source of truth |
| **Plugin Schema** | ✅ Done | JSON schema-driven dynamic table creation via `PluginSchemaService` |
| **Plugin Migrations** | ✅ Done | SQL migration support via `PluginMigrationService` |
| **i18n Support** | ✅ Done | Plugin response messages, schema, KV store, and error handling fully localized |
| **Authentication & Authorization** | ✅ Done | Token-based auth, roles, RBAC with wildcard permissions |
| Flutter client (`wau-flutter`) | ⏳ Planned | Dynamic JSON-driven UI rendering |
| React Web admin (`wau-web`) | ⏳ Planned | Plugin management dashboard + user client |
| Event Bus | ⏳ Planned | Cross-plugin & cross-platform communication |
| SDUI Protocol | ⏳ Planned | Backend-driven layout engine |

> 📚 **For technical details** (architecture, database schema, API specs, plugin format), see the [📖 Online Documentation](https://jeffnaa.github.io/wau/).

### 🚀 Quick Start

**Prerequisites**: PostgreSQL 14+ and Node.js 20+.

```bash
# 1. Install Core
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public

# 3. Initialize the database (creates tables defined in prisma/schema/)
npx prisma migrate deploy

# 4. Generate the Prisma client
npx prisma generate

# 5. Start Service
npm run start:dev

# 6. The server starts at http://localhost:3000
#    Plugins are stored in ./storage/plugins/
```

### 🗄️ Prisma & Database

Wau uses **Prisma 7** with the `pg` adapter against PostgreSQL. The schema lives under `prisma/schema/` and migrations under `prisma/migrations/`.

| Command | Purpose |
|---------|---------|
| `npx prisma migrate dev --name <name>` | Create a new migration during development and apply it locally |
| `npx prisma migrate deploy` | Apply all pending migrations (use in production / CI) |
| `npx prisma migrate status` | Show migration history vs. database state |
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma studio` | Open a local GUI for browsing data |
| `npx prisma migrate reset` | ⚠️ Drop the DB and re-apply all migrations (destructive) |

**Production deployment** (no interactive prompts):

```bash
# 1. Apply pending migrations
npx prisma migrate deploy

# 2. Generate client (typically already part of postinstall)
npx prisma generate

# 3. Build and run
npm run build
npm run start:prod
```

> 💡 Core ships with five tables: `plugin_registry` (installed plugin metadata), `plugin_data` (KV store for plugin runtime data), `users`, `roles`, and `user_tokens` (auth system). Plugins can additionally declare their own tables via `manifest.json` schema or ship `migrations/*.sql` files — those are applied by `PluginSchemaService` / `PluginMigrationService` at install time, independent of the core Prisma migrations above.

### 🧪 Test with the Sample Plugin

A sample plugin (`sample-plugins/test-plugin/`) is included in the repo. You can test the install flow immediately:

```bash
# ZIP the sample plugin (include manifest.json, dist/, and optional locales/ / migrations/)
cd sample-plugins/test-plugin && zip -r ../../test-plugin.zip manifest.json dist/

# Install it via API
curl -X POST -F "file=@test-plugin.zip" http://localhost:3000/plugins/upload

# Verify it is installed
curl http://localhost:3000/plugins

# Test the plugin routes
curl http://localhost:3000/test-plugin/status
```

> **Packaging plugins with `locales/` or `migrations/`:**
> ```bash
> # Example: test-multilang-db-plugin has both locales/ and migrations/
> cd sample-plugins/test-multilang-db-plugin
> zip -r ../../test-multilang-db-plugin.zip manifest.json dist/ locales/ migrations/
> ```

### 📦 Plugin Structure

A valid Wau plugin is a ZIP archive with this structure:

```
my-plugin.zip
├── manifest.json          # Plugin metadata
├── dist/
│   └── index.js           # Plugin entry point (fallback: index.js at root)
├── locales/               # Optional: i18n translation files
│   ├── en/
│   │   ├── messages.json
│   │   └── errors.json
│   └── zh-CN/
│       ├── messages.json
│       └── errors.json
└── migrations/            # Optional: SQL migration files
```

**manifest.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name",
  "auth": {
    "required": false,
    "permissions": ["plugin:read"]
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "zh-CN", "ms-MY"],
    "path": "./locales"
  },
  "schema": {
    "products": {
      "sku": { "type": "string", "required": true, "unique": true },
      "name": { "type": "string", "required": true },
      "price": { "type": "decimal", "required": true, "precision": 10, "scale": 2 }
    }
  }
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
    "name": "test-plugin",
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

#### Authentication

All plugin management routes require permissions. The auth system is token-based (no JWT library — uses `crypto.randomBytes` + `bcrypt`).

```
POST /auth/register          # Public — first user becomes ADMIN
POST /auth/login             # Public
POST /auth/logout            # Revoke current token
POST /auth/logout-all        # Revoke all user tokens
GET  /auth/me                # Current user details
PUT  /auth/password          # Change password (revokes all tokens)
POST /auth/forgot-password   # Public — request reset token (SMTP not yet implemented)
POST /auth/reset-password    # Public — reset with token
```

**Forgot / Reset Password Flow (detailed)**

Since SMTP is not wired up yet, the reset token is written to the database instead of being emailed. Here is the complete flow:

1. **Request a reset token** (returns a generic message regardless of whether the email exists):
   ```bash
   curl -X POST http://localhost:3000/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```
   Response:
   ```json
   { "message": "If the email exists, a reset link has been sent." }
   ```

2. **Retrieve the token from the database.** The token is stored inside the user's `profile` JSON field under the key `_resetToken` (expires in 1 hour):
   ```bash
   psql $DATABASE_URL -c "SELECT profile->>'_resetToken' AS reset_token, profile->>'_resetTokenExpiresAt' AS expires_at FROM users WHERE email = 'user@example.com';"
   ```

3. **Reset the password** with the token obtained in step 2:
   ```bash
   curl -X POST http://localhost:3000/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token": "<reset_token>", "newPassword": "new-secret-password"}'
   ```
   Response:
   ```json
   { "message": "Password has been reset successfully." }
   ```

The first registered user automatically gets the `ADMIN` role with `["*"]` (all) permissions. Subsequent users get the `USER` role with no permissions. Both `AuthGuard` and `PermissionGuard` are registered as global `APP_GUARD` providers.

### 🛠️ Creating a Plugin

1. Create a new directory for your plugin
2. Write a NestJS module with controllers and services
3. Add `manifest.json` with `name`, `version`, `description`, `author`
4. Build to `dist/` (`tsc` or `nest build`)
5. ZIP the `manifest.json` and `dist/` folder (plus `locales/` and `migrations/` if your plugin has them)
6. Upload via `POST /plugins/upload`

### 📂 Project Structure

```
wau-core/
├── src/
│   ├── app.module.ts              # Root module
│   ├── bootstrap.ts               # Server restart helper
│   ├── plugin-manager.service.ts  # Plugin lifecycle (delegates DB to PluginRegistryService)
│   ├── plugin.controller.ts       # Plugin HTTP API
│   ├── auth/                      # Authentication & authorization
│   │   ├── auth.module.ts         # Global auth module
│   │   ├── auth.service.ts        # Register, login, token management
│   │   ├── auth.controller.ts     # /auth REST endpoints
│   │   ├── auth.guard.ts          # Bearer token validation (APP_GUARD)
│   │   ├── permission.guard.ts    # Permission enforcement (APP_GUARD)
│   │   ├── auth-context.service.ts # Helper: getCurrentUser, hasPermission
│   │   ├── public.decorator.ts    # @Public() — bypass auth
│   │   ├── current-user.decorator.ts # @CurrentUser() — inject UserPayload
│   │   ├── permissions.decorator.ts  # @RequirePermissions() — RBAC
│   │   └── dto/                   # RegisterDto, LoginDto, etc.
│   ├── plugin-registry/
│   │   ├── plugin-registry.module.ts
│   │   └── plugin-registry.service.ts  # CRUD for plugin_registry table
│   ├── plugin-data/
│   │   ├── plugin-data.module.ts
│   │   └── plugin-data.service.ts      # KV ops for plugin_data table
│   ├── plugin-migration/
│   │   ├── plugin-migration.module.ts
│   │   └── plugin-migration.service.ts # SQL migration runner
│   ├── plugin-schema/
│   │   ├── plugin-schema.module.ts
│   │   ├── plugin-schema.service.ts    # JSON schema table sync + CRUD
│   │   └── plugin-schema.types.ts      # Schema type definitions
│   ├── prisma/
│   │   ├── prisma.module.ts       # Global Prisma module
│   │   └── prisma.service.ts      # PrismaClient lifecycle
│   └── plugins/
│       └── plugin-loader.module.ts # Boot-time plugin loader
├── prisma/
│   ├── config.ts
│   └── schema/
│       ├── schema.prisma          # Generator + datasource
│       ├── plugin.prisma          # PluginData + PluginRegistry models
│       └── auth.prisma            # Role + User + UserToken models
├── sample-plugins/                # Sample plugin source code
│   ├── test-plugin/
│   ├── test-kv-plugin/
│   ├── test-migration-plugin/
│   ├── test-hybrid-plugin/
│   ├── test-multilang-plugin/
│   ├── test-multilang-db-plugin/
│   ├── test-auth-plugin/
│   └── installer/                 # Pre-built ZIPs
├── storage/plugins/               # Installed plugins directory
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
- **🗄️ 扩展性数据模型**: 采用 PostgreSQL + JSONB 架构，允许插件存储私有的元数据（Metadata）。
- **📊 JSON Schema**: 插件通过 `manifest.json` 声明表结构，核心自动创建并同步 PostgreSQL 表。
- **🔄 SQL 迁移**: 插件可携带 `.sql` 迁移文件，核心跟踪并增量应用。
- **🔐 认证与授权**: 内置基于令牌的认证系统，支持角色权限控制与通配符匹配（`*`、`前缀:*`）。
- **📱 跨端组件协议**: 核心系统通过统一的 JSON 协议驱动 Flutter 和 Web 端渲染。

### 📊 项目进展

| 里程碑 | 状态 | 说明 |
|--------|------|------|
| NestJS Core 框架搭建 | ✅ 完成 | `AppModule`、`main.ts` |
| Prisma + PostgreSQL 配置 | ✅ 完成 | 全局 `PrismaModule`、`PrismaService`（`pg` 适配器）|
| 动态插件加载器 | ✅ 完成 | `PluginLoaderModule.forRoot()` 启动时扫描 `storage/plugins/` |
| 插件生命周期 API | ✅ 完成 | `POST/GET/PUT/DELETE /plugins` — 安装、列表、更新、卸载 |
| 插件路由挂载 | ✅ 完成 | NestJS `PluginLoaderModule` 启动时扫描 `storage/plugins/` 并自动添加路由前缀 |
| **PluginRegistry 数据库迁移** | ✅ 完成 | 插件元数据已持久化到 `plugin_registry` 表；数据库为权威来源 |
| **Plugin Schema** | ✅ 完成 | 通过 `PluginSchemaService` 基于 JSON schema 动态建表 |
| **Plugin Migrations** | ✅ 完成 | 通过 `PluginMigrationService` 支持 SQL 迁移 |
| **i18n 国际化** | ✅ 完成 | 插件响应消息、Schema、KV 存储及错误处理已全面本地化 |
| **认证与授权** | ✅ 完成 | 令牌认证、角色、RBAC 通配符权限 |
| Flutter 客户端 (`wau-flutter`) | ⏳ 规划中 | JSON 驱动的动态 UI 渲染 |
| React Web 管理端 (`wau-web`) | ⏳ 规划中 | 插件管理后台 + 用户端 |
| 事件总线 | ⏳ 规划中 | 跨插件 & 跨平台通信 |
| SDUI 协议 | ⏳ 规划中 | 后端驱动布局引擎 |

> 📚 **详细技术文档**（架构图、数据库模型、API 规范、插件格式）见 [📖 在线文档](https://jeffnaa.github.io/wau/)。

### 🚀 快速开始

**前置要求**：PostgreSQL 14+ 与 Node.js 20+。

```bash
# 1. 安装内核
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public

# 3. 初始化数据库（创建 prisma/schema/ 中定义的表）
npx prisma migrate deploy

# 4. 生成 Prisma 客户端
npx prisma generate

# 5. 启动服务
npm run start:dev

# 6. 服务器运行在 http://localhost:3000
#    插件存储在 ./storage/plugins/
```

### 🗄️ Prisma 与数据库

Wau 基于 **Prisma 7**（使用 `pg` 适配器）连接 PostgreSQL。Schema 位于 `prisma/schema/`，迁移文件位于 `prisma/migrations/`。

| 命令 | 用途 |
|------|------|
| `npx prisma migrate dev --name <name>` | 开发时创建新的迁移并在本地应用 |
| `npx prisma migrate deploy` | 应用所有待执行的迁移（生产 / CI 使用） |
| `npx prisma migrate status` | 查看迁移历史与数据库状态 |
| `npx prisma generate` | Schema 变更后重新生成 Prisma 客户端 |
| `npx prisma studio` | 打开本地 GUI 浏览数据 |
| `npx prisma migrate reset` | ⚠️ 删除数据库并重新应用所有迁移（破坏性） |

**生产部署**（无交互提示）：

```bash
# 1. 应用待执行的迁移
npx prisma migrate deploy

# 2. 生成客户端（通常已包含在 postinstall 中）
npx prisma generate

# 3. 构建并运行
npm run build
npm run start:prod
```

> 💡 核心系统自带五张表：`plugin_registry`（已安装插件元数据）、`plugin_data`（插件运行时键值数据）、`users`（用户）、`roles`（角色）和 `user_tokens`（认证令牌）。插件还可以通过 `manifest.json` 中的 schema 声明自己的表，或者携带 `migrations/*.sql` 文件 —— 这些会在插件安装时由 `PluginSchemaService` / `PluginMigrationService` 处理，与上述核心 Prisma 迁移相互独立。

### 🧪 使用示例插件测试

项目中包含一个示例插件 (`sample-plugins/test-plugin/`)，你可以立即测试安装流程：

```bash
# 打包示例插件（包含 manifest.json、dist/，以及可选的 locales/ / migrations/）
cd sample-plugins/test-plugin && zip -r ../../test-plugin.zip manifest.json dist/

# 通过 API 安装
curl -X POST -F "file=@test-plugin.zip" http://localhost:3000/plugins/upload

# 验证已安装
curl http://localhost:3000/plugins

# 测试插件路由
curl http://localhost:3000/test-plugin/status
```

> **打包包含 `locales/` 或 `migrations/` 的插件：**
> ```bash
> # 示例：test-multilang-db-plugin 同时包含 locales/ 和 migrations/
> cd sample-plugins/test-multilang-db-plugin
> zip -r ../../test-multilang-db-plugin.zip manifest.json dist/ locales/ migrations/
> ```

### 📦 插件结构

一个有效的 Wau 插件是一个 ZIP 压缩包，结构如下：

```
my-plugin.zip
├── manifest.json          # 插件元数据
├── dist/
│   └── index.js           # 插件入口文件（若不存在则回退到根目录 index.js）
├── locales/               # 可选：i18n 翻译文件
│   ├── en/
│   │   ├── messages.json
│   │   └── errors.json
│   └── zh-CN/
│       ├── messages.json
│       └── errors.json
└── migrations/            # 可选：SQL 迁移文件
```

**manifest.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名称",
  "auth": {
    "required": false,
    "permissions": ["plugin:read"]
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "zh-CN", "ms-MY"],
    "path": "./locales"
  },
  "schema": {
    "products": {
      "sku": { "type": "string", "required": true, "unique": true },
      "name": { "type": "string", "required": true },
      "price": { "type": "decimal", "required": true, "precision": 10, "scale": 2 }
    }
  }
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

#### 认证接口

所有插件管理路由都需要权限。认证系统基于令牌（不使用 JWT 库 —— 使用 `crypto.randomBytes` + `bcrypt`）。

```
POST /auth/register          # 公开 — 首个用户成为管理员
POST /auth/login             # 公开
POST /auth/logout            # 撤销当前令牌
POST /auth/logout-all        # 撤销用户所有令牌
GET  /auth/me                # 当前用户详情
PUT  /auth/password          # 修改密码（撤销所有令牌）
POST /auth/forgot-password   # 公开 — 请求重置令牌（SMTP 尚未实现）
POST /auth/reset-password    # 公开 — 使用令牌重置密码
```

**忘记密码 / 重置密码详细流程**

由于 SMTP 尚未接入，重置令牌会写入数据库而非发送邮件。完整流程如下：

1. **请求重置令牌**（无论邮箱是否存在，都返回相同的通用消息）：
   ```bash
   curl -X POST http://localhost:3000/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```
   响应：
   ```json
   { "message": "If the email exists, a reset link has been sent." }
   ```

2. **从数据库读取令牌。** 令牌存储在用户 `profile` JSON 字段的 `_resetToken` 键下（有效期 1 小时）：
   ```bash
   psql $DATABASE_URL -c "SELECT profile->>'_resetToken' AS reset_token, profile->>'_resetTokenExpiresAt' AS expires_at FROM users WHERE email = 'user@example.com';"
   ```

3. **使用步骤 2 获取的令牌重置密码：**
   ```bash
   curl -X POST http://localhost:3000/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token": "<reset_token>", "newPassword": "new-secret-password"}'
   ```
   响应：
   ```json
   { "message": "Password has been reset successfully." }
   ```

第一个注册的用户自动获得 `ADMIN` 角色和 `["*"]`（全部）权限。后续用户获得 `USER` 角色，默认无权限。`AuthGuard` 和 `PermissionGuard` 均作为全局 `APP_GUARD` 注册。

### 🛠️ 创建插件

1. 创建插件目录
2. 编写 NestJS 模块（含控制器和服务）
3. 添加 `manifest.json`，包含 `name`、`version`、`description`、`author`
4. 构建到 `dist/` 目录（使用 `tsc` 或 `nest build`）
5. 将 `manifest.json` 和 `dist/` 文件夹打包为 ZIP（如有 `locales/` 和 `migrations/` 也需包含）
6. 通过 `POST /plugins/upload` 上传

### 📂 项目结构

```
wau-core/
├── src/
│   ├── app.module.ts              # 根模块
│   ├── bootstrap.ts               # 服务器重启辅助
│   ├── plugin-manager.service.ts  # 插件生命周期（DB 委托给 PluginRegistryService）
│   ├── plugin.controller.ts       # 插件 HTTP API
│   ├── auth/                      # 认证与授权
│   │   ├── auth.module.ts         # 全局认证模块
│   │   ├── auth.service.ts        # 注册、登录、令牌管理
│   │   ├── auth.controller.ts     # /auth REST 接口
│   │   ├── auth.guard.ts          # Bearer 令牌验证 (APP_GUARD)
│   │   ├── permission.guard.ts    # 权限执行 (APP_GUARD)
│   │   ├── auth-context.service.ts # 辅助：getCurrentUser, hasPermission
│   │   ├── public.decorator.ts    # @Public() — 绕过认证
│   │   ├── current-user.decorator.ts # @CurrentUser() — 注入 UserPayload
│   │   ├── permissions.decorator.ts  # @RequirePermissions() — RBAC
│   │   └── dto/                   # RegisterDto, LoginDto 等
│   ├── plugin-registry/
│   │   ├── plugin-registry.module.ts
│   │   └── plugin-registry.service.ts  # plugin_registry 表 CRUD
│   ├── plugin-data/
│   │   ├── plugin-data.module.ts
│   │   └── plugin-data.service.ts      # plugin_data 表键值操作
│   ├── plugin-migration/
│   │   ├── plugin-migration.module.ts
│   │   └── plugin-migration.service.ts # SQL 迁移执行器
│   ├── plugin-schema/
│   │   ├── plugin-schema.module.ts
│   │   ├── plugin-schema.service.ts    # JSON schema 表同步 + CRUD
│   │   └── plugin-schema.types.ts      # Schema 类型定义
│   ├── prisma/
│   │   ├── prisma.module.ts       # 全局 Prisma 模块
│   │   └── prisma.service.ts      # PrismaClient 生命周期管理
│   └── plugins/
│       └── plugin-loader.module.ts # 启动时插件加载器
├── prisma/
│   ├── config.ts
│   └── schema/
│       ├── schema.prisma          # Generator + datasource
│       ├── plugin.prisma          # PluginData + PluginRegistry 模型
│       └── auth.prisma            # Role + User + UserToken 模型
├── sample-plugins/                # 示例插件源码
│   ├── test-plugin/
│   ├── test-kv-plugin/
│   ├── test-migration-plugin/
│   ├── test-hybrid-plugin/
│   ├── test-multilang-plugin/
│   ├── test-multilang-db-plugin/
│   ├── test-auth-plugin/
│   └── installer/                 # 预构建 ZIP
├── storage/plugins/               # 已安装插件目录
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

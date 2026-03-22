# 🪁 Wau (Moon Kite / 月亮风筝)

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

## English Version

**Wau** is a high-flexibility, plugin-driven development platform built with **NestJS** and **Flutter**. It provides a robust system core that allows developers to dynamically inject backend routes and frontend UI components by simply uploading `.zip` extension packages.

### 💡 The Vision (Why Wau?)

This project was born because the author is **fed up with the endless, mindless requirement changes in daily work**.

In traditional development, every tiny UI adjustment or logic change requires modifying the core code, recompiling, and redeploying. **Wau**'s philosophy is **"Stable Core, Dynamic Business"**:

- **Isolate Changes**: All business logic is encapsulated in plugins; the Core never contains hard-coded logic for specific requirements.
- **Plug & Play**: Dynamic loading via `.zip` files allows for second-level installation and uninstallation of features.
- **SDUI Driven**: UI layouts are driven by backend protocols. Modifying elements (colors, positions, components) only requires adjusting JSON in the admin panel—no app store resubmission needed.
- **Atomic Decoupling**: Plugins communicate via an event bus, allowing them to work together or function independently.

### ✨ Key Features

- **🔌 Hot-Plugging**: Dynamically upload and extract plugin packages via the Dashboard with immediate effect—no NestJS restart required.
- **📡 Dynamic Route Injection**: The core automatically scans and registers API routes defined within the plugin package.
- **📱 Cross-Platform Protocol**: A unified JSON protocol drives rendering for both Flutter and Web clients.
- **🗄️ Extensible Data Model**: Uses PostgreSQL + JSONB, allowing plugins to store private metadata without altering core table structures.

### 🚀 Quick Start

1.  **Install Core**: Clone the repo and run `npm install`.
2.  **Start Service**: `npm run start:dev`. The system will auto-create the `storage/plugins` directory.
3.  **Upload Plugin**: Prepare a Zip containing `manifest.json` and `index.js`, then call `POST /api/plugins/upload`.

### ☕ Developer's Note

This project is initiated and maintained by **Jeff**. Due to a **busy full-time work schedule** (still fighting urgent daily requirements to make a living), updates might be slow. If you are also tired of being tortured by constant requirement changes, **Pull Requests** are more than welcome.

## License

This project is licensed under the [MIT License](LICENSE).

---

<a name="chinese"></a>

## 中文版本

**Wau** 是一个基于 **NestJS** 和 **Flutter** 构建的高自由度、插件化开发平台。它提供了一个坚固的系统内核，允许开发者通过上传 `.zip` 扩展包，动态地为后端注入路由、为前端注入 UI 组件。

### 💡 开发初衷 (Why Wau?)

这个项目的诞生，是因为作者**受够了在平时工作中被无休止地改需求**。

在传统的开发模式下，每一个微小的界面调整或逻辑变更往往都需要修改核心代码、重新编译、重新发布。**Wau** 的核心理念是**“内核稳固，业务动态”**：

- **隔离变更**：所有的业务逻辑都封装在插件中，核心系统（Core）永不为特定需求做硬编码。
- **即插即用**：通过 `.zip` 动态加载，实现功能的秒级安装与卸载。
- **SDUI 驱动**：UI 布局由后端协议驱动，修改界面元素（颜色、位置、组件）仅需在管理端调整 JSON，无需重新发布 App。
- **原子化解耦**：插件之间通过事件总线通信，既能协同工作，也能彻底拆分。

### ✨ 核心特性

- **🔌 插件热加载**: 支持通过 Dashboard 动态上传并解压缩插件包，实时生效，无需重启进程。
- **📡 动态路由注入**: 插件包解压缩后，内核自动扫描并注册其定义的 API 路由。
- **📱 跨端组件协议**: 核心系统通过统一的 JSON 协议驱动 Flutter 和 Web 端渲染。
- **🗄️ 扩展性数据模型**: 采用 PostgreSQL + JSONB 架构，允许插件存储私有的元数据（Metadata）。

### 🚀 快速开始

1.  **安装内核**: `git clone` 项目并执行 `npm install`。
2.  **启动服务**: `npm run start:dev`。系统将自动创建 `storage/plugins` 目录。
3.  **上传插件**: 准备包含 `manifest.json` 和 `index.js` 的 Zip 包，调用 `POST /api/plugins/upload`。

### ☕ 开发者寄语

本项目由 **JeffNaa** 发起并维护。由于作者**平时工作繁忙**（仍在为了生计对抗各种突发需求），项目的更新进度会有些缓慢。如果你也受够了被改需求折磨，欢迎提交 **Pull Request**。

## License

这个使用 MIT协议。

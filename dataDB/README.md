# 🐾 宠物百科数据管理系统 (dataDB)

这是一个基于 Node.js 和 MongoDB 构建的宠物百科数据管理平台，主要用于自建和管理宠物百科数据库。项目包含一个提供完整 CRUD 功能的 RESTful API 后端，以及一个基于 Vue 3 + TailwindCSS 构建的现代化可视化管理前端。

## ✨ 核心功能

*   **数据展示**：列表形式直观展示宠物基本信息（包含图片缩略图、中英文名、寿命、价格等）。
*   **快捷搜索**：支持根据宠物名称进行模糊/精确搜索。
*   **可视化表单管理**：支持通过直观的 UI 表单新增、编辑、删除宠物百科数据。
*   **JSON 快速导入**：在新增数据时，支持直接粘贴 JSON 数据（带有智能格式修复与容错功能），一键自动解析并填充表单，极大提高录入效率。

## 🛠️ 技术栈

*   **后端**：Node.js, Express, Mongoose (MongoDB), CORS, dotenv
*   **前端**：Vue 3 (CDN), TailwindCSS (CDN), Axios
*   **数据库**：MongoDB

## 📦 数据结构

每条宠物数据包含以下字段：
*   `name` (String): 宠物名称（必填）
*   `engname` (String): 英文名称
*   `nation` (String): 原产地
*   `life` (String): 寿命（如：10-14年）
*   `price` (String): 价格区间
*   `pic` (String): 宠物图片URL
*   **数值评分 (1-10)**：`sticky` (粘人), `shout` (叫声), `friendly` (友好), `lint` (掉毛), `beauty` (美容), `odour` (体味), `saliva` (口水), `active` (运动量)
*   **详细描述 (长文本)**：`message` (简介), `feed` (喂养建议), `relative` (体型特征/优缺点), `pick` (挑选建议)

## 🚀 快速开始

### 1. 环境要求
*   [Node.js](https://nodejs.org/) (推荐 v14+ 版本)
*   [MongoDB](https://www.mongodb.com/) (本地运行或远程集群均可)

### 2. 安装依赖
进入项目目录并安装依赖包：
```bash
cd dataDB
npm install
```

### 3. 配置环境变量
项目根目录下已包含 `.env` 文件，你可以根据实际情况修改 MongoDB 连接地址和端口号：
```env
PORT=3005
MONGODB_URI=mongodb://127.0.0.1:27017/petEncyclopedia
```

### 4. 启动服务
```bash
npm start
# 或者使用 npm run dev
```

### 5. 访问系统
启动成功后，控制台会输出：
```
✅ MongoDB连接成功
🚀 服务器运行在 http://localhost:3005
```
此时，在浏览器中打开 **http://localhost:3005** 即可访问前端管理页面。

## 📖 API 接口文档

基础路径：`http://localhost:3005/api`

| 方法 | 路径 | 描述 | 参数 |
| :--- | :--- | :--- | :--- |
| `GET` | `/pets` | 获取所有宠物数据 | 无 |
| `GET` | `/pets/search` | 根据名称搜索宠物 | `?name=关键字` |
| `GET` | `/pets/:id` | 获取单个宠物详情 | 路径参数 `id` |
| `POST` | `/pets` | 添加新的宠物数据 | Body: 宠物 JSON 数据 |
| `PUT` | `/pets/:id` | 更新宠物数据 | 路径参数 `id`, Body: 更新数据 |
| `DELETE` | `/pets/:id` | 删除宠物数据 | 路径参数 `id` |
| `POST` | `/pets/init-test` | 快捷注入测试数据 | 无 |

---
*本项目为 petSocial 宠物社区的底层数据支撑模块。*

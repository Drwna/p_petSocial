# PetSocial 宠物社交平台

> 一个宠物主题的社交网络平台，支持帖子发布、关注互动、积分商城、商家入驻、线下活动及宠物百科等功能。

---

## 项目架构

本项目由四个独立子应用组成，各自拥有独立的依赖和启动方式：

```
petSocial/
├── server/      # 主后端 API 服务 (Express + MySQL)
├── frontend/    # 跨平台移动端 (UniApp + Vue 3)
├── admin/       # 后台管理面板 (Vue 3 + Element Plus)
└── dataDB/      # 宠物百科微服务 (Express + MongoDB)
```

| 模块 | 技术栈 | 端口 | 说明 |
|------|--------|------|------|
| `server/` | Express + MySQL + Sequelize | **3001** | 主 REST API |
| `frontend/` | UniApp + Vue 3 + Vite | 动态 | H5 / 微信小程序 / App |
| `admin/` | Vue 3 + Vite + Element Plus | **5173** | 管理后台 |
| `dataDB/` | Express + MongoDB + Mongoose | **3005** | 宠物百科微服务 |

---

## 快速启动

> **推荐启动顺序**：先启动后端服务，再启动前端。

### 1. 启动主后端 (server)

```bash
cd server
npm install
# ⚠️ 先配置 .env 文件（见 server/README.md）
npm start
# → http://localhost:3001
```

### 2. 启动宠物百科服务 (dataDB)

```bash
cd dataDB
npm install
# ⚠️ 先配置 .env 文件（见 dataDB/README.md）
npm start
# → http://localhost:3005
```

### 3. 启动管理后台 (admin)

```bash
cd admin
npm install
npm run dev
# → http://localhost:5173
```

### 4. 启动前端 (frontend)

```bash
cd frontend
npm install
npm run dev:h5        # H5 浏览器调试
npm run dev:mp-weixin # 微信小程序调试
```

---

## 功能模块

```
社交核心
├── 帖子 CRUD、图片上传
├── 点赞 / 不喜欢 / 不感兴趣
├── 嵌套评论
├── 关注 / 取消关注
└── 收藏 / 屏蔽用户

用户系统
├── 邮箱注册 + 验证码
├── JWT 登录鉴权（7天有效）
└── 密码找回

内容运营
├── 分类 & 话题（标签）管理
└── 后台帖子/评论审核

积分商城
├── 积分日志记录
├── 礼品兑换
└── 积分商城

商家系统
├── 商家申请入驻
├── 礼品上架管理
└── 线下活动发布

宠物百科
└── 宠物品种信息（独立 MongoDB 服务）
```

---

## 技术选型

| 层次 | 技术 |
|------|------|
| 后端框架 | Express.js 5.x |
| 关系型数据库 | MySQL 8 + Sequelize 6 ORM |
| 文档型数据库 | MongoDB + Mongoose 9 |
| 身份认证 | JWT (jsonwebtoken) |
| 文件上传 | Multer |
| 邮件服务 | Nodemailer (QQ SMTP) |
| 前端框架 | UniApp + Vue 3 |
| 管理端 UI | Element Plus 2.x |
| 构建工具 | Vite 4.x |

---

## 数据库依赖

| 数据库 | 用途 | 使用模块 |
|--------|------|----------|
| MySQL | 社交数据（用户、帖子、评论等） | `server/` |
| MongoDB | 宠物百科文档数据 | `dataDB/` |

> ⚠️ 启动前请确保本地 MySQL（3306）和 MongoDB（27017）服务已启动。

---

## 子项目文档

- [server/README.md](./server/README.md) — 后端 API 详细说明
- [frontend/README.md](./frontend/README.md) — 前端页面与接入说明
- [admin/README.md](./admin/README.md) — 管理后台使用说明
- [dataDB/README.md](./dataDB/README.md) — 宠物百科微服务说明

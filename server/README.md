# Server — 主后端 API 服务

> Express + MySQL + Sequelize，提供 PetSocial 平台所有核心业务接口。

---

## 环境要求

- Node.js >= 16
- MySQL 8.0+（本地服务运行中，端口 3306）

---

## 快速启动

```bash
cd server
npm install
# 1. 复制并填写环境变量（见下方配置说明）
cp .env.example .env
npm start
# → http://localhost:3001
```

> 首次启动会自动执行 `sequelize.sync({ alter: true })`，自动建表并插入初始数据（分类、话题、管理员账号）。

---

## ⚠️ 环境变量配置 (.env)

> **必须在启动前完成配置，否则服务无法正常运行。**

```env
# 服务端口
PORT=3001

# ── MySQL 数据库 ──────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password      # ← 改为你的 MySQL 密码
DB_NAME=pet_social                   # 数据库名，首次启动自动创建

# ── JWT 认证 ──────────────────────────────────
JWT_SECRET=your_jwt_secret_key       # ← 改为强随机字符串（生产环境必须修改）
JWT_EXPIRES_IN=7d

# ── 邮件服务（QQ SMTP）────────────────────────
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=your_qq_email@qq.com      # ← 你的 QQ 邮箱
EMAIL_PASS=your_email_app_password   # ← QQ 邮箱授权码（非登录密码）

# ── 管理员账号 ────────────────────────────────
ADMIN_EMAIL=admin@petsocial.com      # ← 初始管理员邮箱
```

> **QQ 邮箱授权码获取**：登录 QQ 邮箱 → 设置 → 账户 → POP3/SMTP 服务 → 生成授权码。

---

## 目录结构

```
server/
├── src/
│   ├── app.js                    # ★ 应用入口，注册路由 + 初始化数据库
│   ├── config/
│   │   └── db.js                 # Sequelize 连接配置
│   ├── middleware/
│   │   ├── auth.js               # JWT 认证中间件（验证 Bearer Token）
│   │   └── upload.js             # Multer 文件上传配置
│   ├── models/                   # Sequelize 数据模型（共 19 个）
│   │   ├── index.js              # ★ 模型统一导出 + 关联关系定义
│   │   ├── Account.js            # 用户账号
│   │   ├── Pet.js                # 宠物档案（用户主体）
│   │   ├── Post.js               # 帖子
│   │   ├── Comment.js            # 评论（支持嵌套）
│   │   ├── Follow.js             # 关注关系
│   │   ├── PostLike.js           # 点赞
│   │   ├── PostDislike.js        # 不喜欢
│   │   ├── Bookmark.js           # 收藏
│   │   ├── BlockPet.js           # 屏蔽用户
│   │   ├── Category.js           # 内容分类
│   │   ├── Topic.js              # 话题/标签
│   │   ├── PostTopic.js          # 帖子-话题多对多关联
│   │   ├── PointLog.js           # 积分变动日志
│   │   ├── Merchant.js           # 商家
│   │   ├── Gift.js               # 商品/礼品
│   │   ├── GiftRedemption.js     # 礼品兑换记录
│   │   ├── Activity.js           # 线下活动
│   │   ├── ActivityParticipant.js# 活动参与者
│   │   └── VerificationCode.js   # 邮箱验证码
│   ├── routes/                   # API 路由（业务逻辑直接写在路由中）
│   │   ├── account.js            # /api/account
│   │   ├── pet.js                # /api/pet
│   │   ├── post.js               # /api/post
│   │   ├── comment.js            # /api/comment
│   │   ├── follow.js             # /api/follow
│   │   ├── category.js           # /api/category
│   │   ├── topic.js              # /api/topic
│   │   ├── bookmark.js           # /api/bookmark
│   │   ├── upload.js             # /api/upload
│   │   ├── point.js              # /api/point
│   │   ├── merchant.js           # /api/merchant
│   │   ├── gift.js               # /api/gift
│   │   └── activity.js           # /api/activity
│   ├── utils/
│   │   ├── emailService.js       # Nodemailer 邮件发送封装
│   │   └── verificationCode.js   # 验证码生成逻辑
│   └── public/
│       └── images/               # 上传图片存储目录（Multer 目标目录）
├── .env                          # ★ 环境变量（不提交 Git）
└── package.json
```

---

## API 路由总览

| 路由前缀 | 路由文件 | 主要功能 |
|----------|----------|----------|
| `/api/account` | routes/account.js | 注册、登录、发验证码、重置密码 |
| `/api/pet` | routes/pet.js | 宠物档案 CRUD、屏蔽用户 |
| `/api/post` | routes/post.js | 帖子 CRUD、点赞、不喜欢、不感兴趣 |
| `/api/comment` | routes/comment.js | 评论发布、删除、嵌套回复 |
| `/api/follow` | routes/follow.js | 关注/取消关注、关注列表 |
| `/api/category` | routes/category.js | 分类管理 |
| `/api/topic` | routes/topic.js | 话题管理、帖子-话题关联 |
| `/api/bookmark` | routes/bookmark.js | 收藏/取消收藏 |
| `/api/upload` | routes/upload.js | 图片上传（返回图片 URL） |
| `/api/point` | routes/point.js | 积分查询、日志、兑换 |
| `/api/merchant` | routes/merchant.js | 商家申请、审核、管理 |
| `/api/gift` | routes/gift.js | 礼品上架、下架 |
| `/api/activity` | routes/activity.js | 活动发布、报名、审核 |

---

## 认证机制

- 需要登录的接口通过 `auth.js` 中间件验证
- 请求头格式：`Authorization: Bearer <token>`
- Token 有效期 **7 天**，过期返回 `code: 401`

---

## 数据模型关系

```
Account  (1) ──→ (1) Pet                 用户账号 ↔ 宠物档案
Pet      (1) ──→ (N) Post                宠物发帖
Post     (N) ──→ (N) Topic               帖子 ↔ 话题（通过 PostTopic）
Post     (1) ──→ (N) Comment             帖子评论
Pet      (N) ──→ (N) Pet                 关注关系（自关联 Follow）
Account  (1) ──→ (1) Merchant            商家账号
Merchant (1) ──→ (N) Gift                商家礼品
Merchant (1) ──→ (N) Activity            商家活动
```

---

## 文件上传

- 图片保存至 `src/public/images/`
- 访问地址：`http://localhost:3001/images/<文件名>`
- 支持格式：jpg、jpeg、png、gif、webp

---

## 注意事项

1. 数据库表结构变更时，Sequelize 会自动更新表结构（`alter: true`）
2. 软删除机制：删除操作将 `isDeleted` 设为 1，记录 `deletedAt` 时间，数据不会真正删除
3. `.env` 文件包含敏感信息，不要提交到版本控制

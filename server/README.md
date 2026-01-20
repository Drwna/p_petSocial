# 宠物社交服务器

## 项目简介

宠物社交服务器是一个为宠物主人提供社交平台的后端服务，支持宠物信息管理、帖子发布、评论、点赞、关注等功能。

## 技术栈

- **Node.js**：JavaScript运行时环境
- **Express**：Web应用框架
- **MySQL**：关系型数据库
- **Sequelize**：ORM框架
- **JWT**：JSON Web Token，用于身份认证
- **Multer**：文件上传中间件
- **Cors**：跨域资源共享中间件
- **Nodemailer**：邮件发送服务

## 项目结构

```
server/
├── src/
│   ├── config/
│   │   └── db.js           # 数据库配置
│   ├── middleware/
│   │   ├── auth.js         # 身份认证中间件
│   │   └── upload.js       # 文件上传中间件
│   ├── models/
│   │   ├── Account.js      # 账户模型
│   │   ├── Category.js     # 分类模型
│   │   ├── Comment.js      # 评论模型
│   │   ├── Follow.js       # 关注模型
│   │   ├── Pet.js          # 宠物模型
│   │   ├── Post.js         # 帖子模型
│   │   ├── PostLike.js     # 帖子点赞模型
│   │   ├── VerificationCode.js # 验证码模型
│   │   └── index.js        # 模型导出
│   ├── public/
│   │   └── images/         # 上传的图片存储目录
│   ├── routes/
│   │   ├── account.js      # 账户相关路由
│   │   ├── category.js     # 分类相关路由
│   │   ├── comment.js      # 评论相关路由
│   │   ├── follow.js       # 关注相关路由
│   │   ├── pet.js          # 宠物相关路由
│   │   ├── post.js         # 帖子相关路由
│   │   └── upload.js       # 上传相关路由
│   ├── utils/
│   │   ├── emailService.js # 邮件服务
│   │   └── verificationCode.js # 验证码工具
│   └── app.js              # 应用入口
├── .env                    # 环境变量配置
├── package.json            # 项目依赖配置
└── README.md               # 项目说明文档
```

## 环境配置

1. 安装Node.js（版本14或以上）
2. 安装MySQL数据库
3. 创建.env文件，配置以下环境变量：

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pet_social
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

## 安装和运行

1. 安装依赖：

```bash
npm install
```

2. 启动服务器：

```bash
npm start
```

服务器将在配置的端口上运行，默认端口为3001。

## API接口文档

### 账户相关接口

- `POST /api/account/register` - 用户注册
- `POST /api/account/login` - 用户登录
- `POST /api/account/send-code` - 发送验证码
- `POST /api/account/verify-code` - 验证验证码
- `POST /api/account/reset-password` - 重置密码

### 宠物相关接口

- `GET /api/pet/profile` - 获取当前宠物主页信息
- `GET /api/pet/profile/:petId` - 获取指定宠物主页信息
- `GET /api/pet/posts` - 获取当前宠物发布的帖子
- `GET /api/pet/:petId/posts` - 获取指定宠物发布的帖子
- `POST /api/pet/update` - 更新宠物信息

### 帖子相关接口

- `POST /api/post/create` - 发布帖子
- `POST /api/post/delete` - 删除帖子
- `GET /api/post/list` - 获取帖子列表（首页）
- `GET /api/post/:id` - 获取帖子详情
- `POST /api/post/like` - 点赞/取消点赞

### 评论相关接口

- `POST /api/comment/create` - 评论帖子
- `POST /api/comment/delete` - 删除评论
- `GET /api/comment/list` - 获取帖子评论列表

### 关注相关接口

- `POST /api/follow` - 关注/取消关注
- `GET /api/follow/followers` - 获取粉丝列表
- `GET /api/follow/following` - 获取关注列表

### 上传相关接口

- `POST /api/upload/image` - 上传图片

### 分类相关接口

- `GET /api/category/list` - 获取分类列表

## 数据库设计

### 主要表结构

1. **pet** - 宠物表
   - id: 主键
   - petName: 宠物名称
   - petType: 宠物类型
   - gender: 性别
   - avatar: 头像
   - intro: 简介
   - birthday: 生日
   - followCount: 关注数
   - fansCount: 粉丝数
   - createTime: 创建时间

2. **post** - 帖子表
   - id: 主键
   - petId: 发布者宠物ID
   - content: 内容
   - images: 图片数组
   - categoryId: 分类ID
   - createTime: 创建时间
   - isDeleted: 是否删除
   - deletedAt: 删除时间

3. **comment** - 评论表
   - id: 主键
   - postId: 帖子ID
   - petId: 评论者宠物ID
   - content: 内容
   - createTime: 创建时间
   - isDeleted: 是否删除
   - deletedAt: 删除时间

4. **post_like** - 帖子点赞表
   - id: 主键
   - postId: 帖子ID
   - petId: 点赞者宠物ID
   - createTime: 创建时间

5. **follow** - 关注表
   - id: 主键
   - followerPetId: 粉丝宠物ID
   - followingPetId: 被关注宠物ID
   - createTime: 创建时间

6. **category** - 分类表
   - id: 主键
   - name: 分类名称

## 开发注意事项

1. 数据库表结构变更时，Sequelize会自动更新表结构（通过`alter: true`选项）
2. 所有需要身份认证的接口都需要在请求头中添加`Authorization: Bearer <token>`
3. 图片上传后会存储在`src/public/images`目录下，访问路径为`/public/images/filename`
4. 软删除机制：删除操作不会直接删除数据，而是将`isDeleted`字段设为1，并记录`deletedAt`时间

## 许可证

ISC License
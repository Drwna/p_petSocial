# Admin — 后台管理面板

> Vue 3 + Vite + Element Plus，用于内容审核与平台运营管理。

---

## 环境要求

- Node.js >= 16
- 启动前确保 `server/`（端口 3001）已运行

---

## 快速启动

```bash
cd admin
npm install
npm run dev     # → http://localhost:5173
npm run build   # 生产构建，输出至 dist/
```

---

## ⚠️ 关键配置

### API 代理配置

文件：`vite.config.js`

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',   // ← 指向后端服务地址
      changeOrigin: true
    }
  }
}
```

> 开发环境下所有 `/api/*` 请求自动转发到后端，**无需配置 CORS**。
> 部署生产时需通过 Nginx 配置相同的代理规则。

---

## 目录结构

```
admin/
├── src/
│   ├── App.vue                   # 根组件（简单 router-view）
│   ├── main.js                   # Vue 应用入口（挂载 Element Plus）
│   ├── router/
│   │   └── index.js              # ★ 路由配置（含登录守卫）
│   ├── utils/
│   │   └── request.js            # Axios 实例（含认证拦截器）
│   └── views/
│       ├── Login.vue             # 登录页
│       ├── Layout.vue            # ★ 主框架布局（侧边栏 + 顶部栏）
│       ├── PostList.vue          # 帖子管理
│       ├── CommentList.vue       # 评论管理
│       ├── CategoryList.vue      # 分类配置
│       ├── TopicList.vue         # 话题配置
│       ├── MerchantList.vue      # 商家审核
│       └── ActivityList.vue      # 活动审核
├── index.html
├── vite.config.js
└── package.json
```

---

## 管理功能菜单

| 菜单项 | 路由 | 功能说明 |
|--------|------|----------|
| 帖子管理 | `/posts` | 查看、删除帖子 |
| 评论管理 | `/comments` | 查看、删除评论 |
| 分类配置 | `/categories` | 新增、编辑、删除内容分类 |
| 话题配置 | `/topics` | 新增、编辑、删除话题标签 |
| 商家管理 | `/merchants` | 审核商家入驻申请 |
| 活动审核 | `/activities` | 审核线下活动发布申请 |

---

## 认证机制

- 登录成功后 Token 存储于 `localStorage`（键名：`admin_token`）
- Axios 拦截器自动注入 `Authorization: Bearer <token>` 请求头
- 路由守卫检测 Token，未登录自动跳转 `/login`
- Token 失效（401/403）自动清除并跳转登录页

---

## Axios 请求配置

文件：`src/utils/request.js`

```javascript
baseURL: '/api'          // 通过 Vite 代理转发到后端
timeout: 5000            // 请求超时 5 秒
// 响应格式：{ code: 0, data: ..., message: '' }
// code=0 成功，其他为失败
```

---

## 生产部署参考（Nginx）

```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
}

location / {
    root /path/to/admin/dist;
    try_files $uri $uri/ /index.html;
}
```

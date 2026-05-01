# Frontend — 跨平台移动端

> UniApp + Vue 3，一套代码支持 H5、微信小程序、Android/iOS App。

---

## 环境要求

- Node.js >= 16
- 启动前确保 `server/`（端口 3001）已运行

---

## 快速启动

```bash
cd frontend
npm install

npm run dev:h5           # H5 浏览器调试 → http://localhost:5173（或随机端口）
npm run dev:mp-weixin    # 微信小程序（需安装微信开发者工具）
npm run dev:app          # App 调试

# 生产构建
npm run build:h5
npm run build:mp-weixin
```

---

## ⚠️ 关键配置

### 后端地址配置

> **真机调试时必须修改为电脑局域网 IP，否则手机无法访问。**

修改文件：`src/utils/request.js`

```javascript
// 开发环境
const BASE_URL = 'http://localhost:3001'

// 真机调试（改为电脑局域网 IP）
// const BASE_URL = 'http://192.168.x.x:3001'
```

同步修改：`src/api/index.js` 中的 `BASE_URL`

---

## 目录结构

```
frontend/
├── src/
│   ├── App.vue                   # 根组件
│   ├── main.js                   # Vue 应用入口
│   ├── manifest.json             # ★ UniApp 应用配置（AppID、平台权限等）
│   ├── pages.json                # ★ 页面路由 + Tabbar 配置（新增页面必须在此注册）
│   ├── uni.scss                  # 全局样式变量
│   ├── pages/                    # 页面组件
│   │   ├── index/                # 首页（Feed 流，支持分类左右滑动）
│   │   ├── baike/                # 宠物百科
│   │   ├── login/                # 登录
│   │   ├── register/             # 注册
│   │   ├── profile/              # 个人主页
│   │   ├── user/                 # 用户管理（编辑资料、屏蔽列表）
│   │   ├── post/                 # 帖子（创建、详情）
│   │   ├── follow/               # 关注 / 粉丝列表
│   │   ├── points/               # 积分记录
│   │   ├── shop/                 # 积分商城（列表、详情、兑换记录）
│   │   ├── merchant/             # 商家中心（申请、礼品管理、活动管理）
│   │   ├── activity/             # 线下活动（列表、详情）
│   │   └── discuss/              # 讨论页
│   ├── components/
│   │   └── PostCard.vue          # 帖子卡片公共组件
│   ├── api/
│   │   └── index.js              # ★ 所有业务 API 接口封装
│   ├── utils/
│   │   └── request.js            # ★ HTTP 请求工具（uni.request 封装）
│   └── static/
│       └── tabbar/               # 底部导航栏图标资源
├── vite.config.js
└── package.json
```

---

## 底部导航栏（Tabbar）

| 序号 | 标签 | 页面路径 |
|------|------|----------|
| 1 | 首页 | pages/index/index |
| 2 | 百科 | pages/baike/baike |
| 3 | 发布 | pages/post/create |
| 4 | 商城 | pages/shop/list |
| 5 | 我的 | pages/profile/profile |

---

## HTTP 请求机制

`src/utils/request.js` 封装要点：

- 基于 `uni.request` 封装为 Promise
- 自动从 `localStorage` 读取 JWT Token 并注入 `Authorization` 请求头
- 统一响应格式：`code=0` 为成功，`code=401` 自动清除 Token 并跳转登录页

---

## 新增页面步骤

1. 在 `src/pages/<模块>/` 下创建 `.vue` 文件
2. 在 `src/pages.json` 的 `pages` 数组中注册路由
3. 在 `src/api/index.js` 中添加对应 API 方法

---

## 平台兼容性

| 平台 | 支持状态 |
|------|----------|
| H5（Chrome/Safari） | 支持 |
| 微信小程序 | 支持 |
| Android App | 支持（UniApp 打包） |
| iOS App | 支持（UniApp 打包） |
| 支付宝/百度/抖音小程序 | 构建脚本已配置 |

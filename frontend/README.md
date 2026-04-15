# PetSocial Frontend

PetSocial 是一个基于 UniApp 开发的宠物社交应用前端项目，支持多平台（H5、微信小程序、App）运行。

## 📋 项目简介

这是一个专注于宠物爱好者的社交平台，用户可以：
- 创建和管理宠物档案
- 发布图文动态
- 浏览不同分类的宠物内容
- 与其他用户互动（点赞、评论、关注）

## 🛠 技术栈

- **框架**: [UniApp](https://uniapp.dcloud.io/) (Vue 3)
- **开发工具**: HBuilderX 或 VS Code
- **样式**: SCSS
- **API 请求**: 基于 `uni.request` 的 Promise 封装

## 📂 目录结构

```
frontend/
├── src/
│   ├── api/             # API 接口定义
│   ├── components/      # 公共组件 (如 PostCard)
│   ├── pages/           # 页面文件
│   │   ├── index/       # 首页 (支持左右滑动分类)
│   │   ├── login/       # 登录页
│   │   ├── register/    # 注册页
│   │   ├── post/        # 帖子相关 (发布、详情)
│   │   ├── profile/     # 个人主页 & 他人主页
│   │   ├── user/        # 用户资料编辑
│   │   └── follow/      # 关注/粉丝列表
│   ├── static/          # 静态资源 (图片、图标)
│   ├── utils/           # 工具函数 (request.js 等)
│   ├── App.vue          # 应用入口
│   ├── main.js          # Vue 初始化
│   ├── manifest.json    # 应用配置
│   ├── pages.json       # 页面路由与 Tabbar 配置
│   └── uni.scss         # 全局样式变量
└── README.md
```

## 🚀 快速开始

### 1. 环境准备
- 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) (推荐) 或 Node.js 环境。
- 确保后端服务已启动 (默认地址 `http://localhost:3001`)。

### 2. 运行项目

#### 使用 HBuilderX:
1. 打开 HBuilderX，导入 `frontend` 目录。
2. 菜单栏点击 **运行** -> **运行到浏览器** 或 **运行到小程序模拟器**。

#### 使用 CLI (如果已配置):
```bash
npm install
npm run dev:h5
# 或
npm run dev:mp-weixin
```

### 3. 配置后端地址
如果后端地址不是本地 `3001` 端口，请修改 `src/utils/request.js` 和 `src/api/index.js` 中的 `BASE_URL`。

### 4. 本地真机调试

请查看修改 `src/utils/request.js` 和 `src/api/index.js` 中的 `BASE_URL`。

## ✨ 核心功能

1.  **认证系统**
    *   手机号验证码登录/注册。
    *   多账号切换支持。
    *   Token 自动管理与拦截。

2.  **内容流**
    *   首页 Swiper 左右滑动切换分类。
    *   下拉刷新与上拉加载更多。
    *   图片懒加载与预览。

3.  **互动社交**
    *   点赞与取消点赞 (实时更新)。
    *   评论发布与删除 (支持权限控制)。
    *   关注/取关用户。

4.  **发布功能**
    *   多图上传 (并发上传优化)。
    *   发布前预览与删除图片。

## 📱 兼容性

- H5 (Chrome, Safari, etc.)
- 微信小程序
- Android / iOS App (通过 UniApp 打包)

## 📄 许可证

MIT

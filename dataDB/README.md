# DataDB — 宠物百科微服务

> Express + MongoDB + Mongoose，独立的宠物品种信息管理服务。

---

## 环境要求

- Node.js >= 16
- MongoDB（本地运行，端口 27017）

---

## 快速启动

```bash
cd dataDB
npm install
# 确认 .env 配置正确
npm start
# → http://localhost:3005
```

启动成功后控制台输出：
```
MongoDB连接成功
服务器运行在 http://localhost:3005
```

> 打开 `http://localhost:3005` 可访问内置的可视化管理页面。

---

## ⚠️ 环境变量配置 (.env)

```env
PORT=3005
MONGODB_URI=mongodb://127.0.0.1:27017/petEncyclopedia   # ← 改为实际 MongoDB 地址
```

> 如使用远程 MongoDB（如 Atlas），替换为对应连接字符串：
> `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/petEncyclopedia`

---

## 目录结构

```
dataDB/
├── index.js                      # ★ 应用主文件（Express + 所有路由内联）
├── models/
│   └── Pet.js                    # Mongoose Pet 数据模型
├── public/
│   └── index.html                # 可视化管理前端页面（Vue 3 + TailwindCSS CDN）
├── .env                          # ★ 环境变量
└── package.json
```

---

## API 接口

基础路径：`http://localhost:3005/api`

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| `GET` | `/pets` | 获取所有宠物列表 | 无 |
| `GET` | `/pets/search` | 按名称模糊搜索 | `?name=关键字` |
| `GET` | `/pets/:id` | 获取单个宠物详情 | 路径参数 `id` |
| `POST` | `/pets` | 添加新宠物 | Body: 宠物 JSON |
| `PUT` | `/pets/:id` | 更新宠物数据 | 路径参数 `id` + Body |
| `DELETE` | `/pets/:id` | 删除宠物 | 路径参数 `id` |
| `POST` | `/pets/init-test` | 注入测试数据 | 无 |

---

## 数据模型字段

文件：`models/Pet.js`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | String | 是 | 宠物名称 |
| `engname` | String | 否 | 英文名称 |
| `nation` | String | 否 | 原产地 |
| `life` | String | 否 | 寿命（如：10-14年） |
| `price` | String | 否 | 价格区间 |
| `pic` | String | 否 | 图片 URL |
| `sticky` | Number | 否 | 粘人程度（1-10） |
| `shout` | Number | 否 | 叫声频率（1-10） |
| `friendly` | Number | 否 | 友善度（1-10） |
| `lint` | Number | 否 | 掉毛程度（1-10） |
| `beauty` | Number | 否 | 外观评分（1-10） |
| `odour` | Number | 否 | 体味（1-10） |
| `saliva` | Number | 否 | 流口水（1-10） |
| `active` | Number | 否 | 运动量（1-10） |
| `message` | String | 否 | 品种简介 |
| `feed` | String | 否 | 喂养建议 |
| `relative` | String | 否 | 体型特征 / 优缺点 |
| `pick` | String | 否 | 挑选建议 |

---

## 与其他模块的关系

- `frontend/` 的宠物百科页面（`pages/baike/`）调用此服务的 API
- 与主后端 `server/`（端口 3001）完全独立，使用不同数据库（MongoDB vs MySQL）
- 前端通过不同 BASE_URL 区分调用：主服务 3001，百科服务 3005

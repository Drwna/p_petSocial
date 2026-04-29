import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/posts',
    children: [
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('@/views/PostList.vue'),
        meta: { title: '帖子管理' }
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('@/views/CommentList.vue'),
        meta: { title: '评论管理' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/CategoryList.vue'),
        meta: { title: '分类配置' }
      },
      {
        path: 'topics',
        name: 'Topics',
        component: () => import('@/views/TopicList.vue'),
        meta: { title: '话题配置' }
      },
      {
        path: 'merchants',
        name: 'Merchants',
        component: () => import('@/views/MerchantList.vue'),
        meta: { title: '商家管理' }
      },
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/ActivityList.vue'),
        meta: { title: '活动审核' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
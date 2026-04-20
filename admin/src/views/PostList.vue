<template>
  <div class="post-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>帖子列表</span>
          <el-input v-model="keyword" placeholder="关键词搜索" style="width: 200px" @input="handleSearch" />
        </div>
      </template>
      <el-table :data="posts" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="作者" width="150">
          <template #default="{ row }">
            {{ row.pet?.petName }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="状态" width="180">
          <template #default="{ row }">
            <el-tag :type="row.isPinned ? 'warning' : 'info'">{{ row.isPinned ? '置顶' : '常规' }}</el-tag>
            <el-tag :type="row.isFeatured ? 'danger' : 'info'" style="margin-left: 5px">{{ row.isFeatured ? '精品' : '常规' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" :type="row.isPinned ? 'info' : 'warning'" @click="handlePin(row)">
              {{ row.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button size="small" :type="row.isFeatured ? 'info' : 'danger'" @click="handleFeature(row)">
              {{ row.isFeatured ? '取消精品' : '精品' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 20px"
        background
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="page"
        @current-change="loadPosts"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'

const posts = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await request.get('/post/list', {
      params: { page: page.value, pageSize: 10, keyword: keyword.value }
    })
    posts.value = res.data.list
    total.value = res.data.total
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadPosts()
}

const handlePin = async (row) => {
  try {
    const isPinned = row.isPinned ? 0 : 1
    await request.post(`/post/${row.id}/pin`, { isPinned })
    ElMessage.success(isPinned ? '置顶成功' : '取消置顶成功')
    loadPosts()
  } catch (e) {}
}

const handleFeature = async (row) => {
  try {
    const isFeatured = row.isFeatured ? 0 : 1
    await request.post(`/post/${row.id}/feature`, { isFeatured })
    ElMessage.success(isFeatured ? '设为精品成功' : '取消精品成功')
    loadPosts()
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条帖子吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      await request.post('/post/delete', { postId: row.id })
      ElMessage.success('删除成功')
      loadPosts()
    } catch (e) {}
  })
}

onMounted(loadPosts)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
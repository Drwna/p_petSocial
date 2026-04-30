<template>
  <div class="post-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">帖子管理</span>
          <el-input
            v-model="keyword"
            placeholder="搜索帖子内容或作者"
            style="width: 240px"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
      </template>
      <el-table :data="posts" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="作者" width="130">
          <template #default="{ row }">
            <span>{{ row.pet?.petName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip min-width="200" />
        <el-table-column label="状态" width="160" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isPinned" type="warning" size="small" effect="light">置顶</el-tag>
            <el-tag v-if="row.isFeatured" type="danger" size="small" effect="light" style="margin-left: 4px">精品</el-tag>
            <span v-if="!row.isPinned && !row.isFeatured" style="color:#c0c4cc;font-size:12px">普通</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template #default="{ row }">
            <el-button size="small" :type="row.isPinned ? 'info' : 'warning'" plain @click="handlePin(row)">
              {{ row.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button size="small" :type="row.isFeatured ? 'info' : 'success'" plain @click="handleFeature(row)">
              {{ row.isFeatured ? '取消精品' : '精品' }}
            </el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          v-model:current-page="page"
          @current-change="loadPosts"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const posts = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

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
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
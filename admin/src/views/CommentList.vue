<template>
  <div class="comment-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">评论管理</span>
          <el-input
            v-model="keyword"
            placeholder="搜索评论内容"
            style="width: 240px"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
      </template>
      <el-table :data="comments" v-loading="loading" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column label="作者" width="130">
          <template #default="{ row }">{{ row.pet?.petName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip min-width="200" />
        <el-table-column label="所属帖子" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.post?.content || '-' }}</template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
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
          @current-change="loadComments"
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

const comments = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const keyword = ref('')

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const loadComments = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/list-all', {
      params: { page: page.value, size: 10, keyword: keyword.value }
    })
    comments.value = res.data.list
    total.value = res.data.total
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadComments()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条评论吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      await request.post('/comment/delete', { commentId: row.id })
      ElMessage.success('删除成功')
      loadComments()
    } catch (e) {}
  })
}

onMounted(loadComments)
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
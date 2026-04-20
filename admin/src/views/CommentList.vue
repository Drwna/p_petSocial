<template>
  <div class="comment-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论列表</span>
        </div>
      </template>
      <el-table :data="comments" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="作者" width="150">
          <template #default="{ row }">
            {{ row.pet?.petName }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" show-overflow-tooltip />
        <el-table-column label="所属帖子" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.post?.content }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
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
        @current-change="loadComments"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'

const comments = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

const loadComments = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/list-all', {
      params: { page: page.value, size: 10 }
    })
    comments.value = res.data.list
    total.value = res.data.total
  } catch (e) {
  } finally {
    loading.value = false
  }
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
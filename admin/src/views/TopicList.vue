<template>
  <div class="topic-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>话题配置</span>
          <el-button type="primary" @click="handleAdd">新增话题</el-button>
        </div>
      </template>
      <el-table :data="topics" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="postCount" label="帖子数" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑话题' : '新增话题'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'

const topics = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ id: null, name: '', description: '' })

const loadTopics = async () => {
  loading.value = true
  try {
    const res = await request.get('/topic/list')
    topics.value = res.data.list
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.value = { id: null, name: '', description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  try {
    if (form.value.id) {
      await request.post('/topic/update', form.value)
      ElMessage.success('更新成功')
    } else {
      await request.post('/topic/create', form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadTopics()
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该话题吗？', '警告', { type: 'warning' }).then(async () => {
    try {
      await request.post('/topic/delete', { id: row.id })
      ElMessage.success('删除成功')
      loadTopics()
    } catch (e) {}
  })
}

onMounted(loadTopics)
</script>
<template>
  <div class="category-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">分类配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增分类
          </el-button>
        </div>
      </template>
      <el-table :data="categories" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="icon" label="图标" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button size="small" plain @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="420px">
      <el-form :model="form" label-width="80px" style="padding: 0 10px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标URL或标识" />
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
import { Plus } from '@element-plus/icons-vue'

const categories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ id: null, name: '', icon: '' })

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await request.get('/category/list')
    categories.value = res.data.list
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.value = { id: null, name: '', icon: '' }
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
      await request.post('/category/update', form.value)
      ElMessage.success('更新成功')
    } else {
      await request.post('/category/create', form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (e) {}
}

const handleDelete = (row) => {
  if (row.name === '未分类') {
    return ElMessage.warning('默认分类不可删除')
  }
  ElMessageBox.confirm(
    '删除后，该分类下的所有帖子将自动迁移至"未分类"，确定继续？',
    '删除分类',
    { type: 'warning' }
  ).then(async () => {
    try {
      await request.post('/category/delete', { id: row.id })
      ElMessage.success('删除成功，关联帖子已迁移至"未分类"')
      loadCategories()
    } catch (e) {
      ElMessage.error(e?.message || '删除失败')
    }
  })
}

onMounted(loadCategories)
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
</style>
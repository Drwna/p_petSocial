<template>
  <div class="merchant-list">
    <el-card shadow="never">
      <template #header>
        <span class="card-title">商家管理</span>
      </template>

      <el-tabs v-model="activeTab" @tab-change="loadList">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="已通过" name="approved" />
        <el-tab-pane label="已拒绝" name="rejected" />
      </el-tabs>

      <el-table :data="list" v-loading="loading" style="margin-top: 12px" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="businessName" label="商家名称" />
        <el-table-column prop="contactPhone" label="联系电话" width="160" />
        <el-table-column label="申请人" width="160">
          <template #default="{ row }">
            <span>{{ row.account?.email }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="200">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button size="small" plain @click="showDetail(row)">详情</el-button>
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" plain @click="approve(row)">通过</el-button>
              <el-button size="small" type="danger" plain @click="openReject(row)">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end; display: flex"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="loadList"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商家详情" width="500px">
      <el-descriptions :column="1" border v-if="current">
        <el-descriptions-item label="商家名称">{{ current.businessName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ current.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ current.address }}</el-descriptions-item>
        <el-descriptions-item label="简介">{{ current.description }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" v-if="current.rejectReason">{{ current.rejectReason }}</el-descriptions-item>
        <el-descriptions-item label="营业执照">
          <el-image :src="current.licenseImage" style="width:120px;height:80px;object-fit:cover" :preview-src-list="[current.licenseImage]" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectVisible" title="填写拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10
const activeTab = ref('')

const detailVisible = ref(false)
const current = ref(null)
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectTarget = ref(null)

const loadList = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    if (activeTab.value) params.status = activeTab.value
    const res = await request.get('/merchant/list', { params })
    list.value = res.data.list
    total.value = res.data.total
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const statusText = (s) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' }[s] || s)
const statusType = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || '')
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const showDetail = (row) => {
  current.value = row
  detailVisible.value = true
}

const approve = (row) => {
  ElMessageBox.confirm(`确定通过「${row.businessName}」的申请？`, '确认', { type: 'warning' }).then(async () => {
    try {
      await request.post('/merchant/approve', { merchantId: row.id })
      ElMessage.success('已通过')
      loadList()
    } catch (e) {}
  })
}

const openReject = (row) => {
  rejectTarget.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

const submitReject = async () => {
  if (!rejectReason.value.trim()) return ElMessage.warning('请输入拒绝原因')
  try {
    await request.post('/merchant/reject', { merchantId: rejectTarget.value.id, rejectReason: rejectReason.value })
    ElMessage.success('已拒绝')
    rejectVisible.value = false
    loadList()
  } catch (e) {}
}

onMounted(loadList)
</script>

<style scoped>
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
</style>
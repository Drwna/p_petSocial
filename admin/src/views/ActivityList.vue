<template>
  <div class="activity-list">
    <el-card shadow="never">
      <template #header>
        <span class="card-title">活动审核管理</span>
      </template>

      <el-tabs v-model="activeTab" @tab-change="loadList">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="已通过" name="active" />
        <el-tab-pane label="已拒绝" name="rejected" />
        <el-tab-pane label="已结束" name="ended" />
      </el-tabs>

      <el-table :data="list" v-loading="loading" style="margin-top: 12px" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="活动标题" show-overflow-tooltip />
        <el-table-column label="商家" width="140">
          <template #default="{ row }">{{ row.merchant?.businessName }}</template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="140" show-overflow-tooltip />
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            {{ row.currentParticipants }}{{ row.maxParticipants ? `/${row.maxParticipants}` : '' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220">
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
    <el-dialog v-model="detailVisible" title="活动详情" width="520px">
      <el-descriptions :column="1" border v-if="current">
        <el-descriptions-item label="活动标题">{{ current.title }}</el-descriptions-item>
        <el-descriptions-item label="主办商家">{{ current.merchant?.businessName }}</el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ current.location }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatTime(current.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatTime(current.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="人数上限">{{ current.maxParticipants || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="活动描述" v-if="current.description">{{ current.description }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" v-if="current.rejectReason">{{ current.rejectReason }}</el-descriptions-item>
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
const activeTab = ref('pending')

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
    const res = await request.get('/activity/admin-list', { params })
    list.value = res.data.list
    total.value = res.data.total
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const statusText = (s) => ({ pending: '待审核', active: '已通过', rejected: '已拒绝', ended: '已结束', cancelled: '已取消' }[s] || s)
const statusType = (s) => ({ pending: 'warning', active: 'success', rejected: 'danger', ended: 'info', cancelled: 'info' }[s] || '')
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

const showDetail = (row) => {
  current.value = row
  detailVisible.value = true
}

const approve = (row) => {
  ElMessageBox.confirm(`确定通过「${row.title}」？`, '确认', { type: 'warning' }).then(async () => {
    try {
      await request.post('/activity/approve', { activityId: row.id })
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
    await request.post('/activity/reject', { activityId: rejectTarget.value.id, rejectReason: rejectReason.value })
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

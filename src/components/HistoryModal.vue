<template>
  <el-dialog :model-value="show" title="历史战绩" width="min(95vw, 900px)" append-to-body destroy-on-close @update:model-value="$emit('update:show', $event)">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="text-base font-bold flex items-center"><i class="fas fa-history mr-2"></i><span>历史战绩</span></div>
        <div class="flex items-center gap-2 whitespace-nowrap">
          <el-popconfirm title="确定清空所有历史战绩？" confirm-button-text="确认" cancel-button-text="取消" @confirm="confirmClearAll" :disabled="records.length === 0">
            <template #reference>
              <el-button type="danger" :disabled="records.length === 0" size="small">清空</el-button>
            </template>
          </el-popconfirm>
          
        </div>
      </div>
    </template>

    <div class="max-h-[70vh] overflow-y-auto">
      <el-empty v-if="records.length === 0" description="暂无历史战绩"/>
      <div v-else class="space-y-3">
        <el-card v-for="rec in records" :key="rec.id" shadow="hover" body-class="!p-3">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-slate-500">{{ formatTime(rec.time) }} · 平衡度 {{ rec.balance }}% · 模式 {{ rec.mode === 'draft' ? '选马' : '随机' }}</div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600 whitespace-nowrap">结果：</span>
              <BaseSelect v-model="rec.winner" :options="winnerOptions" wrapper-class="min-w-[140px]" @update:modelValue="() => updateRecord(rec)" />
              <el-button type="danger" text size="small" @click="removeRecord(rec.id)">删除</el-button>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <!-- 红队 -->
            <el-card 
              shadow="never" 
              :class="[
                '!p-2 transition-all duration-300',
                rec.winner === 'red' 
                  ? '!border-red-400 !bg-gradient-to-br !from-red-50 !to-red-100 shadow-lg shadow-red-200/50 ring-2 ring-red-300' 
                  : '!border-red-200'
              ]" 
              body-class="!p-2"
            >
              <div class="text-sm font-semibold mb-1 flex items-center gap-2">
                <span :class="rec.winner === 'red' ? 'text-red-800' : 'text-red-700'">
                  红队（总 {{ rec.red.total }}｜均 {{ rec.red.avg }}）
                </span>
                <div v-if="rec.winner === 'red'" class="flex items-center gap-1">
                  <span class="text-yellow-500 text-base animate-bounce">🏆</span>
                  <el-tag size="small" type="danger" class="font-bold shadow-md">
                    <i class="fas fa-crown mr-1 text-yellow-400"></i>胜利
                  </el-tag>
                </div>
                <el-tag v-else-if="rec.winner === 'blue'" size="small" type="info" effect="plain">败北</el-tag>
              </div>
              <ul class="text-sm list-disc list-inside" :class="rec.winner === 'red' ? 'text-red-800' : 'text-slate-700'">
                <li v-for="(p,i) in rec.red.players" :key="p.id">{{ i+1 }}. {{ p.isCaptain ? '👑 ' : ''}}{{ p.name }}（{{ rankName(p.rank) }}）</li>
              </ul>
            </el-card>
            
            <!-- 蓝队 -->
            <el-card 
              shadow="never" 
              :class="[
                '!p-2 transition-all duration-300',
                rec.winner === 'blue' 
                  ? '!border-blue-400 !bg-gradient-to-br !from-blue-50 !to-blue-100 shadow-lg shadow-blue-200/50 ring-2 ring-blue-300' 
                  : '!border-blue-200'
              ]" 
              body-class="!p-2"
            >
              <div class="text-sm font-semibold mb-1 flex items-center gap-2">
                <span :class="rec.winner === 'blue' ? 'text-blue-800' : 'text-blue-700'">
                  蓝队（总 {{ rec.blue.total }}｜均 {{ rec.blue.avg }}）
                </span>
                <div v-if="rec.winner === 'blue'" class="flex items-center gap-1">
                  <span class="text-yellow-500 text-base animate-bounce">🏆</span>
                  <el-tag size="small" type="primary" class="font-bold shadow-md">
                    <i class="fas fa-crown mr-1 text-yellow-400"></i>胜利
                  </el-tag>
                </div>
                <el-tag v-else-if="rec.winner === 'red'" size="small" type="info" effect="plain">败北</el-tag>
              </div>
              <ul class="text-sm list-disc list-inside" :class="rec.winner === 'blue' ? 'text-blue-800' : 'text-slate-700'">
                <li v-for="(p,i) in rec.blue.players" :key="p.id">{{ i+1 }}. {{ p.isCaptain ? '👑 ' : ''}}{{ p.name }}（{{ rankName(p.rank) }}）</li>
              </ul>
            </el-card>
          </div>
        </el-card>
      </div>
    </div>
  </el-dialog>

  <!-- 使用 el-popconfirm 代替自定义确认弹窗 -->
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  records: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:show', 'update-records'])

const rankName = (r) => ({
  bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金', diamond: '钻石', master: '大师', grandmaster: '王者'
}[r] || r || '')

const formatTime = (ts) => new Date(ts).toLocaleString()

const updateRecord = (rec) => {
  emit('update-records', props.records.map(r => r.id === rec.id ? { ...rec } : r))
}

const removeRecord = (id) => {
  emit('update-records', props.records.filter(r => r.id !== id))
}

const confirmClearAll = () => {
  emit('update-records', [])
  showClearConfirm.value = false
}
import BaseSelect from './BaseSelect.vue'

const winnerOptions = [
  { label: '未设置', value: '' },
  { label: '红队胜', value: 'red' },
  { label: '蓝队胜', value: 'blue' }
]

</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 200ms ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-panel-enter-active, .modal-panel-leave-active { transition: all 220ms ease; }
.modal-panel-enter-from { opacity: 0; transform: translateY(8px) scale(0.98); }
.modal-panel-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
</style>


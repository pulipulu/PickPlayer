<template>
  <el-dialog 
    :model-value="show" 
    width="min(95vw, 520px)" 
    append-to-body 
    destroy-on-close
    @update:model-value="$emit('update:show', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">
          <i class="fas fa-cog mr-2 text-blue-600"></i>系统设置
        </h3>

      </div>
    </template>

    <div class="space-y-6">
      <!-- 人员管理 -->
      <div>
        <h4 class="text-lg font-semibold text-slate-800 mb-4">
          <i class="fas fa-users mr-2 text-blue-600"></i>人员管理
        </h4>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2 text-slate-700">批量添加玩家</label>
          <el-input v-model="playerInput" type="textarea" :rows="4" placeholder="每行一个昵称..."/>
          <div class="mt-2 flex space-x-2">
            <el-button type="primary" class="flex-1" @click="handleAddPlayers"><i class="fas fa-plus mr-2"></i>添加玩家</el-button>
            <el-button type="success" class="flex-1" @click="$emit('add-sample')"><i class="fas fa-users mr-2"></i>示例玩家</el-button>
          </div>
        </div>
      </div>

      <!-- 系统操作 -->
      <div>
        <h4 class="text-lg font-semibold text-slate-800 mb-4">
          <i class="fas fa-sliders-h mr-2 text-purple-600"></i>系统操作
        </h4>
        <div class="space-y-3">
          <el-button type="success" class="w-full" @click="$emit('export')"><i class="fas fa-download mr-2"></i>导出结果</el-button>
          <el-button type="danger" class="w-full" @click="$emit('reset')"><i class="fas fa-trash mr-2"></i>重置系统</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'add-players', 'add-sample', 'export', 'reset'])

const playerInput = ref('')

const handleAddPlayers = () => {
  if (playerInput.value.trim()) {
    emit('add-players', playerInput.value)
    playerInput.value = ''
  }
}

const handleBackdropClick = () => {
  emit('update:show', false)
}
</script>

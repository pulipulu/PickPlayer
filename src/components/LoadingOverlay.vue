<template>
  <el-dialog 
    :model-value="show" 
    width="360px" 
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    destroy-on-close
    center
  >
    <template #header><span></span></template>
    <div class="text-center py-4">
      <el-icon class="is-loading" size="32" color="#409eff">
        <loading />
      </el-icon>
      <p class="text-slate-700 font-medium mt-4">{{ message }}</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '加载中...'
  }
})
</script>

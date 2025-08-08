<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-4 mb-4 overflow-visible relative z-50" style="overflow: visible !important;">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:space-x-4">
        <div class="flex items-center space-x-2 text-xs sm:text-sm">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-slate-600">选手人数：<span class="text-blue-600 font-semibold">{{ playerCount }}</span></span>
        </div>
        <div class="flex items-center space-x-2 text-xs sm:text-sm">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span class="text-slate-600">待选区人数：<span class="text-blue-600 font-semibold">{{ candidateCount }}</span>/10</span>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <!-- 选手管理按钮 + 自定义气泡 -->
        <div class="relative">
          <button 
            @click="$emit('manage-players')"
            class="manage-players-btn px-4 py-2 rounded-lg transition-colors text-white text-sm"
            :class="[
              hintItems.length ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-red-400 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            ]"
          >
            <i class="fas fa-users mr-1"></i>选手管理
          </button>
          <!-- 引导徽标 -->
          <div v-if="hintItems.length" class="absolute -top-2 -right-2 flex items-center">
            <span class="relative inline-flex">
              <span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <!-- 气泡内容 -->
          <div 
            v-if="hintItems.length && showHints"
            class="absolute z-[1500] top-full mt-2 bg-white border-2 border-red-200 shadow-2xl rounded-md p-3 text-xs text-slate-700
                   w-[min(92vw,18rem)] sm:w-72 max-w-[92vw]
                   left-0 sm:left-auto sm:right-0
                   max-h-[50vh] overflow-auto hint-bubble"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="font-bold text-red-600 text-sm flex items-center">
                <i class="fas fa-exclamation-triangle mr-1 text-yellow-500"></i>
                添加选手
              </div>
              <button 
                class="text-slate-400 hover:text-slate-600 text-lg leading-none" 
                @click="showHints = false" 
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <ul class="list-disc list-inside space-y-1 mb-3 text-xs text-slate-700">
              <li v-for="(msg, idx) in hintItems" :key="idx" class="text-slate-800 font-medium">{{ msg }}</li>
            </ul>
            <div class="text-right">
              <el-button 
                @click="$emit('manage-players')" 
                type="primary" 
                size="small"
                class="!text-xs"
              >
                去处理
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 随机挑选按钮已移至选手弹窗内 -->
        <button 
          @click.stop="$emit('random-match')"
          :class="[
            'px-4 py-2 rounded-lg transition-colors text-white text-sm',
            candidateCount >= 2
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-gray-500 hover:bg-gray-600'
          ]"
          :title="candidateCount < 2 ? '需要至少2名候选者才能开始匹配' : '开始随机匹配'"
        >
          <i class="fas fa-random mr-1"></i>随机匹配
          <span v-if="candidateCount < 2" class="ml-1 text-xs">
            ({{ candidateCount }}/2+)
          </span>
        </button>
        <button 
          @click.stop="$emit('draft-mode')"
          :class="[
            'px-4 py-2 rounded-lg transition-colors text-white text-sm',
            candidateCount === 10
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-500 hover:bg-gray-600'
          ]"
          :title="candidateCount !== 10 ? '需要恰好10名玩家才能开始选马' : '开始选马模式'"
        >
          <i class="fas fa-hand-pointer mr-1"></i>选马模式
          <span v-if="candidateCount !== 10" class="ml-1 text-xs">
            ({{ candidateCount }}/10)
          </span>
        </button>
        <button 
          @click.stop="$emit('show-history')"
          class="px-4 py-2 rounded-lg transition-colors text-white text-sm bg-slate-700 hover:bg-slate-800"
          title="查看历史战绩"
        >
          <i class="fas fa-history mr-1"></i>历史战绩
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  playerCount: {
    type: Number,
    default: 0
  },
  candidateCount: {
    type: Number,
    default: 0
  },
})

defineEmits(['manage-players', 'random-match', 'draft-mode'])

// 气泡提示逻辑
const showHints = ref(true)
const isMobile = ref(false)

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const hintItems = computed(() => {
  const items = []
  if (props.playerCount < 10) {
    items.push(`选手人数不足，当前 ${props.playerCount}，建议≥10`)
  }
  if (props.candidateCount < 2) {
    items.push(`待选区人数不足，当前 ${props.candidateCount}，随机匹配需≥2`)
  }
  if (props.candidateCount !== 10) {
    items.push(`待选区非10人，当前 ${props.candidateCount}，选马需=10`)
  }
  return items
})
</script>

<style scoped>
/* 气泡样式优化 */
.hint-bubble {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

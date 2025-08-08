<template>
  <nav class="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-[100]">
    <div class="container mx-auto px-2 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <i class="fas fa-gamepad text-white text-sm"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PICK内战选马
            </h1>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- 状态指示器 -->
          <div class="hidden md:flex items-center space-x-4 text-sm">
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-slate-600">选手人数：<span class="text-blue-600 font-semibold">{{ playerCount }}</span></span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-slate-600">待选区人数：<span class="text-blue-600 font-semibold">{{ candidateCount }}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  playerCount: {
    type: Number,
    default: 0
  },
  candidateCount: {
    type: Number,
    default: 0
  }
})

</script>

<template>
  <div class="fixed top-4 right-4 z-[200] md:top-16 space-y-2">
    <TransitionGroup name="toast" tag="div" class="space-y-2">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <div :class="getToastClass(toast.type)" class="text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <i :class="getToastIcon(toast.type)"></i>
          <span>{{ toast.message }}</span>
          <button 
            @click="$emit('remove', toast.id)"
            class="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  toasts: {
    type: Array,
    default: () => []
  }
})

defineEmits(['remove'])

const getToastClass = (type) => {
  const colorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  return colorMap[type] || 'bg-blue-500'
}

const getToastIcon = (type) => {
  const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return iconMap[type] || 'fas fa-info-circle'
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

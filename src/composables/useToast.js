import { ref } from 'vue'

export function useToast() {
  const toasts = ref([])
  let nextId = 1
  const muted = ref(false)
  const defaultDuration = 2400

  const showToast = (message, type = 'info', duration = defaultDuration) => {
    if (muted.value) return null
    const id = nextId++
    const toast = {
      id,
      message,
      type,
      timestamp: Date.now()
    }

    toasts.value.push(toast)

    // 自动移除
    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    muted
  }
}

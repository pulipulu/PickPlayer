<template>
  <BaseSelect 
    :model-value="modelValue"
    :options="rankOptions"
    :size="elementSize"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'gold'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md'
  }
})

defineEmits(['update:modelValue'])

const rankOptions = [
  { label: '🥉 青铜', value: 'bronze' },
  { label: '🥈 白银', value: 'silver' },
  { label: '🥇 黄金', value: 'gold' },
  { label: '💎 铂金', value: 'platinum' },
  { label: '💠 钻石', value: 'diamond' },
  { label: '👑 大师', value: 'master' },
  { label: '🏆 王者', value: 'grandmaster' }
]

const elementSize = computed(() => {
  return props.size === 'sm' ? 'small' : 'default'
})
</script>
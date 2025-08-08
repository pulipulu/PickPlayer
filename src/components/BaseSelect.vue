<template>
  <div :class="wrapperClass" class="w-full">
    <el-select 
      v-model="innerValue" 
      :placeholder="placeholder" 
      :disabled="disabled" 
      class="w-full" 
      popper-class="z-[1000]"
      :size="size"
    >
      <el-option 
        v-for="opt in normalizedOptions" 
        :key="String(opt.value)" 
        :label="opt.label" 
        :value="opt.value" 
      />
    </el-select>
  </div>
  
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Object, null], default: null },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  wrapperClass: { type: String, default: '' },
  size: { type: String, default: '' } // '', 'large', 'small'
})

const emit = defineEmits(['update:modelValue'])
const innerValue = ref(props.modelValue)
watch(() => props.modelValue, v => { innerValue.value = v })

const normalizedOptions = computed(() => {
  return props.options.map(opt => typeof opt === 'object' ? opt : { label: String(opt), value: opt })
})

watch(innerValue, v => emit('update:modelValue', v))
</script>

<style scoped>
</style>


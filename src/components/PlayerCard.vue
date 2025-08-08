<template>
  <div 
    :data-player-id="player.id"
    :class="[
      'player-card bg-white rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md group relative',
      (size === 'tiny' ? 'min-w-[90px] max-w-none sm:min-w-[100px] lg:min-w-[110px]' : size === 'mini' ? 'min-w-[110px]' : size === 'small' ? 'min-w-[120px]' : 'min-w-[140px]'),
      cardClass,
      {
        'border-slate-200 hover:border-blue-300': !variant,
        'border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-emerald-50': variant === 'candidate',
        'cursor-pointer transform hover:scale-105': clickable && !showActions,
        'border-red-200 bg-gradient-to-br from-red-50 to-red-100': variant === 'red-team',
        'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100': variant === 'blue-team',
        'player-selecting': isSelecting
      }
    ]"
    @click="handleClick"
  >
    <!-- 内联编辑模式 -->
    <div v-if="isEditing" class="absolute inset-0 z-20 bg-white/95 rounded-xl p-3 flex flex-col justify-between border-2 border-blue-300 shadow-lg">
      <div class="grid grid-cols-1 gap-2">
        <input v-model="editName" type="text" class="w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="昵称" />
        <RankSelect v-model="editRank" size="sm" />
        <input v-model.number="editPower" type="number" class="w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500" placeholder="分数" min="1" max="1000" />
      </div>
      <div class="mt-2 flex items-center justify-end space-x-2">
        <button @click.stop="cancelInlineEdit" class="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded">取消</button>
        <button @click.stop="saveInlineEdit" class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded">保存</button>
      </div>
    </div>

    <!-- 操作按钮：移动端通过“…”按钮展开，桌面端悬浮可见 -->
    <div v-if="showActions" :class="[
        'absolute top-0 p-1.5 transition-all duration-200 z-10 flex space-x-1',
        actionsOpen ? 'right-10 md:right-0 opacity-100' : 'right-0 opacity-0 md:opacity-0 md:group-hover:opacity-100'
      ]">
      <button 
        @click="handleEdit"
        class="w-9 h-9 md:w-7 md:h-7 bg-blue-500/90 hover:bg-blue-600 rounded-md flex items-center justify-center text-white text-base md:text-sm transition-all hover:scale-105 active:scale-95"
        title="编辑选手信息"
      >
        <i class="fas fa-edit"></i>
      </button>
      <button 
        @click="handleDelete"
        class="w-9 h-9 md:w-7 md:h-7 bg-red-500/90 hover:bg-red-600 rounded-md flex items-center justify-center text-white text-base md:text-sm transition-all hover:scale-105 active:scale-95"
        title="删除选手"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <!-- 移动端展开开关（桌面隐藏） -->
    <button 
      v-if="showActions && !actionsOpen"
      class="md:hidden absolute top-1 right-1 w-7 h-7 bg-slate-700/70 hover:bg-slate-700 text-white rounded-md flex items-center justify-center z-10 active:scale-95"
      title="更多"
      @click.stop="toggleActions"
    >
      <i class="fas fa-ellipsis-h text-sm"></i>
    </button>
    <!-- 移动端收起按钮（覆盖层展开时显示） -->
    <button 
      v-if="showActions && actionsOpen"
      class="md:hidden absolute top-1 right-1 w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md flex items-center justify-center z-20 active:scale-95"
      title="收起"
      @click.stop="toggleActions"
    >
      <i class="fas fa-times text-sm"></i>
    </button>
    
    <div :class="['text-center', size === 'tiny' ? 'p-1.5' : size === 'mini' ? 'p-2' : size === 'small' ? 'p-3' : 'p-4']">
      <!-- 头像区域 -->
      <div class="relative">
        <div 
          :class="[
            'rounded-full flex items-center justify-center mx-auto mb-3',
            getAvatarClass(),
            size === 'tiny' ? 'w-9 h-9' : size === 'mini' ? 'w-10 h-10' : size === 'small' ? 'w-12 h-12' : 'w-16 h-16'
          ]"
        >
          <span 
            :class="[
              'text-white font-bold',
              size === 'tiny' ? 'text-sm' : size === 'mini' ? 'text-base' : size === 'small' ? 'text-lg' : 'text-xl'
            ]"
          >
            {{ player.name.charAt(0) }}
          </span>
        </div>
      </div>

      <!-- 玩家信息 -->
      <div class="font-semibold text-slate-800 mb-2" :class="size === 'tiny' ? 'text-xs' : size === 'mini' ? 'text-sm' : size === 'small' ? 'text-base' : 'text-lg'">
        {{ player.name }}
      </div>
      
      <!-- 段位 -->
      <div class="flex items-center justify-center space-x-2 mb-2">
        <span 
          :class="[
            'player-rank rounded-full text-white font-medium',
            `rank-${player.rank}`,
            size === 'tiny' ? 'px-1 py-0.5 text-[9px]' : size === 'mini' ? 'px-1.5 py-0.5 text-[10px]' : size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
          ]"
        >
          {{ getRankDisplayName(player.rank) }}
        </span>
      </div>
      
      <!-- 实力值 -->
      <div 
        :class="[
          'font-bold',
          getPowerColor(),
          size === 'tiny' ? 'text-xs' : size === 'mini' ? 'text-sm' : size === 'small' ? 'text-base' : 'text-lg'
        ]"
      >
        {{ player.power }}
      </div>
      <div class="text-xs text-slate-500 mt-1">实力值</div>

      <!-- 操作按钮/图标 -->
      <div v-if="showAction" class="mt-2">
        <i 
          v-if="actionIcon" 
          :class="['fas', actionIcon, actionIconColor || 'text-blue-500']"
        ></i>
        <button 
          v-else-if="actionText"
          :class="[
            'px-2 py-1 rounded text-xs font-medium transition-colors',
            actionButtonClass || 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          ]"
          @click.stop="$emit('action', player.id)"
        >
          {{ actionText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RankSelect from './RankSelect.vue'

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'normal', // 'tiny' | 'mini' | 'small' | 'normal'
    validator: (value) => ['tiny', 'mini', 'small', 'normal'].includes(value)
  },
  variant: {
    type: String,
    default: null, // null | 'candidate' | 'red-team' | 'blue-team'
    validator: (value) => [null, 'candidate', 'red-team', 'blue-team'].includes(value)
  },
  inlineEditable: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  },
  showAction: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  actionIcon: {
    type: String,
    default: null // 'fa-plus' | 'fa-times' | 'fa-trash' 等
  },
  actionIconColor: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  actionButtonClass: {
    type: String,
    default: null
  },
  cardClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click', 'action', 'edit', 'delete', 'update'])

const isEditing = ref(false)
const actionsOpen = ref(false)
const editName = ref('')
const editRank = ref('gold')
const editPower = ref(0)
const isSelecting = ref(false)

// 添加编辑和删除处理函数
const handleEdit = (e) => {
  e.stopPropagation()
  if (props.inlineEditable) {
    // 进入内联编辑模式
    editName.value = props.player.name
    editRank.value = props.player.rank
    editPower.value = props.player.power
    isEditing.value = true
  } else {
    emit('edit', props.player.id)
  }
}

const handleDelete = (e) => {
  e.stopPropagation()
  emit('delete', props.player.id)
}

const handleClick = (e) => {
  // 如果点击的是操作按钮区域，不触发卡片点击事件
  if (props.showActions && e.target.closest('.absolute')) {
    return
  }
  
  if (props.clickable) {
    // 添加选中动画效果
    isSelecting.value = true
    setTimeout(() => {
      isSelecting.value = false
    }, 400)
    
    emit('click', props.player.id)
  }
}

const saveInlineEdit = () => {
  if (!props.inlineEditable) return
  const updated = {
    id: props.player.id,
    name: editName.value.trim() || props.player.name,
    rank: editRank.value,
    power: Number(editPower.value) || props.player.power
  }
  emit('update', updated)
  isEditing.value = false
}

const cancelInlineEdit = () => {
  isEditing.value = false
}

const toggleActions = () => {
  actionsOpen.value = !actionsOpen.value
}

const getRankDisplayName = (rank) => {
  const rankNames = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '铂金',
    diamond: '钻石',
    master: '大师',
    grandmaster: '王者'
  }
  return rankNames[rank] || rank
}

const getAvatarClass = () => {
  if (props.variant === 'red-team') {
    return 'bg-gradient-to-r from-red-500 to-red-600'
  } else if (props.variant === 'blue-team') {
    return 'bg-gradient-to-r from-blue-500 to-blue-600'
  } else if (props.variant === 'candidate') {
    return 'bg-gradient-to-r from-green-500 to-emerald-500'
  } else {
    return 'bg-gradient-to-r from-blue-500 to-indigo-500'
  }
}

const getPowerColor = () => {
  if (props.variant === 'red-team') {
    return 'text-red-600'
  } else if (props.variant === 'blue-team') {
    return 'text-blue-600'
  } else if (props.variant === 'candidate') {
    return 'text-green-600'
  } else {
    return 'text-blue-600'
  }
}
</script>

<style scoped>
.player-rank {
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.player-rank::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.player-rank:hover::before {
  left: 100%;
}

.player-rank.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
  box-shadow: 0 2px 4px rgba(205, 127, 50, 0.4);
}

.player-rank.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  box-shadow: 0 2px 4px rgba(192, 192, 192, 0.4);
}

.player-rank.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.4);
}

.player-rank.rank-platinum {
  background: linear-gradient(135deg, #e5e4e2, #b8b8b8);
  box-shadow: 0 2px 4px rgba(229, 228, 226, 0.4);
}

.player-rank.rank-diamond {
  background: linear-gradient(135deg, #b9f2ff, #87ceeb);
  box-shadow: 0 2px 4px rgba(185, 242, 255, 0.4);
}

.player-rank.rank-master {
  background: linear-gradient(135deg, #9370db, #8a2be2);
  box-shadow: 0 2px 4px rgba(147, 112, 219, 0.4);
}

.player-rank.rank-grandmaster {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.4);
}

/* 选中动画 - 更温和的效果 */
@keyframes selection-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
    transform: scale(1.02);
  }
}

.player-selecting {
  animation: selection-pulse 0.4s ease-out;
}
</style>

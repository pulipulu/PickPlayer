<template>
  <el-dialog 
    :model-value="show" 
    width="min(90vw, 1200px)" 
    top="5vh" 
    append-to-body 
    destroy-on-close
    @update:model-value="$emit('update:show', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-base sm:text-xl font-bold text-slate-800">
            <i class="fas fa-clipboard-check mr-2 text-green-600"></i>待选区管理
            <span class="text-sm font-normal text-slate-500 ml-2">({{ candidates.length }}/10人)</span>
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">点击或拖拽玩家到待选区，用于后续的匹配和选马模式</p>
        </div>
        <div class="flex items-center gap-2">
          <el-button 
            type="primary" 
            size="small"
            @click="$emit('balance-select')"
            class="hidden sm:inline-flex"
          >
            <i class="fas fa-balance-scale mr-1"></i>平衡选择
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            @click="$emit('clear')"
            class="hidden sm:inline-flex"
          >
            <i class="fas fa-trash mr-1"></i>清空
          </el-button>

        </div>
      </div>
    </template>
    <!-- 移动端操作按钮 -->
    <div class="sm:hidden mb-4 flex gap-2">
      <el-button type="primary" class="flex-1" @click="$emit('balance-select')">
        <i class="fas fa-balance-scale mr-1"></i>平衡选择
      </el-button>
      <el-button type="danger" class="flex-1" @click="$emit('clear')">
        <i class="fas fa-trash mr-1"></i>清空
      </el-button>
    </div>

    <div class="flex-1">
      <!-- 待选区 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base sm:text-lg font-semibold text-slate-800">
            <i class="fas fa-clipboard-check mr-2 text-green-600"></i>待选区 ({{ candidates.length }}/10)
          </h4>
          <div class="text-xs sm:text-sm">
            <el-tag v-if="candidates.length === 10" type="success" size="small">
              <i class="fas fa-check-circle mr-1"></i>可以开始选马
            </el-tag>
            <el-tag v-else-if="candidates.length < 10" type="warning" size="small">
              还需要 {{ 10 - candidates.length }} 人
            </el-tag>
            <el-tag v-else type="danger" size="small">
              超出限制 {{ candidates.length - 10 }} 人
            </el-tag>
          </div>
        </div>
        
        <!-- 待选区空状态 -->
        <el-empty v-if="candidates.length === 0" description="待选区为空">
          <template #description>
            <span class="text-slate-500">从下方玩家列表中选择玩家添加到待选区</span>
          </template>
          <el-button type="primary" @click="$emit('balance-select')">
            <i class="fas fa-balance-scale mr-1"></i>平衡选择
          </el-button>
        </el-empty>
        
        <!-- 待选区玩家列表 -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <div
            v-for="(player, index) in candidates" 
            :key="player.id"
            class="relative group"
          >
            <PlayerCard 
              :player="player"
              size="small"
              variant="candidate"
              :clickable="true"
              @click="removeFromCandidates(player.id)"
            />
          </div>
        </div>
      </div>
      
      <!-- 所有玩家 -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base sm:text-lg font-semibold text-slate-800">
            <i class="fas fa-users mr-2 text-blue-600"></i>所有玩家 ({{ players.length }}人)
          </h4>
          <div class="text-xs sm:text-sm text-slate-500 hidden sm:block">
            点击或拖拽玩家卡片可添加到待选区
          </div>
        </div>
        
        <el-empty v-if="players.length === 0" description="暂无玩家">
          <template #description>
            <span class="text-slate-500">请先添加玩家</span>
          </template>
        </el-empty>
        
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          <div
            v-for="player in availablePlayers" 
            :key="player.id"
            class="relative group"
          >
            <PlayerCard 
              :player="player"
              size="small"
              :clickable="true"
              :show-action="true"
              action-icon="fa-plus"
              action-icon-color="text-blue-500"
              @click="addToCandidates(player.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import PlayerCard from './PlayerCard.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  players: {
    type: Array,
    default: () => []
  },
  candidates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'update-candidates', 'balance-select', 'clear'])

const availablePlayers = computed(() => {
  return props.players.filter(player => 
    !props.candidates.find(candidate => candidate.id === player.id)
  )
})



const addToCandidates = (playerId) => {
  if (props.candidates.length >= 10) {
    // 使用toast提示而不是alert
    return
  }
  
  const player = props.players.find(p => p.id === playerId)
  if (player) {
    // 只保留基础信息，不包含队长信息
    const playerData = {
      id: player.id,
      name: player.name,
      rank: player.rank,
      power: player.power
    }
    const newCandidates = [...props.candidates, playerData]
    emit('update-candidates', newCandidates)
  }
}

const removeFromCandidates = (playerId) => {
  const newCandidates = props.candidates.filter(c => c.id !== playerId)
  emit('update-candidates', newCandidates)
}


</script>

<style scoped>
/* 简化样式 */
</style>

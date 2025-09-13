<template>
  <el-dialog 
    :model-value="show" 
    width="min(95vw, 1200px)" 
    top="3vh" 
    append-to-body 
    destroy-on-close
    :fullscreen="isMobile"
    @update:model-value="$emit('update:show', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            <i class="fas fa-users mr-2 text-blue-600"></i>选手管理
            <span class="text-sm font-normal text-slate-500 ml-2">({{ players.length }}人)</span>
            <span class="text-sm font-normal text-green-500 ml-2">(已选 {{ candidates.length }}/10人)</span>
          </h3>
          <p class="text-sm text-slate-600 mt-1">管理所有选手信息，点击选手卡片可将其添加到待选区或从待选区移除</p>
        </div>
        <div class="flex flex-wrap items-center gap-1 sm:gap-2">
          <!-- 待选区 下拉菜单 -->
          <el-dropdown trigger="click" @click.stop>
            <el-button 
              type="info" 
              :size="isMobile ? 'small' : 'default'" 
              :disabled="isSelecting && candidates.length === 0"
            >
              <i class="fas fa-list mr-1"></i><span class="hidden sm:inline">待选区</span>
              <i class="fas fa-caret-down ml-1 hidden sm:inline"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  @click="handleBalanceSelect()" 
                  :disabled="isSelecting"
                >
                  <i class="fas fa-balance-scale mr-2 text-teal-600"></i>
                  平衡选择
                </el-dropdown-item>
                <el-dropdown-item 
                  @click="handleRandomSelect()" 
                  :disabled="isSelecting"
                >
                  <i class="fas fa-random mr-2 text-purple-600"></i>
                  随机选择
                </el-dropdown-item>
                <el-dropdown-item 
                  @click="clearCandidates()" 
                  :disabled="candidates.length === 0"
                >
                  <i class="fas fa-trash mr-2 text-red-600"></i>清空待选
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 添加 下拉菜单 -->
          <el-dropdown trigger="click" @click.stop>
            <el-button type="primary" :size="isMobile ? 'small' : 'default'">
              <i class="fas fa-user-plus mr-1"></i><span class="hidden sm:inline">添加</span>
              <i class="fas fa-caret-down ml-1 hidden sm:inline"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showSingleAddForm = true">
                  <i class="fas fa-user-plus mr-2 text-blue-600"></i>新增选手
                </el-dropdown-item>
                <el-dropdown-item @click="showBatchAddForm = true">
                  <i class="fas fa-file-import mr-2 text-emerald-600"></i>批量添加
                </el-dropdown-item>
                <el-dropdown-item @click="$emit('add-sample')">
                  <i class="fas fa-users mr-2 text-purple-600"></i>示例玩家
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 更多 菜单 -->
          <el-dropdown trigger="click" @click.stop>
            <el-button :size="isMobile ? 'small' : 'default'">
              <i class="fas fa-ellipsis-h"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  @click="showClearAllConfirm = true" 
                  :disabled="players.length === 0"
                  class="text-red-600"
                >
                  <i class="fas fa-user-slash mr-2"></i>清空所有选手
                </el-dropdown-item>
                <el-dropdown-item @click="$emit('update:show', false)">
                  <i class="fas fa-times mr-2"></i>关闭
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>


        </div>
      </div>
    </template>


    <div class="p-0">
      <div class="flex-1">
        <div v-if="players.length === 0" class="text-center text-slate-500 py-8">
          <div class="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-user-plus text-3xl opacity-50"></i>
          </div>
          <h4 class="text-lg font-semibold mb-2">暂无玩家</h4>
          <p class="text-sm mb-4">开始添加玩家来使用匹配系统</p>
          <div class="flex justify-center space-x-2">
            <el-button type="primary" @click="showSingleAddForm = true"><i class="fas fa-plus mr-1"></i>添加玩家</el-button>
            <el-button type="success" @click="$emit('add-sample')"><i class="fas fa-users mr-1"></i>示例玩家</el-button>
          </div>
        </div>
        
        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-slate-800">玩家列表</h4>
            <div class="flex items-center gap-2">
              <div class="text-sm text-slate-500">共 {{ players.length }} 名玩家，已选 {{ candidates.length }}/10 名</div>
              <el-button type="success" size="small" @click="$emit('add-sample')"><i class="fas fa-users mr-1"></i>示例玩家</el-button>
            </div>
          </div>
          
          <!-- 玩家列表 - 已选择的排在前面 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            <!-- 已选择的玩家 -->
            <div 
              v-for="player in selectedPlayers" 
              :key="`selected-${player.id}`" 
              class="relative player-card-container"
              :class="getPlayerCardAnimation(player.id, true)"
            >
              <Transition name="check-badge" appear>
                <div class="absolute top-2 right-2 z-10 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <i class="fas fa-check text-white text-xs"></i>
                </div>
              </Transition>
              <PlayerCard 
                :player="player"
                size="small"
                :inline-editable="true"
                variant="candidate"
                :clickable="true"
                @click="togglePlayerSelection(player.id)"
                :show-actions="true"
                @update="handleInlineUpdate"
                @delete="removePlayer"
              />
            </div>
            
            <!-- 未选择的玩家 -->
            <div 
              v-for="player in unselectedPlayers" 
              :key="`unselected-${player.id}`" 
              class="relative player-card-container"
              :class="getPlayerCardAnimation(player.id, false)"
            >
              <PlayerCard 
                :player="player"
                size="small"
                :inline-editable="true"
                :clickable="true"
                @click="togglePlayerSelection(player.id)"
                :show-actions="true"
                @update="handleInlineUpdate"
                @delete="removePlayer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增选手弹窗（Element Plus） -->
    <el-dialog 
      :model-value="showSingleAddForm" 
      width="min(95vw, 600px)" 
      append-to-body 
      destroy-on-close
      @update:model-value="val => showSingleAddForm = val"
    >
      <template #header>
        <div class="text-base font-bold"><i class="fas fa-user-plus mr-2 text-blue-600"></i>新增选手</div>
      </template>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">选手昵称 *</label>
          <el-input v-model="singleAddForm.name" placeholder="请输入选手昵称..." size="large"/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">段位</label>
          <BaseSelect v-model="singleAddForm.rank" :options="rankOptions" size="large"/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">分数</label>
          <el-input v-model="singleAddForm.power" type="number" placeholder="留空自动计算..." size="large"/>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <el-button type="primary" class="flex-1" @click="handleAddSinglePlayer"><i class="fas fa-plus mr-2"></i>添加选手</el-button>
          <el-button class="flex-1" @click="showSingleAddForm = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量添加弹窗（Element Plus） -->
    <el-dialog 
      :model-value="showBatchAddForm" 
      width="min(95vw, 600px)" 
      append-to-body 
      destroy-on-close
      @update:model-value="val => showBatchAddForm = val"
    >
      <template #header>
        <div class="text-base font-bold"><i class="fas fa-file-import mr-2 text-emerald-600"></i>批量添加选手</div>
      </template>
      <div>
        <p class="text-xs text-slate-600 mb-2">
          - 每行一个，格式：<span class="font-medium">昵称</span> 或 <span class="font-medium">昵称,段位</span>；段位可选：bronze / silver / gold / platinum / diamond / master / grandmaster。<br>
          - 空行与重复昵称会被忽略；未写段位默认 <span class="font-medium">gold</span>。
        </p>
        <el-input v-model="batchAddText" type="textarea" :rows="8" :placeholder="batchPlaceholder"/>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <el-button type="success" class="flex-1" @click="handleBatchAddPlayers"><i class="fas fa-check mr-2"></i>添加</el-button>
          <el-button class="flex-1" @click="showBatchAddForm = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗（Element Plus） -->
    <el-dialog 
      :model-value="showDeleteConfirm" 
      width="min(95vw, 420px)" 
      append-to-body 
      destroy-on-close
      @update:model-value="val => showDeleteConfirm = val"
    >
      <template #header>
        <div class="text-base font-bold">确认删除</div>
      </template>
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
        </div>
        <p class="text-slate-600 mb-2">
          确定要删除选手 <span class="font-semibold text-red-600">{{ deletingPlayer?.name }}</span> 吗？
        </p>
        <p class="text-slate-400 text-sm mb-4">此操作无法撤销</p>
        <div class="flex gap-3">
          <el-button type="danger" class="flex-1" @click="handleConfirmDelete"><i class="fas fa-trash mr-2"></i>确认删除</el-button>
          <el-button class="flex-1" @click="showDeleteConfirm = false">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 清空所有选手确认弹窗（Element Plus） -->
    <el-dialog 
      :model-value="showClearAllConfirm" 
      width="min(95vw, 420px)" 
      append-to-body 
      destroy-on-close
      @update:model-value="val => showClearAllConfirm = val"
    >
      <template #header>
        <div class="text-base font-bold">清空所有选手</div>
      </template>
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-trash-alt text-2xl text-red-600"></i>
        </div>
        <p class="text-slate-600 mb-2">
          此操作将删除全部 {{ players.length }} 名选手，并清空待选区与结果。
        </p>
        <p class="text-slate-400 text-sm mb-4">操作不可撤销，是否继续？</p>
        <div class="flex gap-3">
          <el-button type="danger" class="flex-1" @click="confirmClearAllPlayers">确认清空</el-button>
          <el-button class="flex-1" @click="showClearAllConfirm = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<style scoped>
/* 玩家列表动画 */
.player-list-move,
.player-list-enter-active,
.player-list-leave-active {
  transition: all 0.5s ease;
}

.player-list-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.player-list-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.player-list-leave-active {
  position: absolute;
}

/* 选中徽章动画 */
.check-badge-enter-active {
  transition: all 0.3s ease;
}

.check-badge-enter-from {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

/* 操作反馈动画 */
@keyframes pulse-success {
  0%, 100% { 
    background-color: rgb(34, 197, 94);
    transform: scale(1);
  }
  50% { 
    background-color: rgb(22, 163, 74);
    transform: scale(1.05);
  }
}

.animate-pulse-success {
  animation: pulse-success 0.6s ease-in-out;
}

/* 基础玩家卡片动画 */
.player-card-container {
  transition: all 0.3s ease;
}

.player-transition {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 随机选择动画效果 */
.shuffle-effect {
  animation: balanceIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 平衡选择动画效果 */
.balance-effect {
  animation: balanceIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes balanceIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  60% {
    opacity: 1;
    transform: scale(1.05) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 最近选中的高亮效果 */
.recently-selected {
  animation: highlightSelected 0.6s ease-out;
}

@keyframes highlightSelected {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* 正在动画中的状态 */
.animating {
  z-index: 10;
}
</style>

<script setup>
import { ref, computed } from 'vue'
import PlayerCard from './PlayerCard.vue'
import BaseSelect from './BaseSelect.vue'
import { useToast } from '../composables/useToast'

// 移动端检测
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640
})

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

const emit = defineEmits([
  'update:show', 
  'add-single-player', 
  'add-sample', 
  'remove-player', 
  'edit-player',
  'update-candidates',
  'balance-select',
  'random-select',
  'clear-candidates',
  'clear-all-players'
])

const showSingleAddForm = ref(false)
const showBatchAddForm = ref(false)

const singleAddForm = ref({
  name: '',
  rank: 'gold',
  power: ''
})
const batchAddText = ref('')
// 批量添加占位符（多行）
const batchPlaceholder = `示例：\n小明,gold\n小红,platinum\n小刚\n张三,silver\n李四,master`

// 删除确认相关状态
const showDeleteConfirm = ref(false)
const deletingPlayer = ref(null)
const showClearAllConfirm = ref(false)

// Toast 通知
const { showToast } = useToast()

// 防止重复点击的状态和动画控制
const isSelecting = ref(false)
const isAnimating = ref(false)
const animationType = ref('') // 'random' or 'balance'
const animatingPlayers = ref(new Set()) // 正在动画的玩家ID
const recentlySelected = ref(new Set()) // 最近被选中的玩家ID

const rankOptions = [
  { label: '🥉 青铜', value: 'bronze' },
  { label: '🥈 白银', value: 'silver' },
  { label: '🥇 黄金', value: 'gold' },
  { label: '💎 铂金', value: 'platinum' },
  { label: '💠 钻石', value: 'diamond' },
  { label: '👑 大师', value: 'master' },
  { label: '🏆 王者', value: 'grandmaster' }
]


// 计算已选择和未选择的玩家列表
// 已选择的按照在candidates中的顺序排列（最新选择的在末尾）
const selectedPlayers = computed(() => {
  // 按照candidates数组的顺序排列，保持选择顺序
  return props.candidates
    .map(candidate => props.players.find(player => player.id === candidate.id))
    .filter(player => player) // 过滤掉可能不存在的玩家
})

const unselectedPlayers = computed(() => {
  return props.players.filter(player => 
    !props.candidates.some(candidate => candidate.id === player.id)
  )
})

// 添加/移除待选玩家
const togglePlayerSelection = (playerId) => {
  const isSelected = props.candidates.some(c => c.id === playerId)
  
  if (isSelected) {
    // 如果已选择，则移除（移除的选手将自动出现在未选择列表的末尾）
    const newCandidates = props.candidates.filter(c => c.id !== playerId)
    emit('update-candidates', newCandidates)
  } else {
    // 如果未选择，且待选区未满，则添加到队列末尾
    if (props.candidates.length >= 10) {
      // 待选区已满，不能再添加
      showToast('最多只能选择10名选手', 'warning')
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
      // 添加到candidates数组的末尾，这样新选择的选手会出现在已选择列表的末尾
      const newCandidates = [...props.candidates, playerData]
      emit('update-candidates', newCandidates)
    }
  }
}

const handleAddSinglePlayer = () => {
  if (singleAddForm.value.name.trim()) {
    const playerData = {
      name: singleAddForm.value.name.trim(),
      rank: singleAddForm.value.rank,
      power: singleAddForm.value.power ? parseInt(singleAddForm.value.power) : null
    }
    emit('add-single-player', playerData)
    singleAddForm.value = {
      name: '',
      rank: 'gold',
      power: ''
    }
    showSingleAddForm.value = false
  }
}

// 批量添加
const handleBatchAddPlayers = () => {
  if (!batchAddText.value.trim()) return
  // 解析文本：每行一个，支持 昵称 或 昵称,rank
  const lines = batchAddText.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const payload = []
  const validRanks = new Set(['bronze','silver','gold','platinum','diamond','master','grandmaster'])
  for (const line of lines) {
    const [name, rankRaw] = line.split(',').map(s => s?.trim())
    if (!name) continue
    const rank = validRanks.has(rankRaw) ? rankRaw : 'gold'
    payload.push({ name, rank, power: null })
  }
  if (payload.length) {
    // 逐个触发已有单个添加流程以复用校验
    payload.forEach(item => emit('add-single-player', item))
    showBatchAddForm.value = false
    batchAddText.value = ''
  }
}


// 卡片内联编辑更新
const handleInlineUpdate = (updated) => {
  emit('edit-player', updated)
}

const removePlayer = (id) => {
  const player = props.players.find(p => p.id === id)
  if (player) {
    deletingPlayer.value = player
    showDeleteConfirm.value = true
  }
}

const handleConfirmDelete = () => {
  if (deletingPlayer.value) {
    emit('remove-player', deletingPlayer.value.id)
    showDeleteConfirm.value = false
    deletingPlayer.value = null
  }
}

// 清空所有选手
const confirmClearAllPlayers = () => {
  emit('clear-all-players')
  showClearAllConfirm.value = false
}

// 平衡选择
const handleBalanceSelect = async () => {
  if (isSelecting.value) return
  isSelecting.value = true
  
  try {
    // 清空状态
    recentlySelected.value.clear()
    animatingPlayers.value.clear()
    
    // 先清空已选择的玩家
    emit('clear-candidates')
    
    // 等待清空完成
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 开始平衡选择动画
    isAnimating.value = true
    animationType.value = 'balance'
    
    // 执行平衡选择
    emit('balance-select')
    
    // 等待DOM更新后添加动画效果
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 为新选中的玩家添加动画标记
    props.candidates.forEach((candidate, index) => {
      setTimeout(() => {
        recentlySelected.value.add(candidate.id)
        animatingPlayers.value.add(candidate.id)
        
        // 移除动画标记
        setTimeout(() => {
          animatingPlayers.value.delete(candidate.id)
        }, 600)
      }, index * 100) // 错开动画时间
    })
    
    // 等待所有动画完成
    await new Promise(resolve => setTimeout(resolve, 800))
    
  } catch (error) {
    console.error('平衡选择失败:', error)
  } finally {
    // 重置动画状态
    setTimeout(() => {
      isSelecting.value = false
      isAnimating.value = false
      animationType.value = ''
      recentlySelected.value.clear()
    }, 300)
  }
}

// 随机选择
const handleRandomSelect = async () => {
  if (isSelecting.value) return
  
  isSelecting.value = true
  
  try {
    // 清空状态
    recentlySelected.value.clear()
    animatingPlayers.value.clear()
    
    // 先清空已选择的玩家
    emit('clear-candidates')
    
    // 等待清空完成
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 开始随机选择动画
    isAnimating.value = true
    animationType.value = 'random'
    
    // 执行随机选择
    emit('random-select')
    
    // 等待DOM更新后添加动画效果
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 为新选中的玩家添加随机动画标记
    const shuffledIndices = [...Array(props.candidates.length).keys()].sort(() => Math.random() - 0.5)
    shuffledIndices.forEach((originalIndex, animationIndex) => {
      if (props.candidates[originalIndex]) {
        setTimeout(() => {
          recentlySelected.value.add(props.candidates[originalIndex].id)
          animatingPlayers.value.add(props.candidates[originalIndex].id)
          
          // 移除动画标记
          setTimeout(() => {
            animatingPlayers.value.delete(props.candidates[originalIndex].id)
          }, 800)
        }, animationIndex * 150) // 随机错开动画时间
      }
    })
    
    // 等待所有动画完成
    await new Promise(resolve => setTimeout(resolve, 1200))
    
  } catch (error) {
    console.error('随机选择失败:', error)
  } finally {
    // 重置动画状态
    setTimeout(() => {
      isSelecting.value = false
      isAnimating.value = false
      animationType.value = ''
      recentlySelected.value.clear()
    }, 300)
  }
}

// 清空待选区
const clearCandidates = () => {
  emit('clear-candidates')
}

// 获取玩家卡片动画类
const getPlayerCardAnimation = (playerId, isSelected) => {
  const classes = []
  
  // 基础动画类
  classes.push('player-transition')
  
  // 如果正在进行选择动画
  if (isAnimating.value) {
    if (animationType.value === 'random') {
      classes.push('shuffle-effect')
    } else if (animationType.value === 'balance') {
      classes.push('balance-effect')
    }
  }
  
  // 如果是最近被选中的
  if (recentlySelected.value.has(playerId)) {
    classes.push('recently-selected')
  }
  
  // 如果正在动画中
  if (animatingPlayers.value.has(playerId)) {
    classes.push('animating')
  }
  
  return classes.join(' ')
}




</script>

<style scoped>
/* 自定义样式 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-panel-enter-active, .modal-panel-leave-active {
  transition: all 220ms ease;
}
.modal-panel-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>

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
                  <i :class="[
                    'mr-2 text-teal-600',
                    isSelecting ? 'fas fa-spinner fa-spin' : 'fas fa-balance-scale'
                  ]"></i>
                  {{ isSelecting ? '平衡中...' : '平衡选择' }}
                </el-dropdown-item>
                <el-dropdown-item 
                  @click="handleRandomSelect()" 
                  :disabled="isSelecting"
                >
                  <i :class="[
                    'mr-2 text-purple-600',
                    isSelecting ? 'fas fa-spinner fa-spin' : 'fas fa-random'
                  ]"></i>
                  {{ isSelecting ? '随机中...' : '随机选择' }}
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

    <!-- 编辑选手表单 -->
    <div v-if="showEditForm" class="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-slate-800 text-lg">
          <i class="fas fa-edit mr-2 text-blue-600"></i>编辑选手
        </h4>
        <el-button link size="small" @click="showEditForm = false"><i class="fas fa-times"></i></el-button>
      </div>
      <div class="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
        <div class="flex items-start space-x-2">
          <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div class="text-sm text-blue-700">
            <p class="font-medium">编辑说明：</p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>修改选手基本信息</li>
              <li>调整段位和分数</li>
              <li>分数留空将重新计算</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">选手昵称 *</label>
          <el-input v-model="editForm.name" placeholder="请输入选手昵称..." size="large"/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">段位</label>
          <BaseSelect v-model="editForm.rank" :options="rankOptions" size="large" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">分数</label>
          <el-input v-model="editForm.power" type="number" placeholder="留空重新计算..." size="large"/>
        </div>
      </div>
      <div class="mt-4 flex space-x-3">
        <el-button type="primary" class="flex-1" @click="handleEditPlayer"><i class="fas fa-save mr-2"></i>保存修改</el-button>
        <el-button class="flex-1" @click="showEditForm = false">取消</el-button>
      </div>
    </div>

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
          <TransitionGroup 
            name="player-list" 
            tag="div" 
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4"
          >
            <!-- 已选择的玩家 -->
            <div v-for="player in selectedPlayers" :key="`selected-${player.id}`" class="relative">
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
                @edit="editPlayer"
                @update="handleInlineUpdate"
                @delete="removePlayer"
              />
            </div>
            
            <!-- 未选择的玩家 -->
            <div v-for="player in unselectedPlayers" :key="`unselected-${player.id}`" class="relative">
              <PlayerCard 
                :player="player"
                size="small"
                :inline-editable="true"
                :clickable="true"
                @click="togglePlayerSelection(player.id)"
                :show-actions="true"
                @edit="editPlayer"
                @update="handleInlineUpdate"
                @delete="removePlayer"
              />
            </div>
          </TransitionGroup>
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
const showEditForm = ref(false)
const editingPlayer = ref(null)
const editForm = ref({
  name: '',
  rank: 'gold',
  power: ''
})
// 批量添加占位符（多行）
const batchPlaceholder = `示例：\n小明,gold\n小红,platinum\n小刚\n张三,silver\n李四,master`

// 删除确认相关状态
const showDeleteConfirm = ref(false)
const deletingPlayer = ref(null)
const showClearAllConfirm = ref(false)

// Toast 通知
const { showToast } = useToast()

// 防止重复点击的状态
const isSelecting = ref(false)

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
const selectedPlayers = computed(() => {
  return props.players.filter(player => 
    props.candidates.some(candidate => candidate.id === player.id)
  )
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
    // 如果已选择，则移除
    const newCandidates = props.candidates.filter(c => c.id !== playerId)
    emit('update-candidates', newCandidates)
  } else {
    // 如果未选择，且待选区未满，则添加
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

const editPlayer = (id) => {
  console.log('Editing player with id:', id)
  const player = props.players.find(p => p.id === id)
  if (player) {
    console.log('Found player:', player)
    // 创建一个新的对象来存储编辑中的玩家数据
    editingPlayer.value = { ...player }
    // 设置表单数据
    editForm.value = {
      name: player.name,
      rank: player.rank,
      power: player.power ? player.power.toString() : ''
    }
    // 显示编辑表单
    showEditForm.value = true
  } else {
    console.error('Player not found with id:', id)
  }
}

const handleEditPlayer = () => {
  console.log('Handling edit player submit')
  if (!editForm.value.name.trim()) {
    console.error('Player name is required')
    return
  }

  if (!editingPlayer.value) {
    console.error('No player being edited')
    return
  }

  try {
    // 确保所有必要的字段都存在
    const updatedPlayer = {
      id: editingPlayer.value.id,
      name: editForm.value.name.trim(),
      rank: editForm.value.rank,
      power: editForm.value.power ? parseInt(editForm.value.power) : null
    }

    // 打印更新前的数据
    console.log('Current player:', editingPlayer.value)
    console.log('Form data:', editForm.value)
    console.log('Updating player with data:', updatedPlayer)

    // 发出更新事件
    emit('edit-player', updatedPlayer)

    // 重置表单状态
    showEditForm.value = false
    editingPlayer.value = null
    editForm.value = {
      name: '',
      rank: 'gold',
      power: ''
    }
  } catch (error) {
    console.error('Error updating player:', error)
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
    // 先清空已选择的玩家
    emit('clear-candidates')
    
    // 等待一下确保清空完成
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 然后执行平衡选择
    emit('balance-select')
    
    // 降低提示频率：不提示
  } catch (error) {
    console.error('平衡选择失败:', error)
    // 平衡选择失败通常是内部逻辑问题，不需要提示用户
  } finally {
    // 较短的防抖时间，允许快速重新选择
    setTimeout(() => {
      isSelecting.value = false
    }, 200)
  }
}

// 随机选择
const handleRandomSelect = async () => {
  if (isSelecting.value) return
  
  isSelecting.value = true
  
  try {
    // 先清空已选择的玩家
    emit('clear-candidates')
    
    // 等待一下确保清空完成
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 然后执行随机选择
    emit('random-select')
    
    // 降低提示频率：不提示
  } catch (error) {
    console.error('随机选择失败:', error)
    // 随机选择失败通常是内部逻辑问题，不需要提示用户
  } finally {
    // 较短的防抖时间，允许快速重新随机
    setTimeout(() => {
      isSelecting.value = false
    }, 200)
  }
}

// 清空待选区
const clearCandidates = () => {
  emit('clear-candidates')
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

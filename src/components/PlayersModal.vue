<template>
  <el-dialog 
    :model-value="show" 
    width="min(95vw, 1100px)" 
    top="5vh" 
    append-to-body 
    destroy-on-close
    @update:model-value="$emit('update:show', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            <i class="fas fa-users mr-2 text-blue-600"></i>选手管理
            <span class="text-sm font-normal text-slate-500 ml-2">({{ players.length }}人)</span>
          </h3>
          <p class="text-sm text-slate-600 mt-1">管理所有选手基础信息，添加、删除和编辑选手的段位实力等数据</p>
        </div>
        <div class="flex items-center space-x-2">
          <el-button type="success" size="small" @click="showSingleAddForm = true"><i class="fas fa-user-plus mr-1"></i>新增选手</el-button>
          <el-button type="primary" size="small" @click="showAddForm = true"><i class="fas fa-plus mr-1"></i>批量添加</el-button>
          <el-button type="warning" size="small" @click="$emit('add-sample')"><i class="fas fa-users mr-1"></i>示例玩家</el-button>
          <el-button link size="small" @click="$emit('update:show', false)">关闭</el-button>
        </div>
      </div>
    </template>

    <!-- 新增单个选手表单 -->
    <div v-if="showSingleAddForm" class="p-4 border border-green-200 rounded-lg bg-green-50 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold text-slate-800 text-lg">
          <i class="fas fa-user-plus mr-2 text-green-600"></i>新增选手
        </h4>
        <el-button link size="small" @click="showSingleAddForm = false"><i class="fas fa-times"></i></el-button>
      </div>
      <div class="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
        <div class="flex items-start space-x-2">
          <i class="fas fa-info-circle text-green-600 mt-0.5"></i>
          <div class="text-sm text-green-700">
            <p class="font-medium">新增说明：</p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>输入选手昵称（必填）</li>
              <li>选择段位等级</li>
              <li>自定义分数（留空自动计算）</li>
            </ul>
          </div>
        </div>
      </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">选手昵称 *</label>
          <el-input v-model="singleAddForm.name" placeholder="请输入选手昵称..." size="large"/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">段位</label>
          <BaseSelect v-model="singleAddForm.rank" :options="rankOptions" size="large" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-slate-700">分数</label>
          <el-input v-model="singleAddForm.power" type="number" placeholder="留空自动计算..." size="large"/>
        </div>
      </div>
      <div class="mt-4 flex space-x-3">
        <el-button type="success" class="flex-1" @click="handleAddSinglePlayer"><i class="fas fa-plus mr-2"></i>添加选手</el-button>
        <el-button class="flex-1" @click="showSingleAddForm = false">取消</el-button>
      </div>
    </div>

    <!-- 批量添加 -->
    <div v-if="showAddForm" class="p-4 border border-blue-200 rounded-lg bg-slate-50 mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold text-slate-800">添加玩家</h4>
        <el-button link size="small" @click="showAddForm = false"><i class="fas fa-times"></i></el-button>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div class="flex items-start space-x-2">
          <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
          <div class="text-sm text-blue-700">
            <p class="font-medium">添加说明：</p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>每行输入一个玩家昵称</li>
              <li>系统会自动分配段位和实力值</li>
              <li>重复的昵称将被忽略</li>
            </ul>
          </div>
        </div>
      </div>
      <el-input v-model="playerInput" type="textarea" :rows="4" placeholder="请输入玩家昵称，每行一个...&#10;例如：&#10;张三&#10;李四&#10;王五"/>
      <div class="mt-2 flex space-x-2">
        <el-button type="primary" class="flex-1" @click="handleAddPlayers"><i class="fas fa-plus mr-2"></i>添加玩家</el-button>
        <el-button class="flex-1" @click="showAddForm = false">取消</el-button>
      </div>
    </div>

    <!-- 编辑选手表单 -->
    <div v-if="showEditForm" class="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 mb-2">
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
            <el-button type="primary" @click="showAddForm = true"><i class="fas fa-plus mr-1"></i>添加玩家</el-button>
            <el-button type="success" @click="$emit('add-sample')"><i class="fas fa-users mr-1"></i>示例玩家</el-button>
          </div>
        </div>
        
        <div v-else>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold text-slate-800">玩家列表</h4>
            <div class="text-sm text-slate-500">共 {{ players.length }} 名玩家</div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            <div v-for="player in players" :key="player.id" class="relative">
              <PlayerCard 
                :player="player"
                size="small"
                :show-actions="true"
                @edit="editPlayer"
                @delete="removePlayer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

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
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import PlayerCard from './PlayerCard.vue'
import BaseSelect from './BaseSelect.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  players: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'add-players', 'add-single-player', 'add-sample', 'remove-player', 'edit-player'])

const showAddForm = ref(false)
const playerInput = ref('')
const showSingleAddForm = ref(false)
const singleAddForm = ref({
  name: '',
  rank: 'gold',
  power: ''
})
const showEditForm = ref(false)
const editingPlayer = ref(null)
const editForm = ref({
  name: '',
  rank: 'gold',
  power: ''
})

const rankOptions = [
  { label: '🥉 青铜', value: 'bronze' },
  { label: '🥈 白银', value: 'silver' },
  { label: '🥇 黄金', value: 'gold' },
  { label: '💎 铂金', value: 'platinum' },
  { label: '💠 钻石', value: 'diamond' },
  { label: '👑 大师', value: 'master' },
  { label: '🏆 王者', value: 'grandmaster' }
]

// 删除确认相关状态
const showDeleteConfirm = ref(false)
const deletingPlayer = ref(null)



const handleAddPlayers = () => {
  if (playerInput.value.trim()) {
    emit('add-players', playerInput.value)
    playerInput.value = ''
    showAddForm.value = false
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

const editPlayer = (id) => {
  const player = props.players.find(p => p.id === id)
  if (player) {
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

const handleBackdropClick = () => {
  emit('update:show', false)
}
</script>
<style scoped>
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

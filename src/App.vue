<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800" style="overflow: visible !important;">
    <!-- 顶部导航栏 -->
    <NavBar 
      :playerCount="players.length"
      :candidateCount="candidates.length"
    />

    <!-- 主内容区 -->
    <main class="container mx-auto px-2 sm:px-4 py-4 max-w-7xl" style="overflow: visible !important;">
      <!-- 顶部操作栏 -->
      <ActionBar
        :playerCount="players.length"
        :candidateCount="candidates.length"
        @manage-players="showPlayersModal = true"
        @random-match="startRandomMatch"
        @draft-mode="startDraftMode"
        @show-history="showHistory = true"
      />

      <!-- 主要匹配结果展示区 -->
      <MatchResultArea
        :matchResult="matchResult"
        :currentMode="currentMode"
        :draftData="draftData"
        :candidateCount="candidates.length"
        :historyRecords="historyRecords"
        :calculatePlayerStats="calculatePlayerStats"
        @rematch="handleRematch"
        @share="shareResult"
        @save-result="handleSaveMatchResult"
        @player-select="handlePlayerSelection"
        @auto-draft="handleAutoDraft"
        @complete-draft="completeDraft"
        @quick-start="quickStart"
        @draft-mode="startDraftMode"
        @random-match="startRandomMatch"
        @set-captain="handleSetCaptain"
        @swap-captains="handleSwapCaptains"
        @random-captains="handleRandomCaptains"
      />
    <HistoryModal
      v-model:show="showHistory"
      :records="historyRecords"
      @update-records="updateHistoryRecords"
    />
    </main>

    <!-- 设置弹窗 -->
    <SettingsModal
      v-model:show="showSettings"
      @add-players="handleAddPlayers"
      @add-sample="addSamplePlayers"
      @export="exportResult"
      @reset="resetSystem"
    />

    <!-- 合并后的玩家管理弹窗 -->
    <CombinedPlayersModal
      v-model:show="showPlayersModal"
      :players="players"
      :candidates="candidates"
      @add-single-player="handleAddSinglePlayer"
      @add-sample="addSamplePlayers"
      @remove-player="removePlayer"
      @edit-player="editPlayer"
      @update-candidates="candidates = $event"
      @balance-select="balanceSelectCandidates"
      @random-select="autoSelectCandidates"
      @clear-candidates="clearCandidates"
      @clear-all-players="handleClearAllPlayers"
    />



    <!-- 加载提示 -->


    <!-- 胜利奖励确认弹窗 -->
    <el-dialog 
      :model-value="showWinBonusModal" 
      width="min(95vw, 500px)" 
      append-to-body 
      destroy-on-close
      @update:model-value="val => showWinBonusModal = val"
    >
      <template #header>
        <div class="text-base font-bold text-center">
          <i class="fas fa-trophy mr-2 text-yellow-600"></i>
          胜利奖励确认
        </div>
      </template>
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-star text-2xl text-white"></i>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-2">
          {{ pendingWinner === 'red' ? '红队' : '蓝队' }} 获得胜利！
        </h3>
        <p class="text-slate-600 mb-4">
          是否给胜利队伍的选手增加 <span class="font-bold text-green-600">+20</span> 实力分？
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div class="flex items-start space-x-2">
            <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
            <div class="text-sm text-blue-700">
              <p class="font-medium">奖励说明：</p>
              <ul class="list-disc list-inside mt-1 space-y-1">
                <li>胜利队伍的所有选手实力分+20</li>
                <li>实力分会影响后续匹配的平衡度</li>
                <li>可以在选手管理中手动调整实力分</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <el-button 
            type="success" 
            class="flex-1" 
            @click="confirmWinBonus(true)"
          >
            <i class="fas fa-plus mr-2"></i>给奖励 (+20分)
          </el-button>
          <el-button 
            class="flex-1" 
            @click="cancelWinBonus"
          >
            <i class="fas fa-times mr-2"></i>不给奖励
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- Toast 通知 -->
    <ToastContainer :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import NavBar from './components/NavBar.vue'
import ActionBar from './components/ActionBar.vue'
import MatchResultArea from './components/MatchResultArea.vue'
import SettingsModal from './components/SettingsModal.vue'
import CombinedPlayersModal from './components/CombinedPlayersModal.vue'
import HistoryModal from './components/HistoryModal.vue'

import ToastContainer from './components/ToastContainer.vue'
import { usePlayerManager } from './composables/usePlayerManager'
import { useMatchEngine } from './composables/useMatchEngine'
import { useDraftMode } from './composables/useDraftMode'

import { useToast } from './composables/useToast'

// 使用组合式函数
const { players, addPlayers, addSamplePlayers: addSamplePlayersData, clearPlayers } = usePlayerManager()
const { randomMatch } = useMatchEngine()
const { 
  startDraft, 
  selectPlayer, 
  autoDraft, 
  getDraftData, 
  isComplete, 
  getResult,
  setCaptain,
  swapCaptains,
  selectRandomCaptains,
  reset: resetDraft
} = useDraftMode()

const { toasts, showToast, removeToast, muted } = useToast()

// 响应式状态
const candidates = useStorage('game-candidates', [])
const matchResult = ref(null)
const currentMode = ref(null)

const draftData = ref(null)
const showHistory = ref(false)
const historyRecords = useStorage('game-history', [])

// 计算选手战绩的函数
const calculatePlayerStats = (playerId) => {
  let wins = 0
  let losses = 0
  
  historyRecords.value.forEach(record => {
    if (!record.winner) return // 跳过未设置结果的记录
    
    // 检查选手是否在红队
    const inRedTeam = record.red.players.some(p => p.id === playerId)
    // 检查选手是否在蓝队
    const inBlueTeam = record.blue.players.some(p => p.id === playerId)
    
    if (inRedTeam) {
      if (record.winner === 'red') {
        wins++
      } else if (record.winner === 'blue') {
        losses++
      }
    } else if (inBlueTeam) {
      if (record.winner === 'blue') {
        wins++
      } else if (record.winner === 'red') {
        losses++
      }
    }
  })
  
  return { wins, losses }
}

// 弹窗显示状态
const showSettings = ref(false)
const showPlayersModal = ref(false)
const showWinBonusModal = ref(false)
const pendingWinner = ref(null)
// 移除待选区弹窗，合并到玩家管理弹窗

// 方法
const handleAddPlayers = (playerNames) => {
  const addedCount = addPlayers(playerNames)
  // 移除成功提示，批量添加无需通知
}

const handleAddSinglePlayer = (playerData) => {
  // 检查昵称是否已存在
  if (players.value.some(p => p.name.toLowerCase() === playerData.name.toLowerCase())) {
    showToast('选手昵称已存在', 'error')
    return
  }
  
  // 如果没有指定分数，根据段位自动计算
  if (!playerData.power) {
    const rankPowers = {
      bronze: 100,
      silver: 200,
      gold: 300,
      platinum: 400,
      diamond: 500,
      master: 600,
      grandmaster: 700
    }
    // 同段位默认相同初始值（不加随机）
    const basePower = rankPowers[playerData.rank] || 300
    playerData.power = basePower
  }
  
  // 生成唯一ID
  let newId
  do {
    newId = Date.now() + Math.random()
  } while (players.value.some(p => p.id === newId))
  
  // 创建新选手
  const newPlayer = {
    id: newId,
    name: playerData.name,
    rank: playerData.rank,
    power: playerData.power
  }
  
  // 检查ID是否重复（额外保险）
  if (players.value.some(p => p.id === newPlayer.id)) {
    console.error('生成了重复的ID:', newPlayer.id)
    showToast('添加选手时出现ID冲突，请重试', 'error')
    return
  }
  
  players.value.push(newPlayer)
}

const addSamplePlayers = () => {
  const addedCount = addSamplePlayersData()
  // 移除示例玩家添加提示，界面更新已足够反馈
}

const editPlayer = (updatedPlayer) => {
  const playerIndex = players.value.findIndex(p => p.id === updatedPlayer.id)
  
  if (playerIndex === -1) {
    console.error('Player not found:', updatedPlayer.id)
    showToast('找不到要编辑的选手', 'error')
    return
  }

  try {
    const rankPowers = {
      bronze: 100,
      silver: 200,
      gold: 300,
      platinum: 400,
      diamond: 500,
      master: 600,
      grandmaster: 700
    }
    
    // 获取当前玩家的原始数据
    const originalPlayer = players.value[playerIndex]
    
    // 如果段位发生了变化，或者分数为空，则根据新段位重新计算分数
    if (originalPlayer.rank !== updatedPlayer.rank || 
        updatedPlayer.power === null || 
        updatedPlayer.power === undefined || 
        updatedPlayer.power === '') {
      // 根据新段位计算基础分数
      const basePower = rankPowers[updatedPlayer.rank] || 300
      updatedPlayer.power = basePower
    }

    // 确保 power 是数字类型
    updatedPlayer.power = Number(updatedPlayer.power)
    
    // 更新玩家数据
    const newPlayerData = {
      ...players.value[playerIndex],
      name: updatedPlayer.name.trim(),
      rank: updatedPlayer.rank,
      power: updatedPlayer.power
    }
    
    // 更新玩家列表
    players.value[playerIndex] = newPlayerData
    
    // 如果玩家在候选区中，也要更新
    const candidateIndex = candidates.value.findIndex(c => c.id === updatedPlayer.id)
    if (candidateIndex > -1) {
      candidates.value[candidateIndex] = {
        id: newPlayerData.id,
        name: newPlayerData.name,
        rank: newPlayerData.rank,
        power: newPlayerData.power
      }
    }
    
    // 移除更新成功提示，界面更新已足够反馈
  } catch (error) {
    console.error('Error updating player:', error)
    showToast('更新选手信息时出错', 'error')
  }
}

const removePlayer = (playerId) => {
  // 从玩家列表中移除
  const playerIndex = players.value.findIndex(p => p.id === playerId)
  if (playerIndex > -1) {
    players.value.splice(playerIndex, 1)
    
    // 如果玩家在候选区中，也要移除
    const candidateIndex = candidates.value.findIndex(c => c.id === playerId)
    if (candidateIndex > -1) {
      candidates.value.splice(candidateIndex, 1)
    }
  }
}

const autoSelectCandidates = () => {
  if (players.value.length === 0) {
    return
  }
  
  // 确保清空已有选择
  candidates.value = []
  
  const maxSelect = Math.min(10, players.value.length)
  
  // 使用Set确保不重复选择
  const selectedIds = new Set()
  const newCandidates = []
  
  // 创建打乱的玩家列表 - 使用Fisher-Yates洗牌算法
  const shuffled = [...players.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // 选择玩家直到达到最大数量
  for (const player of shuffled) {
    if (newCandidates.length >= maxSelect) break
    
    if (!selectedIds.has(player.id)) {
      selectedIds.add(player.id)
      newCandidates.push({
        id: player.id,
        name: player.name,
        rank: player.rank,
        power: player.power
      })
    }
  }
  
  candidates.value = newCandidates
}

const balanceSelectCandidates = () => {
  if (players.value.length === 0) {
    return
  }
  
  // 确保清空已有选择
  candidates.value = []
  
  const sortedPlayers = [...players.value].sort((a, b) => b.power - a.power)
  const selected = []
  const maxSelect = Math.min(10, players.value.length)
  
  let highIndex = 0
  let lowIndex = sortedPlayers.length - 1
  let selectHigh = true
  
  while (selected.length < maxSelect && highIndex <= lowIndex) {
    if (selected.length >= 10) break; // 确保不超过10人
    
    if (selectHigh) {
      selected.push(sortedPlayers[highIndex])
      highIndex++
    } else {
      selected.push(sortedPlayers[lowIndex])
      lowIndex--
    }
    selectHigh = !selectHigh
  }
  
  // 如果somehow还是超过了10人（以防万一），截取前10人
  if (selected.length > 10) {
    selected.length = 10
  }
  
  // 移除队长信息，只保留基础信息
  candidates.value = selected.map(player => ({
    id: player.id,
    name: player.name,
    rank: player.rank,
    power: player.power
  }))
}

const clearCandidates = () => {
  candidates.value = []
}

const startRandomMatch = () => {
  // 开始匹配不弹出通知
  if (candidates.value.length < 2) {
    // 仅在严重失败时提示
    showToast('需要至少2名候选者才能开始匹配', 'error')
    return
  }
  
  // 重置之前的选马数据和模式
  draftData.value = null
  
  // 清空所有候选者的队长状态
  candidates.value.forEach(candidate => {
    candidate.isCaptain = false
  })
  
  try {
    const result = randomMatch(candidates.value)
    
    if (result.success) {
      matchResult.value = result
      currentMode.value = 'random'
      // 降低噪音：不提示
    } else {
      // 匹配失败通常是逻辑问题，减少噪音通知
      console.error('匹配失败:', result.message)
    }
  } catch (error) {
    console.error('Random match error:', error)
    showToast('匹配过程中出现错误', 'error')
  }
}

const handleRematch = () => {
  if (matchResult.value?.mode === 'draft') {
    // 回到选马模式，重新选马
    startDraftMode()
  } else {
    // 随机匹配保持不变
    startRandomMatch()
  }
}

const startDraftMode = () => {
  // 进入选马模式不弹出通知
  if (candidates.value.length !== 10) {
    showToast('需要恰好10名候选者才能开始选马模式', 'error')
    return
  }
  
  try {
    // 重置之前的匹配结果和选马数据
    matchResult.value = null
    currentMode.value = null
    draftData.value = null
    
    // 清空所有候选者的队长状态
    candidates.value.forEach(candidate => {
      candidate.isCaptain = false
    })
    
    resetDraft() // 确保选马状态被完全重置
    
    const result = startDraft(candidates.value, 5)
    
    if (result.success) {
      currentMode.value = 'draft'
      draftData.value = getDraftData()
      // 不提示
    } else {
      // 选马启动失败通常是逻辑问题，减少噪音通知
      console.error('选马模式启动失败:', result.message)
    }
  } catch (error) {
    console.error('Draft mode error:', error)
    showToast('选马模式启动过程中出现错误', 'error')
  }
}

const handlePlayerSelection = (playerId) => {
  try {
    const result = selectPlayer(playerId)
    
    if (result.success) {
      draftData.value = getDraftData()
      
      // 检查是否已经完成选马
      if (result.isAutoAssigned || result.isDraftComplete || isComplete()) {
        // 立即完成选马，不延迟
        completeDraft()
      }
    } else {
      // 选择失败通常是逻辑问题，减少噪音通知
      console.error('选择失败:', result.message)
    }
  } catch (error) {
    console.error('Player selection error:', error)
    showToast('选择过程中出现错误', 'error')
  }
}

const handleAutoDraft = () => {
  try {
    const result = autoDraft()
    
    if (result.success) {
      draftData.value = getDraftData()
      
      // 如果选马已经完成，立即完成
      if (result.isAutoAssigned || result.isDraftComplete || isComplete()) {
        completeDraft()
      }
    }
  } catch (error) {
    console.error('Auto draft error:', error)
  }
}

// 队长相关事件处理
const handleSetCaptain = ({ team, playerId }) => {
  const res = setCaptain(team, playerId)
  if (!res.success) {
    showToast(res.message || '设置队长失败', 'error')
    return
  }
  
  draftData.value = getDraftData()
  
  // 如果队长选择完成，显示提示
  // 移除队长选择完成提示，界面状态变化已足够反馈
}

const handleSwapCaptains = () => {
  const res = swapCaptains()
  if (!res.success) {
    showToast(res.message || '交换队长失败', 'error')
    return
  }
  draftData.value = getDraftData()
}

const handleRandomCaptains = () => {
  const res = selectRandomCaptains()
  if (!res.success) {
    showToast(res.message || '随机队长失败', 'error')
    return
  }
  draftData.value = getDraftData()
}

const completeDraft = () => {
  try {
    const result = getResult()
    matchResult.value = result
    currentMode.value = null  // 清空模式，显示最终结果
    draftData.value = null    // 清空选马数据
  } catch (error) {
    console.error('Complete draft error:', error)
  }
}
const handleSaveMatchResult = (winner) => {
  if (!matchResult.value) return
  
  // 显示胜利奖励确认弹窗
  pendingWinner.value = winner
  showWinBonusModal.value = true
}

const confirmWinBonus = (giveBonus) => {
  if (!matchResult.value || !pendingWinner.value) return
  
  const r = matchResult.value
  const winner = pendingWinner.value
  
  // 如果选择给奖励，更新胜利队伍选手的实力分
  if (giveBonus) {
    const winningTeam = winner === 'red' ? r.redTeam : r.blueTeam
    
    // 更新玩家列表中的实力分
    winningTeam.players.forEach(winningPlayer => {
      const playerIndex = players.value.findIndex(p => p.id === winningPlayer.id)
      if (playerIndex > -1) {
        players.value[playerIndex].power += 20
      }
      
      // 如果玩家在候选区中，也要更新
      const candidateIndex = candidates.value.findIndex(c => c.id === winningPlayer.id)
      if (candidateIndex > -1) {
        candidates.value[candidateIndex].power += 20
      }
    })
    
    showToast(`${winner === 'red' ? '红队' : '蓝队'}选手实力分+20！`, 'success')
  }
  
  // 保存比赛记录
  const makeTeam = (team) => ({
    total: team.totalPower,
    avg: team.averagePower,
    players: team.players.map(p => ({ id: p.id, name: p.name, rank: p.rank, isCaptain: !!p.isCaptain }))
  })
  const rec = {
    id: Date.now() + Math.random(),
    time: Date.now(),
    mode: r.mode,
    balance: r.balanceScore,
    winner,
    red: makeTeam(r.redTeam),
    blue: makeTeam(r.blueTeam),
    bonusGiven: giveBonus
  }
  historyRecords.value = [rec, ...historyRecords.value]
  
  // 关闭弹窗并重置状态
  showWinBonusModal.value = false
  pendingWinner.value = null
  matchResult.value = null
  currentMode.value = null
}

const cancelWinBonus = () => {
  // 直接保存记录，不给奖励
  confirmWinBonus(false)
}

const updateHistoryRecords = (list) => {
  historyRecords.value = list
  // 不提示，避免过多通知
}

const shareResult = async () => {
  if (!matchResult.value) return
  const result = matchResult.value

  const rankName = (r) => ({
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '铂金',
    diamond: '钻石',
    master: '大师',
    grandmaster: '王者'
  }[r] || r || '')

  const formatTeam = (team, name) => {
    const lines = team.players.map((p, idx) => {
      const crown = p.isCaptain ? '👑 ' : ''
      const rankText = rankName(p.rank)
      const rankSuffix = rankText ? `（${rankText}-${p.power}分）` : ''
      return `${idx + 1}. ${crown}${p.name}${rankSuffix}`
    })
    return `${name}｜总实力 ${team.totalPower}｜均值 ${team.averagePower}\n${lines.join('\n')}`
  }

  const modeText = result.mode === 'draft' ? '选马模式' : '随机匹配'
  const ts = new Date().toLocaleString()
  const header = `PICK内战选马｜战报｜第${historyRecords.value.length + 1}局\n模式：${modeText}｜平衡度：${result.balanceScore}%\n时间：${ts}`
  const text = `${header}\n\n${formatTeam(result.redTeam, '红队')}\n\n${formatTeam(result.blueTeam, '蓝队')}`

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    showToast('结果已复制到剪贴板', 'success')
  } catch (e) {
    console.error('Copy result error:', e)
    showToast('复制失败，请手动选择文本复制', 'error')
  }
}

const exportResult = () => {
  if (!matchResult.value) return
  try {
    exportAsImage(matchResult.value)
  } catch (e) {
    console.error('Export error:', e)
    showToast('导出失败', 'error')
  }
}

const resetSystem = () => {
  if (confirm('确定要重置系统吗？这将清除所有数据！')) {
    clearPlayers()
    candidates.value = []
    matchResult.value = null
    currentMode.value = null
    resetDraft()
    
    showSettings.value = false
  }
}

// 处理清空所有选手（来自合并弹窗的确认）
const handleClearAllPlayers = () => {
  clearPlayers()
  candidates.value = []
  matchResult.value = null
  currentMode.value = null
  resetDraft()
  // 移除清空成功提示，界面变化已足够反馈
}

const quickStart = () => {
  if (players.value.length === 0) {
    // 减少噪音：不在这里提示
    addSamplePlayers()
  }
  
  // 先清空候选人
  candidates.value = []
  
  // 然后添加新的候选人
  autoSelectCandidates()
  
  setTimeout(() => {
    startRandomMatch()
  }, 500)
}

// 初始化
onMounted(() => {
  // 应用初始化完成
})
</script>


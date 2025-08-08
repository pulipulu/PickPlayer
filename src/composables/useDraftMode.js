import { ref, computed } from 'vue'

export function useDraftMode() {
  const isActive = ref(false)
  const currentTurn = ref(1)
  const currentPicker = ref(null) // 'red' or 'blue'
  const redTeam = ref([])
  const blueTeam = ref([])
  const availablePlayers = ref([])
  const maxPlayersPerTeam = ref(5)
  const firstPickMade = ref(false)

  const reset = () => {
    isActive.value = false
    currentTurn.value = 1
    currentPicker.value = null
    redTeam.value = []
    blueTeam.value = []
    availablePlayers.value = []
    firstPickMade.value = false
  }

  const startDraft = (candidates, maxPerTeam = 5) => {
    // 确保不超过10名玩家
    if (candidates.length > 10) {
      candidates = candidates.slice(0, 10)
      console.warn(`玩家数量超过10人，已限制为前10名玩家`)
    }
    
    if (candidates.length !== 10) {
      return {
        success: false,
        message: '选马模式需要恰好10名玩家'
      }
    }

    reset()
    maxPlayersPerTeam.value = maxPerTeam
    availablePlayers.value = [...candidates]
    isActive.value = true
    // 手动选择队长阶段开始，待两队长确定后再开始首轮
    return { success: true, message: '请选择两位队长' }
  }

  const selectRandomCaptains = () => {
    if (availablePlayers.value.length < 2 && (!redTeam.value.find(p => p.isCaptain) || !blueTeam.value.find(p => p.isCaptain))) {
      return { success: false, message: '玩家数量不足，无法选择队长' }
    }

    // 将已有队长退回可选（若尚未开始首轮）
    if (!firstPickMade.value) {
      const redCap = redTeam.value.find(p => p.isCaptain)
      const blueCap = blueTeam.value.find(p => p.isCaptain)
      if (redCap) {
        redTeam.value = redTeam.value.filter(p => !p.isCaptain)
        const cap = { ...redCap }
        delete cap.isCaptain
        availablePlayers.value.push(cap)
      }
      if (blueCap) {
        blueTeam.value = blueTeam.value.filter(p => !p.isCaptain)
        const cap = { ...blueCap }
        delete cap.isCaptain
        availablePlayers.value.push(cap)
      }
    }

    const shuffled = [...availablePlayers.value]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const redCaptain = shuffled[0]
    const blueCaptain = shuffled[1]
    if (!redCaptain || !blueCaptain) {
      return { success: false, message: '随机队长失败' }
    }

    // 设置队长
    setCaptain('red', redCaptain.id)
    setCaptain('blue', blueCaptain.id)

    return { success: true }
  }

  const setCaptain = (team, playerId) => {
    if (!isActive.value) return { success: false, message: '选马未激活' }
    if (team !== 'red' && team !== 'blue') return { success: false, message: '无效队伍' }
    const targetTeam = team === 'red' ? redTeam : blueTeam
    const otherTeam = team === 'red' ? blueTeam : redTeam

    // 已经开始首轮后不可更换
    if (firstPickMade.value) {
      return { success: false, message: '已开始选人，不能更换队长' }
    }

    // 如果该队已有队长，先放回候选
    const existingCaptainIndex = targetTeam.value.findIndex(p => p.isCaptain)
    if (existingCaptainIndex !== -1) {
      const prev = targetTeam.value[existingCaptainIndex]
      targetTeam.value.splice(existingCaptainIndex, 1)
      const restore = { ...prev }
      delete restore.isCaptain
      availablePlayers.value.push(restore)
    }

    // 从候选/另一队中找到该玩家
    let player = availablePlayers.value.find(p => p.id === playerId)
    if (!player) {
      // 若在另一队且是其队长，允许交换
      const otherCapIndex = otherTeam.value.findIndex(p => p.id === playerId && p.isCaptain)
      if (otherCapIndex !== -1) {
        const otherCap = otherTeam.value.splice(otherCapIndex, 1)[0]
        otherCap.isCaptain = true
        targetTeam.value.unshift(otherCap)
        // 如果对方队伍缺队长，需要从候选中再设一个或等待用户设置
        return finalizeCaptainPhase()
      }
      return { success: false, message: '未找到该玩家' }
    }

    // 设为队长
    const cap = { ...player, isCaptain: true }
    targetTeam.value.unshift(cap)
    // 从候选移除
    availablePlayers.value = availablePlayers.value.filter(p => p.id !== playerId)

    return finalizeCaptainPhase()
  }

  const swapCaptains = () => {
    if (firstPickMade.value) return { success: false, message: '已开始选人，不能更换队长' }
    const redCapIndex = redTeam.value.findIndex(p => p.isCaptain)
    const blueCapIndex = blueTeam.value.findIndex(p => p.isCaptain)
    if (redCapIndex === -1 || blueCapIndex === -1) return { success: false, message: '需先设置两位队长' }
    const redCap = redTeam.value.splice(redCapIndex, 1)[0]
    const blueCap = blueTeam.value.splice(blueCapIndex, 1)[0]
    redCap.isCaptain = true
    blueCap.isCaptain = true
    redTeam.value.unshift(blueCap)
    blueTeam.value.unshift(redCap)
    return { success: true }
  }

  const finalizeCaptainPhase = () => {
    const hasRed = redTeam.value.some(p => p.isCaptain)
    const hasBlue = blueTeam.value.some(p => p.isCaptain)
    if (hasRed && hasBlue) {
      currentPicker.value = 'red'
      currentTurn.value = 1
      // 标记可以开始选人了
      return { success: true, message: '队长选择完成，开始选人阶段', canStartPicking: true }
    }
    return { success: true }
  }

  const selectPlayer = (playerId) => {
    if (!isActive.value) {
      return {
        success: false,
        message: '选马模式未激活'
      }
    }

    // 检查是否两个队长都已选择
    const hasRedCaptain = redTeam.value.some(p => p.isCaptain)
    const hasBlueCaptain = blueTeam.value.some(p => p.isCaptain)
    
    if (!hasRedCaptain || !hasBlueCaptain) {
      return {
        success: false,
        message: '请先选择两位队长'
      }
    }

    if (!currentPicker.value) {
      return {
        success: false,
        message: '当前选择者未确定'
      }
    }

    const player = availablePlayers.value.find(p => p.id === playerId)
    if (!player) {
      return {
        success: false,
        message: '玩家不存在或已被选择'
      }
    }

    // 检查当前队伍是否已满
    const currentTeam = currentPicker.value === 'red' ? redTeam.value : blueTeam.value
    if (currentTeam.length >= maxPlayersPerTeam.value) {
      return {
        success: false,
        message: `${currentPicker.value === 'red' ? '红' : '蓝'}队人数已满`
      }
    }



    // 将玩家添加到当前选择的队伍
    if (currentPicker.value === 'red') {
      redTeam.value.push(player)
    } else {
      blueTeam.value.push(player)
    }

    // 从可用玩家中移除
    availablePlayers.value = availablePlayers.value.filter(p => p.id !== playerId)

    // 标记已进行第一轮选人
    if (!firstPickMade.value) firstPickMade.value = true

    // 检查是否只剩一个玩家
    if (availablePlayers.value.length === 1) {
      const lastPlayer = availablePlayers.value[0]
      

      
      // 最后一个玩家分配给人数较少的队伍
      if (redTeam.value.length < blueTeam.value.length) {
        redTeam.value.push(lastPlayer)
      } else if (blueTeam.value.length < redTeam.value.length) {
        blueTeam.value.push(lastPlayer)
      } else {
        // 如果两队人数相等，分配给对方队伍
        if (currentPicker.value === 'red') {
          blueTeam.value.push(lastPlayer)
        } else {
          redTeam.value.push(lastPlayer)
        }
      }
      
      availablePlayers.value = []
      isActive.value = false
      

      
      return {
        success: true,
        message: `${player.name} 已加入${currentPicker.value === 'red' ? '红' : '蓝'}队，最后一名玩家 ${lastPlayer.name} 已自动分配`,
        isAutoAssigned: true,
        result: getResult()
      }
    }

    // 检查是否所有玩家都已分配完毕
    if (availablePlayers.value.length === 0) {
      isActive.value = false
      return {
        success: true,
        message: `${player.name} 已加入${currentPicker.value === 'red' ? '红' : '蓝'}队，选马完成！`,
        isAutoAssigned: false,
        isDraftComplete: true,
        result: getResult()
      }
    }

    // 蛇形选择逻辑：A-B-B-A-A-B-B-A-A-B
    // 轮次1: A选, 轮次2: B选, 轮次3: B选, 轮次4: A选...
    // 规律: 轮次为奇数时，选择权在开始的队伍；轮次为偶数时，选择权在另一队伍
    // 但是每两轮后要交换顺序
    
    currentTurn.value++
    
    // 计算下一个选择者
    // 将轮次按2分组：(1,2), (3,4), (5,6), (7,8)
    const roundPair = Math.ceil(currentTurn.value / 2)
    const isFirstInPair = (currentTurn.value - 1) % 2 === 0
    
    // 奇数组(1,3,5...)：红队先选
    // 偶数组(2,4,6...)：蓝队先选
    if (roundPair % 2 === 1) {
      // 奇数组：红队先选
      currentPicker.value = isFirstInPair ? 'red' : 'blue'
    } else {
      // 偶数组：蓝队先选
      currentPicker.value = isFirstInPair ? 'blue' : 'red'
    }
    


    return {
      success: true,
      message: `${player.name} 已加入队伍`
    }
  }

  const autoDraft = () => {
    if (!isActive.value) {
      return {
        success: false,
        message: '选马模式未激活'
      }
    }

    let lastResult = null
    while (availablePlayers.value.length > 0 && isActive.value) {
      const result = selectPlayer(availablePlayers.value[0].id)
      lastResult = result
      if (!result.success) {
        return result
      }
      // 如果选马已经完成（最后一个玩家被自动分配），跳出循环
      if (result.isAutoAssigned || result.isDraftComplete) {
        break
      }
    }

    return lastResult || {
      success: true,
      message: '自动选择完成'
    }
  }

  const getDraftData = () => {
    const calculateTeamPower = (team) => {
      return team.reduce((total, player) => total + player.power, 0)
    }

    const calculateAveragePower = (team) => {
      return team.length > 0 ? Math.round(calculateTeamPower(team) / team.length) : 0
    }

    return {
      redTeam: {
        players: redTeam.value,
        totalPower: calculateTeamPower(redTeam.value),
        averagePower: calculateAveragePower(redTeam.value)
      },
      blueTeam: {
        players: blueTeam.value,
        totalPower: calculateTeamPower(blueTeam.value),
        averagePower: calculateAveragePower(blueTeam.value)
      },
      currentPicker: currentPicker.value,
      currentTurn: currentTurn.value,
      availablePlayers: availablePlayers.value,
      firstPickMade: firstPickMade.value
    }
  }

  const isComplete = () => {
    return !isActive.value || availablePlayers.value.length === 0
  }

  const getCurrentPicker = () => {
    return currentPicker.value
  }

  const getResult = () => {
    const draftData = getDraftData()
    
    return {
      success: true,
      redTeam: draftData.redTeam,
      blueTeam: draftData.blueTeam,
      balanceScore: calculateBalanceScore(draftData.redTeam, draftData.blueTeam),
      timestamp: new Date().toISOString(),
      mode: 'draft'
    }
  }

  const calculateBalanceScore = (redTeam, blueTeam) => {
    const redPower = redTeam.totalPower
    const bluePower = blueTeam.totalPower
    const totalPower = redPower + bluePower
    
    if (totalPower === 0) return 0
    
    const difference = Math.abs(redPower - bluePower)
    const balanceScore = Math.max(0, 100 - (difference / totalPower) * 100)
    
    return Math.round(balanceScore)
  }

  return {
    isActive: computed(() => isActive.value),
    currentTurn: computed(() => currentTurn.value),
    currentPicker: computed(() => currentPicker.value),
    redTeam: computed(() => redTeam.value),
    blueTeam: computed(() => blueTeam.value),
    availablePlayers: computed(() => availablePlayers.value),
    startDraft,
    selectPlayer,
    autoDraft,
    setCaptain,
    swapCaptains,
    selectRandomCaptains,
    getDraftData,
    isComplete,
    getCurrentPicker,
    getResult,
    reset
  }
}

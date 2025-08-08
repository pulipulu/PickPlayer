import { computed } from 'vue'

export function useMatchEngine() {
  const calculateTeamPower = (players) => {
    return players.reduce((total, player) => total + player.power, 0)
  }

  const calculateBalanceScore = (redTeam, blueTeam) => {
    const redPower = calculateTeamPower(redTeam)
    const bluePower = calculateTeamPower(blueTeam)
    const totalPower = redPower + bluePower
    
    if (totalPower === 0) return 0
    
    const difference = Math.abs(redPower - bluePower)
    const balanceScore = Math.max(0, 100 - (difference / totalPower) * 100)
    
    return Math.round(balanceScore)
  }

  const randomMatch = (candidates) => {
    if (candidates.length < 2) {
      return {
        success: false,
        message: '至少需要2名玩家才能开始匹配'
      }
    }
    
    // 确保不超过10名玩家
    if (candidates.length > 10) {
      const limitedCandidates = candidates.slice(0, 10)
      console.warn(`玩家数量超过10人，已限制为前10名玩家`)
      candidates = limitedCandidates
    }

    // 随机打乱玩家顺序
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)
    
    // 分成两队
    const midPoint = Math.ceil(shuffled.length / 2)
    const redTeam = shuffled.slice(0, midPoint)
    const blueTeam = shuffled.slice(midPoint)
    
    // 为每队选择队长（实力最高的）
    const redCaptain = redTeam.reduce((max, player) => 
      player.power > max.power ? player : max, redTeam[0])
    const blueCaptain = blueTeam.reduce((max, player) => 
      player.power > max.power ? player : max, blueTeam[0])
    
    // 标记队长
    redTeam.forEach(player => {
      player.isCaptain = player.id === redCaptain.id
    })
    blueTeam.forEach(player => {
      player.isCaptain = player.id === blueCaptain.id
    })
    
    const balanceScore = calculateBalanceScore(redTeam, blueTeam)
    
    return {
      success: true,
      redTeam: {
        players: redTeam,
        totalPower: calculateTeamPower(redTeam),
        averagePower: Math.round(calculateTeamPower(redTeam) / redTeam.length)
      },
      blueTeam: {
        players: blueTeam,
        totalPower: calculateTeamPower(blueTeam),
        averagePower: Math.round(calculateTeamPower(blueTeam) / blueTeam.length)
      },
      balanceScore,
      timestamp: new Date().toISOString()
    }
  }

  return {
    randomMatch,
    calculateTeamPower,
    calculateBalanceScore
  }
}

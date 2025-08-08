import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export function usePlayerManager() {
  const players = useStorage('game-players', [])
  const nextId = ref(1)

  const rankPowers = {
    bronze: 100,
    silver: 200,
    gold: 300,
    platinum: 400,
    diamond: 500,
    master: 600,
    grandmaster: 700
  }

  const rankNames = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '铂金',
    diamond: '钻石',
    master: '大师',
    grandmaster: '王者'
  }

  const getRankDisplayName = (rank) => {
    return rankNames[rank] || rank
  }

  const getRankPower = (rank) => {
    return rankPowers[rank] || 100
  }

  const generatePower = (rank) => {
    // 同段位默认一致的初始值（不加随机），后续再调整
    const basePower = getRankPower(rank)
    return basePower
  }

  const generateUniqueId = () => {
    let id
    do {
      id = Date.now() + Math.random()
    } while (players.value.some(p => p.id === id))
    return id
  }

  const addPlayer = (name, rank = 'bronze', isSample = false) => {
    // 检查是否已存在
    if (players.value.find(p => p.name === name)) {
      return false
    }

    const player = {
      id: generateUniqueId(),
      name,
      rank,
      power: generatePower(rank),
      isSample,
      createdAt: new Date().toISOString()
    }

    // 额外保险检查
    if (players.value.some(p => p.id === player.id)) {
      console.error('Generated duplicate ID in usePlayerManager:', player.id)
      return false
    }

    players.value.push(player)
    console.log('Added player via usePlayerManager with ID:', player.id)
    return true
  }

  const addPlayers = (names) => {
    let addedCount = 0
    
    if (typeof names === 'string') {
      names = names.split('\n').map(name => name.trim()).filter(name => name.length > 0)
    }

    names.forEach(name => {
      if (addPlayer(name)) {
        addedCount++
      }
    })

    return addedCount
  }

  const addSamplePlayers = () => {
    const samplePlayers = [
      { name: '张三', rank: 'diamond' },
      { name: '李四', rank: 'platinum' },
      { name: '王五', rank: 'gold' },
      { name: '赵六', rank: 'silver' },
      { name: '钱七', rank: 'bronze' },
      { name: '孙八', rank: 'master' },
      { name: '周九', rank: 'grandmaster' },
      { name: '吴十', rank: 'diamond' },
      { name: '郑十一', rank: 'platinum' },
      { name: '王十二', rank: 'gold' },
      { name: '冯十三', rank: 'silver' },
      { name: '陈十四', rank: 'bronze' }
    ]

    let addedCount = 0
    const shuffled = [...samplePlayers].sort(() => Math.random() - 0.5)
    const selectedSamples = shuffled.slice(0, 12)

    selectedSamples.forEach(sample => {
      if (addPlayer(sample.name, sample.rank, true)) {
        addedCount++
      }
    })

    return addedCount
  }

  const removePlayer = (id) => {
    const index = players.value.findIndex(p => p.id === id)
    if (index > -1) {
      players.value.splice(index, 1)
      return true
    }
    return false
  }

  const clearPlayers = () => {
    players.value = []
    nextId.value = 1
  }

  const getPlayerById = (id) => {
    return players.value.find(p => p.id === id)
  }

  return {
    players,
    addPlayer,
    addPlayers,
    addSamplePlayers,
    removePlayer,
    clearPlayers,
    getPlayerById,
    getRankDisplayName,
    getRankPower
  }
}

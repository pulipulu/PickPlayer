export function useShareManager() {
  const exportAsImage = async (matchResult) => {
    try {
      // 这里可以集成html2canvas来生成图片
      // 暂时使用简单的文本导出
      const resultText = generateResultText(matchResult)
      
      // 创建下载链接
      const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `匹配结果_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Export error:', error)
      return { success: false, error: error.message }
    }
  }

  const generateResultText = (matchResult) => {
    if (!matchResult) return '没有匹配结果'

    const { redTeam, blueTeam, balanceScore, timestamp } = matchResult
    
    let text = `游戏匹配结果\n`
    text += `生成时间: ${new Date(timestamp).toLocaleString()}\n`
    text += `平衡度: ${balanceScore}%\n\n`
    
    text += `红队 (总实力: ${redTeam.totalPower})\n`
    text += `平均实力: ${redTeam.averagePower}\n`
    redTeam.players.forEach((player, index) => {
      const captain = player.isCaptain ? ' [队长]' : ''
      text += `${index + 1}. ${player.name} (${player.rank}) - ${player.power}${captain}\n`
    })
    
    text += `\n蓝队 (总实力: ${blueTeam.totalPower})\n`
    text += `平均实力: ${blueTeam.averagePower}\n`
    blueTeam.players.forEach((player, index) => {
      const captain = player.isCaptain ? ' [队长]' : ''
      text += `${index + 1}. ${player.name} (${player.rank}) - ${player.power}${captain}\n`
    })
    
    return text
  }

  const shareToClipboard = async (matchResult) => {
    try {
      const resultText = generateResultText(matchResult)
      await navigator.clipboard.writeText(resultText)
      return { success: true }
    } catch (error) {
      console.error('Share to clipboard error:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    exportAsImage,
    shareToClipboard,
    generateResultText
  }
}

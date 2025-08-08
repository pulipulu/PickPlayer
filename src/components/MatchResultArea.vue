<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
    <div v-if="matchResult" class="p-4 border-b border-slate-200">
      <h2 class="text-2xl font-bold text-slate-800 text-center">
        <i class="fas fa-trophy mr-3 text-yellow-600"></i>队伍匹配结果
      </h2>
    </div>
    <div class="p-4">
      <Transition name="panel" mode="out-in">

      <div v-if="matchResult" key="result" class="space-y-3">

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div class="text-center">
            <h4 class="text-lg font-bold text-blue-800 mb-2">
              <i class="fas fa-trophy mr-2"></i>匹配完成
            </h4>
            <div class="text-sm text-blue-600">
              平衡度: <span class="font-bold">{{ matchResult.balanceScore }}%</span>
              - {{ getBalanceText(matchResult.balanceScore) }}
            </div>
          </div>
        </div>
        
        <div class="team-container">
          <div class="team-header red-team">
            <span><i class="fas fa-shield-alt mr-2"></i>红队</span>
            <span class="text-sm">总实力: {{ matchResult.redTeam.totalPower }}</span>
          </div>
                      <div class="team-body">
              <TransitionGroup 
                name="team-player" 
                tag="div" 
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
              >
                <PlayerCard 
                  v-for="player in matchResult.redTeam.players" 
                  :key="`red-${player.id}`"
                  :player="player"
                  size="small"
                  variant="red-team"
                />
              </TransitionGroup>
            </div>
        </div>
        
        <div class="team-container">
          <div class="team-header blue-team">
            <span><i class="fas fa-shield-alt mr-2"></i>蓝队</span>
            <span class="text-sm">总实力: {{ matchResult.blueTeam.totalPower }}</span>
          </div>
                      <div class="team-body">
              <TransitionGroup 
                name="team-player" 
                tag="div" 
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
              >
                <PlayerCard 
                  v-for="player in matchResult.blueTeam.players" 
                  :key="`blue-${player.id}`"
                  :player="player"
                  size="small"
                  variant="blue-team"
                />
              </TransitionGroup>
            </div>
        </div>
        

        
        

        <div class="flex flex-col gap-2">
          <div class="flex space-x-2">
          <button 
            @click="$emit('rematch')"
            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm"
          >
            <i class="fas fa-redo mr-1"></i>重新匹配
          </button>
          <button 
            @click="$emit('share')"
            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm"
            title="复制到剪贴板"
          >
            <i class="fas fa-copy mr-1"></i>复制到剪贴板
          </button>
          </div>
          <div class="space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                class="w-full px-3 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-md font-medium shadow-sm"
                @click="handleVictoryClick('red')"
              >
                <i class="fas fa-trophy mr-2"></i>红队胜
              </button>
              <button 
                class="w-full px-3 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm"
                @click="handleVictoryClick('blue')"
              >
                <i class="fas fa-trophy mr-2"></i>蓝队胜
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentMode === 'draft' && draftData" key="draft" class="draft-container">
        <div class="draft-header sticky top-16 z-10 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3 lg:p-4 mb-3 lg:mb-4 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h4 class="text-lg font-bold text-slate-800">
                <i class="fas fa-hand-pointer mr-2"></i>选马模式
              </h4>
              <p class="text-sm text-slate-600">队长轮流选择队员 - 蛇形选择</p>
            </div>
          <div class="flex items-center space-x-4">
              <div class="text-sm text-slate-600">
                <i class="fas fa-stopwatch mr-1"></i>
                第 <span class="font-bold text-blue-600">{{ draftData.currentTurn }}</span> / 8 轮
              </div>
              <div class="text-sm text-slate-600">
                <i class="fas fa-users mr-1"></i>
                剩余: <span class="font-bold text-orange-600">{{ draftData.availablePlayers.length }}</span> 人
              </div>
            </div>
          </div>
          
          <!-- 进度条（瘦身） -->
          <div class="w-full bg-gray-200 rounded-full h-1 mb-1">
            <div class="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full transition-all duration-300" 
                 :style="{ width: ((8 - draftData.availablePlayers.length) / 8 * 100) + '%' }"></div>
          </div>
          
        <!-- 当前选择状态（精简） -->
        <div v-if="draftData.currentPicker && draftData.availablePlayers.length > 0 && draftData.firstPickMade" 
               class="text-center py-2 rounded-lg" 
               :class="getPickerStatusClass(draftData.currentPicker)">
            <div class="text-base font-bold flex items-center justify-center">
              <i class="fas fa-hand-pointer mr-2 animate-bounce"></i>
              轮到 
              <span :class="draftData.currentPicker === 'red' ? 'text-red-600' : 'text-blue-600'" class="mx-2">
                {{ draftData.currentPicker === 'red' ? '红队' : '蓝队' }}
              </span>
              选择
              <span class="ml-2 text-sm">
                (队长: {{ draftData.currentPicker === 'red' 
                  ? (draftData.redTeam.players.find(p => p.isCaptain)?.name || '未知') 
                  : (draftData.blueTeam.players.find(p => p.isCaptain)?.name || '未知') }})
              </span>
            </div>
          </div>

        <!-- 选择队长阶段提示与操作（开始选人前一直显示） -->
        <div v-if="!draftData.firstPickMade" class="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <i class="fas fa-crown text-yellow-600 mr-2"></i>
              <div>
                <div class="text-sm font-semibold text-slate-800">选择队长阶段</div>
                <div class="text-xs text-slate-600">点击下方玩家卡片设为队长；开始选人前可随时随机/交换队长</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="$emit('random-captains')" class="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold ring-2 ring-indigo-200 shadow">
                <i class="fas fa-dice mr-1"></i>随机队长
              </button>
              <button 
                @click="$emit('swap-captains')" 
                class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
                :class="hasRedCaptain && hasBlueCaptain ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                :disabled="!hasRedCaptain || !hasBlueCaptain" 
                :title="!hasRedCaptain || !hasBlueCaptain ? '需先各有一名队长' : '交换队长'"
              >
                <i class="fas fa-exchange-alt mr-1"></i>交换
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center">
              <div class="text-xs font-medium text-red-600 mb-1">红队队长</div>
              <div class="h-8 flex items-center justify-center">
                <span v-if="hasRedCaptain" class="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  <i class="fas fa-crown mr-1"></i>{{ redCaptainName }}
                </span>
                <span v-else class="text-xs text-slate-400">未选择</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs font-medium text-blue-600 mb-1">蓝队队长</div>
              <div class="h-8 flex items-center justify-center">
                <span v-if="hasBlueCaptain" class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <i class="fas fa-crown mr-1"></i>{{ blueCaptainName }}
                </span>
                <span v-else class="text-xs text-slate-400">未选择</span>
              </div>
            </div>
          </div>
        </div>
          
  
          <div class="mt-2 p-2 lg:p-3 bg-white/70 rounded-lg">
            <div class="text-xs text-gray-600 mb-0.5">选择顺序：</div>
            <div class="flex items-center justify-center space-x-1 text-xs">
              <span v-for="(turn, index) in getDraftOrder()" :key="index" 
                    :class="[
                      'px-1 py-0.5 rounded',
                      index + 1 === draftData.currentTurn ? 'bg-yellow-300 text-yellow-900 font-bold ring-2 ring-yellow-500' :
                      index + 1 < draftData.currentTurn ? 'bg-gray-300 text-gray-700 line-through' :
                      turn === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    ]">
                {{ index + 1 }}:{{ turn === 'red' ? '红' : '蓝' }}
              </span>
            </div>
          </div>
        </div>
        

        <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">

          <div class="w-full lg:w-1/3 min-h-0">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div class="p-3 border-b border-slate-200">
                <h5 class="text-base font-semibold text-slate-800">
                  <i class="fas fa-users mr-2 text-blue-600"></i>
                  备选玩家 ({{ draftData.availablePlayers.length }})
                </h5>
              </div>
              <div class="p-2 sm:p-3">
                <template v-if="draftData.availablePlayers.length > 0">
                  <TransitionGroup 
                    name="available-player" 
                    tag="div" 
                    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3"
                  >
                    <PlayerCard 
                      v-for="player in draftData.availablePlayers" 
                      :key="`available-${player.id}`"
                      :player="player"
                      size="tiny"
                      :clickable="true"
                      :card-class="getPlayerCardClass(player)"
                      :data-player-id="player.id"

                      @click="handlePlayerCardClick(player.id)"
                    />
                  </TransitionGroup>
                </template>
                <div v-else class="flex items-center justify-center py-6">
                  <div class="bg-green-50 rounded-xl border-2 border-green-200 p-6">
                    <div class="text-green-600 mb-2">
                      <i class="fas fa-check-circle text-2xl"></i>
                    </div>
                    <h3 class="text-base font-bold text-green-800 mb-1">选马完成！</h3>
                    <p class="text-green-700 text-xs">所有玩家已分配完毕</p>
                  </div>
                </div>
                

                 <div v-if="draftData.availablePlayers.length > 0 && draftData.firstPickMade" class="mt-4 space-y-2">
                  <button 
                    @click="$emit('auto-draft')"
                    class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm font-medium"
                  >
                    <i class="fas fa-magic mr-2"></i>自动选择剩余
                  </button>
                </div>
              </div>
            </div>
          </div>
          

          <div class="flex-1 min-h-0">
            <div class="space-y-4">

              <div class="team-container">
                <div class="team-header red-team">
                  <div class="flex items-center space-x-3">
                    <span><i class="fas fa-shield-alt mr-2"></i>红队</span>
                    <span v-if="draftData.redTeam.players.find(p => p.isCaptain)" class="flex items-center text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <i class="fas fa-crown mr-1"></i>
                      队长: {{ draftData.redTeam.players.find(p => p.isCaptain).name }}
                    </span>
                    <span 
                      v-if="draftData.currentPicker === 'red'" 
                      class="inline-flex items-center gap-1 text-xs sm:text-sm bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-semibold ring-2 ring-red-300 shadow-sm animate-pulse"
                    >
                      <i class="fas fa-hand-pointer"></i>
                      选择中
                    </span>
                  </div>
                  <div class="text-sm">
                    <span>{{ draftData.redTeam.players.length }}/5人</span>
                    <span class="ml-2">总实力: {{ draftData.redTeam.totalPower }}</span>
                  </div>
                </div>
                <div class="team-body">
                  <TransitionGroup 
                    name="draft-player" 
                    tag="div" 
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3"
                  >
                    <PlayerCard 
                      v-for="player in draftData.redTeam.players" 
                      :key="`draft-red-${player.id}`"
                      :player="player"
                      size="tiny"
                      variant="red-team"
                    />

                    <div v-if="!hasRedCaptain && !draftData.firstPickMade" class="col-span-2 sm:col-span-4 md:col-span-5">
                      <div class="bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 p-2">
                        请选择红队队长
                      </div>
                    </div>

                    <div 
                      v-for="n in (5 - draftData.redTeam.players.length)" 
                      :key="'empty-red-' + n"
                      class="bg-red-50 border-2 border-dashed border-red-200 rounded-xl p-2 flex items-center justify-center min-h-[80px]"
                    >
                      <div class="text-red-300 text-center">
                        <i class="fas fa-user-plus text-xl mb-1"></i>
                        <div class="text-xs">空位</div>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
              

              <div class="team-container">
                <div class="team-header blue-team">
                  <div class="flex items-center space-x-3">
                    <span><i class="fas fa-shield-alt mr-2"></i>蓝队</span>
                    <span v-if="draftData.blueTeam.players.find(p => p.isCaptain)" class="flex items-center text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <i class="fas fa-crown mr-1"></i>
                      队长: {{ draftData.blueTeam.players.find(p => p.isCaptain).name }}
                    </span>
                    <span 
                      v-if="draftData.currentPicker === 'blue'" 
                      class="inline-flex items-center gap-1 text-xs sm:text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold ring-2 ring-blue-300 shadow-sm animate-pulse"
                    >
                      <i class="fas fa-hand-pointer"></i>
                      选择中
                    </span>
                  </div>
                  <div class="text-sm">
                    <span>{{ draftData.blueTeam.players.length }}/5人</span>
                    <span class="ml-2">总实力: {{ draftData.blueTeam.totalPower }}</span>
                  </div>
                </div>
                <div class="team-body">
                  <TransitionGroup 
                    name="draft-player" 
                    tag="div" 
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3"
                  >
                    <PlayerCard 
                      v-for="player in draftData.blueTeam.players" 
                      :key="`draft-blue-${player.id}`"
                      :player="player"
                      size="tiny"
                      variant="blue-team"
                    />
                    <div v-if="!hasBlueCaptain && !draftData.firstPickMade" class="col-span-2 sm:col-span-4 md:col-span-5">
                      <div class="bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200 p-2">
                        请选择蓝队队长
                      </div>
                    </div>

                    <div 
                      v-for="n in (5 - draftData.blueTeam.players.length)" 
                      :key="'empty-blue-' + n"
                      class="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-2 flex items-center justify-center min-h-[80px]"
                    >
                      <div class="text-blue-300 text-center">
                        <i class="fas fa-user-plus text-xl mb-1"></i>
                        <div class="text-xs">空位</div>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模式选择面板 -->
      <div v-else key="mode" class="mode-selection-panel">
        <div class="text-center mb-8">
          <i class="fas fa-gamepad text-6xl text-blue-500 mb-4"></i>
          <h3 class="text-2xl font-bold text-slate-800 mb-2">选择匹配模式</h3>
          <p class="text-slate-600">选择您喜欢的组队方式开始游戏</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <!-- 随机匹配模式 -->
          <div class="mode-card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <i class="fas fa-random text-2xl text-orange-600"></i>
              </div>
              <h4 class="text-xl font-bold text-slate-800 mb-2">随机匹配</h4>
              <p class="text-sm text-slate-600 leading-relaxed">
                系统根据玩家实力自动平衡分队，快速开始游戏
              </p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>自动平衡队伍实力</span>
              </div>
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>快速开始游戏</span>
              </div>
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>支持任意人数（偶数）</span>
              </div>
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                <span>当前待选玩家：{{ candidateCount }} 人</span>
              </div>
            </div>
            
            <button 
              @click="$emit('random-match')"
              :disabled="candidateCount === 0 || candidateCount % 2 !== 0"
              :class="[
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
                (candidateCount === 0 || candidateCount % 2 !== 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 shadow-lg'
              ]"
              :title="candidateCount === 0 ? '请先添加待选玩家' : candidateCount % 2 !== 0 ? '需要偶数个玩家' : ''"
            >
              <i class="fas fa-bolt mr-2"></i>
              开始随机匹配
            </button>
          </div>
          
          <!-- 选马模式 -->
          <div class="mode-card bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 hover:border-red-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <i class="fas fa-hand-pointer text-2xl text-red-600"></i>
              </div>
              <h4 class="text-xl font-bold text-slate-800 mb-2">选马模式</h4>
              <p class="text-sm text-slate-600 leading-relaxed">
                队长轮流选择队员，策略性组建理想阵容
              </p>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>蛇形选择规则 (A-B-B-A-A-B-B-A-A-B)</span>
              </div>
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>策略性队伍组建</span>
              </div>
              <div class="flex items-center text-sm text-slate-600">
                <i class="fas fa-check text-green-500 mr-2"></i>
                <span>支持手动和自动选择</span>
              </div>
              <div class="flex items-center text-sm" :class="candidateCount === 10 ? 'text-green-600' : 'text-orange-600'">
                <i :class="candidateCount === 10 ? 'fas fa-check text-green-500' : 'fas fa-exclamation-triangle text-orange-500'" class="mr-2"></i>
                <span>需要恰好10名玩家（当前：{{ candidateCount }}/10）</span>
              </div>
            </div>
            
            <button 
              @click="$emit('draft-mode')"
              :disabled="candidateCount !== 10"
              :class="[
                'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
                candidateCount !== 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 shadow-lg'
              ]"
              :title="candidateCount !== 10 ? '需要恰好10名玩家才能开始选马' : ''"
            >
              <i class="fas fa-crown mr-2"></i>
              开始选马模式
            </button>
          </div>
        </div>
        
        <!-- 模式切换提示 -->
        <div v-if="matchResult || currentMode" class="text-center mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-700">
            <i class="fas fa-info-circle mr-2"></i>
            您可以随时点击上方按钮切换到不同的匹配模式
          </p>
        </div>
      </div>
      </Transition>
    </div>
    
    <!-- 庆祝礼花覆盖层（仅展示简洁徽章，无背景闪烁） -->
    <div v-if="celebration.show" class="fixed inset-0 pointer-events-none z-[1001]">
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="celebration-badge-container mb-3">
          <div 
            class="celebration-badge px-6 sm:px-8 py-3 sm:py-4 rounded-full"
            :class="{
              'bg-gradient-to-r from-red-500 to-red-600': celebration.team === 'red',
              'bg-gradient-to-r from-blue-500 to-blue-600': celebration.team === 'blue'
            }"
          >
            <div class="flex items-center space-x-3 text-white">
              <i class="fas fa-crown text-2xl sm:text-3xl text-yellow-300"></i>
              <span class="text-2xl sm:text-4xl font-extrabold">{{ celebration.team === 'red' ? '红队胜利' : '蓝队胜利' }}</span>
              <i class="fas fa-crown text-2xl sm:text-3xl text-yellow-300"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import PlayerCard from './PlayerCard.vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  matchResult: {
    type: Object,
    default: null
  },

  currentMode: {
    type: String,
    default: null
  },
  draftData: {
    type: Object,
    default: null
  },
  candidateCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['rematch', 'share', 'player-select', 'auto-draft', 'complete-draft', 'quick-start', 'draft-mode', 'random-match', 'set-captain', 'swap-captains', 'random-captains'])

// 庆祝状态
const celebration = ref({
  show: false,
  team: null
})

const getBalanceClass = (score) => {
  if (score >= 90) return 'balance-excellent'
  if (score >= 80) return 'balance-good'
  if (score >= 70) return 'balance-fair'
  return 'balance-poor'
}

const getBalanceText = (score) => {
  if (score >= 90) return '极佳'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  return '较差'
}

const getPickerStatusClass = (picker) => {
  return picker === 'red' 
    ? 'bg-red-50 border border-red-200 text-red-700' 
    : 'bg-blue-50 border border-blue-200 text-blue-700'
}

const getDraftOrder = () => {
  // 生成蛇形选择顺序：红-蓝-蓝-红-红-蓝-蓝-红
  return ['red', 'blue', 'blue', 'red', 'red', 'blue', 'blue', 'red']
}

const hasRedCaptain = computed(() => !!(props.draftData?.redTeam?.players || []).find(p => p.isCaptain))
const hasBlueCaptain = computed(() => !!(props.draftData?.blueTeam?.players || []).find(p => p.isCaptain))
const bothCaptainsChosen = computed(() => hasRedCaptain.value && hasBlueCaptain.value)
const redCaptainName = computed(() => (props.draftData?.redTeam?.players || []).find(p => p.isCaptain)?.name || '')
const blueCaptainName = computed(() => (props.draftData?.blueTeam?.players || []).find(p => p.isCaptain)?.name || '')

const getPlayerCardClass = (player) => {
  if (!props.draftData || props.draftData.firstPickMade) {
    return 'hover:scale-105 hover:shadow-lg'
  }
  
  // 队长选择阶段的样式
  const baseClass = 'hover:scale-105 hover:shadow-lg border-2 '
  
  if (!hasRedCaptain.value && !hasBlueCaptain.value) {
    // 都没选，显示红色边框表示优先选红队长
    return baseClass + 'border-red-300 hover:border-red-500'
  } else if (!hasRedCaptain.value) {
    // 只能选红队长
    return baseClass + 'border-red-300 hover:border-red-500'
  } else if (!hasBlueCaptain.value) {
    // 只能选蓝队长  
    return baseClass + 'border-blue-300 hover:border-blue-500'
  } else {
    // 都选完了
    return baseClass + 'border-green-300'
  }
}

const handlePlayerCardClick = (playerId) => {
  if (!props.draftData) return
  
  const player = props.draftData.availablePlayers.find(p => p.id === playerId)
  if (!player) return
  
  if (props.draftData.firstPickMade || bothCaptainsChosen.value) {
    // 选人阶段 - 直接执行选择逻辑
    emit('player-select', player.id)
  } else {
    // 队长选择阶段
    if (!hasRedCaptain.value) {
      emit('set-captain', { team: 'red', playerId: player.id })
    } else if (!hasBlueCaptain.value) {
      emit('set-captain', { team: 'blue', playerId: player.id })
    }
  }
}

// 庆祝礼花
const startCelebration = (team) => {
  const colors = team === 'red'
    ? ['#ef4444', '#f97316', '#f59e0b', '#fde047']
    : ['#3b82f6', '#06b6d4', '#60a5fa', '#93c5fd']

  celebration.value = { show: true, team }

  const shoot = () => {
    confetti({ particleCount: 60, spread: 70, startVelocity: 45, origin: { y: 0.6 }, ticks: 200, colors })
    confetti({ particleCount: 80, spread: 100, startVelocity: 55, origin: { y: 0.55 }, ticks: 220, colors })
    confetti({ particleCount: 40, spread: 120, startVelocity: 65, decay: 0.9, scalar: 1.1, origin: { y: 0.5 }, colors })
    confetti({ particleCount: 40, spread: 60, angle: 60, origin: { x: 0, y: 0.6 }, colors })
    confetti({ particleCount: 40, spread: 60, angle: 120, origin: { x: 1, y: 0.6 }, colors })
  }

  shoot()
  setTimeout(shoot, 180)
  setTimeout(shoot, 360)

  setTimeout(() => {
    celebration.value.show = false
  }, 1600)
}

// 处理胜利按钮点击
const handleVictoryClick = (team) => {
  startCelebration(team)
  emit('save-result', team)
}
</script>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: all 250ms ease;
}
.panel-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
.team-container {
  @apply bg-white rounded-xl border border-slate-200 shadow-sm;
}

.team-header {
  @apply px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between font-semibold text-base sm:text-lg;
}

.team-header.red-team {
  @apply bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200;
}

.team-header.blue-team {
  @apply bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200;
}

.team-body {
  @apply p-3 lg:p-4;
}

/* 队伍玩家动画 */
.team-player-move,
.team-player-enter-active,
.team-player-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.team-player-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(-100px) rotate(10deg);
}

.team-player-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(100px) rotate(-10deg);
}

.team-player-leave-active {
  position: absolute;
}

/* 选马模式玩家动画 */
.draft-player-move,
.draft-player-enter-active,
.draft-player-leave-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.draft-player-enter-from {
  opacity: 0;
  transform: scale(0.5) translateX(-50px) rotateY(180deg);
}

.draft-player-leave-to {
  opacity: 0;
  transform: scale(0.5) translateX(50px) rotateY(-180deg);
}

.draft-player-leave-active {
  position: absolute;
}

/* 随机匹配特殊动画 */
@keyframes shuffle-in {
  0% {
    opacity: 0;
    transform: scale(0.1) rotate(0deg) translateY(-200px);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2) rotate(180deg) translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(360deg) translateY(0);
  }
}

.team-player-enter-active.shuffle-animation {
  animation: shuffle-in 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 队伍标题动画 */
@keyframes team-appear {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.team-container {
  animation: team-appear 0.6s ease-out;
}

/* 待选区玩家动画 */
.available-player-move,
.available-player-enter-active,
.available-player-leave-active {
  transition: all 0.3s ease-out;
}

.available-player-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.available-player-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.available-player-leave-active {
  position: absolute;
  z-index: 50;
}

/* 选中高亮动画 */
@keyframes selection-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    transform: scale(1.05);
  }
}

.player-selecting {
  animation: selection-pulse 0.6s ease-out;
}

/* 空位高亮动画 */
@keyframes slot-highlight {
  0%, 100% {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
  }
  50% {
    border-color: rgba(59, 130, 246, 0.6);
    background: rgba(59, 130, 246, 0.1);
  }
}

.empty-slot-ready {
  animation: slot-highlight 1s ease-in-out infinite;
}

.balance-indicator {
  @apply text-center py-4 px-6 rounded-lg font-semibold;
}

.balance-excellent {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.balance-good {
  @apply bg-blue-100 text-blue-800 border border-blue-200;
}

.balance-fair {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-200;
}

.balance-poor {
  @apply bg-red-100 text-red-800 border border-red-200;
}

.draft-header {
  @apply text-center mb-6;
}

.draft-title {
  @apply text-2xl font-bold text-slate-800 mb-2;
}

.draft-subtitle {
  @apply text-slate-600;
}

/* 简单动画样式 */
.simple-animation-enter-active,
.simple-animation-leave-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.simple-animation-enter-from {
  opacity: 0;
  transform: scale(0.3);
}

.simple-animation-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

.simple-animation-enter-to {
  opacity: 1;
  transform: scale(1);
}

.celebration-badge-container {
  animation: badge-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.celebration-badge {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.2);
  animation: badge-glow 1.8s ease-in-out infinite;
}

.celebration-victory-text {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.35);
  animation: victory-pop 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes badge-entrance {
  0% { 
    opacity: 0;
    transform: scale(0.3) translateY(-100px);
  }
  70% {
    opacity: 1;
    transform: scale(1.1) translateY(0px);
  }
  100% { 
    opacity: 1;
    transform: scale(1) translateY(0px);
  }
}

@keyframes badge-glow {
  0%, 100% { 
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
  50% { 
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4), 0 0 0 6px rgba(255, 255, 255, 0.4);
  }
}

@keyframes victory-pop {
  0% { opacity: 0; transform: scale(0.7) translateY(8px); }
  60% { opacity: 1; transform: scale(1.06) translateY(0); }
  100% { opacity: 1; transform: scale(1); }
}

</style>

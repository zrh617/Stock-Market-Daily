<template>
  <div
    class="h-full w-full bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm overflow-hidden flex flex-col"
  >
    <!-- 标题栏 -->
    <div class="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 flex-shrink-0 px-2">
      <div
        class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"
      >
        <svg
          class="w-6 h-6 sm:w-7 sm:h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-100">基金实时估值</h2>
      <button
        @click="showAddFundDialog = true"
        class="ml-auto p-2 sm:p-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 hover:scale-105 backdrop-blur-sm flex-shrink-0"
        title="添加基金"
      >
        <svg
          class="w-5 h-5 sm:w-6 sm:h-6 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
      </button>
      <button
        @click="refreshFunds"
        :disabled="isLoading"
        class="p-2 sm:p-3 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        title="刷新"
      >
        <svg
          class="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 hover:text-green-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </button>
    </div>

    <!-- 添加基金对话框 -->
    <div
      v-if="showAddFundDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showAddFundDialog = false"
    >
      <div
        class="bg-dark-800 rounded-xl p-4 sm:p-6 max-w-md w-full border border-dark-700 shadow-xl"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-100">添加基金</h3>
          <button
            @click="showAddFundDialog = false"
            class="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="mb-4">
          <input
            v-model="searchKeyword"
            @input="handleSearch"
            type="text"
            placeholder="输入基金代码或名称搜索"
            class="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="mb-4 max-h-48 overflow-y-auto">
          <div
            v-for="fund in searchResults"
            :key="fund.code"
            @click="addFund(fund.code, fund.name)"
            class="p-3 bg-dark-700 hover:bg-dark-600 rounded-lg cursor-pointer transition-colors mb-2"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-gray-100">{{ fund.name }}</div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ fund.code }} · {{ fund.type }} · {{ fund.company }}
                </div>
              </div>
              <svg
                class="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- 手动输入 -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-2">或手动输入基金代码</label>
          <div class="flex space-x-2">
            <input
              v-model="manualFundCode"
              type="text"
              placeholder="例如：000001"
              class="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              @click="addFundByCode"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoading && funds.length === 0"
      class="flex items-center justify-center py-16 flex-shrink-0"
    >
      <div class="flex flex-col items-center space-y-4">
        <div
          class="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <div class="text-base sm:text-lg text-gray-400">正在加载基金数据...</div>
      </div>
    </div>

    <!-- 基金列表 -->
    <div
      v-else-if="funds.length > 0"
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800 min-h-0 px-2"
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="fund in funds"
          :key="fund.code"
          class="group/fund p-6 sm:p-8 bg-gradient-to-r from-dark-700/50 to-dark-800/50 rounded-xl hover:bg-dark-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10 backdrop-blur-sm border border-dark-600/30"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-2">
                <div class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-100 truncate">
                  {{ fund.name }}
                </div>
              </div>
              <div class="text-sm sm:text-base text-gray-400 mb-4">
                {{ fund.code }} · {{ fund.type }}
              </div>

              <!-- 估值信息 -->
              <div class="space-y-3 sm:space-y-4 mt-6">
                <div class="flex items-center justify-between">
                  <span class="text-sm sm:text-base text-gray-400">实时估值</span>
                  <span class="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
                    {{ fund.estimatedValue.toFixed(3) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm sm:text-base text-gray-400">最新净值</span>
                  <span class="text-base sm:text-lg font-semibold text-gray-200">
                    {{ fund.netValue.toFixed(3) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm sm:text-base text-gray-400">涨跌幅</span>
                  <span
                    :class="[
                      'text-lg sm:text-xl lg:text-2xl font-bold',
                      fund.changePercent >= 0 ? 'text-green-400' : 'text-red-400',
                    ]"
                  >
                    {{ fund.changePercent >= 0 ? '+' : '' }}{{ fund.changePercent.toFixed(2) }}%
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm sm:text-base text-gray-400">涨跌额</span>
                  <span
                    :class="[
                      'text-base sm:text-lg font-semibold',
                      fund.change >= 0 ? 'text-green-400' : 'text-red-400',
                    ]"
                  >
                    {{ fund.change >= 0 ? '+' : '' }}{{ fund.change.toFixed(3) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 删除按钮 -->
            <button
              @click="removeFund(fund.code)"
              class="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 opacity-0 group-hover/fund:opacity-100 flex-shrink-0"
              title="删除基金"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>

          <!-- 更新时间 -->
          <div class="mt-4 pt-4 border-t border-dark-600/30">
            <div class="text-sm text-gray-500">更新：{{ fund.updateTime }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center py-16">
      <div class="text-center">
        <div
          class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 sm:w-10 sm:h-10 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div class="text-base sm:text-lg text-gray-500 mb-3">暂无自选基金</div>
        <button
          @click="showAddFundDialog = true"
          class="text-sm sm:text-base text-green-400 hover:text-green-300 transition-colors px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20"
        >
          点击添加基金
        </button>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dark-600/30 flex-shrink-0 px-2">
      <div class="text-sm sm:text-base text-gray-500 text-center">
        <span class="inline-flex items-center space-x-2">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>实时估值仅供参考，以实际净值为准</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fundAPI, type FundQuote, type FundInfo } from '@/services/fundAPI'

const isLoading = ref<boolean>(false)
const funds = ref<FundQuote[]>([])
const showAddFundDialog = ref<boolean>(false)
const searchKeyword = ref<string>('')
const searchResults = ref<FundInfo[]>([])
const manualFundCode = ref<string>('')

// 实时更新定时器
let updateInterval: ReturnType<typeof setInterval> | null = null
// 搜索防抖定时器
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// 从localStorage加载自选基金列表
const loadFavoriteFunds = (): string[] => {
  try {
    const saved = localStorage.getItem('favoriteFunds')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载自选基金失败:', error)
  }
  // 默认基金列表
  return ['000001', '110022', '161725']
}

// 保存自选基金列表到localStorage
const saveFavoriteFunds = (codes: string[]) => {
  try {
    localStorage.setItem('favoriteFunds', JSON.stringify(codes))
  } catch (error) {
    console.error('保存自选基金失败:', error)
  }
}

// 获取基金代码列表
const getFavoriteFundCodes = (): string[] => {
  return loadFavoriteFunds()
}

// 加载基金数据
const loadFunds = async () => {
  const codes = getFavoriteFundCodes()
  if (codes.length === 0) {
    funds.value = []
    return
  }

  isLoading.value = true
  try {
    const quotes = await fundAPI.getFundQuotes(codes)
    funds.value = quotes
  } catch (error) {
    console.error('加载基金数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 搜索基金（带防抖）
const handleSearch = async () => {
  // 清除之前的定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  // 如果搜索关键词为空，清空结果
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  // 防抖：300ms后执行搜索
  searchDebounceTimer = setTimeout(async () => {
    try {
      const results = await fundAPI.searchFunds(searchKeyword.value)
      searchResults.value = results.slice(0, 5) // 限制显示5个结果
    } catch (error) {
      console.error('搜索基金失败:', error)
    }
  }, 300)
}

// 添加基金
const addFund = async (code: string, name?: string) => {
  const codes = getFavoriteFundCodes()
  if (codes.includes(code)) {
    alert('该基金已在自选列表中')
    return
  }

  codes.push(code)
  saveFavoriteFunds(codes)
  showAddFundDialog.value = false
  searchKeyword.value = ''
  searchResults.value = []
  manualFundCode.value = ''
  await loadFunds()
}

// 通过代码添加基金
const addFundByCode = async () => {
  const code = manualFundCode.value.trim()
  if (!code) {
    alert('请输入基金代码')
    return
  }

  // 验证代码格式（6位数字）
  if (!/^\d{6}$/.test(code)) {
    alert('基金代码应为6位数字')
    return
  }

  await addFund(code)
}

// 删除基金
const removeFund = (code: string) => {
  if (confirm(`确定要删除基金 ${code} 吗？`)) {
    const codes = getFavoriteFundCodes()
    const index = codes.indexOf(code)
    if (index > -1) {
      codes.splice(index, 1)
      saveFavoriteFunds(codes)
      loadFunds()
    }
  }
}

// 刷新基金数据
const refreshFunds = async () => {
  await loadFunds()
}

// 启动实时更新
const startRealTimeUpdates = () => {
  // 每30秒更新一次基金估值
  updateInterval = setInterval(() => {
    loadFunds()
  }, 30 * 1000)
}

// 停止实时更新
const stopRealTimeUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

onMounted(() => {
  loadFunds()
  startRealTimeUpdates()
})

onUnmounted(() => {
  stopRealTimeUpdates()
  // 清除搜索防抖定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script>


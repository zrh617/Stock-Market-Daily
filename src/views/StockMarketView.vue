<template>
  <div class="h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
    <!-- 顶部Tab栏 -->
    <TabBar @tab-change="handleTabChange" />

    <!-- 主内容区域 -->
    <div class="h-full pt-14 sm:pt-16 flex flex-col">
      <div
        class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <!-- 页面标题 -->
        <div class="mb-2 sm:mb-4 animate-fade-in flex-shrink-0">
          <h1 class="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-100 mb-1">
            {{ getCurrentTabName() }}市场分析
          </h1>
          <p class="text-xs sm:text-sm text-gray-400">实时市场数据 · 重要事件提醒 · 技术分析</p>
        </div>

        <!-- 主要内容区域 -->
        <div
          class="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-slide-up flex-1 min-h-0"
          style="max-height: calc(100vh - 400px)"
        >
          <!-- 左侧：事件日历 -->
          <div class="order-2 xl:order-1 min-h-0">
            <EventCalendar :market="activeTab" />
          </div>

          <!-- 中间：股票图表 -->
          <div class="order-1 xl:order-2 min-h-0">
            <StockChart :market="activeTab" />
          </div>

          <!-- 右侧：AI预测股票 -->
          <div class="order-3 xl:order-3 min-h-0">
            <AIStockPrediction :market="activeTab" />
          </div>
        </div>

        <!-- 底部统计信息 -->
        <div
          class="mt-2 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 animate-slide-up flex-shrink-0"
        >
          <div
            class="card p-3 sm:p-4 bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-dark-700/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div class="w-full sm:w-auto">
                <div class="flex items-center space-x-2 mb-2 sm:mb-3">
                  <div
                    class="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-semibold text-gray-100">市场概览</h3>
                </div>
                <div class="space-y-1 sm:space-y-2">
                  <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-400">上涨股票</span>
                    <span class="text-green-400 font-medium">{{ marketStats.rising }}</span>
                  </div>
                  <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-400">下跌股票</span>
                    <span class="text-red-400 font-medium">{{ marketStats.falling }}</span>
                  </div>
                  <div class="flex justify-between text-xs sm:text-sm">
                    <span class="text-gray-400">平盘股票</span>
                    <span class="text-gray-400 font-medium">{{ marketStats.unchanged }}</span>
                  </div>
                </div>
              </div>
              <div class="text-left sm:text-right mt-2 sm:mt-0">
                <div class="text-lg sm:text-xl font-bold text-gray-100">
                  {{ marketStats.total }}
                </div>
                <div class="text-xs text-gray-400">总股票数</div>
              </div>
            </div>
          </div>

          <div
            class="card p-3 sm:p-4 bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-dark-700/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div class="w-full sm:w-auto">
                <div class="flex items-center space-x-2 mb-2 sm:mb-3">
                  <div
                    class="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-semibold text-gray-100">热门板块</h3>
                </div>
                <div class="space-y-1 sm:space-y-2">
                  <div
                    v-for="sector in hotSectors"
                    :key="sector.name"
                    class="flex justify-between text-xs sm:text-sm"
                  >
                    <span class="text-gray-400">{{ sector.name }}</span>
                    <span
                      :class="[
                        'font-medium',
                        sector.change >= 0 ? 'text-green-400' : 'text-red-400',
                      ]"
                    >
                      {{ sector.change >= 0 ? '+' : '' }}{{ sector.changePercent }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="card p-3 sm:p-4 bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-dark-700/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 sm:col-span-2 lg:col-span-1"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div class="w-full sm:w-auto">
                <div class="flex items-center space-x-2 mb-2 sm:mb-3">
                  <div
                    class="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-sm sm:text-base font-semibold text-gray-100">今日事件</h3>
                </div>
                <div class="space-y-1 sm:space-y-2">
                  <div v-for="event in todayEvents" :key="event.id" class="text-xs sm:text-sm">
                    <div class="text-gray-100 font-medium">{{ event.title }}</div>
                    <div class="text-gray-400">{{ event.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import EventCalendar from '@/components/EventCalendar.vue'
import StockChart from '@/components/StockChart.vue'
import AIStockPrediction from '@/components/AIStockPrediction.vue'
import { stockMarketAPI } from '@/services/stockMarketAPI'
import type { MarketStats, SectorPerformance, MarketEvent } from '@/services/stockMarketAPI'

const router = useRouter()
const route = useRoute()
const activeTab = ref<string>((route.params.market as string) || 'us')

const marketStats = ref<MarketStats>({
  total: 0,
  rising: 0,
  falling: 0,
  unchanged: 0,
  volume: 0,
  marketCap: 0,
})

const hotSectors = ref<SectorPerformance[]>([])

const todayEvents = ref<MarketEvent[]>([])

// 实时更新定时器
let updateInterval: number | null = null

const loadMarketData = async () => {
  try {
    const [stats, sectors, events] = await Promise.all([
      stockMarketAPI.getMarketStats(activeTab.value),
      stockMarketAPI.getSectorPerformance(activeTab.value),
      stockMarketAPI.getMarketEvents(),
    ])

    marketStats.value = stats
    hotSectors.value = sectors.slice(0, 4) // 只显示前4个板块
    todayEvents.value = events.slice(0, 3) // 只显示前3个事件
  } catch (error) {
    console.error('加载市场数据失败:', error)
  }
}

const getCurrentTabName = () => {
  const tabNames: Record<string, string> = {
    us: '美股',
    cn: 'A股',
    hk: '港股',
  }
  return tabNames[activeTab.value] || '美股'
}

const handleTabChange = async (tabId: string) => {
  // 如果切换到基金情报，跳转到基金页面
  if (tabId === 'fund') {
    router.push('/fund')
    return
  }
  
  // 其他市场标签切换
  activeTab.value = tabId
  await loadMarketData()
}

// 启动实时更新
const startRealTimeUpdates = () => {
  // 每5分钟更新一次市场数据
  updateInterval = setInterval(() => {
    loadMarketData()
  }, 5 * 60 * 1000)
}

// 停止实时更新
const stopRealTimeUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

onMounted(() => {
  loadMarketData()
  startRealTimeUpdates()
})

onUnmounted(() => {
  stopRealTimeUpdates()
})
</script>
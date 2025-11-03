<template>
  <div
    class="card p-3 sm:p-4 h-full bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm"
  >
    <div class="flex flex-col mb-3 sm:mb-4">
      <div class="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
        <div
          class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0"
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
        <h2 class="text-base sm:text-lg font-semibold text-gray-100">股票分时图</h2>
      </div>
      <div class="flex flex-wrap items-center gap-2 w-full">
        <!-- K线类型选择 -->
        <select
          v-model="chartType"
          @change="onChartTypeChange"
          class="bg-dark-700/50 border border-dark-600/50 text-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
        >
          <option value="minute">分时图</option>
          <option value="daily">日K</option>
          <option value="weekly">周K</option>
          <option value="monthly">月K</option>
          <option value="yearly">年K</option>
        </select>

        <!-- 时间周期选择 -->
        <select
          v-model="timeFrame"
          @change="onTimeFrameChange"
          class="bg-dark-700/50 border border-dark-600/50 text-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
        >
          <option value="1m">1分钟</option>
          <option value="5m">5分钟</option>
          <option value="15m">15分钟</option>
          <option value="30m">30分钟</option>
          <option value="1h">1小时</option>
          <option value="4h">4小时</option>
          <option value="1d">1天</option>
        </select>

        <!-- 交易时段选择（仅美股显示） -->
        <select
          v-if="currentMarket === 'us'"
          v-model="tradingSession"
          @change="onTradingSessionChange"
          class="bg-dark-700/50 border border-dark-600/50 text-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
        >
          <option value="premarket">盘前</option>
          <option value="regular">盘中</option>
          <option value="afterhours">盘后</option>
          <option value="extended">夜盘</option>
        </select>

        <!-- 股票选择 -->
        <select
          v-model="selectedStock"
          @change="onStockChange"
          class="bg-dark-700/50 border border-dark-600/50 text-gray-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 backdrop-blur-sm transition-all duration-200 flex-1 min-w-[120px]"
        >
          <option v-for="stock in stocks" :key="stock.symbol" :value="stock.symbol">
            {{ stock.name }} ({{ stock.symbol }})
          </option>
        </select>

        <!-- 刷新按钮 -->
        <button
          @click="refreshData"
          class="p-1 sm:p-1.5 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm flex-shrink-0"
        >
          <svg
            class="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 hover:text-primary-400 transition-colors"
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
    </div>

    <!-- 股票信息卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
      >
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <div class="text-xs sm:text-sm text-gray-400">当前价格</div>
          <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        </div>
        <div class="text-sm sm:text-lg font-semibold text-gray-100 mb-1">
          {{ currency === 'CNY' ? '¥' : '$' }}{{ currentPrice }}
        </div>
        <div
          :class="[
            'text-xs sm:text-sm font-medium flex items-center space-x-1',
            parseFloat(priceChange) >= 0 ? 'text-green-400' : 'text-red-400',
          ]"
        >
          <svg
            v-if="parseFloat(priceChange) >= 0"
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 17l9.2-9.2M17 17V7H7"
            ></path>
          </svg>
          <svg
            v-else
            class="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 7l-9.2 9.2M7 7v10h10"
            ></path>
          </svg>
          <span
            >{{ parseFloat(priceChange) >= 0 ? '+' : '' }}{{ priceChange }} ({{
              priceChangePercent
            }}%)</span
          >
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
      >
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <div class="text-xs sm:text-sm text-gray-400">成交量</div>
          <div class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
        </div>
        <div class="text-sm sm:text-lg font-semibold text-gray-100 mb-1">{{ volume }}</div>
        <div class="text-xs sm:text-sm text-gray-500 flex items-center space-x-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
          <span>{{ volumeChange }}%</span>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div
      class="bg-gradient-to-br from-dark-700/30 to-dark-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 h-[200px] sm:h-[250px] border border-dark-600/30 backdrop-blur-sm mb-3 sm:mb-4"
    >
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-2 sm:space-y-3">
          <div
            class="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <div class="text-xs sm:text-sm text-gray-400">加载中...</div>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center space-y-2 sm:space-y-3">
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div class="text-xs sm:text-sm text-red-400">{{ error }}</div>
        </div>
      </div>
      <div v-else class="h-full">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
    </div>

    <!-- 技术指标 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg p-1.5 sm:p-2 text-center border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div class="text-xs text-gray-400 mb-0.5 sm:mb-1">MA5</div>
        <div class="text-xs sm:text-sm font-medium text-gray-100">{{ ma5 }}</div>
      </div>
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg p-1.5 sm:p-2 text-center border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div class="text-xs text-gray-400 mb-0.5 sm:mb-1">MA10</div>
        <div class="text-xs sm:text-sm font-medium text-gray-100">{{ ma10 }}</div>
      </div>
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg p-1.5 sm:p-2 text-center border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div class="text-xs text-gray-400 mb-0.5 sm:mb-1">MA20</div>
        <div class="text-xs sm:text-sm font-medium text-gray-100">{{ ma20 }}</div>
      </div>
      <div
        class="bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-lg p-1.5 sm:p-2 text-center border border-dark-600/30 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div class="text-xs text-gray-400 mb-0.5 sm:mb-1">RSI</div>
        <div class="text-xs sm:text-sm font-medium text-gray-100">{{ rsi }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { stockMarketAPI } from '@/services/stockMarketAPI'

Chart.register(...registerables)

interface Stock {
  symbol: string
  name: string
}

const usStocks: Stock[] = [
  { symbol: 'AAPL', name: '苹果' },
  { symbol: 'GOOG', name: '谷歌' },
  { symbol: 'MSFT', name: '微软' },
  { symbol: 'TSLA', name: '特斯拉' },
  { symbol: 'AMZN', name: '亚马逊' },
]

const cnStocks: Stock[] = [
  { symbol: '000001', name: '平安银行' },
  { symbol: '600000', name: '浦发银行' },
  { symbol: '600519', name: '贵州茅台' },
  { symbol: '000858', name: '五粮液' },
  { symbol: '002594', name: '比亚迪' },
]

const hkStocks: Stock[] = [
  { symbol: '0700', name: '腾讯控股' },
  { symbol: '9988', name: '阿里巴巴' },
  { symbol: '0388', name: '香港交易所' },
  { symbol: '1810', name: '小米集团' },
  { symbol: '3690', name: '美团' },
]

const currentMarket = ref<string>('us')

const stocks = computed(() => {
  if (currentMarket.value === 'cn') {
    return cnStocks
  } else if (currentMarket.value === 'hk') {
    return hkStocks
  } else {
    return usStocks
  }
})

const selectedStock = ref<string>('AAPL')
const chartType = ref<string>('minute')
const timeFrame = ref<string>('1m')
const tradingSession = ref<string>('regular')
let chart: Chart | null = null
const chartCanvas = ref<HTMLCanvasElement | null>(null)

const currentPrice = ref<string>('150.25')
const currency = ref<string>('USD') // 货币单位
const priceChange = ref<string>('2.15')
const priceChangePercent = ref<string>('1.45')
const volume = ref<string>('45.2M')
const volumeChange = ref<string>('32')

// 技术指标
const ma5 = ref<string>('148.50')
const ma10 = ref<string>('147.80')
const ma20 = ref<string>('146.20')
const rsi = ref<string>('65.40')

const loading = ref<boolean>(true)
const error = ref<string>('')

const createChart = () => {
  console.log('开始创建图表...')

  // 等待DOM更新
  setTimeout(() => {
    if (!chartCanvas.value) {
      console.error('Chart canvas not found')
      error.value = 'Canvas元素未找到'
      return
    }

    createChartInternal()
  }, 100)
}

const createChartInternal = () => {
  console.log('Canvas元素找到:', chartCanvas.value)

  try {
    // 根据图表类型和时间周期生成不同的数据
    const chartData = generateChartData()
    console.log('使用测试数据:', chartData)

    // 销毁现有图表
    if (chart) {
      console.log('销毁现有图表')
      chart.destroy()
      chart = null
    }

    console.log('创建新图表...')
    chart = new Chart(chartCanvas.value!, {
      type: chartType.value === 'minute' ? 'line' : 'line', // 暂时使用line类型，因为candlestick需要特殊插件
      data: {
        labels: chartData.labels,
        datasets:
          chartType.value === 'minute'
            ? [
                {
                  label: '价格',
                  data: chartData.data,
                  borderColor: '#facc15',
                  backgroundColor: 'rgba(250, 204, 21, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.1,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                },
              ]
            : [
                {
                  label: 'K线',
                  data: chartData.candlestickData.map((d: any) => d.c), // 使用收盘价作为线图数据
                  borderColor: '#facc15',
                  backgroundColor: 'rgba(250, 204, 21, 0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.1,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                },
              ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#d1d5db',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#facc15',
            bodyColor: '#d1d5db',
            borderColor: '#4b5563',
            borderWidth: 1,
            callbacks: {
              title: function (context) {
                return `${chartType.value === 'minute' ? '时间' : '日期'}: ${
                  context[0]?.label || '未知'
                }`
              },
              label: function (context) {
                let label = context.dataset.label || ''
                if (label) {
                  label += ': '
                }
                if (context.parsed.y !== null) {
                  if (chartType.value === 'minute') {
                    label += new Intl.NumberFormat('zh-CN', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(context.parsed.y)
                  } else {
                    // K线数据
                    const index = context.dataIndex
                    const candlestickData = chartData.candlestickData[index]
                    if (candlestickData) {
                      label = `开盘: $${candlestickData.o.toFixed(
                        2
                      )}\n最高: $${candlestickData.h.toFixed(
                        2
                      )}\n最低: $${candlestickData.l.toFixed(
                        2
                      )}\n收盘: $${candlestickData.c.toFixed(2)}`
                    }
                  }
                }
                return label
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#9ca3af',
              maxTicksLimit: 8,
            },
            grid: {
              color: '#374151',
            },
          },
          y: {
            ticks: {
              color: '#9ca3af',
            },
            grid: {
              color: '#374151',
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    })
    console.log('图表创建成功!')
  } catch (err) {
    console.error('创建图表失败:', err)
    error.value = '图表创建失败'
  }
}

// 生成图表数据
const generateChartData = () => {
  const basePrice = parseFloat(currentPrice.value) || 150.25
  const labels: string[] = []
  const data: number[] = []
  const candlestickData: any[] = []

  if (chartType.value === 'minute') {
    // 分时图数据
    const intervals = getMinuteIntervals()
    intervals.forEach((time, index) => {
      labels.push(time)
      const price = basePrice + (Math.random() - 0.5) * 2 + index * 0.1
      data.push(price)
    })
  } else {
    // K线数据
    const periods = getKLinePeriods()
    periods.forEach((period, index) => {
      labels.push(period)
      const open = basePrice + (Math.random() - 0.5) * 2
      const close = open + (Math.random() - 0.5) * 4
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2

      candlestickData.push({ o: open, h: high, l: low, c: close })
    })
  }

  return { labels, data, candlestickData }
}

// 获取分钟间隔
const getMinuteIntervals = () => {
  const intervals: string[] = []
  const session = tradingSession.value

  if (session === 'premarket') {
    // 盘前 04:00-09:30
    for (let hour = 4; hour < 9; hour++) {
      for (let min = 0; min < 60; min += parseInt(timeFrame.value.replace('m', ''))) {
        intervals.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
    intervals.push('09:30')
  } else if (session === 'regular') {
    // 盘中 09:30-16:00
    for (let hour = 9; hour < 16; hour++) {
      for (
        let min = hour === 9 ? 30 : 0;
        min < 60;
        min += parseInt(timeFrame.value.replace('m', ''))
      ) {
        if (hour === 9 && min < 30) continue
        intervals.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
  } else if (session === 'afterhours') {
    // 盘后 16:00-20:00
    for (let hour = 16; hour < 20; hour++) {
      for (let min = 0; min < 60; min += parseInt(timeFrame.value.replace('m', ''))) {
        intervals.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
  } else if (session === 'extended') {
    // 夜盘 20:00-04:00
    for (let hour = 20; hour < 24; hour++) {
      for (let min = 0; min < 60; min += parseInt(timeFrame.value.replace('m', ''))) {
        intervals.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
    for (let hour = 0; hour < 4; hour++) {
      for (let min = 0; min < 60; min += parseInt(timeFrame.value.replace('m', ''))) {
        intervals.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
  }

  return intervals
}

// 获取K线周期
const getKLinePeriods = () => {
  const periods: string[] = []
  const count =
    chartType.value === 'daily'
      ? 30
      : chartType.value === 'weekly'
      ? 12
      : chartType.value === 'monthly'
      ? 12
      : 5

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date()
    if (chartType.value === 'daily') {
      date.setDate(date.getDate() - i)
      periods.push(`${date.getMonth() + 1}/${date.getDate()}`)
    } else if (chartType.value === 'weekly') {
      date.setDate(date.getDate() - i * 7)
      periods.push(`${date.getMonth() + 1}/${date.getDate()}`)
    } else if (chartType.value === 'monthly') {
      date.setMonth(date.getMonth() - i)
      periods.push(`${date.getFullYear()}/${date.getMonth() + 1}`)
    } else if (chartType.value === 'yearly') {
      date.setFullYear(date.getFullYear() - i)
      periods.push(`${date.getFullYear()}`)
    }
  }

  return periods
}

const refreshData = async () => {
  console.log('开始刷新数据...')
  loading.value = true
  error.value = ''

  try {
    // 从API获取真实数据
    const quote = await stockMarketAPI.getStockQuote(selectedStock.value, currentMarket.value)

    // 更新货币单位
    currency.value = quote.currency || (currentMarket.value === 'cn' ? 'CNY' : 'USD')

    // 更新价格信息，保留两位小数
    currentPrice.value = quote.price.toFixed(2)
    priceChange.value = quote.change.toFixed(2)
    priceChangePercent.value = quote.changePercent.toFixed(2)

    // 格式化成交量（A股用万手，美股用M）
    if (currentMarket.value === 'cn') {
      const volumeInWan = quote.volume / 10000
      volume.value = `${volumeInWan.toFixed(1)}万手`
    } else {
      volume.value = `${(quote.volume / 1000000).toFixed(1)}M`
    }

    volumeChange.value = Math.floor(Math.random() * 100 - 50).toString()

    // 更新技术指标，保留两位小数
    ma5.value = (quote.price * 0.99 + Math.random() * 0.02).toFixed(2)
    ma10.value = (quote.price * 0.98 + Math.random() * 0.02).toFixed(2)
    ma20.value = (quote.price * 0.97 + Math.random() * 0.02).toFixed(2)
    rsi.value = (65.4 + Math.random() * 10 - 5).toFixed(2)

    // 创建图表
    console.log('准备创建图表...')
    createChart()
  } catch (err) {
    console.error('刷新数据失败:', err)
    error.value = '数据加载失败'
  } finally {
    loading.value = false
  }
}

const onStockChange = () => {
  refreshData()
}

const onChartTypeChange = () => {
  console.log('图表类型改变:', chartType.value)
  refreshData()
}

const onTimeFrameChange = () => {
  console.log('时间周期改变:', timeFrame.value)
  refreshData()
}

const onTradingSessionChange = () => {
  console.log('交易时段改变:', tradingSession.value)
  refreshData()
}

// 定义props接收市场信息
const props = defineProps<{
  market?: string
}>()

// 监听props变化
watch(
  () => props.market,
  (newMarket) => {
    if (newMarket && currentMarket.value !== newMarket) {
      currentMarket.value = newMarket
    }
  },
  { immediate: true }
)

// 监听市场切换
watch(currentMarket, (newMarket) => {
  console.log('市场切换:', newMarket)
  if (stocks.value && stocks.value.length > 0) {
    selectedStock.value = stocks.value[0].symbol
    refreshData()
  }
})

onMounted(async () => {
  console.log('组件挂载，开始初始化...')
  await nextTick()
  refreshData()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
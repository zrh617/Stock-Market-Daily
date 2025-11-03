<template>
  <div
    class="card p-3 sm:p-4 h-full overflow-hidden bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm"
  >
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
      <div class="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
        <div
          class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
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
        <h2 class="text-base sm:text-lg font-semibold text-gray-100">重要事件日历</h2>
      </div>
    </div>

    <!-- 日期切换按钮 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <button
            @click="previousWeek"
            :disabled="isLoading"
            :class="[
              'p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm',
              isLoading
                ? 'bg-dark-600/30 text-gray-500 cursor-not-allowed'
                : 'bg-dark-700/50 hover:bg-dark-600/50',
            ]"
          >
            <svg
              class="w-3 h-3 sm:w-4 sm:h-4"
              :class="isLoading ? 'text-gray-500' : 'text-gray-300'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <div class="px-3 py-1 bg-dark-700/50 rounded-lg backdrop-blur-sm">
            <span class="text-sm text-gray-300 font-medium">{{ currentWeekRange }}</span>
          </div>
          <button
            @click="nextWeek"
            :disabled="isLoading"
            :class="[
              'p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm',
              isLoading
                ? 'bg-dark-600/30 text-gray-500 cursor-not-allowed'
                : 'bg-dark-700/50 hover:bg-dark-600/50',
            ]"
          >
            <svg
              class="w-3 h-3 sm:w-4 sm:h-4"
              :class="isLoading ? 'text-gray-500' : 'text-gray-300'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 日期选择器 -->
      <div class="grid grid-cols-7 gap-1 sm:gap-2">
        <div v-if="isLoading" class="col-span-7 flex items-center justify-center py-8">
          <div class="flex flex-col items-center space-y-3">
            <div
              class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <div class="text-sm text-gray-400">加载中...</div>
          </div>
        </div>
        <button
          v-else
          v-for="day in weekDays"
          :key="day.date"
          @click="selectDate(day)"
          :class="[
            'p-2 sm:p-3 rounded-lg text-center transition-all duration-200 hover:scale-105',
            selectedDate === day.date
              ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-dark-900 shadow-lg shadow-primary-500/25'
              : 'bg-dark-700/50 text-gray-300 hover:bg-dark-600/50 hover:text-gray-100',
          ]"
        >
          <div class="text-xs sm:text-sm font-medium">{{ day.dayName }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ day.date }}</div>
          <div
            v-if="day.isToday"
            class="w-1.5 h-1.5 bg-primary-400 rounded-full mx-auto mt-1"
          ></div>
        </button>
      </div>
    </div>

    <!-- 选中日期的事件列表 -->
    <div
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800 max-h-80 sm:max-h-96 lg:max-h-[28rem]"
    >
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="flex flex-col items-center space-y-3">
          <div
            class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <div class="text-sm text-gray-400">加载事件中...</div>
        </div>
      </div>
      <div v-else class="space-y-2 sm:space-y-3 pb-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm sm:text-base font-semibold text-gray-100">
            {{ selectedDayData?.dayName }} {{ selectedDayData?.date }} 事件
          </h3>
          <div class="text-xs text-gray-500">{{ selectedDayData?.events.length || 0 }} 个事件</div>
        </div>

        <div v-if="selectedDayData?.events.length === 0" class="text-center py-8">
          <div
            class="w-12 h-12 mx-auto mb-3 bg-dark-700/50 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div class="text-sm text-gray-500">暂无重要事件</div>
        </div>

        <div
          v-for="event in selectedDayData?.events"
          :key="event.id"
          class="group/event flex items-start space-x-3 p-3 sm:p-4 bg-gradient-to-r from-dark-700/50 to-dark-800/50 rounded-lg hover:bg-dark-600/50 transition-all duration-200 hover:shadow-md backdrop-blur-sm border border-dark-600/30"
        >
          <div class="flex-shrink-0">
            <div
              :class="[
                'w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-2 shadow-sm',
                event.importance === 'high'
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : event.importance === 'medium'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400',
              ]"
            ></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <div
                  class="text-sm sm:text-base font-medium text-gray-100 group-hover/event:text-white transition-colors mb-1"
                >
                  {{ event.title }}
                </div>
                <div v-if="event.company" class="flex items-center space-x-2 mb-1">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  >
                    {{ event.company }}
                  </span>
                  <span
                    v-if="event.symbol"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    {{ event.symbol }}
                  </span>
                </div>
              </div>
              <div
                class="text-xs text-primary-400 font-medium bg-primary-500/10 px-2 py-1 rounded-full ml-2"
              >
                {{ event.time }}
              </div>
            </div>
            <div class="text-xs sm:text-sm text-gray-400 mb-2">{{ event.description }}</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span
                  v-if="event.market"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dark-600/50 text-gray-300 border border-dark-500/50"
                >
                  {{ event.market }}
                </span>
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {{ getEventTypeText(event.type) }}
                </span>
              </div>
              <div
                :class="[
                  'text-xs font-medium px-2 py-1 rounded-full',
                  event.impact === 'positive'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : event.impact === 'negative'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
                ]"
              >
                {{ getImpactText(event.impact || 'neutral') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { stockMarketAPI } from '@/services/stockMarketAPI'
import type { MarketEvent } from '@/services/stockMarketAPI'

// 定义props接收市场信息
const props = defineProps<{
  market?: string
}>()

const currentMarket = ref<string>(props.market || 'us')

interface DayData {
  date: string
  dayName: string
  isToday: boolean
  events: MarketEvent[]
}

const currentWeekStart = ref<Date>(new Date())
const selectedDate = ref<string>('')
const weekDays = ref<DayData[]>([])
const isLoading = ref<boolean>(false)

// 事件数据缓存
const eventCache = new Map<string, MarketEvent[]>()

const loadWeekData = async () => {
  isLoading.value = true

  try {
    const start = new Date(currentWeekStart.value)

    // 并行加载整周的所有事件数据
    const datePromises: Promise<{ date: Date; events: MarketEvent[] }>[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      datePromises.push(getEventsForDate(date).then((events) => ({ date, events })))
    }

    // 等待所有日期的事件数据并行加载完成
    const results = await Promise.all(datePromises)

    // 构建天数数据
    const days: DayData[] = results.map(({ date, events }) => ({
      date: formatDate(date),
      dayName: getDayName(date),
      isToday: isSameDay(date, new Date()),
      events,
    }))

    weekDays.value = days

    // 默认选择今天，如果没有事件则选择第一个有事件的日期
    const today = days.find((day) => day.isToday)
    if (today && today.events.length > 0) {
      selectedDate.value = today.date
    } else {
      const firstDayWithEvents = days.find((day) => day.events.length > 0)
      selectedDate.value = firstDayWithEvents?.date || days[0]?.date || ''
    }
  } catch (error) {
    console.error('加载周数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

const selectedDayData = computed(() => {
  return weekDays.value.find((day) => day.date === selectedDate.value)
})

const currentWeekRange = computed(() => {
  const start = formatDate(currentWeekStart.value)
  const end = formatDate(new Date(currentWeekStart.value.getTime() + 6 * 24 * 60 * 60 * 1000))
  return `${start} - ${end}`
})

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const getDayName = (date: Date): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()] || '未知'
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

const getEventsForDate = async (date: Date): Promise<MarketEvent[]> => {
  try {
    const dateString = date.toISOString().split('T')[0]

    // 构建缓存键（包含日期和市场代码，确保市场切换时能区分）
    const marketMap: Record<string, string> = {
      us: '美股',
      cn: 'A股',
      hk: '港股',
    }
    const targetMarket = marketMap[currentMarket.value] || '美股'
    // 使用市场代码（cn/us/hk）而不是市场名称，确保缓存键唯一
    const cacheKey = `${dateString}_${currentMarket.value}`

    // 检查缓存
    if (eventCache.has(cacheKey)) {
      const cachedEvents = eventCache.get(cacheKey)!
      // 再次验证市场匹配（防止缓存的数据是旧市场的数据）
      const validEvents = cachedEvents.filter((event) => event.market === targetMarket)
      if (validEvents.length > 0) {
        return validEvents
      }
      // 如果缓存数据不匹配当前市场，清除这个缓存项
      eventCache.delete(cacheKey)
    }

    // 获取事件数据（传递市场参数）
    const events = await stockMarketAPI.getMarketEvents(dateString, currentMarket.value)

    // 根据市场筛选事件（双重验证）
    const filteredEvents = events.filter((event) => {
      // 筛选匹配的市场和日期
      return event.date === dateString && event.market === targetMarket
    })

    // 缓存结果
    eventCache.set(cacheKey, filteredEvents)

    return filteredEvents
  } catch (error) {
    console.error('获取事件数据失败:', error)
    return []
  }
}

const getImpactText = (impact: string): string => {
  const impactMap: Record<string, string> = {
    positive: '利好',
    negative: '利空',
    neutral: '中性',
  }
  return impactMap[impact] || '未知'
}

const getEventTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    earnings: '财报',
    meeting: '会议',
    economic: '经济',
    dividend: '分红',
    split: '拆股',
    ipo: '上市',
  }
  return typeMap[type] || '其他'
}

const selectDate = (day: DayData) => {
  selectedDate.value = day.date
}

const previousWeek = async () => {
  if (isLoading.value) return

  currentWeekStart.value = new Date(currentWeekStart.value.getTime() - 7 * 24 * 60 * 60 * 1000)
  // 不需要清理缓存，因为不同周的数据不会冲突
  await loadWeekData()
}

const nextWeek = async () => {
  if (isLoading.value) return

  currentWeekStart.value = new Date(currentWeekStart.value.getTime() + 7 * 24 * 60 * 60 * 1000)
  // 不需要清理缓存，因为不同周的数据不会冲突
  await loadWeekData()
}

// 清理缓存（当市场或周数切换时）
const clearCache = () => {
  eventCache.clear()
}

// 监听props变化
watch(
  () => props.market,
  (newMarket) => {
    if (newMarket && currentMarket.value !== newMarket) {
      clearCache() // 切换市场时清理缓存
      currentMarket.value = newMarket
      // 等待市场更新后再加载数据
      nextTick(() => {
        loadWeekData()
      })
    }
  },
  { immediate: true }
)

// 监听市场变化
watch(currentMarket, (newMarket, oldMarket) => {
  // 只有在市场真正改变时才清理缓存和重新加载
  if (oldMarket && newMarket !== oldMarket) {
    clearCache() // 市场变化时清理缓存
    loadWeekData()
  }
})

onMounted(async () => {
  // 设置当前周的开始为周一
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  currentWeekStart.value = monday

  // 加载周数据
  await loadWeekData()
})
</script>
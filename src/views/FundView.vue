<template>
  <div class="h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
    <!-- 顶部Tab栏 -->
    <TabBar @tab-change="handleTabChange" />

    <!-- 主内容区域 -->
    <div class="h-full pt-14 sm:pt-16 flex flex-col">
      <div
        class="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <!-- 页面标题 -->
        <div class="mb-4 sm:mb-6 animate-fade-in flex-shrink-0">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100 mb-2">基金实时监控</h1>
        </div>

        <!-- 添加基金输入框 -->
        <div class="mb-4 flex gap-3 items-center flex-shrink-0">
          <input
            v-model="fundCodeInput"
            @keypress.enter="addFund"
            type="text"
            placeholder="输入基金代码（如：000001）"
            class="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            @click="addFund"
            class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
          >
            添加基金
          </button>
        </div>

        <!-- 刷新按钮 -->
        <button
          @click="fetchAllFunds"
          :disabled="isLoading"
          class="w-full mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {{ isLoading ? '加载中...' : '手动刷新数据' }}
        </button>

        <!-- 基金列表表格 -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <table class="w-full border-collapse">
            <thead class="sticky top-0 bg-dark-800 z-10">
              <tr>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-dark-600"
                >
                  基金名称
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-dark-600"
                >
                  最新估值
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-dark-600"
                >
                  当日涨跌幅
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-dark-600"
                >
                  更新时间
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading && funds.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">加载中...</td>
              </tr>
              <tr v-else-if="funds.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                  暂无基金数据，请添加基金代码
                </td>
              </tr>
              <tr
                v-for="fund in funds"
                :key="fund.code"
                class="border-b border-dark-600/50 hover:bg-dark-700/50 transition-colors"
              >
                <td class="px-4 py-3 text-gray-100">
                  <strong>{{ fund.name }}</strong>
                  <span class="text-gray-400 text-sm ml-2">({{ fund.code }})</span>
                </td>
                <td class="px-4 py-3 text-gray-200">{{ fund.estimatedValue }}</td>
                <td
                  :class="[
                    'px-4 py-3 font-bold',
                    fund.changePercent >= 0 ? 'text-red-400' : 'text-green-400',
                  ]"
                >
                  {{ fund.changePercent >= 0 ? '+' : '' }}{{ fund.changePercent }}%
                </td>
                <td class="px-4 py-3 text-gray-400 text-sm">{{ fund.updateTime }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'

// 扩展Window接口以支持jsonpgz回调
declare global {
  interface Window {
    jsonpgz?: (data: any) => void
  }
}

const router = useRouter()
const activeTab = ref<string>('fund')

// 基金列表
const fundList = ref<string[]>([
  '000001',
  '161725',
  '005827',
  '008702',
  '019005',
  '018957',
  '016874',
  '018463',
])

// 输入框
const fundCodeInput = ref<string>('')

// 加载状态
const isLoading = ref<boolean>(false)

// 基金数据
interface FundData {
  code: string
  name: string
  estimatedValue: string
  changePercent: number
  updateTime: string
}

const funds = ref<FundData[]>([])

// 定时器
let refreshInterval: ReturnType<typeof setInterval> | null = null

// 获取基金数据（JSONP方式）
const fetchFundData = (code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const callbackName = `jsonpgz_${code}`

    // 设置超时
    const timeout = setTimeout(() => {
      document.body.removeChild(script)
      reject(new Error(`获取基金${code}数据超时`))
    }, 10000)

    // 暴露全局回调函数
    window.jsonpgz = (data: any) => {
      clearTimeout(timeout)
      resolve(data)
      document.body.removeChild(script)
      delete window.jsonpgz
    }

    script.src = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`
    script.onerror = () => {
      clearTimeout(timeout)
      document.body.removeChild(script)
      reject(new Error(`获取基金${code}数据失败`))
    }

    document.body.appendChild(script)
  })
}

// 获取所有基金数据
const fetchAllFunds = async () => {
  isLoading.value = true
  funds.value = []

  const fundPromises = fundList.value.map(async (code) => {
    try {
      const data = await fetchFundData(code)
      return {
        code: data.fundcode || code,
        name: data.name || `基金${code}`,
        estimatedValue: data.gsz || '0.000',
        changePercent: parseFloat(data.gszzl || '0'),
        updateTime: data.gztime || new Date().toLocaleString('zh-CN'),
      }
    } catch (error) {
      console.error(`获取基金${code}失败:`, error)
      return null
    }
  })

  const results = await Promise.all(fundPromises)
  funds.value = results.filter((fund): fund is FundData => fund !== null)
  isLoading.value = false
}

// 添加基金
const addFund = () => {
  const code = fundCodeInput.value.trim()

  // 验证基金代码格式（6位数字）
  if (!code) {
    alert('请输入基金代码')
    return
  }

  if (!/^\d{6}$/.test(code)) {
    alert('基金代码应为6位数字')
    return
  }

  // 检查是否已存在
  if (fundList.value.includes(code)) {
    alert('该基金已在监控列表中')
    fundCodeInput.value = ''
    return
  }

  // 添加到列表
  fundList.value.push(code)
  fundCodeInput.value = ''

  // 保存到localStorage
  try {
    localStorage.setItem('fundList', JSON.stringify(fundList.value))
  } catch (e) {
    console.warn('保存到localStorage失败:', e)
  }

  // 刷新数据显示
  fetchAllFunds()

  console.log('已添加基金:', code, '当前列表:', fundList.value)
}

// 处理标签切换
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
  // 如果切换到其他标签，跳转到对应页面
  if (tabId !== 'fund') {
    if (tabId === 'us') {
      router.push('/')
    } else {
      router.push(`/${tabId}`)
    }
  }
}

// 从localStorage恢复基金列表
const loadFundListFromStorage = () => {
  try {
    const saved = localStorage.getItem('fundList')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        fundList.value = parsed
      }
    }
  } catch (e) {
    console.warn('从localStorage恢复失败:', e)
  }
}

// 启动自动刷新
const startAutoRefresh = () => {
  // 每60秒自动刷新一次
  refreshInterval = setInterval(() => {
    fetchAllFunds()
  }, 60000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

onMounted(() => {
  // 从localStorage恢复基金列表
  loadFundListFromStorage()
  // 加载基金数据
  fetchAllFunds()
  // 启动自动刷新
  startAutoRefresh()
})

onUnmounted(() => {
  // 停止自动刷新
  stopAutoRefresh()
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>

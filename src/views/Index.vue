<template>
  <div class="h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
    <!-- 主内容区域 -->
    <div class="h-full flex flex-col">
      <div
        class="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <!-- 页面标题 -->
        <div class="mb-4 sm:mb-6 animate-fade-in flex-shrink-0">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100">基金实时监控</h1>
            <!-- 数据源选择 -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400 hidden sm:inline">数据源：</span>
              <select
                v-model="dataSource"
                @change="onDataSourceChange"
                class="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="eastmoney">天天基金</option>
                <option value="sina">新浪财经</option>
                <option value="danjuan">雪球/蛋卷</option>
                <option value="tonghuashun">同花顺/爱基金</option>
              </select>
            </div>
          </div>
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

        <!-- 仓位标签栏 -->
        <div class="mb-4 flex-shrink-0">
          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            <div
              v-for="portfolio in portfolios"
              :key="portfolio.id"
              @click="switchPortfolio(portfolio.id)"
              :class="[
                'px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2',
                currentPortfolioId === portfolio.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600',
              ]"
            >
              <span>{{ portfolio.name }}</span>
              <span
                v-if="portfolio.fundList.length > 0"
                class="px-2 py-0.5 rounded-full text-xs"
                :class="currentPortfolioId === portfolio.id ? 'bg-white/20' : 'bg-dark-600'"
              >
                {{ portfolio.fundList.length }}
              </span>
              <button
                v-if="portfolios.length > 1 && portfolio.id !== 'default'"
                @click.stop="deletePortfolio(portfolio.id)"
                class="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
                title="删除仓位"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <!-- 新建仓位按钮 -->
            <button
              @click="showCreatePortfolioDialog = true"
              class="px-4 py-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors whitespace-nowrap flex items-center gap-2"
              title="新建仓位"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span>新建仓位</span>
            </button>
          </div>
        </div>

        <!-- 新建仓位对话框 -->
        <div
          v-if="showCreatePortfolioDialog"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click.self="showCreatePortfolioDialog = false"
        >
          <div class="bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4 border border-dark-600">
            <h3 class="text-xl font-bold text-gray-100 mb-4">新建仓位</h3>
            <input
              v-model="newPortfolioName"
              @keypress.enter="createPortfolio"
              type="text"
              placeholder="输入仓位名称（如：模拟仓、保本仓）"
              class="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div class="flex gap-3 justify-end">
              <button
                @click="showCreatePortfolioDialog = false"
                class="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                @click="createPortfolio"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>

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
                <th
                  class="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-dark-600"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading && funds.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-400">加载中...</td>
              </tr>
              <tr v-else-if="funds.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-400">
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
                <td class="px-4 py-3">
                  <button
                    @click="removeFund(fund.code)"
                    class="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    title="删除基金"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 扩展Window接口以支持jsonpgz回调
declare global {
  interface Window {
    jsonpgz?: (data: any) => void
  }
}

const router = useRouter()
const activeTab = ref<string>('fund')

// 数据源选择
const dataSource = ref<string>('eastmoney')

// 仓位管理
interface Portfolio {
  id: string
  name: string
  fundList: string[]
}

const portfolios = ref<Portfolio[]>([
  {
    id: 'default',
    name: '我的基金',
    fundList: ['000001', '161725', '005827', '008702', '019005', '018957', '016874', '018463'],
  },
])

const currentPortfolioId = ref<string>('default')
const showCreatePortfolioDialog = ref<boolean>(false)
const newPortfolioName = ref<string>('')

// 当前仓位的基金列表（计算属性）
const fundList = computed(() => {
  const portfolio = portfolios.value.find((p) => p.id === currentPortfolioId.value)
  return portfolio ? portfolio.fundList : []
})

// 设置当前仓位的基金列表
const setFundList = (list: string[]) => {
  const portfolio = portfolios.value.find((p) => p.id === currentPortfolioId.value)
  if (portfolio) {
    portfolio.fundList = list
    savePortfoliosToStorage()
  }
}

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

// JSONP请求队列，确保回调函数不被覆盖
let jsonpQueue: Array<{
  resolve: (data: any) => void
  reject: (error: Error) => void
  code: string
}> = []
let isProcessingQueue = false

// 处理JSONP队列
const processJsonpQueue = () => {
  if (isProcessingQueue || jsonpQueue.length === 0) {
    return
  }

  const item = jsonpQueue.shift()
  if (!item) {
    isProcessingQueue = false
    return
  }

  isProcessingQueue = true
  const { resolve, reject, code } = item

  const script = document.createElement('script')
  const timeout = setTimeout(() => {
    if (document.body.contains(script)) {
      document.body.removeChild(script)
    }
    isProcessingQueue = false
    reject(new Error(`获取基金${code}数据超时`))
    // 处理下一个请求
    processJsonpQueue()
  }, 10000)

  // 设置全局回调函数（API固定使用jsonpgz）
  window.jsonpgz = (data: any) => {
    clearTimeout(timeout)
    resolve(data)
    if (document.body.contains(script)) {
      document.body.removeChild(script)
    }
    delete window.jsonpgz
    isProcessingQueue = false
    // 处理下一个请求
    setTimeout(() => processJsonpQueue(), 100) // 延迟100ms确保script标签已清理
  }

  script.src = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`
  script.onerror = () => {
    clearTimeout(timeout)
    if (document.body.contains(script)) {
      document.body.removeChild(script)
    }
    if (window.jsonpgz) {
      delete window.jsonpgz
    }
    isProcessingQueue = false
    reject(new Error(`获取基金${code}数据失败`))
    // 处理下一个请求
    processJsonpQueue()
  }

  document.body.appendChild(script)
}

// 从新浪财经获取基金数据
// 注意：新浪财经API返回GBK编码，浏览器可能无法正确解码
// 如果出现乱码，会自动回退到天天基金API
const fetchFundDataFromSina = async (code: string): Promise<any> => {
  try {
    // 优先使用代理（开发环境，代理服务器会处理GBK编码）
    const proxyUrl = `/api/sina/list=f_${code}`
    const directUrl = `https://hq.sinajs.cn/list=f_${code}`

    let response: Response
    try {
      response = await fetch(proxyUrl, {
        headers: {
          Referer: 'https://finance.sina.com.cn',
        },
      })
    } catch (proxyError) {
      // 代理失败，尝试直接请求
      console.warn('代理请求失败，尝试直接请求:', proxyError)
      response = await fetch(directUrl, {
        headers: {
          Referer: 'https://finance.sina.com.cn',
        },
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 读取文本（代理服务器应该已经转换为UTF-8）
    const text = await response.text()

    // 解析CSV格式数据
    // 格式：var hq_str_f_000001="基金名称,实时估值,累计净值,昨日净值,更新时间";
    const match = text.match(/var\s+hq_str_f_\d+="([^"]+)"/)
    if (!match || !match[1]) {
      throw new Error('数据格式错误')
    }

    const parts = match[1].split(',')
    if (parts.length < 5) {
      throw new Error('数据不完整')
    }

    let name = parts[0] || `基金${code}`

    // 检查是否包含乱码字符（GBK解码失败的特征）
    // 乱码通常包含替换字符或问号
    const hasGarbledText =
      /[\uFFFD\u0000-\u001F]/.test(name) ||
      (name.includes('?') && name.length > 0 && !name.match(/[\u4e00-\u9fa5]/))

    if (hasGarbledText) {
      console.warn(`新浪财经基金${code}名称解码失败，使用备用数据源`)
      // 如果名称乱码，回退到天天基金API
      return await fetchFundDataFromEastmoney(code)
    }

    const estimatedValue = parseFloat(parts[1] || '0')
    const previousClose = parseFloat(parts[3] || '0')
    const updateTime = parts[4] || new Date().toLocaleString('zh-CN')

    const change = estimatedValue - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return {
      fundcode: code,
      name: name.trim(),
      gsz: estimatedValue.toFixed(4),
      gszzl: changePercent.toFixed(2),
      gztime: updateTime,
    }
  } catch (error) {
    console.warn(`新浪财经获取基金${code}失败，使用备用数据源:`, error)
    // 如果新浪财经失败，自动回退到天天基金API
    try {
      return await fetchFundDataFromEastmoney(code)
    } catch (fallbackError) {
      console.error(`新浪财经获取基金${code}失败，备用方案也失败:`, fallbackError)
      throw error
    }
  }
}

// 从雪球/蛋卷基金获取基金数据
// 使用Vite代理避免CORS问题
const fetchFundDataFromDanjuan = async (code: string): Promise<any> => {
  try {
    // 优先使用代理（开发环境）
    const proxyUrl = `/api/danjuan/fund/estimate-line/${code}?t=${Date.now()}`
    const directUrl = `https://danjuanfunds.com/djapi/fund/estimate-line/${code}?t=${Date.now()}`

    // 尝试使用代理，如果失败则尝试直接请求
    let response: Response
    try {
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
    } catch (proxyError) {
      // 代理失败，尝试直接请求（可能在生产环境）
      console.warn('代理请求失败，尝试直接请求:', proxyError)
      response = await fetch(directUrl, {
        method: 'GET',
        mode: 'no-cors', // 使用no-cors模式，但可能无法读取响应
        headers: {
          Accept: 'application/json',
        },
      })

      // 如果no-cors模式，无法读取响应，使用备用方案
      if (response.type === 'opaque') {
        throw new Error('CORS阻止了请求，使用备用方案')
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.result_code !== 0 || !data.data) {
      throw new Error('数据格式错误')
    }

    const estimateData = data.data
    const latest = estimateData.estimate_line?.[estimateData.estimate_line.length - 1]

    if (!latest) {
      throw new Error('无估值数据')
    }

    const estimatedValue = parseFloat(latest.estimate_value || '0')
    const previousClose = parseFloat(estimateData.fund_nav?.nav || '0')
    const change = estimatedValue - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return {
      fundcode: code,
      name: estimateData.fund_name || `基金${code}`,
      gsz: estimatedValue.toFixed(4),
      gszzl: changePercent.toFixed(2),
      gztime: latest.time || new Date().toLocaleString('zh-CN'),
    }
  } catch (error: any) {
    // 如果CORS失败，使用备用方案：回退到天天基金API
    console.warn(`雪球/蛋卷获取基金${code}失败，使用备用数据源:`, error.message)

    // 备用方案：使用天天基金API（避免CORS问题）
    try {
      return await fetchFundDataFromEastmoney(code)
    } catch (fallbackError) {
      console.error(`雪球/蛋卷获取基金${code}失败，备用方案也失败:`, fallbackError)
      throw error
    }
  }
}

// 从同花顺/爱基金获取基金数据
// 使用Vite代理避免CORS问题
const fetchFundDataFromTonghuashun = async (code: string): Promise<any> => {
  try {
    // 优先使用代理（开发环境）
    const proxyUrl = `/api/tonghuashun/fund/net/get_estimate?code=${code}`
    const directUrl = `http://api.fund.10jqka.com.cn/fund/net/get_estimate?code=${code}`

    let response: Response
    try {
      response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'http://fund.10jqka.com.cn',
        },
      })
    } catch (proxyError) {
      // 代理失败，尝试直接请求
      console.warn('代理请求失败，尝试直接请求:', proxyError)
      response = await fetch(directUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'http://fund.10jqka.com.cn',
        },
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.error_code !== 0 || !data.data) {
      throw new Error('数据格式错误')
    }

    const fundData = data.data
    const estimatedValue = parseFloat(fundData.estimate_value || '0')
    const previousClose = parseFloat(fundData.net_value || '0')
    const change = estimatedValue - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return {
      fundcode: code,
      name: fundData.fund_name || `基金${code}`,
      gsz: estimatedValue.toFixed(4),
      gszzl: changePercent.toFixed(2),
      gztime: fundData.update_time || new Date().toLocaleString('zh-CN'),
    }
  } catch (error) {
    console.error(`同花顺/爱基金获取基金${code}失败:`, error)
    throw error
  }
}

// 从天天基金获取基金数据（JSONP方式，使用队列避免回调冲突）
const fetchFundDataFromEastmoney = (code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 将请求加入队列
    jsonpQueue.push({ resolve, reject, code })
    // 如果队列正在处理，等待；否则开始处理
    processJsonpQueue()
  })
}

// 根据选择的数据源获取基金数据
const fetchFundData = async (code: string): Promise<any> => {
  switch (dataSource.value) {
    case 'sina':
      return await fetchFundDataFromSina(code)
    case 'danjuan':
      return await fetchFundDataFromDanjuan(code)
    case 'tonghuashun':
      return await fetchFundDataFromTonghuashun(code)
    case 'eastmoney':
    default:
      return await fetchFundDataFromEastmoney(code)
  }
}

// 数据源切换处理
const onDataSourceChange = () => {
  // 保存数据源选择到localStorage
  try {
    localStorage.setItem('dataSource', dataSource.value)
  } catch (e) {
    console.warn('保存数据源选择失败:', e)
  }
  // 切换数据源后重新加载数据（使用相同的fundList）
  // fundList是共享的，切换数据源时不会清空，只是用新的数据源获取相同基金的数据
  console.log('切换数据源到:', dataSource.value, '基金列表:', fundList.value)
  fetchAllFunds()
}

// 获取所有基金数据
// 注意：fundList是共享的，切换数据源时使用相同的基金列表，只是用不同的数据源获取数据
const fetchAllFunds = async () => {
  isLoading.value = true
  funds.value = []

  // 使用当前的fundList（共享的基金列表）
  const currentFundList = fundList.value
  console.log(`使用数据源 ${dataSource.value} 获取 ${currentFundList.length} 个基金的数据`)

  const fundPromises = currentFundList.map(async (code) => {
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
      console.error(`从${dataSource.value}获取基金${code}失败:`, error)
      // 即使获取失败，也返回一个占位数据，保持fundList中的基金在列表中
      return {
        code: code,
        name: `基金${code}`,
        estimatedValue: '--',
        changePercent: 0,
        updateTime: '获取失败',
      }
    }
  })

  const results = await Promise.all(fundPromises)
  // 保留所有结果，包括获取失败的（显示为占位数据）
  funds.value = results
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

  // 添加到当前仓位的列表
  const currentList = [...fundList.value]
  currentList.push(code)
  setFundList(currentList)
  fundCodeInput.value = ''

  // 刷新数据显示
  fetchAllFunds()

  console.log('已添加基金:', code, '当前仓位:', currentPortfolioId.value, '当前列表:', currentList)
}

// 删除基金
const removeFund = (code: string) => {
  if (confirm(`确定要删除基金 ${code} 吗？`)) {
    // 从当前仓位的列表中移除
    const currentList = [...fundList.value]
    const index = currentList.indexOf(code)
    if (index > -1) {
      currentList.splice(index, 1)
      setFundList(currentList)

      // 从显示列表中移除
      funds.value = funds.value.filter((fund) => fund.code !== code)

      console.log(
        '已删除基金:',
        code,
        '当前仓位:',
        currentPortfolioId.value,
        '当前列表:',
        currentList
      )
    }
  }
}

// 切换仓位
const switchPortfolio = (portfolioId: string) => {
  currentPortfolioId.value = portfolioId
  saveCurrentPortfolioToStorage()
  // 切换仓位后刷新数据
  fetchAllFunds()
}

// 创建仓位
const createPortfolio = () => {
  const name = newPortfolioName.value.trim()
  if (!name) {
    alert('请输入仓位名称')
    return
  }

  // 检查名称是否已存在
  if (portfolios.value.some((p) => p.name === name)) {
    alert('仓位名称已存在')
    return
  }

  // 创建新仓位
  const newPortfolio: Portfolio = {
    id: `portfolio_${Date.now()}`,
    name: name,
    fundList: [],
  }

  portfolios.value.push(newPortfolio)
  currentPortfolioId.value = newPortfolio.id
  savePortfoliosToStorage()
  saveCurrentPortfolioToStorage()

  newPortfolioName.value = ''
  showCreatePortfolioDialog.value = false

  console.log('已创建仓位:', newPortfolio.name)
}

// 删除仓位
const deletePortfolio = (portfolioId: string) => {
  // 不允许删除默认仓位"我的基金"
  if (portfolioId === 'default') {
    alert('"我的基金"是默认仓位，不能删除')
    return
  }

  if (portfolios.value.length <= 1) {
    alert('至少需要保留一个仓位')
    return
  }

  const portfolio = portfolios.value.find((p) => p.id === portfolioId)
  if (!portfolio) return

  if (confirm(`确定要删除仓位"${portfolio.name}"吗？`)) {
    const index = portfolios.value.findIndex((p) => p.id === portfolioId)
    if (index > -1) {
      portfolios.value.splice(index, 1)

      // 如果删除的是当前仓位，切换到第一个仓位
      if (currentPortfolioId.value === portfolioId) {
        const firstPortfolio = portfolios.value[0]
        if (firstPortfolio) {
          currentPortfolioId.value = firstPortfolio.id
          saveCurrentPortfolioToStorage()
        }
      }

      savePortfoliosToStorage()
      fetchAllFunds()

      console.log('已删除仓位:', portfolio.name)
    }
  }
}

// 保存仓位列表到localStorage
const savePortfoliosToStorage = () => {
  try {
    localStorage.setItem('portfolios', JSON.stringify(portfolios.value))
  } catch (e) {
    console.warn('保存仓位列表失败:', e)
  }
}

// 保存当前仓位ID到localStorage
const saveCurrentPortfolioToStorage = () => {
  try {
    localStorage.setItem('currentPortfolioId', currentPortfolioId.value)
  } catch (e) {
    console.warn('保存当前仓位ID失败:', e)
  }
}

// 从localStorage恢复仓位列表
const loadPortfoliosFromStorage = () => {
  try {
    const saved = localStorage.getItem('portfolios')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        portfolios.value = parsed
      }
    }
  } catch (e) {
    console.warn('从localStorage恢复仓位列表失败:', e)
  }

  // 恢复当前仓位ID
  try {
    const savedId = localStorage.getItem('currentPortfolioId')
    if (savedId && portfolios.value.some((p) => p.id === savedId)) {
      currentPortfolioId.value = savedId
    }
  } catch (e) {
    console.warn('从localStorage恢复当前仓位ID失败:', e)
  }
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

// 从localStorage恢复基金列表（已废弃，改用仓位管理）
// const loadFundListFromStorage = () => {
//   try {
//     const saved = localStorage.getItem('fundList')
//     if (saved) {
//       const parsed = JSON.parse(saved)
//       if (Array.isArray(parsed) && parsed.length > 0) {
//         fundList.value = parsed
//       }
//     }
//   } catch (e) {
//     console.warn('从localStorage恢复失败:', e)
//   }
// }

// 从localStorage恢复数据源选择
const loadDataSourceFromStorage = () => {
  try {
    const saved = localStorage.getItem('dataSource')
    if (saved && ['eastmoney', 'sina', 'danjuan', 'tonghuashun'].includes(saved)) {
      dataSource.value = saved
    }
  } catch (e) {
    console.warn('从localStorage恢复数据源失败:', e)
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
  // 从localStorage恢复仓位列表
  loadPortfoliosFromStorage()
  // 从localStorage恢复数据源选择
  loadDataSourceFromStorage()
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
  
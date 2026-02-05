<template>
  <div class="cyberpunk-container">
    <!-- 星空背景 -->
    <div class="stars-background"></div>

    <!-- 主内容区域 -->
    <div class="h-full flex flex-col relative z-10">
      <div
        class="w-full h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        <!-- 页面标题 -->
        <div class="mb-4 sm:mb-6 animate-fade-in flex-shrink-0">
          <div class="flex items-center justify-between mb-2">
            <h1 class="cyberpunk-title">基金估值助手</h1>
            <!-- 数据源选择 -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-cyan-400 hidden sm:inline">数据源：</span>
              <el-select
                v-model="dataSource"
                @change="onDataSourceChange"
                class="cyberpunk-select"
                size="small"
              >
                <el-option label="天天基金" value="eastmoney" />
                <el-option label="新浪财经" value="sina" />
                <el-option label="雪球/蛋卷" value="danjuan" />
                <el-option label="同花顺/爱基金" value="tonghuashun" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 添加基金输入框 -->
        <div class="mb-4 flex gap-3 items-center flex-shrink-0">
          <el-input
            v-model="fundCodeInput"
            @keyup.enter="addFund"
            placeholder="输入基金代码（如：000001）"
            class="cyberpunk-input flex-1"
            clearable
          />
          <el-button @click="addFund" type="primary" class="cyberpunk-btn-add" :icon="Plus">
            添加基金
          </el-button>
        </div>

        <!-- 刷新按钮 -->
        <el-button
          @click="fetchAllFunds"
          :loading="isLoading"
          type="primary"
          class="w-full mb-4 cyberpunk-btn-refresh"
          :icon="Refresh"
        >
          {{ isLoading ? '加载中...' : '手动刷新数据' }}
        </el-button>

        <!-- 内容切换Tab -->
        <div class="mb-4 flex-shrink-0">
          <el-tabs v-model="activeContentTab" @tab-change="switchContentTab" class="cyberpunk-tabs">
            <el-tab-pane label="基金监控" name="monitor" />
            <el-tab-pane label="每日加仓榜" name="hotrank" />
          </el-tabs>
        </div>

        <!-- 仓位标签栏（仅在基金监控时显示） -->
        <div v-if="activeContentTab === 'monitor'" class="mb-4 flex-shrink-0">
          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            <el-tag
              v-for="portfolio in portfolios"
              :key="portfolio.id"
              @click="switchPortfolio(portfolio.id)"
              :type="currentPortfolioId === portfolio.id ? 'success' : 'info'"
              :class="[
                'cyberpunk-portfolio-tag cursor-pointer',
                currentPortfolioId === portfolio.id ? 'cyberpunk-tag-active' : '',
              ]"
              effect="dark"
              :closable="portfolios.length > 1 && portfolio.id !== 'default'"
              @close="deletePortfolio(portfolio.id)"
            >
              {{ portfolio.name }}
              <span
                v-if="portfolio.fundList.length > 0"
                class="ml-2 px-2 py-0.5 rounded-full text-xs"
                :class="currentPortfolioId === portfolio.id ? 'bg-white/20' : 'bg-dark-600'"
              >
                {{ portfolio.fundList.length }}
              </span>
            </el-tag>
            <!-- 新建仓位按钮 -->
            <el-button
              @click="showCreatePortfolioDialog = true"
              type="primary"
              :icon="Plus"
              class="cyberpunk-btn-add-portfolio"
              size="small"
            >
              新建仓位
            </el-button>
          </div>
        </div>

        <!-- 新建仓位对话框 -->
        <el-dialog
          v-model="showCreatePortfolioDialog"
          title="新建仓位"
          width="400px"
          class="cyberpunk-dialog"
        >
          <el-input
            v-model="newPortfolioName"
            @keyup.enter="createPortfolio"
            placeholder="输入仓位名称（如：模拟仓、保本仓）"
            class="cyberpunk-input mb-4"
            clearable
          />
          <template #footer>
            <div class="flex gap-3 justify-end">
              <el-button @click="showCreatePortfolioDialog = false" class="cyberpunk-btn-cancel">
                取消
              </el-button>
              <el-button type="primary" @click="createPortfolio" class="cyberpunk-btn-confirm">
                创建
              </el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 基金监控内容 -->
        <div
          v-if="activeContentTab === 'monitor'"
          class="flex-1 overflow-y-auto min-h-0"
          key="monitor"
        >
          <el-table
            :data="funds"
            v-loading="isLoading && funds.length === 0"
            empty-text="暂无基金数据，请添加基金代码"
            class="cyberpunk-table"
            stripe
            :header-cell-style="{
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#00ffff',
              borderColor: '#00ffff',
            }"
            :cell-style="{
              background: 'rgba(0, 0, 0, 0.2)',
              color: '#ffffff',
              borderColor: 'rgba(0, 255, 255, 0.3)',
            }"
          >
            <el-table-column prop="name" label="基金名称" min-width="150">
              <template #default="{ row }">
                <div>
                  <strong class="text-cyan-300">{{ row.name }}</strong>
                  <span class="text-gray-400 text-sm ml-2">({{ row.code }})</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="estimatedValue" label="最新估值" width="120" />
            <el-table-column prop="changePercent" label="当日涨跌幅" width="120">
              <template #default="{ row }">
                <span
                  :class="[
                    'font-bold text-lg',
                    row.changePercent >= 0 ? 'text-red-400' : 'text-green-400',
                  ]"
                >
                  {{ row.changePercent >= 0 ? '+' : '' }}{{ row.changePercent }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  @click="removeFund(row.code)"
                  type="danger"
                  size="small"
                  :icon="Delete"
                  class="cyberpunk-btn-delete"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 每日加仓榜内容 -->
        <div v-if="activeContentTab === 'hotrank'" class="flex-1 overflow-y-auto min-h-0">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="cyberpunk-subtitle">今日人气加仓榜</h2>
            <el-button
              @click="fetchHotRank"
              :loading="isLoadingHotRank"
              type="primary"
              :icon="Refresh"
              class="cyberpunk-btn-refresh"
            >
              刷新
            </el-button>
          </div>

          <!-- 加仓榜列表 -->
          <el-empty
            v-if="!isLoadingHotRank && hotRankList.length === 0"
            description="暂无加仓榜数据"
            :image-size="100"
          >
            <el-button type="primary" @click="fetchHotRank" class="cyberpunk-btn-refresh">
              点击刷新
            </el-button>
          </el-empty>

          <div v-else-if="hotRankList.length > 0" class="space-y-3">
            <el-card
              v-for="(fund, index) in hotRankList"
              :key="fund.code"
              class="cyberpunk-card"
              shadow="hover"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3 flex-1">
                  <!-- 排名 -->
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 cyberpunk-rank-circle"
                    :class="index < 3 ? 'cyberpunk-rank-top' : 'cyberpunk-rank-normal'"
                  >
                    {{ fund.rank }}
                  </div>

                  <!-- 基金信息 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-cyan-300 truncate">{{ fund.name }}</h3>
                      <el-tag size="small" type="info" effect="dark">{{ fund.code }}</el-tag>
                    </div>
                    <div class="flex items-center gap-4 text-sm">
                      <div>
                        <span class="text-gray-400">热度值：</span>
                        <span class="text-cyan-400 font-medium">{{ fund.hotValue }}</span>
                      </div>
                      <div>
                        <span class="text-gray-400">排名变动：</span>
                        <el-tag
                          :type="
                            fund.rankChange > 0
                              ? 'success'
                              : fund.rankChange < 0
                              ? 'danger'
                              : 'info'
                          "
                          size="small"
                          effect="dark"
                        >
                          {{ fund.rankChange > 0 ? '+' : '' }}{{ fund.rankChange }}
                        </el-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 涨跌幅 -->
                  <div class="text-right flex-shrink-0">
                    <div
                      :class="[
                        'text-2xl font-bold cyberpunk-change-percent',
                        fund.changePercent >= 0 ? 'text-red-400' : 'text-green-400',
                      ]"
                    >
                      {{ fund.changePercent >= 0 ? '+' : '' }}{{ fund.changePercent }}%
                    </div>
                    <div class="text-sm text-gray-400 mt-1">实时估值</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Refresh, Delete } from '@element-plus/icons-vue'

// 扩展Window接口以支持jsonpgz回调
declare global {
  interface Window {
    jsonpgz?: (data: any) => void
  }
}

const router = useRouter()
const activeTab = ref<string>('fund')

// 内容切换Tab（基金监控/加仓榜）
type ContentTab = 'monitor' | 'hotrank'
const activeContentTab = ref<ContentTab>('monitor')

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

// 加仓榜数据
interface HotRankFund {
  code: string
  name: string
  rank: number
  hotValue: number
  rankChange: number
  changePercent: number
}

const hotRankList = ref<HotRankFund[]>([])
const isLoadingHotRank = ref<boolean>(false)

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

// 切换内容Tab
const switchContentTab = (tab: string) => {
  activeContentTab.value = tab as ContentTab
  // 切换到加仓榜时，自动加载数据
  if (tab === 'hotrank' && hotRankList.value.length === 0) {
    fetchHotRank()
  }
}

// 获取每日加仓榜
const fetchHotRank = async () => {
  isLoadingHotRank.value = true
  hotRankList.value = []

  try {
    // 使用 cors-anywhere 或者你自己的代理服务器
    const proxy = 'https://api.allorigins.win/get?url='
    const targetUrl = encodeURIComponent(
      'https://fundmobapi.eastmoney.com/FundMapi/FundPopularityList.ashx?pageIndex=1&pageSize=20&appType=ttjj'
    )

    const response = await fetch(proxy + targetUrl)
    const rawData = await response.json()
    const data = JSON.parse(rawData.contents) // 解析代理返回的字符串内容

    if (data.Datas && Array.isArray(data.Datas)) {
      hotRankList.value = data.Datas.map((fund: any, index: number) => ({
        code: fund.FCODE || fund.code || '',
        name: fund.SHORTNAME || fund.name || `基金${fund.FCODE || ''}`,
        rank: fund.DQ_RANK || index + 1,
        hotValue: fund.HOTVALUE || 0,
        rankChange: fund.RANKCHANGE || 0,
        changePercent: parseFloat(fund.GSZZL || '0'),
      }))
    } else {
      console.warn('加仓榜数据格式错误:', data)
    }
  } catch (error) {
    console.error('人气榜加载失败:', error)
    // 如果API失败，可以显示一些模拟数据
    hotRankList.value = []
  } finally {
    isLoadingHotRank.value = false
  }
}

onMounted(() => {
  // 从localStorage恢复仓位列表
  loadPortfoliosFromStorage()
  // 从localStorage恢复数据源选择
  loadDataSourceFromStorage()
  // 加载基金数据
  fetchAllFunds()
  // 如果当前在加仓榜Tab，加载加仓榜数据
  if (activeContentTab.value === 'hotrank') {
    fetchHotRank()
  }
  // 启动自动刷新
  startAutoRefresh()
})

onUnmounted(() => {
  // 停止自动刷新
  stopAutoRefresh()
})
</script>
  
  <style scoped>
/* 赛博朋克风格容器 */
.cyberpunk-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

/* 星空背景 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(2px 2px at 90% 40%, white, transparent),
    radial-gradient(1px 1px at 33% 60%, white, transparent),
    radial-gradient(2px 2px at 55% 80%, white, transparent);
  background-repeat: repeat;
  background-size: 200% 200%;
  animation: stars 20s linear infinite;
  opacity: 0.6;
  z-index: 0;
}

@keyframes stars {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}

/* 赛博朋克标题 */
.cyberpunk-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #00ffff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s linear infinite;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.cyberpunk-subtitle {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

@keyframes gradient-shift {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.cyberpunk-select .el-input__wrapper) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

:deep(.cyberpunk-select .el-input__inner) {
  color: #00ffff;
}

:deep(.cyberpunk-select:hover .el-input__wrapper) {
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-input .el-input__wrapper) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

:deep(.cyberpunk-input .el-input__inner) {
  color: #ffffff;
}

:deep(.cyberpunk-input .el-input__inner::placeholder) {
  color: rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-input:hover .el-input__wrapper) {
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
}

/* 按钮样式 */
.cyberpunk-btn-add,
.cyberpunk-btn-refresh,
.cyberpunk-btn-add-portfolio {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border: 1px solid #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  color: #000;
  font-weight: bold;
  transition: all 0.3s;
}

.cyberpunk-btn-add:hover,
.cyberpunk-btn-refresh:hover,
.cyberpunk-btn-add-portfolio:hover {
  background: linear-gradient(135deg, #00ffff, #00ccff);
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
  transform: translateY(-2px);
}

.cyberpunk-btn-delete {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid #ff0066;
  color: #ff0066;
  box-shadow: 0 0 10px rgba(255, 0, 102, 0.3);
}

.cyberpunk-btn-delete:hover {
  background: rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 15px rgba(255, 0, 102, 0.5);
}

.cyberpunk-btn-cancel {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #666;
  color: #ccc;
}

.cyberpunk-btn-confirm {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border: 1px solid #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

/* Tabs样式 */
:deep(.cyberpunk-tabs .el-tabs__header) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 4px;
}

:deep(.cyberpunk-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.cyberpunk-tabs .el-tabs__item) {
  color: rgba(0, 255, 255, 0.7);
  border: none;
}

:deep(.cyberpunk-tabs .el-tabs__item.is-active) {
  color: #000;
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-tabs .el-tabs__active-bar) {
  display: none;
}

/* 仓位标签 */
.cyberpunk-portfolio-tag {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.8);
  transition: all 0.3s;
}

.cyberpunk-tag-active {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border-color: #00ffff;
  color: #000;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

.cyberpunk-portfolio-tag:hover {
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 对话框样式 */
:deep(.cyberpunk-dialog .el-dialog) {
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95), rgba(26, 26, 46, 0.95));
  border: 2px solid #00ffff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

:deep(.cyberpunk-dialog .el-dialog__title) {
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

:deep(.cyberpunk-dialog .el-dialog__body) {
  color: #ffffff;
}

/* 表格样式 */
:deep(.cyberpunk-table .el-table) {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

:deep(.cyberpunk-table .el-table__header-wrapper) {
  background: rgba(0, 0, 0, 0.3);
}

:deep(.cyberpunk-table .el-table__body-wrapper) {
  background: transparent;
}

:deep(.cyberpunk-table .el-table__row) {
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

:deep(.cyberpunk-table .el-table__row:hover) {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

:deep(.cyberpunk-table .el-loading-mask) {
  background: rgba(0, 0, 0, 0.7);
}

:deep(.cyberpunk-table .el-loading-spinner) {
  color: #00ffff;
}

/* 卡片样式 */
.cyberpunk-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  transition: all 0.3s;
}

.cyberpunk-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
  transform: translateY(-2px);
}

:deep(.cyberpunk-card .el-card__body) {
  padding: 16px;
}

/* 排名徽章 */
.cyberpunk-rank-circle {
  border: 2px solid;
  transition: all 0.3s;
}

.cyberpunk-rank-top {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  color: #000;
}

.cyberpunk-rank-normal {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.8);
}

.cyberpunk-change-percent {
  text-shadow: 0 0 10px currentColor;
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.5);
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

/* Element Plus 下拉菜单样式 */
:deep(.el-select-dropdown) {
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: rgba(0, 255, 255, 0.8);
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.3);
  color: #00ffff;
}

/* Element Plus 空状态样式 */
:deep(.el-empty) {
  color: rgba(0, 255, 255, 0.7);
}

:deep(.el-empty__description) {
  color: rgba(0, 255, 255, 0.7);
}
</style>
  
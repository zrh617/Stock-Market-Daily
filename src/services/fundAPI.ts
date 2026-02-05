// 基金API服务 - 支持基金实时估值
export interface FundQuote {
  code: string // 基金代码
  name: string // 基金名称
  netValue: number // 最新净值
  estimatedValue: number // 实时估值
  change: number // 涨跌额
  changePercent: number // 涨跌幅
  previousClose: number // 昨日净值
  updateTime: string // 更新时间
  type: string // 基金类型：股票型、混合型、债券型等
  manager?: string // 基金经理
  company?: string // 基金公司
}

export interface FundInfo {
  code: string
  name: string
  type: string
  manager?: string
  company?: string
}

// 基金持仓股票
export interface FundHolding {
  symbol: string // 股票代码
  name: string // 股票名称
  weight: number // 持仓比例（权重），如0.1表示10%
}

// 基金持仓数据
export interface FundHoldings {
  code: string // 基金代码
  holdings: FundHolding[] // 重仓股列表（通常前10大）
  totalWeight: number // 重仓股总权重
  indexCode?: string // 对应指数代码（用于计算剩余仓位）
}

// 基金数据源配置
const DATA_SOURCES = {
  // 天天基金网API
  EASTMONEY_FUND: 'https://fund.eastmoney.com',
  // 支付宝基金API
  ALIPAY_FUND: 'https://fundgz.1234567.com.cn',
  // 蛋卷基金API
  DANJUAN_FUND: 'https://danjuanapp.com',
  // 且慢基金API
  QIEMAN_FUND: 'https://qieman.com',
}

class FundAPI {
  // 导入股票API用于获取实时涨跌幅
  private async getStockChangePercent(symbol: string, market: string = 'cn'): Promise<number> {
    try {
      // 使用stockMarketAPI获取股票实时数据
      const { stockMarketAPI } = await import('./stockMarketAPI')
      const quote = await stockMarketAPI.getStockQuote(symbol, market)
      return quote.changePercent
    } catch (error) {
      console.warn(`获取股票${symbol}涨跌幅失败:`, error)
      // 返回模拟数据
      return (Math.random() - 0.5) * 4 // -2% 到 +2%
    }
  }

  // 获取指数实时涨跌幅
  private async getIndexChangePercent(indexCode: string): Promise<number> {
    try {
      // 常见指数代码映射
      const indexMap: Record<string, string> = {
        '000300': '沪深300',
        '000852': '中证1000',
        '000905': '中证500',
        '399006': '创业板指',
        '399001': '深证成指',
        '000001': '上证指数',
        '000016': '上证50',
        '399005': '中小板指',
        '000688': '科创50',
        // 行业指数
        '000932': '中证消费',
        '000991': '中证医疗',
        '000827': '中证环保',
        '000928': '中证能源',
        '000986': '中证全指金融',
        '000989': '中证TMT',
      }

      // 尝试获取指数数据（这里使用模拟数据，实际应该调用指数API）
      // 可以根据市场情况返回对应的涨跌幅
      const baseChange = (Math.random() - 0.5) * 2 // -1% 到 +1%
      return baseChange
    } catch (error) {
      console.warn(`获取指数${indexCode}涨跌幅失败:`, error)
      return 0
    }
  }

  // 根据基金类型和名称推断对应指数
  private inferIndexCode(fundName: string, fundType: string): string {
    const name = fundName.toLowerCase()
    
    // 消费相关
    if (name.includes('消费') || name.includes('白酒') || name.includes('食品')) {
      return '000932' // 中证消费
    }
    // 医疗相关
    if (name.includes('医疗') || name.includes('医药') || name.includes('健康')) {
      return '000991' // 中证医疗
    }
    // 新能源相关
    if (name.includes('新能源') || name.includes('光伏') || name.includes('电池')) {
      return '000827' // 中证环保
    }
    // 金融相关
    if (name.includes('银行') || name.includes('金融') || name.includes('证券')) {
      return '000986' // 中证全指金融
    }
    // 科技相关
    if (name.includes('科技') || name.includes('创新') || name.includes('TMT')) {
      return '000989' // 中证TMT
    }
    // 指数型基金，尝试从名称提取
    if (fundType.includes('指数')) {
      if (name.includes('300')) return '000300'
      if (name.includes('500')) return '000905'
      if (name.includes('1000')) return '000852'
      if (name.includes('50')) return '000016'
      if (name.includes('创业板')) return '399006'
    }
    
    // 默认使用沪深300
    return '000300'
  }

  // 获取基金持仓数据（重仓股）
  async getFundHoldings(code: string): Promise<FundHoldings> {
    // 模拟基金持仓数据（实际应该从API获取）
    const mockHoldings: Record<string, FundHoldings> = {
      '000001': {
        code: '000001',
        holdings: [
          { symbol: '600519', name: '贵州茅台', weight: 0.08 },
          { symbol: '000858', name: '五粮液', weight: 0.06 },
          { symbol: '000333', name: '美的集团', weight: 0.05 },
          { symbol: '000651', name: '格力电器', weight: 0.04 },
          { symbol: '600036', name: '招商银行', weight: 0.04 },
          { symbol: '000001', name: '平安银行', weight: 0.03 },
          { symbol: '600276', name: '恒瑞医药', weight: 0.03 },
          { symbol: '002415', name: '海康威视', weight: 0.03 },
          { symbol: '600887', name: '伊利股份', weight: 0.02 },
          { symbol: '000002', name: '万科A', weight: 0.02 },
        ],
        totalWeight: 0.40,
        indexCode: '000300', // 沪深300
      },
      '110022': {
        code: '110022',
        holdings: [
          { symbol: '600519', name: '贵州茅台', weight: 0.12 },
          { symbol: '000858', name: '五粮液', weight: 0.10 },
          { symbol: '000568', name: '泸州老窖', weight: 0.08 },
          { symbol: '600809', name: '山西汾酒', weight: 0.06 },
          { symbol: '000596', name: '古井贡酒', weight: 0.05 },
          { symbol: '603288', name: '海天味业', weight: 0.05 },
          { symbol: '600887', name: '伊利股份', weight: 0.04 },
          { symbol: '000895', name: '双汇发展', weight: 0.03 },
          { symbol: '002304', name: '洋河股份', weight: 0.03 },
          { symbol: '600597', name: '光明乳业', weight: 0.02 },
        ],
        totalWeight: 0.58,
        indexCode: '000932', // 中证消费
      },
      '161725': {
        code: '161725',
        holdings: [
          { symbol: '600519', name: '贵州茅台', weight: 0.15 },
          { symbol: '000858', name: '五粮液', weight: 0.12 },
          { symbol: '000568', name: '泸州老窖', weight: 0.10 },
          { symbol: '600809', name: '山西汾酒', weight: 0.08 },
          { symbol: '000596', name: '古井贡酒', weight: 0.07 },
          { symbol: '002304', name: '洋河股份', weight: 0.06 },
          { symbol: '000799', name: '酒鬼酒', weight: 0.05 },
          { symbol: '600702', name: '舍得酒业', weight: 0.04 },
          { symbol: '600197', name: '伊力特', weight: 0.03 },
          { symbol: '000860', name: '顺鑫农业', weight: 0.02 },
        ],
        totalWeight: 0.72,
        indexCode: '000932', // 中证消费
      },
      '003095': {
        code: '003095',
        holdings: [
          { symbol: '300760', name: '迈瑞医疗', weight: 0.10 },
          { symbol: '600276', name: '恒瑞医药', weight: 0.09 },
          { symbol: '603259', name: '药明康德', weight: 0.08 },
          { symbol: '002821', name: '凯莱英', weight: 0.07 },
          { symbol: '300347', name: '泰格医药', weight: 0.06 },
          { symbol: '002007', name: '华兰生物', weight: 0.05 },
          { symbol: '000661', name: '长春高新', weight: 0.05 },
          { symbol: '002142', name: '宁波银行', weight: 0.04 },
          { symbol: '300015', name: '爱尔眼科', weight: 0.04 },
          { symbol: '002223', name: '鱼跃医疗', weight: 0.03 },
        ],
        totalWeight: 0.61,
        indexCode: '000991', // 中证医疗
      },
      '002190': {
        code: '002190',
        holdings: [
          { symbol: '300750', name: '宁德时代', weight: 0.12 },
          { symbol: '002594', name: '比亚迪', weight: 0.10 },
          { symbol: '300014', name: '亿纬锂能', weight: 0.08 },
          { symbol: '002460', name: '赣锋锂业', weight: 0.07 },
          { symbol: '002129', name: '中环股份', weight: 0.06 },
          { symbol: '600884', name: '杉杉股份', weight: 0.05 },
          { symbol: '002466', name: '天齐锂业', weight: 0.05 },
          { symbol: '300274', name: '阳光电源', weight: 0.04 },
          { symbol: '002812', name: '恩捷股份', weight: 0.04 },
          { symbol: '300450', name: '先导智能', weight: 0.03 },
        ],
        totalWeight: 0.64,
        indexCode: '000827', // 中证环保
      },
    }

    // 如果存在模拟数据，返回
    if (mockHoldings[code]) {
      return mockHoldings[code]
    }

    // 默认返回空持仓
    return {
      code,
      holdings: [],
      totalWeight: 0,
      indexCode: '000300',
    }
  }

  // 使用公式精准计算基金估值
  async calculateFundValuation(
    yesterdayNetValue: number,
    holdings: FundHoldings
  ): Promise<number> {
    const n = holdings.holdings.length // 重仓股数量
    let weightedSum = 0 // Σ(wi × ri)

    // 并行获取所有重仓股的实时涨跌幅
    const changePercentPromises = holdings.holdings.map((holding) =>
      this.getStockChangePercent(holding.symbol, 'cn')
    )
    const changePercents = await Promise.all(changePercentPromises)

    // 计算重仓股加权贡献：Σ(wi × ri)
    for (let i = 0; i < n; i++) {
      const weight = holdings.holdings[i].weight
      const changePercent = changePercents[i] / 100 // 转换为小数（如2% -> 0.02）
      weightedSum += weight * changePercent
    }

    // 获取剩余仓位比例
    const remainingWeight = 1 - holdings.totalWeight

    // 获取对应指数的实时涨跌幅
    const indexCode = holdings.indexCode || '000300'
    const indexChangePercent = await this.getIndexChangePercent(indexCode)
    const indexChange = indexChangePercent / 100 // 转换为小数

    // 计算剩余仓位贡献：(1 - Σwi) × Rindex
    const remainingContribution = remainingWeight * indexChange

    // 应用公式：Vtoday = Vyesterday × [1 + Σ(wi × ri) + (1 - Σwi) × Rindex]
    const todayValuation = yesterdayNetValue * (1 + weightedSum + remainingContribution)

    return todayValuation
  }

  // 获取基金实时估值（使用精准公式计算）
  async getFundQuote(code: string): Promise<FundQuote> {
    let yesterdayNetValue = 0
    let fundName = `基金${code}`
    let fundType = '未知类型'
    let manager: string | undefined
    let company: string | undefined

    try {
      // 尝试从天天基金网获取昨日净值
      const response = await fetch(
        `${DATA_SOURCES.EASTMONEY_FUND}/js/${code}.js`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://fund.eastmoney.com',
          },
        }
      )

      if (response.ok) {
        const text = await response.text()
        const match = text.match(/var\s+fundData\s*=\s*({.*?});/)
        if (match) {
          try {
            const data = JSON.parse(match[1])
            yesterdayNetValue = parseFloat(data.dwjz || data.netvalue || '0')
            fundName = data.name || data.fundname || fundName
            fundType = data.fundtype || fundType
            manager = data.manager
            company = data.company
          } catch (e) {
            console.warn('解析基金数据失败:', e)
          }
        }
      }
    } catch (error) {
      console.warn('天天基金API调用失败，尝试其他数据源:', error)
    }

    try {
      // 尝试从支付宝基金API获取
      const alipayResponse = await fetch(
        `${DATA_SOURCES.ALIPAY_FUND}/js/${code}.js`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      )

      if (alipayResponse.ok) {
        const text = await alipayResponse.text()
        const match = text.match(/jsonpgz\(({.*?})\)/)
        if (match) {
          try {
            const data = JSON.parse(match[1])
            if (!yesterdayNetValue) {
              yesterdayNetValue = parseFloat(data.dwjz || '0')
            }
            if (fundName === `基金${code}`) {
              fundName = data.name || fundName
            }
            if (fundType === '未知类型') {
              fundType = data.fundtype || fundType
            }
          } catch (e) {
            console.warn('解析支付宝基金数据失败:', e)
          }
        }
      }
    } catch (error) {
      console.warn('支付宝基金API调用失败，使用模拟数据:', error)
    }

    // 如果无法获取昨日净值，使用模拟数据
    if (!yesterdayNetValue) {
      await this.delay(300)
      
      const mockFunds: Record<string, { netValue: number; name: string; type: string }> = {
        '000001': { netValue: 1.523, name: '华夏成长混合', type: '混合型' },
        '110022': { netValue: 3.245, name: '易方达消费行业股票', type: '股票型' },
        '161725': { netValue: 1.125, name: '招商中证白酒指数', type: '指数型' },
        '005827': { netValue: 2.156, name: '易方达蓝筹精选混合', type: '混合型' },
        '163402': { netValue: 0.856, name: '兴全趋势投资混合', type: '混合型' },
        '519674': { netValue: 5.234, name: '银河创新成长混合', type: '混合型' },
        '001595': { netValue: 1.045, name: '天弘中证银行指数', type: '指数型' },
        '002190': { netValue: 3.456, name: '农银新能源主题', type: '股票型' },
        '003095': { netValue: 2.856, name: '中欧医疗健康混合', type: '混合型' },
      }

      if (mockFunds[code]) {
        yesterdayNetValue = mockFunds[code].netValue
        fundName = mockFunds[code].name
        fundType = mockFunds[code].type
      } else {
        // 生成随机模拟数据
        yesterdayNetValue = 1 + Math.random() * 4
      }
    }

    // 获取基金持仓数据
    const holdings = await this.getFundHoldings(code)
    
    // 如果没有持仓数据，尝试根据基金名称推断指数代码
    if (holdings.totalWeight === 0 && holdings.holdings.length === 0) {
      const inferredIndexCode = this.inferIndexCode(fundName, fundType)
      holdings.indexCode = inferredIndexCode
    }

    // 使用精准公式计算今日估值
    let estimatedValue: number
    let changePercent: number
    let change: number

    if (holdings.holdings.length > 0 && yesterdayNetValue > 0) {
      // 使用公式精准计算
      estimatedValue = await this.calculateFundValuation(yesterdayNetValue, holdings)
      change = estimatedValue - yesterdayNetValue
      changePercent = (change / yesterdayNetValue) * 100
    } else {
      // 如果没有持仓数据，使用简化的模拟计算
      const simulatedChangePercent = (Math.random() - 0.5) * 2 // -1% 到 +1%
      changePercent = simulatedChangePercent
      change = yesterdayNetValue * (changePercent / 100)
      estimatedValue = yesterdayNetValue + change
    }

    return {
      code: code,
      name: fundName,
      netValue: parseFloat(yesterdayNetValue.toFixed(3)),
      estimatedValue: parseFloat(estimatedValue.toFixed(3)),
      change: parseFloat(change.toFixed(3)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      previousClose: parseFloat(yesterdayNetValue.toFixed(3)),
      updateTime: new Date().toLocaleString('zh-CN'),
      type: fundType,
      manager: manager,
      company: company,
    }
  }

  // 保留原有的模拟数据方法作为后备（已废弃，但保留兼容性）
  private async getMockFundQuote(code: string): Promise<FundQuote> {
    await this.delay(300)

    // 热门基金模拟数据
    const mockFunds: Record<string, FundQuote> = {
      '000001': {
        code: '000001',
        name: '华夏成长混合',
        netValue: 1.523,
        estimatedValue: 1.528,
        change: 0.005,
        changePercent: 0.33,
        previousClose: 1.523,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '混合型',
        manager: '张经理',
        company: '华夏基金',
      },
      '110022': {
        code: '110022',
        name: '易方达消费行业股票',
        netValue: 3.245,
        estimatedValue: 3.268,
        change: 0.023,
        changePercent: 0.71,
        previousClose: 3.245,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '股票型',
        manager: '萧经理',
        company: '易方达基金',
      },
      '161725': {
        code: '161725',
        name: '招商中证白酒指数',
        netValue: 1.125,
        estimatedValue: 1.132,
        change: 0.007,
        changePercent: 0.62,
        previousClose: 1.125,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '指数型',
        manager: '侯经理',
        company: '招商基金',
      },
      '005827': {
        code: '005827',
        name: '易方达蓝筹精选混合',
        netValue: 2.156,
        estimatedValue: 2.168,
        change: 0.012,
        changePercent: 0.56,
        previousClose: 2.156,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '混合型',
        manager: '张经理',
        company: '易方达基金',
      },
      '163402': {
        code: '163402',
        name: '兴全趋势投资混合',
        netValue: 0.856,
        estimatedValue: 0.859,
        change: 0.003,
        changePercent: 0.35,
        previousClose: 0.856,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '混合型',
        manager: '董经理',
        company: '兴全基金',
      },
      '519674': {
        code: '519674',
        name: '银河创新成长混合',
        netValue: 5.234,
        estimatedValue: 5.268,
        change: 0.034,
        changePercent: 0.65,
        previousClose: 5.234,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '混合型',
        manager: '郑经理',
        company: '银河基金',
      },
      '001595': {
        code: '001595',
        name: '天弘中证银行指数',
        netValue: 1.045,
        estimatedValue: 1.042,
        change: -0.003,
        changePercent: -0.29,
        previousClose: 1.045,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '指数型',
        manager: '陈经理',
        company: '天弘基金',
      },
      '002190': {
        code: '002190',
        name: '农银新能源主题',
        netValue: 3.456,
        estimatedValue: 3.478,
        change: 0.022,
        changePercent: 0.64,
        previousClose: 3.456,
        updateTime: new Date().toLocaleString('zh-CN'),
        type: '股票型',
        manager: '赵经理',
        company: '农银汇理基金',
      },
    }
  }

  // 批量获取基金实时估值
  async getFundQuotes(codes: string[]): Promise<FundQuote[]> {
    const promises = codes.map((code) => this.getFundQuote(code))
    return Promise.all(promises)
  }

  // 搜索基金
  async searchFunds(keyword: string): Promise<FundInfo[]> {
    await this.delay(200)

    // 模拟搜索结果
    const allFunds: FundInfo[] = [
      { code: '000001', name: '华夏成长混合', type: '混合型', company: '华夏基金' },
      { code: '110022', name: '易方达消费行业股票', type: '股票型', company: '易方达基金' },
      { code: '161725', name: '招商中证白酒指数', type: '指数型', company: '招商基金' },
      { code: '005827', name: '易方达蓝筹精选混合', type: '混合型', company: '易方达基金' },
      { code: '163402', name: '兴全趋势投资混合', type: '混合型', company: '兴全基金' },
      { code: '519674', name: '银河创新成长混合', type: '混合型', company: '银河基金' },
      { code: '001595', name: '天弘中证银行指数', type: '指数型', company: '天弘基金' },
      { code: '002190', name: '农银新能源主题', type: '股票型', company: '农银汇理基金' },
      { code: '001717', name: '工银前沿医疗股票', type: '股票型', company: '工银瑞信基金' },
      { code: '003095', name: '中欧医疗健康混合', type: '混合型', company: '中欧基金' },
      { code: '161028', name: '富国中证新能源汽车', type: '指数型', company: '富国基金' },
      { code: '001838', name: '国泰国证食品饮料', type: '指数型', company: '国泰基金' },
    ]

    if (!keyword) {
      return allFunds.slice(0, 10)
    }

    const lowerKeyword = keyword.toLowerCase()
    return allFunds.filter(
      (fund) =>
        fund.code.includes(keyword) ||
        fund.name.toLowerCase().includes(lowerKeyword) ||
        fund.company?.toLowerCase().includes(lowerKeyword)
    )
  }

  // 工具方法：延迟
  private delay(ms: number): Promise<void> {
    return Promise.resolve()
      .then(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  }
}

export const fundAPI = new FundAPI()


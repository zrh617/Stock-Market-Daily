// 增强版API服务 - 集成真实财经数据源
export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  high: number
  low: number
  open: number
  previousClose: number
  currency?: string // 'USD' | 'CNY' | 'HKD'
  market?: string // 'us' | 'cn' | 'hk'
}

export interface MarketEvent {
  id: string
  title: string
  time: string
  date: string
  description: string
  importance: 'high' | 'medium' | 'low'
  market: string
  impact: 'positive' | 'negative' | 'neutral'
  type: 'earnings' | 'meeting' | 'economic' | 'dividend' | 'split' | 'ipo'
  company?: string
  symbol?: string
}

export interface MarketStats {
  total: number
  rising: number
  falling: number
  unchanged: number
  volume: number
  marketCap: number
}

export interface SectorPerformance {
  name: string
  change: number
  changePercent: number
  volume: number
}

// 真实数据源配置
const DATA_SOURCES = {
  // Alpha Vantage - 免费股票数据API
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  // Yahoo Finance - 实时股票数据
  YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart',
  // Financial Modeling Prep - 财报数据
  FMP: 'https://financialmodelingprep.com/api/v3',
  // MarketWatch - 企业事件
  MARKETWATCH: 'https://www.marketwatch.com',
  // SEC EDGAR - 官方财报数据
  SEC_EDGAR: 'https://www.sec.gov/edgar',
  // 财经日历API
  ECONOMIC_CALENDAR: 'https://api.marketaux.com/v1/news',
  // Polygon.io - 实时市场数据
  POLYGON: 'https://api.polygon.io/v2',
  // IEX Cloud - 股票数据
  IEX_CLOUD: 'https://cloud.iexapis.com/stable',
  // 雪球API - A股数据
  XUEQIU: 'https://stock.xueqiu.com/v5/stock',
  // 金十数据API - A股财经事件
  JIN10: 'https://api.jin10.com',
  // 同花顺API - A股数据
  TONGHUASHUN: 'https://q.10jqka.com.cn',
  // Tushare Pro API - 专业A股数据（HTTP接口）
  TUSHARE_PRO: 'http://api.tushare.pro',
  // Wind API - 万得数据
  WIND_API: 'https://www.wind.com.cn/mobile/WDS/api',
  // AllTick China A-shares实时数据
  ALLTICK: 'https://api.alltick.co',
  // LSEG Data & Analytics
  LSEG: 'https://api.refinitiv.com',
  // 聚宽API - A股数据
  JOINQUANT: 'https://www.joinquant.com',
  // 米筐API - A股数据
  RICEQUANT: 'https://www.ricequant.com',
  // 东方财富Choice API
  EASTMONEY_CHOICE: 'https://datacenter-web.eastmoney.com',
  // 同花顺iFinD API
  IFIND: 'https://api.10jqka.com.cn',
}

// API密钥配置（实际使用时需要申请）
const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore - Vite environment variables
    return import.meta.env[key] || ''
  } catch {
    return ''
  }
}

const API_KEYS = {
  ALPHA_VANTAGE: getEnvVar('VITE_ALPHA_VANTAGE_KEY') || 'demo',
  FMP: getEnvVar('VITE_FMP_KEY') || 'demo',
  MARKETAUX: getEnvVar('VITE_MARKETAUX_KEY') || 'demo',
  POLYGON: getEnvVar('VITE_POLYGON_KEY') || 'demo',
  IEX_CLOUD: getEnvVar('VITE_IEX_CLOUD_KEY') || 'demo',
  JIN10: getEnvVar('VITE_JIN10_KEY') || 'demo',
  TUSHARE_PRO: getEnvVar('VITE_TUSHARE_PRO_TOKEN') || '',
  JOINQUANT: getEnvVar('VITE_JOINQUANT_TOKEN') || '',
  RICEQUANT: getEnvVar('VITE_RICEQUANT_TOKEN') || '',
  EASTMONEY: getEnvVar('VITE_EASTMONEY_TOKEN') || '',
  IFIND: getEnvVar('VITE_IFIND_TOKEN') || '',
}

class EnhancedStockMarketAPI {
  private baseUrl = 'https://api.example.com'
  
  // 获取交易日期的字符串格式（YYYYMMDD）
  private getTradeDate(date: Date, offset: number = 0): string {
    const d = new Date(date)
    d.setDate(d.getDate() + offset)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }
  
  // 获取公司名称
  private async getCompanyName(symbol: string): Promise<string> {
    const companyNames: Record<string, string> = {
      'AAPL': '苹果公司',
      'TSLA': '特斯拉',
      'MSFT': '微软',
      'GOOGL': '谷歌',
      'AMZN': '亚马逊',
      'META': 'Meta',
      'NVDA': '英伟达',
      'NFLX': '奈飞',
      'AMD': 'AMD',
      'INTC': '英特尔',
      'CRM': 'Salesforce',
      'ORCL': '甲骨文',
      'ADBE': 'Adobe',
      'PYPL': 'PayPal',
      'UBER': '优步',
      'SQ': 'Square',
      'ZM': 'Zoom',
      'ROKU': 'Roku',
      'SPOT': 'Spotify',
      'TWTR': 'Twitter',
    }
    return companyNames[symbol] || symbol
  }

  // 获取真实股票数据（支持多市场）
  async getStockQuote(symbol: string, market?: string): Promise<StockQuote> {
    try {
      // 尝试从Yahoo Finance获取实时数据
      const yahooResponse = await fetch(`${DATA_SOURCES.YAHOO_FINANCE}/${symbol}?interval=1m&range=1d`)
      if (yahooResponse.ok) {
        const yahooData = await yahooResponse.json()
        const quote = yahooData.chart.result[0].meta
        
        return {
          symbol: symbol,
          name: await this.getCompanyName(symbol),
          price: quote.regularMarketPrice,
          change: quote.regularMarketPrice - quote.previousClose,
          changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap || 0,
          pe: quote.trailingPE || 0,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          open: quote.regularMarketOpen,
          previousClose: quote.previousClose
        }
      }
    } catch (error) {
      console.warn('Yahoo Finance API调用失败，尝试Alpha Vantage:', error)
      
      try {
        // 备用：Alpha Vantage API
        const alphaResponse = await fetch(`${DATA_SOURCES.ALPHA_VANTAGE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.ALPHA_VANTAGE}`)
        if (alphaResponse.ok) {
          const alphaData = await alphaResponse.json()
          const quote = alphaData['Global Quote']
          
          if (quote) {
            return {
              symbol: quote['01. symbol'],
              name: await this.getCompanyName(symbol),
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
              volume: parseInt(quote['06. volume']),
              marketCap: 0,
              pe: 0,
              high: parseFloat(quote['03. high']),
              low: parseFloat(quote['04. low']),
              open: parseFloat(quote['02. open']),
              previousClose: parseFloat(quote['08. previous close'])
            }
          }
        }
      } catch (alphaError) {
        console.warn('Alpha Vantage API也失败，使用模拟数据:', alphaError)
      }
    }
    
    // 如果是A股，优先使用Tushare Pro、Wind等专业API获取最新数据
    if (market === 'cn') {
      // 1. 优先尝试Tushare Pro API（获取最新的交易日数据）
      if (API_KEYS.TUSHARE_PRO) {
        try {
          // 将A股代码转换为Tushare格式（如000001 -> 000001.SZ 或 600519 -> 600519.SH）
          const prefix = symbol.startsWith('0') || symbol.startsWith('3') ? 'SZ' : 'SH'
          const tsSymbol = `${symbol.padStart(6, '0')}.${prefix}`
          
          // 先获取最新的交易日
          const today = new Date()
          const tradeDateResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_name: 'trade_cal',
              token: API_KEYS.TUSHARE_PRO,
              params: {
                exchange: '',
                start_date: this.getTradeDate(today, -30), // 往前30天开始查找
                end_date: this.getTradeDate(today, 0), // 到今天
                is_open: 1, // 只查询交易日
              },
              fields: 'cal_date,is_open',
            }),
          })
          
          let latestTradeDate = this.getTradeDate(today, 0)
          if (tradeDateResponse.ok) {
            const tradeDateData = await tradeDateResponse.json()
            if (tradeDateData.code === 0 && tradeDateData.data?.items) {
              // 找到最新的交易日（倒序取第一个）
              const latest = tradeDateData.data.items[tradeDateData.data.items.length - 1]
              if (latest && latest[0]) {
                latestTradeDate = latest[0]
              }
            }
          }
          
          // 获取股票基础信息（用于获取名称）
          const nameResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_name: 'stock_basic',
              token: API_KEYS.TUSHARE_PRO,
              params: {
                ts_code: tsSymbol,
              },
              fields: 'ts_code,name',
            }),
          })
          
          let stockName = symbol
          if (nameResponse.ok) {
            const nameData = await nameResponse.json()
            if (nameData.code === 0 && nameData.data?.items?.[0]) {
              stockName = nameData.data.items[0][1] || symbol
            }
          }
          
          // 获取最新的日线行情数据
          const dailyResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_name: 'daily',
              token: API_KEYS.TUSHARE_PRO,
              params: {
                ts_code: tsSymbol,
                trade_date: latestTradeDate,
              },
              fields: 'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount',
            }),
          })
          
          if (dailyResponse.ok) {
            const dailyData = await dailyResponse.json()
            if (dailyData.code === 0 && dailyData.data?.items?.[0]) {
              const latest = dailyData.data.items[0]
              const fields = dailyData.data.fields
              const fieldMap: Record<string, any> = {}
              fields.forEach((f: string, i: number) => {
                fieldMap[f] = latest[i]
              })
              
              const price = parseFloat(fieldMap.close) || 0
              const open = parseFloat(fieldMap.open) || price
              const high = parseFloat(fieldMap.high) || price
              const low = parseFloat(fieldMap.low) || price
              const preClose = parseFloat(fieldMap.pre_close) || price
              const change = price - preClose
              const changePercent = parseFloat(fieldMap.pct_chg) || (preClose ? ((change / preClose) * 100) : 0)
              const volume = parseFloat(fieldMap.vol) || 0
              
              // 获取基本面数据（PE等）
              const basicResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  api_name: 'daily_basic',
                  token: API_KEYS.TUSHARE_PRO,
                  params: {
                    ts_code: tsSymbol,
                    trade_date: latestTradeDate,
                  },
                  fields: 'ts_code,trade_date,turnover_rate,pe,pb,ps,dv_ttm',
                }),
              })
              
              let pe = 0
              let marketCap = 0
              if (basicResponse.ok) {
                const basicData = await basicResponse.json()
                if (basicData.code === 0 && basicData.data?.items?.[0]) {
                  const basicFields = basicData.data.fields
                  pe = parseFloat(basicData.data.items[0][basicFields.indexOf('pe')]) || 0
                }
              }
              
              return {
                symbol: symbol,
                name: stockName,
                price: price,
                change: change,
                changePercent: changePercent,
                volume: volume,
                marketCap: marketCap,
                pe: pe,
                high: high,
                low: low,
                open: open,
                previousClose: preClose,
                currency: 'CNY',
                market: 'cn'
              }
            }
          }
        } catch (error) {
          console.warn('Tushare Pro API调用失败，尝试其他数据源:', error)
        }
      }
      
      // 2. 尝试东方财富Choice API
      if (API_KEYS.EASTMONEY) {
        try {
          const emSymbol = symbol.startsWith('0') || symbol.startsWith('3') ? `0.${symbol}` : `1.${symbol}`
          const response = await fetch(
            `${DATA_SOURCES.EASTMONEY_CHOICE}/api/data/v1/get?datatype=k&marketid=${emSymbol}`,
            {
              headers: {
                'Authorization': `Bearer ${API_KEYS.EASTMONEY}`,
              },
            }
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              const latest = data.data[0]
              return {
                symbol: symbol,
                name: latest.name || symbol,
                price: latest.close || latest.p || 0,
                change: latest.change || 0,
                changePercent: latest.pct_chg || 0,
                volume: latest.volume || 0,
                marketCap: latest.total_mv || 0,
                pe: latest.pe || 0,
                high: latest.high || latest.close,
                low: latest.low || latest.close,
                open: latest.open || latest.close,
                previousClose: latest.pre_close || latest.close,
                currency: 'CNY',
                market: 'cn'
              }
            }
          }
        } catch (error) {
          console.warn('东方财富API调用失败，尝试其他数据源:', error)
        }
      }
      
      // 3. 尝试雪球API（不需要API密钥）
      try {
        const xueqiuSymbol = symbol.startsWith('0') || symbol.startsWith('3') ? `SZ${symbol}` : `SH${symbol}`
        const xueqiuResponse = await fetch(
          `${DATA_SOURCES.XUEQIU}/quote.json?symbol=${xueqiuSymbol}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://xueqiu.com',
            },
          }
        )
        if (xueqiuResponse.ok) {
          const xueqiuData = await xueqiuResponse.json()
          const quote = xueqiuData.data?.quote
          
          if (quote) {
            return {
              symbol: symbol,
              name: quote.name || symbol,
              price: quote.current || quote.last_close || 0,
              change: quote.change || 0,
              changePercent: quote.percent || 0,
              volume: quote.volume || 0,
              marketCap: quote.market_capital || 0,
              pe: quote.pe_ttm || 0,
              high: quote.high || quote.current,
              low: quote.low || quote.current,
              open: quote.open || quote.current,
              previousClose: quote.last_close || quote.current,
              currency: 'CNY',
              market: 'cn'
            }
          }
        }
      } catch (error) {
        console.warn('雪球API调用失败，使用模拟数据:', error)
      }
    }
    
    // 模拟数据作为后备
    await this.delay(500)
    
    // A股模拟数据（人民币单位）
    const aStockMockData: Record<string, StockQuote> = {
      '000001': {
        symbol: '000001',
        name: '平安银行',
        price: 12.58,
        change: 0.15,
        changePercent: 1.21,
        volume: 125000000,
        marketCap: 243000000000,
        pe: 5.8,
        high: 12.65,
        low: 12.35,
        open: 12.43,
        previousClose: 12.43,
        currency: 'CNY',
        market: 'cn'
      },
      '600000': {
        symbol: '600000',
        name: '浦发银行',
        price: 8.45,
        change: -0.05,
        changePercent: -0.59,
        volume: 98000000,
        marketCap: 158000000000,
        pe: 4.2,
        high: 8.52,
        low: 8.38,
        open: 8.50,
        previousClose: 8.50,
        currency: 'CNY',
        market: 'cn'
      },
      '600519': {
        symbol: '600519',
        name: '贵州茅台',
        price: 1688.50,
        change: 15.80,
        changePercent: 0.94,
        volume: 3200000,
        marketCap: 2120000000000,
        pe: 32.5,
        high: 1695.00,
        low: 1675.00,
        open: 1680.00,
        previousClose: 1672.70,
        currency: 'CNY',
        market: 'cn'
      },
      '000858': {
        symbol: '000858',
        name: '五粮液',
        price: 145.88,
        change: 2.15,
        changePercent: 1.49,
        volume: 8500000,
        marketCap: 566000000000,
        pe: 18.5,
        high: 146.50,
        low: 144.20,
        open: 144.50,
        previousClose: 143.73,
        currency: 'CNY',
        market: 'cn'
      },
      '002594': {
        symbol: '002594',
        name: '比亚迪',
        price: 245.50,
        change: 5.80,
        changePercent: 2.42,
        volume: 12000000,
        marketCap: 715000000000,
        pe: 28.5,
        high: 247.80,
        low: 240.20,
        open: 242.00,
        previousClose: 239.70,
        currency: 'CNY',
        market: 'cn'
      }
    }
    
    // 美股模拟数据（美元单位）
    const usStockMockData: Record<string, StockQuote> = {
      'AAPL': {
        symbol: 'AAPL',
        name: '苹果公司',
        price: 150.25,
        change: 2.15,
        changePercent: 1.45,
        volume: 45200000,
        marketCap: 2400000000000,
        pe: 28.5,
        high: 152.30,
        low: 148.90,
        open: 149.50,
        previousClose: 148.10,
        currency: 'USD',
        market: 'us'
      },
      'TSLA': {
        symbol: 'TSLA',
        name: '特斯拉',
        price: 245.80,
        change: -3.20,
        changePercent: -1.28,
        volume: 38000000,
        marketCap: 780000000000,
        pe: 45.2,
        high: 250.15,
        low: 242.30,
        open: 248.50,
        previousClose: 249.00,
        currency: 'USD',
        market: 'us'
      },
      'MSFT': {
        symbol: 'MSFT',
        name: '微软',
        price: 335.45,
        change: 4.25,
        changePercent: 1.28,
        volume: 28000000,
        marketCap: 2500000000000,
        pe: 32.1,
        high: 337.80,
        low: 332.15,
        open: 333.20,
        previousClose: 331.20,
        currency: 'USD',
        market: 'us'
      }
    }
    
    // 根据市场返回相应数据
    if (market === 'cn' && aStockMockData[symbol]) {
      return aStockMockData[symbol]
    }
    
    return usStockMockData[symbol] || usStockMockData['AAPL']!
  }

  // 获取A股财报和事件数据（使用Tushare Pro、金十、同花顺等真实API）
  private async getAStockEvents(date?: string): Promise<MarketEvent[]> {
    const targetDate = date ? new Date(date) : new Date()
    const dateStr = targetDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    const dateStrCN = dateStr.replace(/-/g, '')
    const events: MarketEvent[] = []
    
    // 1. 优先使用Tushare Pro获取财报事件（获取最新数据）
    if (API_KEYS.TUSHARE_PRO) {
      try {
        // 获取业绩预告（查询最近7天的数据，确保获取最新）
        const startDate = this.getTradeDate(new Date(targetDate), -7)
        const endDate = dateStrCN
        
        const earningsResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_name: 'forecast',
            token: API_KEYS.TUSHARE_PRO,
            params: {
              start_date: startDate,
              end_date: endDate,
            },
            fields: 'ts_code,ann_date,end_date,type,p_change_min,p_change_max,net_profit_min,net_profit_max',
          }),
        })
        
        if (earningsResponse.ok) {
          const earningsData = await earningsResponse.json()
          if (earningsData.code === 0 && earningsData.data?.items) {
            earningsData.data.items.forEach((item: any[], index: number) => {
              const fieldMap = Object.fromEntries(
                earningsData.data.fields.map((f: string, i: number) => [f, item[i]])
              )
              const symbol = (fieldMap.ts_code?.replace(/\.(SZ|SH)/, '') || '')
              
              if (symbol) {
                events.push({
                  id: `tushare_forecast_${symbol}_${index}`,
                  title: `${symbol}业绩预告`,
                  time: '09:30',
                  date: dateStr,
                  description: `预计${fieldMap.p_change_min || 0}%-${fieldMap.p_change_max || 0}%业绩变化`,
                  importance: Math.abs(fieldMap.p_change_max || 0) > 50 ? 'high' : 'medium',
                  market: 'A股',
                  impact: (fieldMap.p_change_max || 0) > 0 ? 'positive' : 'negative',
                  type: 'earnings',
                  symbol: symbol,
                })
              }
            })
          }
        }
        
        // 获取财报发布日期（查询最近30天，确保获取最新财报）
        const reportStartDate = this.getTradeDate(new Date(targetDate), -30)
        const reportResponse = await fetch(DATA_SOURCES.TUSHARE_PRO, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_name: 'report_rc',
            token: API_KEYS.TUSHARE_PRO,
            params: {
              start_date: reportStartDate,
              end_date: endDate,
            },
            fields: 'ts_code,ann_date,f_ann_date,end_date,report_type,comp_type',
          }),
        })
        
        if (reportResponse.ok) {
          const reportData = await reportResponse.json()
          if (reportData.code === 0 && reportData.data?.items) {
            reportData.data.items.forEach((item: any[], index: number) => {
              const fieldMap = Object.fromEntries(
                reportData.data.fields.map((f: string, i: number) => [f, item[i]])
              )
              const symbol = (fieldMap.ts_code?.replace(/\.(SZ|SH)/, '') || '')
              const reportType = fieldMap.report_type === '1' ? '一季报' : 
                                 fieldMap.report_type === '2' ? '中报' :
                                 fieldMap.report_type === '3' ? '三季报' : '年报'
              
              // 使用实际公告日期，而不是查询日期
              const annDate = fieldMap.ann_date || fieldMap.f_ann_date || dateStrCN
              const eventDate = annDate.length === 8 
                ? `${annDate.substring(0, 4)}-${annDate.substring(4, 6)}-${annDate.substring(6, 8)}`
                : dateStr
              
              if (symbol && eventDate === dateStr) { // 只添加与查询日期匹配的事件
                events.push({
                  id: `tushare_report_${symbol}_${index}_${annDate}`,
                  title: `${symbol}${reportType}发布`,
                  time: '20:00',
                  date: eventDate,
                  description: `${symbol}发布${reportType}`,
                  importance: 'high',
                  market: 'A股',
                  impact: 'positive',
                  type: 'earnings',
                  symbol: symbol,
                })
              }
            })
          }
        }
      } catch (error) {
        console.warn('Tushare Pro财报API调用失败，尝试其他数据源:', error)
      }
    }
    
    // 2. 尝试从金十数据获取A股财经事件
    if (API_KEYS.JIN10) {
      try {
        const jin10Response = await fetch(
          `${DATA_SOURCES.JIN10}/api/v1/calendar/list?date=${dateStr}&country=CN`,
          {
            headers: {
              'Authorization': `Bearer ${API_KEYS.JIN10}`,
            },
          }
        )
        if (jin10Response.ok) {
          const jin10Data = await jin10Response.json()
          jin10Data.data?.forEach((item: any, index: number) => {
            events.push({
              id: `jin10_cn_${index}_${Date.now()}`,
              title: item.title || item.event || item.name || '财经事件',
              time: item.time || item.datetime?.split(' ')[1] || '09:30',
              date: dateStr,
              description: item.description || item.content || item.title || '',
              importance: item.importance || (item.star > 3 ? 'high' : 'medium'),
              market: 'A股',
              impact: item.impact || 'neutral',
              type: item.type || 'economic',
              company: item.company || undefined,
              symbol: item.symbol || undefined,
            })
          })
        }
      } catch (error) {
        console.warn('金十数据API调用失败，尝试其他数据源:', error)
      }
    }
    
    // 3. 尝试从同花顺获取事件数据
    try {
      const thsResponse = await fetch(
        `${DATA_SOURCES.TONGHUASHUN}/stock/important_report?date=${dateStrCN}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.10jqka.com.cn',
          },
        }
      )
      if (thsResponse.ok) {
        const thsData = await thsResponse.json()
        if (thsData.data) {
          thsData.data.forEach((item: any, index: number) => {
            events.push({
              id: `tonghuashun_${item.code || index}_${index}`,
              title: item.title || `${item.name || item.code || '公司'}财报发布`,
              time: item.time || '20:00',
              date: dateStr,
              description: item.content || item.title || '',
              importance: item.level === '重要' ? 'high' : 'medium',
              market: 'A股',
              impact: 'positive',
              type: 'earnings',
              company: item.name || undefined,
              symbol: item.code || undefined,
            })
          })
        }
      }
    } catch (error) {
      console.warn('同花顺API调用失败:', error)
    }
    
    // 如果从真实API获取到数据，直接返回
    if (events.length > 0) {
      return events
    }
    
    // 模拟A股财报和事件数据（涵盖所有主要A股公司的财报时间）
    const generateEventsForWeek = () => {
      const events: MarketEvent[] = []
      const baseDate = date ? new Date(date) : today
      
      // A股主要公司财报事件（基于真实财报发布规律）
      // 一季报：4月底前，半年报：8月底前，三季报：10月底前，年报：次年4月底前
      
      const companies = [
        // 白酒行业
        { name: '贵州茅台', symbol: '600519', time: '20:00' },
        { name: '五粮液', symbol: '000858', time: '19:30' },
        { name: '泸州老窖', symbol: '000568', time: '18:00' },
        { name: '山西汾酒', symbol: '600809', time: '17:00' },
        { name: '洋河股份', symbol: '002304', time: '16:30' },
        { name: '古井贡酒', symbol: '000596', time: '15:30' },
        
        // 银行行业
        { name: '平安银行', symbol: '000001', time: '15:00' },
        { name: '浦发银行', symbol: '600000', time: '14:00' },
        { name: '招商银行', symbol: '600036', time: '16:00' },
        { name: '工商银行', symbol: '601398', time: '09:30' },
        { name: '建设银行', symbol: '601939', time: '10:00' },
        { name: '农业银行', symbol: '601288', time: '10:30' },
        { name: '中国银行', symbol: '601988', time: '11:00' },
        { name: '兴业银行', symbol: '601166', time: '14:30' },
        { name: '民生银行', symbol: '600016', time: '15:00' },
        { name: '中信银行', symbol: '601998', time: '15:30' },
        
        // 新能源/汽车
        { name: '比亚迪', symbol: '002594', time: '16:00' },
        { name: '宁德时代', symbol: '300750', time: '18:00' },
        { name: '长城汽车', symbol: '601633', time: '17:30' },
        { name: '吉利汽车', symbol: '00175', time: '16:30' },
        { name: '蔚来', symbol: '9866', time: '20:00' },
        { name: '理想汽车', symbol: '2015', time: '19:00' },
        
        // 科技/互联网 - A股科技公司
        { name: '海康威视', symbol: '002415', time: '16:30' },
        { name: '大华股份', symbol: '002236', time: '16:00' },
        { name: '中兴通讯', symbol: '000063', time: '18:00' },
        { name: '科大讯飞', symbol: '002230', time: '17:30' },
        { name: '用友网络', symbol: '600588', time: '17:00' },
        { name: '广联达', symbol: '002410', time: '16:45' },
        { name: '紫光股份', symbol: '000938', time: '16:15' },
        { name: '浪潮信息', symbol: '000977', time: '15:45' },
        { name: '中科创达', symbol: '300496', time: '15:30' },
        { name: '寒武纪', symbol: '688256', time: '15:15' },
        { name: '汇川技术', symbol: '300124', time: '15:00' },
        { name: '深信服', symbol: '300454', time: '14:45' },
        { name: '金山办公', symbol: '688111', time: '14:30' },
        { name: '东方财富', symbol: '300059', time: '14:15' },
        { name: '同花顺', symbol: '300033', time: '14:00' },
        { name: '三六零', symbol: '601360', time: '13:45' },
        { name: '奇安信', symbol: '688561', time: '13:30' },
        { name: '恒生电子', symbol: '600570', time: '13:15' },
        { name: '润和软件', symbol: '300339', time: '13:00' },
        { name: '四维图新', symbol: '002405', time: '12:45' },
        { name: '启明星辰', symbol: '002439', time: '12:30' },
        { name: '宝信软件', symbol: '600845', time: '12:15' },
        { name: '长亮科技', symbol: '300348', time: '12:00' },
        { name: '宇信科技', symbol: '300674', time: '11:45' },
        { name: '京东方A', symbol: '000725', time: '11:30' },
        { name: 'TCL科技', symbol: '000100', time: '11:15' },
        { name: '深天马A', symbol: '000050', time: '11:00' },
        { name: '欧菲光', symbol: '002456', time: '10:45' },
        { name: '歌尔股份', symbol: '002241', time: '10:30' },
        { name: '立讯精密', symbol: '002475', time: '10:15' },
        { name: '蓝思科技', symbol: '300433', time: '10:00' },
        { name: '闻泰科技', symbol: '600745', time: '09:45' },
        { name: '兆易创新', symbol: '603986', time: '09:30' },
        { name: '韦尔股份', symbol: '603501', time: '09:15' },
        { name: '紫光国微', symbol: '002049', time: '20:30' },
        { name: '景嘉微', symbol: '300474', time: '20:15' },
        { name: '中微公司', symbol: '688012', time: '20:00' },
        { name: '北方华创', symbol: '002371', time: '19:45' },
        { name: '长川科技', symbol: '300604', time: '19:30' },
        { name: '华天科技', symbol: '002185', time: '19:15' },
        { name: '通富微电', symbol: '002156', time: '19:00' },
        { name: '长电科技', symbol: '600584', time: '18:45' },
        { name: '晶方科技', symbol: '603005', time: '18:30' },
        { name: '卓胜微', symbol: '300782', time: '18:15' },
        { name: '圣邦股份', symbol: '300661', time: '18:00' },
        
        // 港股科技公司（保留原有）
        { name: '腾讯控股', symbol: '0700', time: '20:00' },
        { name: '阿里巴巴', symbol: '9988', time: '19:00' },
        { name: '京东', symbol: '9618', time: '18:30' },
        { name: '美团', symbol: '3690', time: '18:00' },
        { name: '小米集团', symbol: '1810', time: '17:30' },
        { name: '百度', symbol: '9888', time: '17:00' },
        { name: '网易', symbol: '9999', time: '16:30' },
        
        // 消费/零售
        { name: '美的集团', symbol: '000333', time: '16:00' },
        { name: '格力电器', symbol: '000651', time: '15:00' },
        { name: '海尔智家', symbol: '600690', time: '14:30' },
        { name: '恒瑞医药', symbol: '600276', time: '15:30' },
        { name: '药明康德', symbol: '603259', time: '17:00' },
        { name: '迈瑞医疗', symbol: '300760', time: '17:30' },
        
        // 房地产
        { name: '万科A', symbol: '000002', time: '14:00' },
        { name: '保利发展', symbol: '600048', time: '14:30' },
        { name: '融创中国', symbol: '1918', time: '16:00' },
        { name: '碧桂园', symbol: '2007', time: '15:00' },
        
        // 金融
        { name: '中国平安', symbol: '601318', time: '15:00' },
        { name: '中国人寿', symbol: '601628', time: '14:30' },
        { name: '中国太保', symbol: '601601', time: '14:00' },
        { name: '中信证券', symbol: '600030', time: '16:00' },
        { name: '海通证券', symbol: '600837', time: '15:30' },
        { name: '华泰证券', symbol: '601688', time: '15:00' },
        
        // 能源
        { name: '中国石油', symbol: '601857', time: '09:30' },
        { name: '中国石化', symbol: '600028', time: '10:00' },
        { name: '中国神华', symbol: '601088', time: '10:30' },
        { name: '兖矿能源', symbol: '600188', time: '11:00' },
        
        // 电力/公用事业
        { name: '长江电力', symbol: '600900', time: '14:00' },
        { name: '国电电力', symbol: '600795', time: '14:30' },
        { name: '华能国际', symbol: '600011', time: '15:00' },
        
        // 化工
        { name: '万华化学', symbol: '600309', time: '16:00' },
        { name: '恒力石化', symbol: '600346', time: '16:30' },
        { name: '荣盛石化', symbol: '002493', time: '17:00' },
        
        // 食品饮料
        { name: '海天味业', symbol: '603288', time: '15:30' },
        { name: '伊利股份', symbol: '600887', time: '16:00' },
        { name: '双汇发展', symbol: '000895', time: '15:00' },
        { name: '金龙鱼', symbol: '300999', time: '16:30' },
        
        // 制造业
        { name: '三一重工', symbol: '600031', time: '15:30' },
        { name: '中联重科', symbol: '000157', time: '16:00' },
        { name: '徐工机械', symbol: '000425', time: '15:00' },
        
        // 通信
        { name: '中国移动', symbol: '600941', time: '17:00' },
        { name: '中国联通', symbol: '600050', time: '16:30' },
        { name: '中国电信', symbol: '601728', time: '17:30' },
      ]
      
      // 为每一天生成事件，分散到未来7天内
      // 将所有公司的财报事件分散到未来7天中
      const companiesPerDay = Math.ceil(companies.length / 7)
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(baseDate.getDate() + dayOffset)
        const dateString = eventDate.toISOString().split('T')[0]
        
        // 计算当天应该显示的公司范围
        const startIndex = dayOffset * companiesPerDay
        const endIndex = Math.min(startIndex + companiesPerDay, companies.length)
        const dailyCompanies = companies.slice(startIndex, endIndex)
        
        // 为当天所有公司生成财报事件
        dailyCompanies.forEach((company, index) => {
          const reportTypes = ['第三季度财报', '三季度业绩', '第三季度业绩说明会', '三季报电话会议']
          const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)]
          
          // 重要公司标记为high（包括茅台、五粮液、比亚迪、平安、银行、主要科技公司等）
          const importantSymbols = [
            '600519', '000858', '002594', '601318', '000001', // 茅台、五粮液、比亚迪、平安、平安银行
            '002415', '000063', '002230', '688111', '300059', // 海康、中兴、科大讯飞、金山办公、东方财富
            '300750', '600036', '000333', '000651', // 宁德、招行、美的、格力
            '601398', '601939', '601288', '601988' // 四大行
          ]
          const importance = importantSymbols.includes(company.symbol) ? 'high' : 'medium'
          
          events.push({
            id: `astock_${dateString}_${company.symbol}_${index}`,
            title: `${company.name}2024年${reportType}`,
            time: company.time,
            date: dateString || today.toISOString().split('T')[0],
            description: `${company.name}发布2024年第三季度财报，包括营收、净利润等关键财务指标`,
            importance: importance,
            market: 'A股',
            impact: Math.random() > 0.3 ? 'positive' : 'neutral',
            type: 'earnings',
            company: company.name,
            symbol: company.symbol
          })
        })
      }
      
      // 添加经济数据事件
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(baseDate.getDate() + dayOffset)
        const dateString = eventDate.toISOString().split('T')[0]
        
        // 随机添加一些经济数据事件
        if (Math.random() > 0.7) {
          const economicEvents = [
            { title: '中国CPI数据发布', time: '09:30', type: 'economic' },
            { title: '中国PPI数据发布', time: '09:30', type: 'economic' },
            { title: '央行货币政策执行报告发布', time: '18:00', type: 'economic' },
            { title: '中国GDP数据发布', time: '10:00', type: 'economic' },
            { title: '中国PMI数据发布', time: '09:30', type: 'economic' },
            { title: '央行MLF操作', time: '09:20', type: 'economic' },
          ]
          
          const selectedEvent = economicEvents[Math.floor(Math.random() * economicEvents.length)]
          
          if (selectedEvent) {
            events.push({
            id: `economic_${dateString}_${Math.random().toString(36).substring(2, 11)}`,
            title: selectedEvent.title,
            time: selectedEvent.time,
            date: dateString || today.toISOString().split('T')[0],
            description: `国家统计局或中国人民银行发布重要经济数据`,
            importance: 'high',
            market: 'A股',
            impact: 'neutral',
            type: selectedEvent.type as 'earnings' | 'meeting' | 'economic' | 'dividend' | 'split' | 'ipo'
            })
          }
        }
      }
      
      return events
    }
    
    const aStockEvents = generateEventsForWeek()
    
    // 如果有指定日期，筛选该日期的事件
    if (date) {
      const filtered = aStockEvents.filter(event => event.date === date)
      // 如果该日期没有事件，至少返回一些默认事件
      if (filtered.length === 0) {
        return generateEventsForWeek().filter(event => event.date === date)
      }
      return filtered
    }
    
    return aStockEvents
  }

  // 获取真实企业财报和会议事件
  async getMarketEvents(date?: string, market?: string): Promise<MarketEvent[]> {
    // 如果是A股，使用专门的A股事件获取方法
    if (market === 'cn' || market === 'A股') {
      const aStockEvents = await this.getAStockEvents(date)
      if (aStockEvents.length > 0) {
        return aStockEvents
      }
    }
    
    try {
      // 尝试从MarketAux获取财经新闻和事件（美股）
      const marketAuxResponse = await fetch(`${DATA_SOURCES.ECONOMIC_CALENDAR}?api_token=${API_KEYS.MARKETAUX}&countries=us&limit=50`)
      if (marketAuxResponse.ok) {
        const marketAuxData = await marketAuxResponse.json()
        const events: MarketEvent[] = []
        
        marketAuxData.data?.forEach((item: any, index: number) => {
          const eventDate = new Date(item.published_at).toISOString().split('T')[0]
          if (!date || eventDate === date) {
            events.push({
              id: `marketaux_${index}`,
              title: item.title,
              time: new Date(item.published_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              date: eventDate,
              description: item.description || item.title,
              importance: this.determineImportance(item.title),
              market: '美股',
              impact: this.determineImpact(item.title),
              type: this.determineEventType(item.title),
              company: this.extractCompanyName(item.title),
              symbol: this.extractSymbol(item.title)
            })
          }
        })
        
        if (events.length > 0) {
          return events.slice(0, 20) // 限制返回数量
        }
      }
    } catch (error) {
      console.warn('MarketAux API调用失败，使用增强模拟数据:', error)
    }

    // 增强的模拟数据 - 包含真实企业财报和会议信息
    await this.delay(400)
    
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    
    const events: MarketEvent[] = [
      // 今日事件
      {
        id: '1',
        title: '苹果公司财报电话会议',
        time: '17:00',
        date: today.toISOString().split('T')[0],
        description: '苹果公司发布2024年第四季度财报，讨论iPhone 16销售表现和AI战略',
        importance: 'high',
        market: '美股',
        impact: 'positive',
        type: 'earnings',
        company: '苹果公司',
        symbol: 'AAPL'
      },
      {
        id: '2',
        title: '特斯拉投资者日',
        time: '20:00',
        date: today.toISOString().split('T')[0],
        description: '特斯拉举办投资者日活动，展示最新自动驾驶技术和电池技术进展',
        importance: 'high',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '特斯拉',
        symbol: 'TSLA'
      },
      {
        id: '3',
        title: '微软Azure云服务发布会',
        time: '22:00',
        date: today.toISOString().split('T')[0],
        description: '微软发布Azure AI新功能，包括Copilot企业版和混合云解决方案',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '微软',
        symbol: 'MSFT'
      },
      {
        id: '4',
        title: '美联储官员讲话',
        time: '22:30',
        date: today.toISOString().split('T')[0],
        description: '美联储主席鲍威尔就货币政策发表重要讲话',
        importance: 'high',
        market: '美股',
        impact: 'neutral',
        type: 'economic'
      },
      {
        id: '5',
        title: 'CPI数据发布',
        time: '20:30',
        date: today.toISOString().split('T')[0],
        description: '美国消费者价格指数月度数据',
        importance: 'high',
        market: '美股',
        impact: 'neutral',
        type: 'economic'
      },
      
      // 明日事件
      {
        id: '6',
        title: '英伟达GTC大会',
        time: '09:00',
        date: tomorrow.toISOString().split('T')[0],
        description: '英伟达GPU技术大会，发布最新AI芯片和自动驾驶技术',
        importance: 'high',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '英伟达',
        symbol: 'NVDA'
      },
      {
        id: '7',
        title: '亚马逊AWS re:Invent',
        time: '18:00',
        date: tomorrow.toISOString().split('T')[0],
        description: '亚马逊云服务年度大会，发布新的AI和机器学习服务',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '亚马逊',
        symbol: 'AMZN'
      },
      {
        id: '8',
        title: 'Meta Connect大会',
        time: '19:00',
        date: tomorrow.toISOString().split('T')[0],
        description: 'Meta年度开发者大会，展示VR/AR和元宇宙最新进展',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Meta',
        symbol: 'META'
      },
      {
        id: '9',
        title: '谷歌I/O开发者大会',
        time: '20:00',
        date: tomorrow.toISOString().split('T')[0],
        description: '谷歌年度开发者大会，发布Android 15和AI新功能',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '谷歌',
        symbol: 'GOOGL'
      },
      
      // 后天事件
      {
        id: '10',
        title: 'Netflix财报发布',
        time: '16:00',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        description: 'Netflix发布2024年第四季度财报，讨论订阅用户增长和内容策略',
        importance: 'high',
        market: '美股',
        impact: 'neutral',
        type: 'earnings',
        company: 'Netflix',
        symbol: 'NFLX'
      },
      {
        id: '11',
        title: 'AMD数据中心产品发布会',
        time: '18:30',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        description: 'AMD发布新一代EPYC处理器和Radeon数据中心GPU',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'AMD',
        symbol: 'AMD'
      },
      {
        id: '12',
        title: 'Salesforce Dreamforce大会',
        time: '19:00',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        description: 'Salesforce年度用户大会，展示CRM和AI新功能',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Salesforce',
        symbol: 'CRM'
      },
      {
        id: '13',
        title: '甲骨文OpenWorld大会',
        time: '20:00',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        description: '甲骨文年度技术大会，发布数据库和云服务新功能',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: '甲骨文',
        symbol: 'ORCL'
      },
      {
        id: '14',
        title: 'Adobe MAX创意大会',
        time: '21:00',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        description: 'Adobe年度创意大会，发布Creative Cloud新功能和AI工具',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Adobe',
        symbol: 'ADBE'
      },
      
      // 更多企业事件
      {
        id: '15',
        title: 'PayPal投资者日',
        time: '16:00',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'PayPal举办投资者日活动，讨论数字支付和加密货币战略',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'PayPal',
        symbol: 'PYPL'
      },
      {
        id: '16',
        title: '优步财报电话会议',
        time: '17:30',
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '优步发布季度财报，讨论网约车和外卖业务表现',
        importance: 'high',
        market: '美股',
        impact: 'neutral',
        type: 'earnings',
        company: '优步',
        symbol: 'UBER'
      },
      {
        id: '17',
        title: 'Square Block投资者大会',
        time: '18:00',
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Square Block举办投资者大会，展示金融科技和比特币业务',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Square',
        symbol: 'SQ'
      },
      {
        id: '18',
        title: 'Zoom财报发布',
        time: '16:00',
        date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Zoom发布季度财报，讨论视频会议和企业协作业务',
        importance: 'high',
        market: '美股',
        impact: 'neutral',
        type: 'earnings',
        company: 'Zoom',
        symbol: 'ZM'
      },
      {
        id: '19',
        title: 'Roku开发者大会',
        time: '19:00',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Roku举办开发者大会，展示流媒体平台新功能',
        importance: 'medium',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Roku',
        symbol: 'ROKU'
      },
      {
        id: '20',
        title: 'Spotify Wrapped发布',
        time: '20:00',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Spotify发布年度音乐总结和用户数据',
        importance: 'low',
        market: '美股',
        impact: 'positive',
        type: 'meeting',
        company: 'Spotify',
        symbol: 'SPOT'
      }
    ]
    
    if (date) {
      return events.filter(event => event.date === date)
    }
    
    return events
  }

  // 判断事件重要性
  private determineImportance(title: string): 'high' | 'medium' | 'low' {
    const highKeywords = ['财报', 'earnings', '美联储', 'fed', 'CPI', 'GDP', '非农', 'IPO', '上市']
    const mediumKeywords = ['大会', 'conference', '发布会', 'launch', '投资者', 'investor']
    
    const lowerTitle = title.toLowerCase()
    
    if (highKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'high'
    }
    if (mediumKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'medium'
    }
    return 'low'
  }

  // 判断事件影响
  private determineImpact(title: string): 'positive' | 'negative' | 'neutral' {
    const positiveKeywords = ['财报', 'earnings', '增长', 'growth', '创新', 'innovation', '突破', 'breakthrough']
    const negativeKeywords = ['下跌', 'decline', '亏损', 'loss', '裁员', 'layoff', '危机', 'crisis']
    
    const lowerTitle = title.toLowerCase()
    
    if (positiveKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'positive'
    }
    if (negativeKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'negative'
    }
    return 'neutral'
  }

  // 判断事件类型
  private determineEventType(title: string): 'earnings' | 'meeting' | 'economic' | 'dividend' | 'split' | 'ipo' {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('财报') || lowerTitle.includes('earnings')) return 'earnings'
    if (lowerTitle.includes('大会') || lowerTitle.includes('conference') || lowerTitle.includes('meeting')) return 'meeting'
    if (lowerTitle.includes('美联储') || lowerTitle.includes('fed') || lowerTitle.includes('cpi') || lowerTitle.includes('gdp')) return 'economic'
    if (lowerTitle.includes('分红') || lowerTitle.includes('dividend')) return 'dividend'
    if (lowerTitle.includes('拆股') || lowerTitle.includes('split')) return 'split'
    if (lowerTitle.includes('上市') || lowerTitle.includes('ipo')) return 'ipo'
    
    return 'meeting'
  }

  // 提取公司名称
  private extractCompanyName(title: string): string | undefined {
    const companies = ['苹果', 'Apple', '特斯拉', 'Tesla', '微软', 'Microsoft', '谷歌', 'Google', '亚马逊', 'Amazon', 'Meta', '英伟达', 'NVIDIA', 'Netflix', 'AMD', 'Salesforce', '甲骨文', 'Oracle', 'Adobe', 'PayPal', '优步', 'Uber', 'Square', 'Zoom', 'Roku', 'Spotify']
    
    for (const company of companies) {
      if (title.includes(company)) {
        return company
      }
    }
    return undefined
  }

  // 提取股票代码
  private extractSymbol(title: string): string | undefined {
    const symbolMap: Record<string, string> = {
      '苹果': 'AAPL', 'Apple': 'AAPL',
      '特斯拉': 'TSLA', 'Tesla': 'TSLA',
      '微软': 'MSFT', 'Microsoft': 'MSFT',
      '谷歌': 'GOOGL', 'Google': 'GOOGL',
      '亚马逊': 'AMZN', 'Amazon': 'AMZN',
      'Meta': 'META',
      '英伟达': 'NVDA', 'NVIDIA': 'NVDA',
      'Netflix': 'NFLX',
      'AMD': 'AMD',
      'Salesforce': 'CRM',
      '甲骨文': 'ORCL', 'Oracle': 'ORCL',
      'Adobe': 'ADBE',
      'PayPal': 'PYPL',
      '优步': 'UBER', 'Uber': 'UBER',
      'Square': 'SQ',
      'Zoom': 'ZM',
      'Roku': 'ROKU',
      'Spotify': 'SPOT'
    }
    
    for (const [company, symbol] of Object.entries(symbolMap)) {
      if (title.includes(company)) {
        return symbol
      }
    }
    return undefined
  }

  // 获取股票历史数据
  async getStockHistory(symbol: string, period: string = '1d'): Promise<Array<{time: string, price: number, volume: number}>> {
    try {
      await this.delay(300)
      
      // 生成模拟历史数据
      const data = []
      const basePrice = 150
      let currentPrice = basePrice
      
      for (let i = 0; i < 24; i++) {
        const hour = 9 + Math.floor(i / 4)
        const minute = (i % 4) * 15
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        const change = (Math.random() - 0.5) * 2
        currentPrice += change
        currentPrice = Math.max(currentPrice, basePrice * 0.95)
        currentPrice = Math.min(currentPrice, basePrice * 1.05)
        
        data.push({
          time,
          price: Number(currentPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 100000
        })
      }
      
      return data
    } catch (error) {
      console.error('获取历史数据失败:', error)
      throw new Error('获取历史数据失败')
    }
  }
  
  // 获取市场统计
  async getMarketStats(market: string = 'us'): Promise<MarketStats> {
    try {
      await this.delay(200)
      
      const stats: Record<string, MarketStats> = {
        'us': {
          total: 3247,
          rising: 1856,
          falling: 1203,
          unchanged: 188,
          volume: 4500000000,
          marketCap: 45000000000000
        },
        'cn': {
          total: 4500,
          rising: 2100,
          falling: 1800,
          unchanged: 600,
          volume: 1200000000000,
          marketCap: 80000000000000
        },
        'hk': {
          total: 2500,
          rising: 1200,
          falling: 1000,
          unchanged: 300,
          volume: 800000000000,
          marketCap: 35000000000000
        }
      }
      
      return stats[market] || stats['us']!
    } catch (error) {
      console.error('获取市场统计失败:', error)
      throw new Error('获取市场统计失败')
    }
  }
  
  // 获取板块表现
  async getSectorPerformance(market: string = 'us'): Promise<SectorPerformance[]> {
    try {
      await this.delay(300)
      
      const sectors: Record<string, SectorPerformance[]> = {
        'us': [
          { name: '科技股', change: 2.3, changePercent: 1.8, volume: 1200000000 },
          { name: '新能源', change: 1.8, changePercent: 1.2, volume: 800000000 },
          { name: '医药生物', change: -0.5, changePercent: -0.3, volume: 600000000 },
          { name: '金融', change: 0.9, changePercent: 0.6, volume: 900000000 },
          { name: '消费', change: 1.2, changePercent: 0.8, volume: 700000000 }
        ],
        'cn': [
          { name: '科技股', change: 1.5, changePercent: 1.2, volume: 800000000 },
          { name: '新能源', change: 2.1, changePercent: 1.8, volume: 600000000 },
          { name: '医药生物', change: 0.8, changePercent: 0.6, volume: 400000000 },
          { name: '金融', change: 0.3, changePercent: 0.2, volume: 500000000 },
          { name: '消费', change: 1.0, changePercent: 0.8, volume: 300000000 }
        ],
        'hk': [
          { name: '科技股', change: 1.8, changePercent: 1.5, volume: 500000000 },
          { name: '金融', change: 0.6, changePercent: 0.4, volume: 400000000 },
          { name: '地产', change: -0.3, changePercent: -0.2, volume: 300000000 },
          { name: '消费', change: 0.9, changePercent: 0.7, volume: 200000000 },
          { name: '公用事业', change: 0.4, changePercent: 0.3, volume: 150000000 }
        ]
      }
      
      return sectors[market] || sectors['us']!
    } catch (error) {
      console.error('获取板块表现失败:', error)
      throw new Error('获取板块表现失败')
    }
  }
  
  // 获取技术指标
  async getTechnicalIndicators(symbol: string): Promise<{
    ma5: number
    ma10: number
    ma20: number
    rsi: number
    macd: number
    bollinger: { upper: number, middle: number, lower: number }
  }> {
    try {
      await this.delay(200)
      
      return {
        ma5: 148.50,
        ma10: 147.80,
        ma20: 146.20,
        rsi: 65.4,
        macd: 1.2,
        bollinger: {
          upper: 152.5,
          middle: 148.0,
          lower: 143.5
        }
      }
    } catch (error) {
      console.error('获取技术指标失败:', error)
      throw new Error('获取技术指标失败')
    }
  }
  
  // 工具方法：延迟
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const stockMarketAPI = new EnhancedStockMarketAPI()
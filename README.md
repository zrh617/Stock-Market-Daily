# 股票市场情报系统

一个现代化的股票市场情报展示系统，提供实时股票数据、重要事件日历和技术分析。

## 功能特性

### 🎯 核心功能
- **多市场支持**: 美股、A股、港股情报切换
- **实时数据**: 股票价格、成交量、技术指标
- **事件日历**: 重要市场事件提醒和日程管理
- **分时图表**: 交互式股票价格走势图
- **市场概览**: 涨跌统计、热门板块分析

### 🎨 界面设计
- **现代化UI**: 基于Tailwind CSS的深色主题设计
- **响应式布局**: 适配桌面和移动设备
- **流畅动画**: 平滑的过渡效果和交互反馈
- **直观导航**: 固定顶部Tab栏，快速切换市场

### 📊 数据展示
- **股票信息**: 当前价格、涨跌幅、成交量
- **技术指标**: MA5/MA10/MA20、RSI等技术分析指标
- **市场统计**: 上涨/下跌/平盘股票数量统计
- **板块表现**: 热门板块涨跌幅排行

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图表库**: Chart.js + vue-chartjs
- **状态管理**: Pinia
- **路由**: Vue Router

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── TabBar.vue      # 顶部Tab导航栏
│   ├── EventCalendar.vue # 事件日历组件
│   └── StockChart.vue  # 股票图表组件
├── views/              # 页面目录
│   └── StockMarketView.vue # 主页面
├── services/           # API服务
│   └── stockMarketAPI.ts   # 股票数据API
├── assets/             # 静态资源
│   └── main.css        # 全局样式
└── router/             # 路由配置
    └── index.ts
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 组件说明

### TabBar 组件
- 固定顶部导航栏
- 支持美股、A股、港股切换
- 主题切换按钮
- 响应式设计

### EventCalendar 组件
- 周视图事件日历
- 重要事件标记（高/中/低重要性）
- 周导航功能
- 实时数据加载

### StockChart 组件
- 交互式分时图
- 多股票切换
- 技术指标显示
- 实时数据刷新

## API 服务

### stockMarketAPI 服务
提供以下API接口：

- `getStockQuote(symbol)`: 获取股票实时报价
- `getStockHistory(symbol)`: 获取股票历史数据
- `getMarketEvents(date)`: 获取市场事件
- `getMarketStats(market)`: 获取市场统计
- `getSectorPerformance(market)`: 获取板块表现
- `getTechnicalIndicators(symbol)`: 获取技术指标

## 样式定制

项目使用Tailwind CSS，支持自定义主题：

```css
/* 自定义颜色 */
:root {
  --primary-500: #facc15;
  --dark-900: #0f172a;
  --dark-800: #1e293b;
}
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开发计划

- [ ] 添加更多技术指标
- [ ] 支持股票搜索和收藏
- [ ] 添加新闻资讯模块
- [ ] 实现用户个性化设置
- [ ] 添加移动端优化

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进项目！
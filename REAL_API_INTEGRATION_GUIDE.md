# 真实API集成指南

本项目已集成以下真实数据源和AI模型，用于获取最新的A股数据、事件和AI预测。

## 📊 数据源配置

### 1. **Tushare Pro**（推荐，专业A股数据）
- **官网**: https://tushare.pro/
- **注册**: 需要注册并获取Token
- **优势**: 
  - 专业A股数据接口
  - 包含财报、业绩预告、公告等完整数据
  - 数据准确且及时
- **配置步骤**:
  1. 访问 https://tushare.pro/register 注册账号
  2. 获取Token（在用户中心查看）
  3. 在项目根目录创建`.env`文件，添加：
     ```
     VITE_TUSHARE_PRO_TOKEN=your_tushare_token_here
     ```

### 2. **东方财富Choice API**
- **官网**: https://choice.eastmoney.com/
- **优势**: 专业金融数据平台，数据全面
- **配置**:
   ```
   VITE_EASTMONEY_TOKEN=your_eastmoney_token_here
   ```

### 3. **金十数据API**（财经事件）
- **官网**: https://www.jin10.com/
- **优势**: 专业的财经日历和事件数据
- **配置**:
   ```
   VITE_JIN10_KEY=your_jin10_api_key_here
   ```

### 4. **雪球API**（无需密钥）
- **官网**: https://xueqiu.com/
- **说明**: 免费使用，但可能需要处理反爬虫机制

### 5. **同花顺API**（无需密钥）
- **官网**: https://www.10jqka.com.cn/
- **说明**: 公开数据接口，可直接使用

## 🤖 AI模型配置

### 1. **DeepSeek API**（推荐）
- **官网**: https://www.deepseek.com/
- **优势**: 价格实惠，性能优秀
- **配置步骤**:
  1. 访问 https://platform.deepseek.com/ 注册账号
  2. 创建API密钥
  3. 在`.env`文件中添加：
     ```
     VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
     ```

### 2. **Qwen API**（通义千问）
- **官网**: https://dashscope.aliyun.com/
- **优势**: 阿里云官方AI服务
- **配置**:
   ```
   VITE_QWEN_API_KEY=your_qwen_api_key_here
   ```

## 📝 完整配置示例

在项目根目录创建`.env`文件：

```env
# Tushare Pro - A股数据
VITE_TUSHARE_PRO_TOKEN=your_tushare_token

# 东方财富Choice
VITE_EASTMONEY_TOKEN=your_eastmoney_token

# 金十数据 - 财经事件
VITE_JIN10_KEY=your_jin10_key

# DeepSeek - AI预测
VITE_DEEPSEEK_API_KEY=your_deepseek_key

# Qwen - AI预测（备用）
VITE_QWEN_API_KEY=your_qwen_key
```

## 🔄 API优先级

### **A股股票数据**
1. Tushare Pro（如果配置）
2. 东方财富Choice API（如果配置）
3. 雪球API（免费，无需配置）
4. 模拟数据（备用）

### **A股事件数据**
1. Tushare Pro财报接口（如果配置）
2. 金十数据API（如果配置）
3. 同花顺API（免费）
4. 模拟数据（备用）

### **AI股票预测**
1. DeepSeek API（如果配置）
2. Qwen API（如果配置）
3. 智能模拟数据（基于真实价格）

## 🚀 使用说明

1. **配置API密钥**：按照上述步骤获取并配置API密钥
2. **重启开发服务器**：修改`.env`后需要重启
3. **检查控制台**：如果有API调用失败，会在控制台显示警告
4. **验证数据**：检查页面显示的数据是否为真实数据

## ⚠️ 注意事项

- `.env`文件不要提交到Git（已在`.gitignore`中排除）
- API调用频率限制：某些免费API有调用频率限制
- 数据延迟：免费API可能有15-20分钟的数据延迟
- CORS问题：某些API可能需要通过代理服务器调用

## 📚 API文档链接

- [Tushare Pro文档](https://tushare.pro/document/2)
- [DeepSeek API文档](https://platform.deepseek.com/api-docs/)
- [Qwen API文档](https://help.aliyun.com/zh/model-studio/developer-reference/api-details-9)
- [金十数据API文档](https://www.jin10.com/help/api.html)


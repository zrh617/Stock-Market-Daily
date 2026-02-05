import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      // 代理雪球/蛋卷基金API，解决CORS问题
      '/api/danjuan': {
        target: 'https://danjuanfunds.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/danjuan/, '/djapi'),
        headers: {
          'Referer': 'https://danjuanfunds.com',
          'Origin': 'https://danjuanfunds.com',
        },
      },
      // 代理新浪财经API
      '/api/sina': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina/, ''),
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
      },
      // 代理同花顺/爱基金API
      '/api/tonghuashun': {
        target: 'http://api.fund.10jqka.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tonghuashun/, ''),
        headers: {
          'Referer': 'http://fund.10jqka.com.cn',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

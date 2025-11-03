import { createRouter, createWebHistory } from 'vue-router'
import StockMarketView from '../views/StockMarketView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stock-market',
      component: StockMarketView,
    }
  ],
})

export default router

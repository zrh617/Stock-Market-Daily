import { createRouter, createWebHistory } from 'vue-router'
import StockMarketView from '../views/StockMarketView.vue'
import FundView from '../views/FundView.vue'
import Index from '../views/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stock-market',
      // component: StockMarketView,
      component: Index,
    },
    {
      path: '/fund',
      name: 'fund',
      component: FundView,
    },
    {
      path: '/:market(us|cn|hk)',
      name: 'market',
      component: StockMarketView,
    },
  ],
})

export default router

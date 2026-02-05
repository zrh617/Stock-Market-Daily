<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700/50 shadow-lg"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div
            class="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 text-dark-900"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <h1
            class="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent"
          >
            股票市场情报
          </h1>
        </div>

        <!-- Tab Navigation -->
        <nav class="flex space-x-1 bg-dark-800/50 rounded-lg sm:rounded-xl p-1 backdrop-blur-sm">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="setActiveTab(tab.id)"
            :class="[
              'relative px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 transform text-xs sm:text-sm',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-dark-900 shadow-lg shadow-primary-500/25 scale-105'
                : 'text-gray-300 hover:text-gray-100 hover:bg-dark-700/50 hover:scale-102',
            ]"
          >
            <span class="relative z-10">{{ tab.name }}</span>
            <div
              v-if="activeTab === tab.id"
              class="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-md sm:rounded-lg opacity-20 animate-pulse"
            ></div>
          </button>
        </nav>

        <!-- Theme Toggle & Settings -->
        <div class="flex items-center space-x-1 sm:space-x-2">
          <button
            @click="toggleTheme"
            class="p-1.5 sm:p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 hover:text-primary-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </button>
          <div class="w-px h-4 sm:h-6 bg-dark-600 hidden sm:block"></div>
          <div class="text-xs text-gray-400 hidden sm:block">
            {{ new Date().toLocaleDateString('zh-CN') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Tab {
  id: string
  name: string
}

const tabs: Tab[] = [
  { id: 'us', name: '美股情报' },
  { id: 'cn', name: 'A股情报' },
  { id: 'hk', name: '港股情报' },
  { id: 'fund', name: '基金情报' },
]

const route = useRoute()
const activeTab = ref<string>('us')

// 根据路由更新激活标签
const updateActiveTabFromRoute = () => {
  const path = route.path
  if (path === '/fund') {
    activeTab.value = 'fund'
  } else if (path.startsWith('/cn')) {
    activeTab.value = 'cn'
  } else if (path.startsWith('/hk')) {
    activeTab.value = 'hk'
  } else {
    activeTab.value = 'us'
  }
}

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
  // 触发父组件事件
  emit('tab-change', tabId)
}

const toggleTheme = () => {
  // 主题切换逻辑
  console.log('切换主题')
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateActiveTabFromRoute()
  }
)

onMounted(() => {
  updateActiveTabFromRoute()
})

const emit = defineEmits<{
  'tab-change': [tabId: string]
}>()
</script>

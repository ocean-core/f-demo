import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'leaflet/dist/leaflet.css'

// 确保 proj4 库在全局可用，这有助于解决构建问题
import proj4 from 'proj4'
window.proj4 = proj4

// 修复Leaflet图标问题
import L from 'leaflet'

// 防止在构建中出现问题的安全处理
try {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
} catch (e) {
  console.warn('无法设置Leaflet默认图标', e)
}

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err)
  console.log('错误信息:', info)
}

app.mount('#app')

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // minify: false, // 关闭压缩
    // sourcemap: true,
    commonjsOptions: {
      // 处理CommonJS模块转换选项
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      // 不再外部化处理
      output: {
        manualChunks: {
          // 将地理空间依赖分离到单独的chunk
          georaster: ['georaster', 'georaster-layer-for-leaflet'],
          leaflet: ['leaflet'],
          vendor: ['vue', 'date-fns']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['leaflet', 'proj4', 'georaster', 'georaster-layer-for-leaflet'], // 明确包含需要处理的库
    exclude: ['proj4-fully-loaded'] // 排除有问题的库
  },
  resolve: {
    alias: {
      // 添加别名，解决某些包的引用问题
      'proj4-fully-loaded': resolve(__dirname, './src/utils/proj4-shim.js'),
      'geomask': resolve(__dirname, './src/utils/geomask-shim.js')
    }
  }
})



# 洪水域名监测系统

基于Vue3+Vite开发的洪水域名单页应用，使用Leaflet和GeoRaster进行地图和空间数据可视化。

## 功能特点

- 地图铺满整个页面，清晰展示洪水数据
- 左侧透明面板提供河流深度、洪水深度等数据切换按钮
- 底部颜色图例展示不同值的颜色对应关系
- 点击地图任意点可查看经纬度、河流深度、洪水深度等详细信息
- 右侧透明面板展示预警数据
- 顶部日期选择栏可切换不同日期的数据
- 支持Cloud Optimized GeoTIFF（COG）文件的加载和展示

## 技术栈

- Vue 3 + Vite - 高效的现代前端框架
- Leaflet - 轻量级开源地图库
- GeoRaster - 栅格数据处理和可视化
- DateFns - 日期处理库
- Axios - HTTP请求

## 运行说明

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产环境版本
npm run build
```

## 数据源

应用程序从本地服务器获取GeoTIFF数据：
- public/data
  - o_rivdph2001_20011229.tif
  - o_rivdph2001_20011230.tif


请确保在运行应用程序前，相应的数据服务已启动。

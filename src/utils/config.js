/**
 * 环境配置文件
 * 处理不同环境下的API URL和其他配置
 */

// 判断当前环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 基础配置
const config = {
  // API相关
  api: {
    // 开发环境使用本地服务器，生产环境使用相对路径
    baseUrl: isDevelopment ? 'http://127.0.0.1:8003' : './data',
  },

  // 地图相关
  map: {
    // 初始地图中心点
    center: [30, 110],
    // 初始缩放级别
    zoom: 4,
    // 底图URL
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    // 底图属性
    tileLayerAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // TIF文件元数据
  tifMeta: {
    // 栅格尺寸
    width: 1440,
    height: 720,
    // 边界
    bounds: {
      left: -180,
      bottom: -90,
      right: 180,
      top: 90
    },
    // 分辨率
    resolution: 0.25,
    // NoData值
    noDataValue: 1.0000000200408773e+20
  }
};

export default config; 
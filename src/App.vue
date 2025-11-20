<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { format, parse } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import { initMap, updateMapLayer, getPixelValue } from './utils/mapService';

// 可选日期列表（从TIF文件名提取）
const availableDates = ref([
  'o_rivdph2001_20011229.tif',
  'o_rivdph2001_20011230.tif'
]);

const dataDomain = ''

// 选择的日期
const selectedDate = ref(availableDates.value[0]);

// 图层选项
const layerOptions = ref([
  { id: 'riverDepth', label: '河流深度', unit: 'm' },
  { id: 'floodDepth', label: '洪水深度', unit: 'm' }
]);

// 当前激活的图层
const activeLayer = ref('riverDepth');

// 图例范围
const legendRange = ref([0, 45]); // 根据数据动态调整

// 点击位置信息
const pointInfo = ref({
  visible: false,
  x: 0,
  y: 0,
  lng: 0,
  lat: 0,
  riverDepth: 0,
  floodDepth: 0
});

// 预警信息
const warnings = ref([
  {
    level: 'danger',
    title: '持续降雨注意',
    content: '未来3天预计降雨量达120mm，可能导致局部地区积水。',
    time: '2025-03-01 08:30'
  },
  {
    level: 'warning',
    title: '洪水预警',
    content: '河流水位上涨，预计将在24小时内达到警戒线',
    time: '2025-03-02 09:12'
  },
]);

// 地图对象
let map;
let currentLayer;

// 日期格式化
const formatDate = (filename) => {
  if (!filename) return '';
  const dateStr = filename.match(/\d{8}/)?.[0];
  if (!dateStr) return filename;

  try {
    const dateObj = parse(dateStr, 'yyyyMMdd', new Date());
    return format(dateObj, 'yyyy-MM-dd');
  } catch (e) {
    return dateStr;
  }
};

// 获取当前图层标签
const getActiveLayerLabel = () => {
  const layer = layerOptions.value.find(l => l.id === activeLayer.value);
  return layer ? layer.label : '';
};

// 获取当前图层单位
const getActiveLayerUnit = () => {
  const layer = layerOptions.value.find(l => l.id === activeLayer.value);
  return layer ? layer.unit : '';
};

// 设置当前图层
const setActiveLayer = (layerId) => {
  activeLayer.value = layerId;
  updateMapLayer(map, `${dataDomain}/data/${selectedDate.value}`, activeLayer.value);
};

// 日期改变事件
const onDateChange = () => {
  updateMapLayer(map, `${dataDomain}/data/${selectedDate.value}`, activeLayer.value);
};

// 关闭位置信息弹窗
const closePointInfo = () => {
  pointInfo.value.visible = false;
};

// 地图点击事件处理
const handleMapClick = (e) => {
  const { lat, lng } = e.latlng;

  // 获取点击位置的像素值（这个需要通过GeoRaster库实现）
  getPixelValue(lat, lng, selectedDate.value).then(values => {
    pointInfo.value = {
      visible: true,
      x: e.originalEvent.pageX,
      y: e.originalEvent.pageY,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
      riverDepth: values.riverDepth.toFixed(2),
      floodDepth: values.floodDepth.toFixed(2)
    };
  });
};

// 组件挂载后初始化
onMounted(() => {
  // 初始化地图
  map = initMap('map-container', handleMapClick);

  // 加载初始图层
  updateMapLayer(map, `${dataDomain}/data/${selectedDate.value}`, activeLayer.value);
});

// 监听图层变更，更新图例颜色
watch(activeLayer, () => {
  const legendGradient = document.querySelector('.legend-gradient');
  if (legendGradient) {
    if (activeLayer.value === 'riverDepth') {
      legendGradient.style.background = 'linear-gradient(to right, #d4f1f9, #75c6ef, #1077c3, #064273)';
    } else {
      legendGradient.style.background = 'linear-gradient(to right, #e5f5e0, #a1d99b, #31a354, #006837)';
    }
  }
});
</script>

<template>
  <div class="app-container">
    <!-- 顶部日期选择栏 -->
    <div class="top-bar">
      <div class="logo">洪水监测系统</div>
      <div class="date-selector">
        <label for="date-select">选择日期:</label>
        <select id="date-select" v-model="selectedDate" @change="onDateChange">
          <option v-for="date in availableDates" :key="date" :value="date">{{ formatDate(date) }}</option>
        </select>
      </div>
    </div>

    <!-- 左侧控制面板 -->
    <div class="left-panel">
      <h3>数据图层</h3>
      <div class="layer-buttons">
        <button v-for="layer in layerOptions" :key="layer.id" :class="{ active: activeLayer === layer.id }"
          @click="setActiveLayer(layer.id)">
          {{ layer.label }}
        </button>
      </div>

      <!-- 颜色图例 -->
      <div class="color-legend">
        <h4>{{ getActiveLayerLabel() }} ({{ getActiveLayerUnit() }})</h4>
        <div class="legend-container">
          <div class="legend-gradient"></div>
          <div class="legend-labels">
            <span>{{ legendRange[0] }}</span>
            <span>{{ legendRange[1] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="map-container"></div>

    <!-- 右侧预警面板 -->
    <div class="right-panel">
      <h3>预警信息</h3>
      <div class="warning-list">
        <div v-if="warnings.length === 0" class="no-warnings">暂无预警信息</div>
        <div v-for="(warning, index) in warnings" :key="index" class="warning-item" :class="warning.level">
          <div class="warning-title">{{ warning.title }}</div>
          <div class="warning-content">{{ warning.content }}</div>
          <div class="warning-time">{{ warning.time }}</div>
        </div>
      </div>
    </div>

    <!-- 点击位置信息弹窗 -->
    <div v-if="pointInfo.visible" class="point-info" :style="{ left: pointInfo.x + 'px', top: pointInfo.y + 'px' }">
      <div class="point-info-header">
        <span>位置信息</span>
        <button class="close-btn" @click="closePointInfo">×</button>
      </div>
      <div class="point-info-content">
        <div class="info-row">
          <span class="info-label">经度:</span>
          <span class="info-value">{{ pointInfo.lng }}°</span>
        </div>
        <div class="info-row">
          <span class="info-label">纬度:</span>
          <span class="info-value">{{ pointInfo.lat }}°</span>
        </div>
        <div class="info-row">
          <span class="info-label">河流深度:</span>
          <span class="info-value">{{ pointInfo.riverDepth }} m</span>
        </div>
        <div class="info-row">
          <span class="info-label">洪水深度:</span>
          <span class="info-value">{{ pointInfo.floodDepth }} m</span>
        </div>
        <div class="info-row">
          <span class="info-label">日期:</span>
          <span class="info-value">{{ formatDate(selectedDate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: white;
}

#map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 顶部条样式 */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-selector select {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  backdrop-filter: blur(5px);
}

/* 左侧面板样式 */
.left-panel {
  position: absolute;
  top: 80px;
  left: 20px;
  width: 250px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.left-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
}

.layer-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.layer-buttons button {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.layer-buttons button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.layer-buttons button.active {
  background-color: rgba(52, 152, 219, 0.7);
  border-color: rgba(52, 152, 219, 0.8);
}

/* 颜色图例 */
.color-legend {
  margin-top: 20px;
}

.color-legend h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: normal;
}

.legend-container {
  margin-top: 10px;
}

.legend-gradient {
  height: 20px;
  width: 100%;
  background: linear-gradient(to right, #d4f1f9, #75c6ef, #1077c3, #064273);
  border-radius: 4px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 右侧面板样式 */
.right-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 300px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.right-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.warning-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 15px;
  position: relative;
  border-left: 4px solid #f39c12;
}

.warning-item.warning {
  border-left-color: #f39c12;
}

.warning-item.danger {
  border-left-color: #e74c3c;
}

.warning-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 16px;
}

.warning-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin-bottom: 10px;
}

.warning-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.no-warnings {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 20px 0;
}

/* 点击信息弹窗 */
.point-info {
  position: absolute;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 10px;
  min-width: 250px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -100%);
  margin-top: -15px;
}

.point-info:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  margin-left: -10px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent;
}

.point-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: white;
}

.point-info-content {
  padding: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  font-weight: 500;
}
</style>

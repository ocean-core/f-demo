/**
 * geomask垫片文件
 * 用于解决构建过程中geomask库的依赖问题
 */

// 简化版的geomask功能
const geomask = {
  // 一个简单的多边形裁剪函数，实际使用时可能需要更复杂的实现
  mask: function (raster, geometry) {
    console.warn('使用geomask-shim替代版本，功能可能受限');
    // 如果实际项目需要，可以在这里实现简单的裁剪逻辑
    return raster;
  },

  // 添加其他可能需要的方法
  getGeometryBounds: function (geometry) {
    if (!geometry) return null;

    // 简单实现，获取几何对象的边界
    if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates.length > 0) {
      const coords = geometry.coordinates[0];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      for (const [x, y] of coords) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      return [minX, minY, maxX, maxY];
    }

    return null;
  }
};

export default geomask; 
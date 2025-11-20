/**
 * proj4-fully-loaded垫片文件
 * 用于解决构建过程中proj4-fully-loaded的依赖问题
 */
import proj4 from 'proj4';

// 添加常用的坐标系定义
// EPSG:4326 WGS84 (标准经纬度)
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
// EPSG:3857 Web Mercator (网页墨卡托)
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');

// 导出修改后的proj4对象
const proj4js = proj4;

// 确保所有必要的方法都存在
if (!proj4js.defs) {
  console.warn('proj4.defs方法不可用，使用替代方案');
  proj4js.defs = function (name, def) {
    if (arguments.length === 1) {
      return proj4js.WGS84;
    }
    proj4js[name] = def;
    return proj4js[name];
  };
}

export default proj4js; 
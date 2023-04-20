import request from '@/common-scripts/request';

// 资产基本信息
export function postAssetInfo(data) { return request({ url: '/api/threat/asset/qryAssetByIp', method: 'post', data }) }

// 资产额外信息
export function postAssetExInfo(data) { return request({ url: '/api/threat/asset/qryAssetExtInfo', method: 'post', data }) }

// 资产分组信息
export function postGroupSelect(data) { return request({ url: '/api/asset/catalog/list', method: 'post', data }) }

// 设置分组
export function setAssetGroup(data) { return request({ url: '/api/threat/asset/setAssetGroup', method: 'post', clearCache: true, data }) }

// 设置备注
export function setAssetRemark(data) { return request({ url: '/api/search/batchUpdateData', method: 'post', clearCache: true, data }) }

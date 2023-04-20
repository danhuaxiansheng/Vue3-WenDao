import request from '@/common-scripts/request';

// 获取侧边栏菜单配置
export function menuTree(data) { return request({ url: '/api/asset/catalog/tree', method: 'post', data }) }

// 添加侧边栏分组
export function addTreeNode(data) { return request({ url: '/api/asset/catalog/add', method: 'post', data }) }

// 拖动树节点
export function updateTreeNode(data) { return request({ url: '/api/asset/catalog/update', method: 'post', data }) }

// 编辑侧边栏分组
export function editTreeNode(data) { return request({ url: '/api/asset/catalog/update', method: 'post', data }) }

// 删除侧边栏分组
export function deleteTreeNode(data) { return request({ url: '/api/asset/catalog/delete', method: 'post', data }) }

// 获取卡片数据
export function getResData(data, url = '/api/threat/asset/qryAssetList') { return request({ url, method: 'post', data }) }

// 获取资产
export function getAssetGroup(data) { return request({ url: '/api/asset/catalog/list', method: 'post', data }) }

// 添加资产
export function addAsset(data) { return request({ url: '/api/threat/asset/addAsset', method: 'post', data }) }

//添加资产备注
export function setAssetNote(data) { return request({ url: '/api/search/batchUpdateData', method: 'post', clearCache: true, data }) }

// 设置资产分组
export function setAssetGroup(data, url = '/api/threat/asset/setAssetGroup') { return request({ url, method: 'post', data }) }

// 刪除资产
export function delAsset(data, url = '/api/threat/asset/delAsset') { return request({ url, method: 'post', data }) }

// 获取拓扑图关系
export function tuoGraph(data) { return request({ url: '/api/threat/asset/qryAssetConnectionGraph', method: 'post', data }) }

// 获取拓扑图表格
export function tuoTable(data) { return request({ url: '/api/threat/asset/qryAssetConnectionList', method: 'post', data }) }

// 获取下拉菜单选项
export function getSearchMap(data) { return request({ url: '/api/asset1126/SearchBarMapping', method: 'post', data }) }

// 编辑资产-表格模式
export function updateAsset(data, url = '/api/asset1126/addAsset') { return request({ url, method: 'post', data }) }

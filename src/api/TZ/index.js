import request from '@/common-scripts/request';

// 获取页面searchbar配置
export function getSearchBarOpt(data) { return request({ url: '/external/moduleField/list', method: 'post', data }) }

// 获取用户标签界面下拉列表
export function getUserTagList(data, url = '/api/common/qryUserTagSelectLabel') { return request({ url, method: 'post', data }) }

// 获取 数据详情模块-显示列
export function getModuleField(data) { return request({ url: '/external/moduleField/moduleColumns', clearCache: true, method: 'post', data }) }

// 新增历史记录
export function addHistory(data) { return request({ url: '/api/professional/insertHistory', method: 'post', data }) }

// 获取历史记录
export function findHistory(data) { return request({ url: '/api/professional/findHistory', method: 'post', data }) }

// 删除历史记录
export function deleteHistory(data) { return request({ url: '/api/professional/deleteHistory', method: 'post', data }) }

// 新增收藏记录
export function addCollect(data) { return request({ url: '/api/professional/indexUpdateCollect', method: 'post', clearCache: true, data }) }

// 新增书签
export function addBook(data) { return request({ url: '/api/professional/addBookMark', method: 'post', data }) }

// 获取收藏记录
export function findCollect(data) { return request({ url: '/api/professional/getCollectList', method: 'post', data }) }

// 删除收藏记录
export function deleteCollect(data) { return request({ url: '/api/professional/deleteCollect', method: 'post', data }) }

// 设置默认收藏
export function setDefaultCollect(data) { return request({ url: '/api/professional/defaultCollect', method: 'post', data }) }
export function setCancelCollect(data) { return request({ url: '/api/professional/cancelDefault', method: 'post', data }) }

// 获取表格数据
export function getTableData(params) {
    return request({
        url: params.url || '/api/search/singleCommon',
        method: 'post', data: params.data,

        // 非必要 
        // clearCache 是否对相同url请求进行中断
        clearCache: params.clearCache,
        // key标识 防止不同场景下的请求 被一并中断
        cacheName: params.cacheName,
    })
}
// 导出ES数据
export function exportEsData(data) { return request({ url: '/api/file/searchExcel', method: 'post', clearCache: true, data }) }
// 查询所有标签信息
export function loadTagsData(data) { return request({ url: '/api/dataBase/find', method: 'post', data }) }
// 添加用户标签
export function addUserTag(data, url = '/api/communal/userTag') { return request({ url: url, method: 'post', clearCache: true, data }) }
// 添加自定义标签
export function addCustomTag(data) { return request({ url: '/api/dataBase/add', method: 'post', clearCache: true, data }) }
// 设置显示列
export function setColumns(data) { return request({ url: '/external/module/saveDisplayColumns', method: 'post', clearCache: true, data }) }
// 删除数据 - ES
export function deleteEs(data, url = '/api/search/batchDeleteByUpdate') { return request({ url, method: 'post', clearCache: true, data }) }
// 删除数据 - 数据库
export function deleteDb(data, url = '/api/dataBase/update') { return request({ url, method: 'post', clearCache: true, data }) }

// 修改风险等级
export function modifyRisk(data) { return request({ url: '/api/communal/modifyRisk', method: 'post', data }) }
// 获取 数据包详情
export function getPackages(data) { return request({ url: '/api/transfer/getPackages', method: 'post', clearCache: true, data }) }
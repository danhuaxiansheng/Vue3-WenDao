import request from '@/common-scripts/request';

// 获取模块数量
export function getModules() { return request({ url: '/auth/external/user/retrieveClassify', method: 'post' }) }
// 获取全库数据统计
export function getEchartData(data) { return request({ url: '/api/retrieve/oneKeySearchHome', method: 'post', data }) }
// 查询接口
export function mainSearch(data) { return request({ url: '/api/retrieve/find', method: 'post', data }) }
// 聚类统计-字段
export function clusterFields(data) { return request({ url: '/api/retrieve/groupField', method: 'post', data }) }
// 聚类统计-查询结果
export function clusterSearch(data) { return request({ url: '/api/search/groupSearch', method: 'post', data }) }



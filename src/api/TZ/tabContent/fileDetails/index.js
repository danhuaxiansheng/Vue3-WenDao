import request from '@/common-scripts/request';

//获取分析报告
export function getDynamicReport(data) { return request({ url: '/api/file/dynaReportFile', method: 'post', clearCache: true, data }) }
// 获取网络访问统计
export function getNetworkData(data) { return request({ url: '/api/search/network', method: 'post', data }) }
// 关联附件查询
export function relateAttachment(data, url) { return request({ url, method: 'post', clearCache: true, data }) }
// 关联静态详情
export function relateStaticResult(data) { return request({ url: "/api/search/singleCommon", method: 'post', clearCache: true, data }) }
// 预览文件/附件
export function previewFileData(data) { return request({ url: '/api/file/filePreview', method: 'post', clearCache: true, data }) }
// 下载文件/附件
export function downloadFileData(data, url = '/api/file/download') { return request({ url, method: 'post', clearCache: true, data }) }
// 下载分析报告
export function downloadReportData(data, url = '/api/file/findAnalysis') { return request({ url, method: 'post', clearCache: true, data }) }
// 更新网络访问数据
export function updateNetworkData(data) { return request({ url: '/api/search/updateArray', method: 'post', clearCache: true, data }) }
// 删除网络访问数据
export function deleteNetworkData(data) { return request({ url: '/api/search/deleteArray', method: 'post', clearCache: true, data }) }
// 新增网络访问数据
export function addNetworkData(data) { return request({ url: '/api/search/addArray', method: 'post', clearCache: true, data }) }




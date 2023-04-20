import request from '@/common-scripts/request';

// 获取规则聚类信息
export function postAggList(url, data) { return request({ url, method: 'post', data }) }

// 编辑规则
export function updateRule(url, data) { return request({ url, method: 'post', data }) }

// 编辑规则
export function singleAddRule(url, data) { return request({ url, method: 'post', data }) }

// 删除规则
export function deleteRule(url, data) { return request({ url, method: 'post', data }) }

// 批量导入规则
export function batchImportRules(url, data) { return request({ url, method: 'post', data }) }
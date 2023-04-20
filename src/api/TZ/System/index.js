//综合设置系统-api 
import request from '@/common-scripts/request';

// 新增规则（单条）
export function updateRule(data, url = '/api/malicious/addRule') { return request({ url, method: 'post', data }) }

// WAF规则-是否启用
export function isEnableStatus(data, url = '/api/waf/sw') { return request({ url, method: 'post', data }) }

// 邮件过滤-邮件过滤规则-api
export function batchAdd(data) { return request({ url: '/api/dataBase/batchAdd', method: 'post', data }) }
export function getGlobal(data) { return request({ url: '/api/dataBase/find', method: 'post', data }) }
export function setGlobal(data) { return request({ url: '/api/dataBase/batchUpdate', method: 'post', data }) }
// 文件检测配置- api
export function getFileTypes() { return request({ url: '/api/transfer/getFileTypes', method: 'post' }) }
export function saveFileTypes(data) { return request({ url: '/api/transfer/saveFileTypes', method: 'post', data, clearCache: true }) }
export function modifyFileTypes(data) { return request({ url: '/api/transfer/modifyFileTypes', method: 'post', data, clearCache: true }) }




//恶意码址系统-api 
import request from '@/common-scripts/request';

// 新增规则（单条）
export function updateRule(data, url = '/api/malicious/addRule') { return request({ url, method: 'post', data }) }
// 批量导入
export function batchUploadRules(data) { return request({ url: '/api/file/insertBatch', method: 'post', data }) }
// WAF规则-是否启用
export function isEnableStatus(data, url = '/api/waf/sw') { return request({ url, method: 'post', data }) }
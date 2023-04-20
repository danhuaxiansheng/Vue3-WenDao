//恶意邮件检测-api 
import request from '@/common-scripts/request';
// 木马邮件 - api
export function postDetection(data) { return request({ url: '/api/mail/check/detection', method: 'post', data }) }
export function postLifeCircle(data) { return request({ url: '/api/search/riskLevelPeriod', method: 'post', data }) }



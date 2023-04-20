import request from '@/common-scripts/request';

//获取邮件详情
export function getEmlDetails(data) { return request({ url: '/api/mail/check/searchEmlAtt', method: 'post', clearCache: true, data }) }
// 添加邮件审计
export function addEmlBrowse(data) { return request({ url: '/api/dataBase/addEmlBrowse', method: 'post', data }) }




import request from '@/common-scripts/request';

// 获取系统logo
export function qrySystemLogo(data) { return request({ url: '/auth/common/qrySystemLogo', method: 'post', data }) }

// 获取系统名称
export function qrySystemName(data) { return request({ url: '/auth/common/qrySystemName', method: 'post', data }) }

// 获取系统版本号
export function qrySystemVersion() { return request({ url: '/maintain/tzdj/version', method: 'get' }) }

// 获取系统Icon
export function getIcon(url, data) { return request({ url, method: 'post', data }) }

// 获取证书状态
export function licenseState() { return request({ url: '/auth/authorization/licenseState', method: 'post' }) }

// 获取证书详情
export function getCertInfo() { return request({ url: '/auth/authorization/licenseBasicInfo', method: 'post' }) }

// 获取证书序列号
export function getCertKey() { return request({ url: '/auth/authorization/licenseMc', method: 'post' }) }

// 上传证书
export function uploadCert(params) { return request({ url: '/auth/authorization/licenseUpload', method: 'post', data: params, headers: { 'Content-Type': 'multipart/form-data' } }) }

// 效验证书
export function verificationCert() { return request({ url: '/auth/authorization/licenseVerification', method: 'post' }) }

// 下载证书
export function downCert() { return request({ url: '/auth/authorization/licenseDownload', method: 'get' }) }

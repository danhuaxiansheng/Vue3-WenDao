import request from '@/common-scripts/request';

export function getApkCode(data) { return request({ url: '/api/qx/getIpCode', method: 'post', data }) }

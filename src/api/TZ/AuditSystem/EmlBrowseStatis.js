import request from '@/common-scripts/request';

// 资产基本信息
export function postEmlBrowse(data) { return request({ url: '/api/dataBase/find', method: 'post', data }) }
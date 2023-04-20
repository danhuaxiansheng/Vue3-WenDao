import request from '@/common-scripts/request';

//查询 响应详情 
export function generalQuery(data) { return request({ url: '/api/search/generalQuery', method: 'post', data }) }
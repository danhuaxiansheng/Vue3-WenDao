import request from '@/common-scripts/request';

// 获取页面searchbar配置
export function getDataList(data) {
    return request({
        url: '/auth/admin/node/list',
        method: 'post', data
    })
}
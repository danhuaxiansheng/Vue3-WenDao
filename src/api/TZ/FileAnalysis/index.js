//文件深度系统-api 
import request from '@/common-scripts/request';
// 风险统计/分析状态
export function homePage(data) { return request({ url: '/api/search/homePage', method: 'post', data }) }
// 文件类型分布
export function fileType(data) { return request({ url: '/api/search/singleCommon', method: 'post', data }) }
// 任务解析状态
export function taskState(data) { return request({ url: '/api/dataBase/tbUploadTask', method: 'post', data }) }

// 批量导入
export function deleteDBData(data) { return request({ url: '/api/dataBase/delete', method: 'post', data }) }
// 文件上传，可获取上传进度
export function uploadFileData(data, onUploadProgress) {
    return request({
        url: '/api/file/upload',
        method: 'post',
        // headers: { 'Content-Type': 'multipart/form-data' },
        // responseType: 'blob',
        data,
        onUploadProgress
    })
}


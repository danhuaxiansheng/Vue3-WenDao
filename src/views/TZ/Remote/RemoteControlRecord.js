module.exports = {
    // toolbar参数
    toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [
            // 导出选中数据
            { field: "base_exportSelect" },
            // 导出搜索结果
            { field: "base_more" },
            // 我的收藏
            { field: "base_myCollect" },
        ]
    },
    //tabContent 配置
    tabConfig: {
        isEnable: true,
        options: {
            riskDetails: {
                isEnable: true,
                text: "数据详情",
                options: {
                    riskLevel: {
                        isEnable: true,
                        btns: [
                            { field: "base_exportData" },
                        ]
                    },
                    userTag: { isEnable: false, },    // 用户标签
                }
            },
            dataFlow: {
                isEnable: true,
            }
        }
    }
}
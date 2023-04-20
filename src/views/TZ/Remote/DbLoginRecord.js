module.exports = {
    // toolbar参数
    toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [
            // 导出选中数据
            { field: "base_exportSelect" },
            // 导出搜索结果
            { field: "base_exportSearch", icon: "iconfont icon-export" },
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
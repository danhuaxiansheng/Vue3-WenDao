module.exports = {
    searchOptions: {
        time: {
            field: "@createtime",
            title: "入库时间",
            defualtOptions: "最近30分钟",
            clearable: false,
            global: false,   // 应用全局-功能按钮
        }
    },
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
    gridOptions: {
        defaultSort: { prop: '@createtime', order: 'descending' },
    },
    // 侧边栏配置
    tabConfig: {
        isEnable: true,
        options: {
            riskDetails: {
                isEnable: true,
                text: "数据详情",
                options: {
                    riskLevel: {
                        isEnable: true,
                        title: '风险等级',
                        btns: [
                            { field: "base_exportData" },
                        ]
                    },
                    threatOrg: { isEnable: false },   //'威胁组织'
                    threatLabel: { isEnable: false }, //'威胁标签'
                    userTag: { isEnable: false, }, // 用户标签
                    // 附件风险
                    fileRisk: { isEnable: true },
                }
            },
            dataFlow: { isEnable: true, text: "会话分析" },
        }
    },
}
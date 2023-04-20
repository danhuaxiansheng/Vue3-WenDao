module.exports = {
    // searchBar的查询条件
    searchOptions: {
        isEnable: true,
        time: {
            field: "time",
            title: "上报时间",
            defualtOptions: "最近24小时",
            clearable: true,
            global: true,   // 应用全局-功能按钮
        }
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
                }
            },
            dataFlow: { isEnable: false },
        }
    },
}
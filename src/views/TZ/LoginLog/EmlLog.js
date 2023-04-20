module.exports = {
    //tabContent 配置
    tabConfig: {
        isEnable: true,
        options: {
            riskDetails: {
                isEnable: true,
                text: "信息详情",
                options: {
                    riskLevel: {
                        isEnable: true,
                        btns: [
                            { field: "base_exportData" },
                        ]
                    },
                    // 载荷信息
                    payload: {
                        isEnable: true,
                        title: '载荷信息',
                        field: 'payload'
                    },
                }
            },
            dataFlow: {
                isEnable: true,
            }
        }
    }
}
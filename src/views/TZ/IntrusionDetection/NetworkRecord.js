module.exports = {
    // 侧边栏配置
    tabConfig: {
        isEnable: true,
        options: {
            riskDetails: {
                isEnable: true,
                text: "数据详情",
                options: {
                    payload: { isEnable: true }
                }
            },
            dataFlow: { isEnable: true, text: "会话分析" },
        }
    },
}
module.exports = {
    // toolbar参数
    toolOptions: {
        isEnable: true,
        options:
            [
                //用户标签
                { field: "base_addUserTag" },
                // 导出选中数据
                { field: "base_exportSelect" },
                // 更多
                { field: "base_more" },
                { field: "risktag", class: "to_right" },
                { field: "risklevel", class: "to_right" },
                // 我的收藏
                { field: "base_myCollect" },
            ],
    },
    // // 侧边栏配置
    // tabConfig: {
    //     isEnable: true,
    //     options: {
    //         riskDetails: {
    //             isEnable: true,
    //             text: "数据详情",
    //             options: {
    //                 payload: { isEnable: true }
    //             }
    //         },
    //         dataFlow: { isEnable: true, text: "会话分析" },
    //     }
    // },
}
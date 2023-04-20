<template>
    <pageLayout ref="pageLayout"
        :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
    </pageLayout>
</template>
<script>
export default {
    name: "EnclosureRecord",
    data() {
        return {
            // searchBar的查询条件
            searchOptions: {
                isEnable: true,
                time: {
                    field: "time",
                    title: "捕获时间",
                    defualtOptions: "最近24小时",
                    dateLimit: 30,  // 30天范围内
                    clearable: true,
                    global: true,   // 应用全局-功能按钮
                }
            },
            // toolbar参数
            toolOptions: {
                isEnable: true,
                primaryKey: "indexid",
                options: [
                    //用户标签
                    { field: "base_addUserTag" },
                    // 导出选中数据
                    { field: "base_exportSelect" },
                    // 更多
                    { field: "base_more" },
                    { field: "staticscanstatus", class: "to_right" },
                    { field: "taskstate", class: "to_right" },
                    { field: "risklevel", class: "to_right" },
                    // 我的收藏
                    { field: "base_myCollect" },
                ]
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
                                btns: [
                                    { field: "base_exportData" },
                                    { name: '导出附件', type: 'button', icon: "iconfont icon-export", handler: this.exportAttachment }
                                ]
                            },// 风险等级
                            fileRisk: { isEnable: true },// 附件风险
                        }
                    },
                    emlDetails: {
                        isEnable: true,
                        text: "邮件详情",
                    },
                    fileDetails: {
                        isEnable: true,
                        text: "附件详情",
                        options: {
                            isRelate: true, // 是否单独关联附件
                            relateUrl: "/api/search/generalQuery",  //关联附件的api地址
                        }
                    },
                    dataFlow: { isEnable: true, text: "会话分析" },
                }
            },
            gridOptions: {
                where: {
                    filterFields: ["networkaction", "basicaction"]
                },
                extendParams: {
                    isShift: false,
                    specialParams: JSON.stringify([{ flag: "1", value: "filerisk" }]),
                },
                defaultSort: { prop: 'time', order: 'descending' },
            },
        };
    },
    methods: {
        // 导出附件-单条导出
        exportAttachment() {
            this.$refs['pageLayout'].downloadType = "single";
            this.$refs['pageLayout'].downloadFiles()
        },
    },
    components: {
        pageLayout: () => import("@COMP/TZ/pageLayout")
    },
};
</script>

<style lang="scss" scoped>
</style>

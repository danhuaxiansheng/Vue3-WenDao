<template>
    <pageLayout :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
    </pageLayout>
</template>
<script>
export default {
    name: "EmlFilterRecord",
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
                    // 导出选中数据
                    { field: "base_exportSelect" },
                    // 更多
                    { field: "base_more" },
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
                        text: "信息摘要",
                        options: {
                            // 风险等级
                            riskLevel: { isEnable: false },
                            threatOrg: { isEnable: false },//'威胁组织'
                            threatLabel: { isEnable: false },//'威胁标签'
                            userTag: { isEnable: false }, // 用户标签
                        }
                    },
                    dataFlow: { isEnable: false },
                }
            },
            gridOptions: {
                defaultSort: { prop: 'time', order: 'descending' },
            },
        };
    },
    methods: {
    },
    components: {
        pageLayout: () => import("@COMP/TZ/pageLayout")
    },
};
</script>

<style lang="scss" scoped>
</style>

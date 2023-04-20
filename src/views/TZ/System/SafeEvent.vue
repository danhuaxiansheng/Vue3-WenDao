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
                    field: "createtime",
                    title: "入库时间",
                    defualtOptions: "",
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
                        text: "安全事件详情",
                        options: {
                            // 风险等级
                            riskLevel: { isEnable: false },
                            threatOrg: { isEnable: false },//'威胁组织'
                            threatLabel: { isEnable: false },//'威胁标签'
                            userTag: { isEnable: false }, // 用户标签
                            vulnDescript: { isEnable: true },
                            vulnSolution: { isEnable: true },
                        }
                    },
                    dataFlow: { isEnable: false },
                }
            },
            gridOptions: {
                defaultSort: { prop: 'createtime', order: 'descending' },
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

<template>
    <pageLayout :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
        <!-- 响应信息 -->
        <template v-slot:abntype="{scope}"
            >
            <span>{{scope.row.appproto + " " + scope.row.abntype}}</span>
        </template>
        <!-- attackip -->
    </pageLayout>
</template>
<script>
export default {
    name: "AccountPwd",
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
                            // 风险等级
                            riskLevel: {
                                isEnable: true,
                                btns: [
                                    { field: "base_exportData" },
                                ]
                            },
                            threatOrg: { isEnable: true },//'威胁组织'
                            threatLabel: { isEnable: true },//'威胁标签'
                            userTag: {
                                isEnable: true,  // 是否启用
                            },
                            // 附件风险
                            fileRisk: { isEnable: true },
                            payload: { isEnable: true },
                            //交互详情
                            responseInfo: {
                                isEnable: true,
                                title: '交互详情',
                                headerKeys: {
                                    General: { isEnable: false, }
                                }
                            },
                        }
                    },
                    dataFlow: { isEnable: true, text: "会话分析" },
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

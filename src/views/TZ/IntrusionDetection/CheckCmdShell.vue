<template>
    <pageLayout :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
        <!-- 数据详情-右侧插槽 -->
        <template v-slot:custom="{row}"
            >
            <el-row style="order:28">
                <el-panel shadow="never"
                    theme="border-left"
                    title="回复摘要"
                    :border="false">
                    <ul class="dataDetails-label">
                        <li>
                            <span class="element-content__left">回复信息</span>
                            <span class="element-content__right ellipsis">{{row.isresponse}}</span>
                        </li>
                        <li>
                            <span class="element-content__left">流量协议</span>
                            <span class="element-content__right ellipsis">{{row.protocol}}</span>
                        </li>
                    </ul>
                </el-panel>
            </el-row>
        </template>
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
.el-panel + .el-panel {
    margin-top: 0;
}
</style>

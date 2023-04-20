<template>
    <pageLayout :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
    </pageLayout>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    name: "AccountPwd",
    computed: {
        ...mapGetters(['$toolBar']),
    },
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
                    { field: "risktag", class: "to_right" },
                    { field: "risklevel", class: "to_right" },
                    {
                        name: '数据聚类',
                        value: "sip",
                        field: "data_cluster",
                        type: 'select',
                        class: "element-cluster_data to_right",
                        selectList: [
                            { value: '无', key: "-999" },
                            { value: '按"源IP"', key: "sip" },
                            { value: '按"目的IP"', key: "dip" },
                            { value: '按"网站标题"', key: "h-req-title" },
                            { value: '按"规则编号"', key: "yamlernumber" },
                            { value: '按"请求主机"', key: "h-req-host" },
                            { value: '按"请求URL"', key: "h-req-url" },
                        ]
                    },
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

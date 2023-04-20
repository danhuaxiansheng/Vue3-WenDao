<template>
    <pageLayout :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
        <!-- 响应信息 -->
        <template v-slot:responsedata="{scope}"
            >
            <span>{{formatPayload(scope.row.responsedata)}}</span>
        </template>
        <!-- attackip -->
    </pageLayout>
</template>
<script>
import { formatPayload } from "@PAGE/platform.js";
export default {
    name: "HttpMetadata",
    data() {
        return {
            // searchBar的查询条件
            searchOptions: {
                time: {
                    field: "@createtime",
                    title: "入库时间",
                    defualtOptions: "最近30分钟",
                    clearable: false,
                    global: false,   // 应用全局-功能按钮
                }
            },
            // toolbar参数
            toolOptions: {
                isEnable: true,
                primaryKey: "indexid",
                options: [
                    // 导出选中数据
                    { field: "base_exportSelect" },
                    // 导出搜索结果
                    { field: "base_exportSearch", icon: "iconfont icon-export" },
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
                            //交互详情
                            responseInfo: {
                                isEnable: true,
                                title: '交互详情',
                                switchBtn: {
                                    isHide: true
                                }
                            },
                        }
                    },
                    dataFlow: { isEnable: true, text: "会话分析" },
                }
            },
            gridOptions: {
                defaultSort: { prop: '@createtime', order: 'descending' },
            },
        }
    },
    methods: {
        formatPayload(value) {
            return value && formatPayload(value);
        },
    },
    components: {
        pageLayout: () => import("@COMP/TZ/pageLayout"),
    }
};
</script>

<style lang="scss" scoped>
</style>

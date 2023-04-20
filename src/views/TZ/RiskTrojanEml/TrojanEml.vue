<template>
    <pageLayout ref="pageLayout"
        :searchbar="searchOptions"
        :toolbar="toolOptions"
        :gridbar="gridOptions"
        :tabConfig="tabConfig">
        <!-- 数据详情-右侧插槽 -->
        <template v-slot:custom="{row}"
            >
            <!-- 风险类型 -->
            <el-row style="order:12">
                <el-panel shadow="never"
                    theme="border-left"
                    title="风险类型"
                    :border="false">
                    <risk-type :row="row"></risk-type>
                </el-panel>
            </el-row>

            <el-row style="order:27">
                <life-circle :row="row"
                    :mainTime="searchOptions.time.field"></life-circle>
            </el-row>
        </template>
    </pageLayout>
</template>
<script>
export default {
    name: "TrojanEml",
    data() {
        return {
            testValue: "",
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
                            // 风险等级
                            riskLevel: {
                                isEnable: true,
                                btns: [
                                    { field: "base_exportData" },
                                    { name: '导出邮件', type: 'button', icon: "iconfont icon-export", handler: this.exportEmail },
                                    { name: '导出附件', type: 'button', icon: "iconfont icon-export", handler: this.exportAttachment },
                                ]
                            }
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
                            isRelate: true
                        }
                    },
                    dataFlow: { isEnable: true, text: "会话分析" },
                }
            },
            gridOptions: {
                defaultSort: { prop: 'time', order: 'descending' },
                where: {
                    filterFields: ['emlcontent']
                }
            },
        };
    },
    methods: {
        // 导出邮件-单条导出
        exportEmail() {
            // 重置参数，否会会和导出附件互相影响
            this.$refs['pageLayout'].downloadParams = {
                tableName: "inf-eml",
                column: "emlcontent",
                rowKeyField: "indexid",
                fileName: "subject",
                defaultType: "eml",
                fileType: "",
            }
            this.$refs['pageLayout'].downloadId = "indexid";
            this.$refs['pageLayout'].downloadIndexName = "";
            this.$refs['pageLayout'].downloadType = "single";
            this.$refs['pageLayout'].downloadFiles()
        },
        // 导出附件-单条导出
        exportAttachment() {
            // 重置参数，否会会和导出邮件互相影响
            this.$refs['pageLayout'].downloadParams = {
                tableName: "inf-file",
                column: "filecontent",
                rowKeyField: "sha256",
                fileName: "filename",
                fileType: "filetype",
                defaultType: "",
            }
            this.$refs['pageLayout'].downloadId = "emlkey";
            this.$refs['pageLayout'].downloadIndexName = "inf-attachment";
            this.$refs['pageLayout'].downloadType = "single";
            this.$refs['pageLayout'].downloadFiles()
        },
    },
    components: {
        pageLayout: () => import("@COMP/TZ/pageLayout"),
        RiskType: () => import("./modules/RiskType.vue"),
        LifeCircle: () => import("./modules/LifeCircle.vue")
    },
};
</script>

<style lang="scss" scoped>
</style>

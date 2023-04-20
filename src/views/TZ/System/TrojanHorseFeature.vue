<template>
    <div class="layout">
        <pageLayout ref="pageLayout"
            @beforeReloadTable="beforeReloadTable"
            :searchbar="searchOptions"
            :toolbar="toolOptions"
            :tabConfig="tabConfig"
            :gridbar="gridOptions">

            <!-- 风险等级/信誉等级 -->
            <template v-slot:ALARM_LEVEL="{scope}"
                >
                <svg-icon :title="scope.row['ALARM_LEVEL']"
                    :href="`icon-risk-${formatRisk(scope.row['ALARM_LEVEL'])}`">
                </svg-icon>
            </template>
            <!-- 规则详情 -->
            <template v-slot:PRO_RULES="{scope}"
                >
                {{formatRuleDetail(scope.row['PRO_RULES'])}}
            </template>
            <!-- 规则详情 -->
            <template v-slot:IS_ENABLE="{scope}"
                >
                <el-switch v-model="scope.row['IS_ENABLE']"
                    active-color="#34a853"
                    inactive-color="#c8c9ca"
                    active-value="启用"
                    inactive-value="未启用"
                    :title="formatExpiryTime(scope.row)?'已过期，不可设置':''"
                    :disabled="formatExpiryTime(scope.row)"
                    @change="changeStatus($event,scope.row)"></el-switch>
            </template>

            <template v-slot:VALID_END_TIME="{scope}"
                >
                <span v-if="formatExpiryTime(scope.row)"
                    style="color:red">过期</span>
                <span v-else>{{scope.row['VALID_END_TIME']}}</span>
            </template>

            <!-- 操作列配置 -->
            <template 
                v-slot:action-column="{scope}">
                <el-button class="element-table__button"
                    :class="{active:scope.row['GROUP_KEY'] !='系统内置'}"
                    :disabled="scope.row['GROUP_KEY'] =='系统内置'"
                    :title="scope.row['GROUP_KEY']?'系统内置，不可编辑！':''"
                    @click.stop="editRuleData(scope.row)">
                    <i class="iconfont icon-edit"></i>编辑
                </el-button>
            </template>
        </pageLayout>

        <!-- toolBar自定义事件 -->
        <pageToolEvents ref="toolEvents"
            :acceptType="fileType"
            @addDialogSubmit="addDialogSubmit"
            @reloadTable="reloadTable"></pageToolEvents>
    </div>
</template>
<script>
import { mapState } from 'vuex';
import { isEnableStatus, updateRule } from "@API/TZ/System/index.js"
export default {
    name: "TrojanHorseFeature",
    data() {
        return {
            fileType: {
                type: [".xlsx"],
                template: {
                    xml: "/fileTemplate/ScanVirusUser.xml",
                    xlsx: "/fileTemplate/virtueRule.xlsx"
                }
            },
            // searchBar的查询条件
            searchOptions: {
                isEnable: true,
                isEs: false,
                time: {
                    field: "CREATE_TIME",
                    title: "创建时间",
                    defualtOptions: "",
                    // dateLimit: 30,  // 30天范围内
                    clearable: true,
                    global: true,   // 应用全局-功能按钮
                },
                condition: {
                    useExpression: false, // 禁用表达式
                },
                tools: {
                    collect: {
                        isEnable: true
                    },
                    history: {
                        isEnable: true
                    }
                },
            },
            // toolbar参数
            toolOptions: {
                isEnable: true,
                options:
                    [ // 我的收藏
                        { field: "base_myCollect" },
                        { name: "新增规则", field: "add_rule", type: "button", icon: "iconfont icon-add", handler: this.addFeatureRules },
                        // { name: "导入规则", field: "upload_rule", type: "button", icon: "iconfont icon-upload", handler: this.uploadFeatureRules },
                        {
                            name: '导入规则',
                            field: "upload_rule",
                            type: 'dropdown',
                            icon: "iconfont icon-upload",
                            dropList: [
                                { name: '追加导入', field: "append_rules", type: 'button', handler: this.appendFeaturesdRules },
                                { name: '覆盖导入', field: "cover_rules", type: 'button', handler: this.coverFeaturesRules },
                            ]
                        },
                        // 导出选中数据
                        { field: "base_exportSelect" },
                        // 更多
                        { field: "base_more" },
                        { field: "risklevel", class: "to_right" },
                    ],
            },
            gridOptions: {
                url: '/api/dataBase/find',
                defaultSort: { prop: 'CREATE_TIME', order: 'descending' },// 设置默认排序规则
                // 配置操作列
                actionColumn: {
                    isEnable: true,
                    fixed: "right",
                    align: "center",
                    label: "操作",
                    width: "100",
                    field: "action-column"
                },
            },
            tabConfig: {
                isEnable: false,
            },
        };
    },
    computed: {
        ...mapState({
            userName: (state) => state.user.userName,
            indexName: (state) => state.user.pageinfo.indexName,
        })
    },
    methods: {
        beforeReloadTable(conditions) {
            // 表格默认查未删除
            conditions.push({ field: 'IS_DELETE', value: 0, op: "equal" })
        },
        formatExpiryTime(row) {
            var validTime = Date.parse(row['VALID_END_TIME']),
                nowDate = new Date().getTime();
            return validTime < nowDate;

        },
        addDialogSubmit(dialog) {
            let formData = dialog.formData,
                userName = this.userName,
                indexName = indexName = this.indexName;
            formData.IS_INVALID = 0;
            formData.IS_DELETE = 0;
            formData.AUTHOR = userName;
            //新增模式
            let apiUrl = "/api/malicious/addRule",
                apiParams = {
                    params: JSON.stringify({
                        indexName,
                        sources: [formData]
                    }),
                },
                successText = "数据新增成功！"

            // 编辑模式
            if (dialog.update) {
                apiUrl = "/api/malicious/updateRule";
                successText = "数据编辑成功！";
                let conditions = [{ field: "KEY_ID", value: formData["KEY_ID"], op: "equal" }];
                delete formData.KEY_ID;
                delete formData.IS_DELETE;
                delete formData.AUTHOR;

                apiParams = {
                    params: JSON.stringify({
                        indexName,
                        conditions,
                        doc: {
                            ...formData,
                            MODIFY_AUTHOR: userName,
                        }
                    })
                };
            }

            updateRule(apiParams, apiUrl).then(res => {
                if (res.status == 200) {
                    this.$message(successText);
                    //重置表格状态和数据
                    this.reloadTable("search");
                }
            }).catch(err => {
                console.log(err)
            })
        },
        reloadTable(type) {
            if (type == "search")
                this.$refs['pageLayout'].search();
            else
                this.$refs['pageLayout'].reloadTable();
        },
        // 新增规则
        addFeatureRules() {
            this.$refs['toolEvents'].openAddDialog();
        },
        // 追加导入
        appendFeaturesdRules() {
            this.$refs['toolEvents'].openUploadDialog(false);
        },
        // 覆盖导入
        coverFeaturesRules() {
            this.$refs['toolEvents'].openUploadDialog(true);
        },
        // 编辑row
        editRuleData(row) {
            let editRow = {
                PRO_RULES: row.PRO_RULES.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
                PRO_NAME: row.PRO_NAME,
                PORT: (row.PORT || "").toUpperCase(),
                VALID_END_TIME: row.VALID_END_TIME,
                REMARK: row.REMARK,
                APT_NAME: row.APT_NAME,
                ALARM_LEVEL: this.getAlarmLevel(row.ALARM_LEVEL),
                RESOURCE: row.RESOURCE,
                KEY_ID: row.KEY_ID
            };
            this.$refs['toolEvents'].openAddDialog(editRow);
        },
        getAlarmLevel(level) {
            let value = 1;
            switch (level) {
                case "可疑":
                    value = 1;
                    break;
                case "危险":
                    value = 2;
                    break;
                case "高危":
                    value = 3;
                    break;
            }
            return value;
        },
        //设为失效
        changeStatus(checked, row) {
            const apiUrl = "/api/malicious/isEnable"
            //设置规则失效
            let apiParams = {
                isEnable: checked == "启用" ? true : false,
                id: row['KEY_ID']
            }
            //接口请求
            isEnableStatus(apiParams, apiUrl).then(res => {
                if (res.status == 200) {
                    row.enable = checked;
                    this.$message({ message: "设置成功！", type: "success" });
                } else
                    this.$message({ message: res.msg || "设置失败！", type: "error" })
            }).catch(error => { console.log(error) });
        },
        expiryTime(endtime) {
            let endTime = Date.parse(endtime),
                nowTime = new Date().getTime();
            return endTime < nowTime
        },
        formatRisk(value) {
            return { '高危': 'high', '危险': 'middle', '可疑': 'low' }[value] || "none";
        },
        formatRuleDetail(value) {
            return value.replace("&lt;", "<").replace("&gt;", ">")
        }
    },
    components: {
        pageLayout: () => import("@COMP/TZ/pageLayout"),
        pageToolEvents: () => import("./modules-Custom/pageToolEvents.vue"),
    },
};
</script>

<style lang="scss" scoped>
.layout {
    height: 100%;
    width: 100%;
}
</style>

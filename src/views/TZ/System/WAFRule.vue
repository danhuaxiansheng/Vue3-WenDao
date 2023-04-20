<template>
  <div class="layout" v-loading="loading">
    <pageLayout
      ref="pageLayout"
      @beforeReloadTable="beforeReloadTable"
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :tabConfig="tabConfig"
      :gridbar="gridOptions"
    >
      <!-- 风险等级/信誉等级 -->
      <template v-slot:enable="{ scope }">
        <el-switch
          :value="scope.row['enable'] == '启用'"
          :title="scope.row['enable']"
          @change="changeStatus($event, scope.row)"
          active-color="#34a853"
          inactive-color="#c8c9ca"
        >
        </el-switch>
      </template>

      <!-- 操作列配置 -->
      <template v-slot:action-column="{ scope }">
        <el-button
          class="element-table__button"
          :class="{ active: !isEnableEdit(scope.row.source) }"
          :disabled="isEnableEdit(scope.row.source)"
          :title="isEnableEdit(scope.row.source) ? '系统内置，不可编辑！' : ''"
          @click.stop="editRuleData(scope.row)"
        >
          <i class="iconfont icon-edit"></i>编辑
        </el-button>
      </template>
    </pageLayout>

    <!-- toolBar自定义事件 -->
    <pageToolEvents
      ref="toolEvents"
      :acceptType="fileType"
      @addDialogSubmit="addDialogSubmit"
      @reloadTable="reloadTable"
    ></pageToolEvents>
  </div>
</template>
<script>
import { isEnableStatus, updateRule } from "@API/TZ/System/index.js";
import pageSettings from "./modules-Custom/pageSettings";
export default {
  name: "WAFRule",
  data() {
    return {
      loading: false,
      fileType: {
        type: [".xlsx"],
        table: this.indexName,
      },
      // searchBar的查询条件
      searchOptions: {
        isEnable: true,
        isEs: false,
        time: {
          field: "createTime",
          title: "创建时间",
          defualtOptions: "",
          // dateLimit: 30,  // 30天范围内
          clearable: true,
          global: true, // 应用全局-功能按钮
        },
        condition: {
          useExpression: false, // 禁用表达式
        },
        tools: {
          collect: {
            isEnable: true,
          },
          history: {
            isEnable: true,
          },
        },
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        options: [
          // 我的收藏
          { field: "base_myCollect" },
          {
            name: "新增规则",
            field: "add_rule",
            type: "button",
            icon: "iconfont icon-add",
            handler: this.addFeatureRules,
          },
          // { name: "导入规则", field: "upload_rule", type: "button", icon: "iconfont icon-upload", handler: this.uploadFeatureRules },
          {
            name: "导入规则",
            field: "upload_rule",
            type: "dropdown",
            icon: "iconfont icon-upload",
            dropList: [
              {
                name: "追加导入",
                field: "append_rules",
                type: "button",
                handler: this.appendFeaturesdRules,
              },
              {
                name: "覆盖导入",
                field: "cover_rules",
                type: "button",
                handler: this.coverFeaturesRules,
              },
            ],
          },
          // 导出选中数据
          { field: "base_exportSelect" },
          // 更多
          { field: "base_more" },
          { field: "usageLevel", class: "to_right" },
          { field: "source", class: "to_right" },
        ],
      },
      gridOptions: {
        url: "/api/dataBase/find",
        defaultSort: { prop: "createTime", order: "descending" }, // 设置默认排序规则
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "88",
          field: "action-column",
        },
      },
      tabConfig: {
        isEnable: false,
      },
    };
  },
  methods: {
    beforeReloadTable(conditions) {
      // 表格默认查未删除
      conditions.push({ field: "IS_DELETE", value: 0, op: "equal" });
    },
    // 新增弹窗-提交
    addDialogSubmit(dialog) {
      let formData = dialog.formData,
        rowId = formData.id;
      // 数据反映射
      formData.enable = formData.enable ? 1 : 0;
      formData.source = 2;
      //新增模式
      let apiUrl = "/api/waf/addRule",
        successText = "数据新增成功！";
      // 编辑模式
      if (dialog.update) {
        apiUrl = "/api/waf/updateRule";
        successText = "数据编辑成功！";
        formData.id = rowId;
        // 数据反映射
        formData.usageLevel = pageSettings.getMapValue(
          formData.usageLevel,
          "usageLevel"
        );
        delete formData.source;
      }
      // 构造参数
      let apiParams = {
        params: JSON.stringify(formData),
      };
      this.loading = true;
      updateRule(apiParams, apiUrl)
        .then((res) => {
          if (res.status == 200) {
            this.$message(successText);
            this.reloadTable("search");
          }
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    reloadTable(type) {
      if (type == "search") this.$refs["pageLayout"].search();
      else this.$refs["pageLayout"].reloadTable();
    },
    // 新增规则
    addFeatureRules() {
      this.$refs["toolEvents"].openAddDialog();
    },
    // 追加导入
    appendFeaturesdRules() {
      this.$refs["toolEvents"].openUploadDialog(false);
    },
    // 覆盖导入
    coverFeaturesRules() {
      this.$refs["toolEvents"].openUploadDialog(true);
    },
    // 编辑row
    editRuleData(row) {
      // 通过风险类型反映射拿到对应的value值
      let riskValue = this.$refs["toolEvents"].getRiskValueByType(row.risk);

      let editRow = {
        name: row.name,
        ruleType: row.ruleType,
        usageLevel: row.usageLevel,
        enable: row.enable == "启用" ? true : false,
        risk: riskValue,
        conditionRule: row.conditionRule,
        decideRule: row.decideRule,
        apt: row.apt,
        cnnvdId: row.cnnvdId,
        cve: row.cve,
        description: row.description,
        id: row.id,
      };
      // 规则名称不允许编辑
      this.$refs["toolEvents"].addDialog.disabled = true;
      this.$refs["toolEvents"].openAddDialog(editRow);
    },
    changeStatus(checked, row) {
      let apiParams = {
        id: row.id,
        open: checked,
      };
      isEnableStatus(apiParams).then((res) => {
        if (res.status == 200) {
          row.enable = checked ? "启用" : "禁用";
          this.$message({ message: "设置成功！", type: "success" });
        } else
          this.$message({ message: res.msg || "设置失败！", type: "error" });
      });
    },
    isEnableEdit(source) {
      return source == "系统内置";
    },
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
 :deep(.tool-bar .el-select.to_right:nth-last-child(2)) {
  width: 144px;
}
</style>

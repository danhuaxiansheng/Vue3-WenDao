<template>
  <div class="layout">
    <pageLayout
      ref="pageLayout"
      @beforeReloadTable="beforeReloadTable"
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :tabConfig="tabConfig"
      :gridbar="gridOptions"
    >
      <!-- 是否启用 -->
      <template v-slot:STATE="{ scope }">
        <el-switch
          v-model="scope.row['STATE']"
          active-color="#34a853"
          inactive-color="#c8c9ca"
          :active-value="1"
          :inactive-value="0"
          @change="changeStatus($event, scope.row)"
        ></el-switch>
      </template>

      <!-- 操作列配置 -->
      <template v-slot:action-column="{ scope }">
        <el-button
          class="element-table__button active"
          @click="checkFilter(scope.row)"
        >
          <i class="iconfont icon-table-detail"></i>查看过滤记录
        </el-button>
      </template>
    </pageLayout>
    <!-- 新建过滤规则-弹窗 -->
    <el-dialog
      class="element-form__dialog"
      title="新建过滤规则"
      v-model:visible="dialogConfig.visible"
      width="520px"
      :before-close="cancelSubmit"
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogConfig.ruleForm"
        :rules="dialogConfig.rules"
        ref="ruleForm"
        label-width="90px"
        @submit.prevent
      >
        <el-form-item label="规则类型：">
          <el-select
            v-model="dialogConfig.ruleForm.PRO_TYPE"
            placeholder="请选择规则类型"
          >
            <el-option
              v-for="option in dialogConfig.ruleType"
              :key="option.value"
              :value="option.value"
              :label="option.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="匹配类型：">
          <el-select
            v-model="dialogConfig.ruleForm.FILTER_TYPE"
            placeholder="请选择匹配类型"
          >
            <el-option
              v-for="option in filterType"
              :key="option.value"
              :value="option.value"
              :label="option.key"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch
            v-model="dialogConfig.ruleForm.STATE"
            active-color="#34a853"
            inactive-color="#c8c9ca"
            :active-value="1"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>
        <el-form-item label="匹配值：" prop="FILTER_VALUE">
          <el-input
            v-model="dialogConfig.ruleForm.FILTER_VALUE"
            type="textarea"
            placeholder="请输入匹配值"
            maxlength="2000"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelSubmit">取消</el-button>
        <el-button type="primary" @click="submitRules">确认</el-button>
      </span> -->
    </el-dialog>
    <!-- 全局过滤规则-弹窗 -->
    <el-dialog
      class="element-form__dialog element-form__global"
      title="全局过滤规则"
      v-model:visible="globalConfig.visible"
      width="440px"
      :before-close="cancelGlobal"
      :close-on-click-modal="false"
    >
      <el-form
        :model="globalConfig.ruleForm"
        :rules="globalConfig.rules"
        ref="globalForm"
        @submit.prevent
        label-width="0"
      >
        <el-form-item prop="maxSize">
          <el-checkbox
            v-model="globalConfig.ruleChecked.isTotal"
            label="文件不大于（单位：Byte）"
          ></el-checkbox>
          <el-input-number
            maxlength="9"
            placeholder="请输入文件大小"
            title="文件大小为1b ~ 100MB"
            :disabled="!globalConfig.ruleChecked.isTotal"
            v-model.trim="globalConfig.ruleForm.maxSize"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="globalConfig.ruleChecked.isEnclosure"
            label="过滤“无附件”的邮件"
          ></el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            disabled
            v-model="globalConfig.ruleChecked.isEmpty"
            label="过滤“收件人、发件人、主题、发件时间、密送、抄送”为空的邮件"
          ></el-checkbox>
        </el-form-item>
      </el-form>

      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelGlobal">取消</el-button>
        <el-button type="primary" @click="submitGlobal">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>
<script>
import { deleteDb } from "@/api/TZ/index.js";
import { batchAdd, getGlobal, setGlobal } from "@/api/TZ/System/index.js";

import { mapState } from "vuex";
import { setSessionParam } from "@PAGE/platform.js";

export default {
  name: "EmlFilterNew",
  data() {
    return {
      // 新建过滤规则
      dialogConfig: {
        visible: false,
        ruleType: [
          { value: 4, key: "主题" },
          { value: 5, key: "发件人" },
          { value: 6, key: "收件人" },
          { value: 7, key: "抄送" },
          { value: 8, key: "密送" },
        ],
        ruleForm: {
          PRO_TYPE: 4,
          FILTER_TYPE: 1,
          STATE: 1,
          FILTER_VALUE: "",
        },
        rules: {
          FILTER_VALUE: [
            { required: true, message: "匹配值不能为空", trigger: "blur" },
          ],
        },
      },
      // 全局过滤规则
      globalConfig: {
        visible: false,
        ruleForm: {
          maxSize: 0,
        },
        rules: {
          maxSize: [
            {
              required: true,
              validator: this.validateMaxsize,
              trigger: "blur",
            },
          ],
        },
        ruleChecked: {
          isTotal: false,
          isEnclosure: false,
          isEmpty: true,
        },
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
            name: "新增过滤规则",
            field: "filter_rule",
            type: "button",
            icon: "iconfont icon-add",
            handler: this.addFilterRule,
          },
          {
            name: "全局过滤规则",
            field: "global_rule",
            type: "button",
            icon: "iconfont icon-add",
            handler: this.globalFilterRule,
          },
          // 导出选中数据
          { field: "base_exportSelect" },
          // 更多
          { field: "base_more" },
          { field: "source", class: "to_right" },
        ],
      },
      gridOptions: {
        url: "/api/dataBase/find",
        enableSetColumns: false,
        defaultSort: { prop: "CREATE_TIME", order: "descending" }, // 设置默认排序规则
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "148",
          field: "action-column",
        },
      },
      tabConfig: {
        isEnable: false,
      },
    };
  },
  computed: {
    ...mapState({
      indexName: (state) => state.user.pageinfo.indexName,
    }),
    filterType() {
      let filterType = [];
      let proType = this.dialogConfig.ruleForm.PRO_TYPE;
      if (proType == 4) {
        filterType = [
          { value: 1, key: "等于匹配" },
          { value: 2, key: "包含匹配" },
          { value: 3, key: "起始匹配" },
          { value: 4, key: "结束匹配" },
        ];
      } else filterType = [{ value: 2, key: "包含匹配" }];
      return filterType;
    },
  },
  methods: {
    beforeReloadTable(conditions) {
      // 表格默认查未删除
      conditions.push({ field: "IS_DELETE", value: 0, op: "equal" });
      conditions.push({
        field: "PRO_TYPE",
        value: ["1", "2", "3"],
        op: "notor",
      });
    },
    validateMaxsize(rule, value, callback) {
      value = value.toString().toLocaleLowerCase();
      if (value.trim() === "") {
        callback(new Error("文件大小不能为空"));
      } else if (Number(value) < 1) {
        callback(new Error("文件大小需大于0"));
      } else if (Number(value) > 104857600) {
        callback(new Error("文件大小需不超过104857600字节"));
      } else {
        callback();
      }
    },
    // 新增过滤规则
    addFilterRule() {
      this.dialogConfig.visible = true;
    },
    cancelSubmit() {
      this.$refs["ruleForm"].resetFields();
      this.dialogConfig.visible = false;
    },
    submitRules() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let apiParams = {
            params: JSON.stringify({
              indexName: this.indexName,
              sources: [{ ...this.dialogConfig.ruleForm }],
            }),
          };
          batchAdd(apiParams)
            .then((res) => {
              if (res.status == 200) {
                this.cancelSubmit();
                this.$message({ message: "新增成功！", type: "success" });
                this.$refs["pageLayout"].reloadTable();
              } else {
                this.$message({
                  message: res.msg || "新增失败！",
                  type: "error",
                });
              }
            })
            .catch(() => {});
        }
      });
    },
    // 全局过滤规则
    globalFilterRule() {
      this.globalConfig.visible = true;
      let apiParams = {
        params: JSON.stringify({
          indexName: this.indexName,
          indexType: this.indexName,
          conditions: [
            { field: "IS_DELETE", value: 0, op: "equal" },
            { field: "PRO_TYPE", value: ["1", "2", "3"], op: "equal" },
          ],
          onlyCount: false,
          sortField: "PRO_TYPE",
          sortOrder: "asc",
          group: null,
          topSize: null,
        }),
      };
      // 获取全局配置信息
      getGlobal(apiParams)
        .then((res) => {
          if (!res.data || !res.data.length) {
            this.$message({
              message: "数据请求异常，请联系管理员",
              type: "error",
            });
            return;
          }
          this.formatGlobalValue(res.data);
        })
        .catch(() => {});
    },
    formatGlobalValue(result) {
      result.forEach((item) => {
        switch (item.PRO_TYPE) {
          case "2":
            this.globalConfig.ruleChecked.isTotal =
              Number(item.STATE) == 1 ? true : false;
            this.globalConfig.ruleForm.maxSize = Number(item.FILTER_VALUE);
            break;
          case "3":
            this.globalConfig.ruleChecked.isEnclosure =
              Number(item.STATE) == 1 ? true : false;
            break;
        }
      });
    },
    cancelGlobal() {
      this.$refs["globalForm"].resetFields();
      this.globalConfig.visible = false;
    },
    submitGlobal() {
      this.$refs["globalForm"].validate((valid) => {
        if (valid) {
          const ruleChecked = this.globalConfig.ruleChecked;
          let maxSizeState = ruleChecked.isTotal ? 1 : 0;
          let isEnclosure = ruleChecked.isEnclosure ? 1 : 0;

          let apiParams = {
            params: JSON.stringify({
              indexName: this.indexName,
              primaryKey: "FILTER_ID",
              doc: [
                {
                  FILTER_ID: 2,
                  FILTER_VALUE: this.globalConfig.ruleForm.maxSize,
                  STATE: maxSizeState,
                },
                { FILTER_ID: 3, FILTER_VALUE: isEnclosure, STATE: isEnclosure },
              ],
            }),
          };
          setGlobal(apiParams)
            .then((res) => {
              if (res.status == 200) {
                this.$message({ message: "设置成功！", type: "success" });
                this.cancelGlobal();
              } else
                this.$message({
                  message: res.msg || "设置失败！",
                  type: "error",
                });
            })
            .catch(() => {});
        }
      });
    },
    changeStatus(checked, row) {
      let apiParams = {
        params: JSON.stringify({
          indexName: this.indexName,
          conditions: [
            { field: "FILTER_ID", value: row["FILTER_ID"], op: "equal" },
          ],
          doc: {
            STATE: checked ? 1 : 0,
          },
        }),
      };
      deleteDb(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.$message({ message: "设置成功！", type: "success" });
          } else
            this.$message({ message: res.msg || "设置失败！", type: "error" });
        })
        .catch(() => {});
    },
    checkFilter(row) {
      let conditionParam = {
        isJson: true,
        type: "_blank",
        sessionName: "paramListSession",
        url: "/TZ/System/EmlFilterRecord",
        data: {
          expression: '{"query":{"term":{"filterid":"' + row.FILTER_ID + '"}}}',
          conditions: [{ field: "time", value: "", op: "equal" }],
        },
      };
      setSessionParam(conditionParam);
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>

<style lang="scss" scoped>
.layout {
  height: 100%;
  width: 100%;
}
:deep(.element-form__global) {
  .el-form-item:not(:first-child) {
    &:last-child {
      margin-bottom: 0;
    }
    .el-checkbox {
      width: 100%;
      .el-checkbox__label {
        opacity: 0.88;
        max-width: initial;
        white-space: pre-wrap;
      }
    }
  }
}
</style>

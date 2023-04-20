<template>
  <div class="element-page__content">
    <search-bar
      ref="searachBar"
      :options="searchOptions"
      v-model:params="searchParams"
      @search="search"
      @onload="searchLoadSuccess"
      @reset="search"
    >
      <template v-slot:tools>
        <collectAndHistory
          ref="collectAndHistory"
          :options="searchOptions.tools"
        />
      </template>
    </search-bar>

    <!-- 表格区域 -->
    <gridBar
      ref="dataTable"
      v-if="tableOptions.isEnable"
      v-model:options="tableOptions"
      :pageAsideLeft="$attrs.pageAsideLeft"
      @selectChange="(list) => (selectRows = list)"
    >
      <!-- 页面toolBar -->

      <template #tool-left>
        <pageToolbar
          :pageType="pageType"
          :pageApiConfig="pageApiConfig"
          :aggListData="aggListData"
          :apiSearchParams="apiSearchParams"
          :selectRows="selectRows"
          @toolBarSearch="toolBarSearch"
        ></pageToolbar>
      </template>

      <!-- 表格字段列格式化 -->
      <template
        v-for="key in formatColumns"
        v-slot:[key]="{ scope }"
        :key="key"
      >
        <formatFields
          :slotName="key"
          :scope="scope"
          @change="updateRuleData"
        ></formatFields>
      </template>
      <!-- 操作列配置 -->
      <template v-slot:action-column="{ scope }">
        <el-button
          class="element-table__button active"
          :disabled="pageType == 'blackList' && scope.row.useEnable != 1"
          @click.stop="editRuleData(scope.row)"
        >
          <i class="iconfont icon-edit"></i>编辑
        </el-button>
      </template>
    </gridBar>

    <el-dialog
      class="element-form__dialog"
      :title="pageType == 'blackList' ? '黑名单编辑' : '白名单编辑'"
      v-model:visible="dialogConfig.visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogConfig.ruleForm"
        :rules="dialogConfig.rules"
        ref="ruleForm"
        @submit.prevent
        label-width="90px"
      >
        <el-form-item :label="dialogConfig.ruleForm.type + '：'">
          {{ dialogConfig.ruleForm.value }}
        </el-form-item>
        <el-form-item label="信誉等级：" v-if="pageType == 'blackList'">
          <el-radio-group v-model="dialogConfig.ruleForm.threatLevel">
            <el-radio :label="3">高危</el-radio>
            <el-radio :label="2">危险</el-radio>
            <el-radio :label="1">可疑</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="长期有效：" v-if="pageType == 'blackList'">
          <el-radio-group v-model="dialogConfig.ruleForm.expiryEnable">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="有效期至："
          v-if="
            pageType == 'blackList' && dialogConfig.ruleForm.expiryEnable == 1
          "
          prop="expiryTime"
        >
          <el-date-picker
            v-model="dialogConfig.ruleForm.expiryTime"
            type="datetime"
            placeholder="请选择有效时间"
            fefault-date="2099-12-31"
            default-time="23:59:59"
            value-format="yyyy-MM-dd hh:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="特征备注：" v-if="pageType == 'blackList'">
          <el-input
            v-model="dialogConfig.ruleForm.dataTag"
            maxlength="255"
            placeholder="请输入特征备注"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="特征备注：" v-if="pageType == 'whiteList'">
          <el-input
            v-model="dialogConfig.ruleForm.remark"
            maxlength="255"
            placeholder="请输入特征备注"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="组织名称：" v-if="pageType == 'blackList'">
          <el-input
            v-model="dialogConfig.ruleForm.groupId"
            maxlength="255"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="info" @click="dialogConfig.visible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="submitRules">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import searchBarConfig from "./pageSettings.js";
import {
  postAggList,
  updateRule,
} from "@API/TZ/IntelligenceManage/TacticalIntelligence.js";
export default {
  name: "PageContent",
  props: {
    pageType: {
      type: String,
      default: "blackList",
    },
  },
  data() {
    return {
      dialogConfig: {
        visible: false,
        ruleForm: {
          id: "",
          type: "",
          value: "",
          threatLevel: 1,
          expiryEnable: 0,
          expiryTime: "",
          dataTag: "",
          remark: "",
          groupId: "",
        },
        rules: {
          expiryTime: [
            { required: true, message: "请选择有效时间", trigger: "blur" },
          ],
        },
      },
      pageApiConfig: {},
      apiSearchParams: {
        typeCode: 99,
        importEnable: 0, //是否重点关注
        sourceCode: 99, //规则类型：99-全部
      },
      //toolBar数据
      aggListData: {
        aggSource: [],
        aggType: [],
      },
      toolButton: [],
      // searchBar查询条件
      searchParams: {},
      // searchbar配置
      searchOptions: {
        isEnable: true,
        isEs: false,
        time: {
          field: "createtime",
          title: "创建时间",
          defualtOptions: "",
          // dateLimit: 30,  // 30天范围内
          clearable: true,
          global: true, // 应用全局-功能按钮
        },
        condition: {
          // useExpression: false,
          custom: false,
          columns: null,
        },
        tools: {
          collect: { isEnable: false },
          history: { isEnable: false },
        },
      },
      //table的选择列
      selectRows: [],
      formatColumns: [],
      // table配置
      tableOptions: {
        isEnable: true,
        url: "", // 接口地址
        enableSetColumns: false,
        columns: [],
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "100",
          field: "action-column",
        },
        conditions: [], // 条件
        pagination: {}, // 分页
        defaultSort: { prop: "createTime", order: "descending" }, // 设置默认排序规则
      },
    };
  },
  watch: {
    pageType: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.initPageConfig();
        }
      },
      immediate: true,
    },
  },
  methods: {
    // 初始化页面配置信息
    initPageConfig() {
      // 获取页面请求api
      this.pageApiConfig = searchBarConfig.getPageApi(this.pageType);
      //获取searchBar下拉选项
      this.searchOptions.condition.columns = searchBarConfig.getSearchColumns(
        this.pageType
      );
      //获取table的列信息
      this.tableOptions.columns = searchBarConfig.getGridColunms(this.pageType);
      this.tableOptions.url = this.pageApiConfig.gridUrl;
      this.formatColumns = searchBarConfig.getFormatColumns();
      //获取agg数据后再加载toolBar配置
      // this.toolOptions.options =
      //     this.formatToolbarOptions(searchBarConfig.getToolBtn());
    },
    // searchBar加载完成后进行条件组装
    searchLoadSuccess() {
      // 全局时间设置
      const globalTime = localStorage.getItem("globalTime");
      if (globalTime) {
        this.$refs["searachBar"].loadCondition({
          conditions: [
            {
              op: "equal",
              connector: "and",
              field: this.searchOptions.time.field,
              value: globalTime,
            },
          ],
        });
      }
      //执行表格查询事件
      setTimeout(() => {
        this.search();
      }, 50);
    },
    search() {
      if (this.$refs.dataTable) {
        // 重置：查询第一页
        this.$refs.dataTable.pagination.currentPage = 1;
      }
      //构建表格查询条件
      this.buildSearchContions();
      //查询agg聚合数据
      this.searchOfAggregate();
      // 加载表格数据
      this.reloadTable();
    },
    buildSearchContions() {
      // 表达式赋值
      this.tableOptions.expression = this.searchParams.expression ?? null;
      // 白名单 不需要importEnable参数
      if (this.pageType == "whiteList") {
        delete this.apiSearchParams.importEnable;
      }
      // 拼接查询条件
      this.tableOptions.extendParams = this.apiSearchParams;
      this.tableOptions.conditions = [...this.searchParams.conditions];
    },
    searchOfAggregate() {
      let params = this.$refs["dataTable"].getWhere(),
        apiUrl = this.pageApiConfig.aggUrlConfig;
      //接口请求
      postAggList(apiUrl, {
        ...this.apiSearchParams,
        params: JSON.stringify(JSON.parse(params)),
      })
        .then((res) => {
          this.aggListData = res.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    reloadTable() {
      // 表格查询
      this.$refs?.dataTable.reloadTable();
      // 加入历史记录
      this.addHistory();
    },
    addHistory() {
      (this.searchParams.conditions.length || this.searchParams.expression) &&
        this.$refs["collectAndHistory"] &&
        this.$refs["collectAndHistory"].addHistory(this.searchParams);
    },
    //toolBar调用查询
    toolBarSearch() {
      // 执行查询事件
      this.search();
    },
    editRuleData(row) {
      this.dialogConfig.ruleForm = {
        id: row.id,
        type: row.type,
        value: row.value,
        threatLevel: row.threatLevel,
        expiryEnable: row.expiryEnable,
        expiryTime: row.expiryTime,
        dataTag: row.dataTag,
        remark: row.remark,
        groupId: row.groupId,
      };
      this.dialogConfig.visible = true;
    },
    submitRules() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          const ruleForm = this.dialogConfig.ruleForm;

          let params = {
            ...ruleForm,
          };
          //长期有效时，时间默认传2099
          if (!params.expiryEnable) {
            params.expiryTime = "2099-12-31 23:59:59";
          }

          if (this.pageType == "whiteList") {
            delete params.type;
            delete params.value;
            delete params.threatLevel;
            delete params.groupId;
            delete params.expiryEnable;
            delete params.expiryTime;
            delete params.dataTag;
          }
          //调用数据更新接口
          this.updateRuleData(params, "编辑成功！");
        }
      });
    },
    updateRuleData(apiParams) {
      let apiUrl = this.pageApiConfig.updateUrl;
      //接口请求
      updateRule(apiUrl, apiParams)
        .then(() => {
          this.$message({ message: "数据更新成功！", type: "success" });
          //关闭弹窗
          this.dialogConfig.visible = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  components: {
    searchBar: () => import("@COMP/TZ/searchbar"),
    gridBar: () => import("@COMP/TZ/gridbar"),
    formatFields: () => import("./FormatFields.vue"),
    pageToolbar: () => import("./PageToolBar.vue"),
    collectAndHistory: () => import("@COMP/TZ/collectAndHistory/index.vue"),
  },
};
</script>

<style lang="scss" scoped>
:deep(.element-page__content) {
  .search-bar {
    padding-bottom: 0;
  }
}

:deep(.element-tooltar__content) {
  .tool-bar {
    .element-button__default {
      color: #948b8b;
      border-color: #f1f3f4;
      background-color: #fff;
      opacity: 1;
      float: right;
      &.active {
        border-color: $highColor;
        color: $highColor;
      }
    }
  }
  .aggType {
    margin-top: 16px;
    .el-button {
      margin: 0;
      height: 26px;
      border: none;
      position: relative;
      &:not(:last-child)::after {
        content: "";
        display: inline-block;
        position: absolute;
        height: 12px;
        width: 1px;
        right: 0;
        top: 6px;
        background-color: $lineColor;
      }
      &.active {
        background: linear-gradient(90deg, #4ca1ff, $highColor);
        color: #fff;
      }
      &.active::after {
        display: none;
      }
    }
  }
}
:deep(.page-table) {
  padding: 0 16px;
  height: calc(100% - 48px) !important;
  .el-table {
    height: calc(100% - 152px) !important;
  }
}
:deep(.element-form__dialog) {
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }
}
</style>

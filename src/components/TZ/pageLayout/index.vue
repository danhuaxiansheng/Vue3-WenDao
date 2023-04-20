<template>
  <div class="page-layout element-container__full">
    <Layout v-bind="$attrs">
      <div
        v-if="searchOptions.isEnable"
        slotslot="search"
        height="auto"
        class="page-header"
      >
        <search-bar
          ref="searachBar"
          :options="searchOptions"
          v-model:params="searchParams"
          @search="search"
          @onload="searchLoadSuccess"
          @reset="search"
        >
          <template v-slot:tools>
            <collectAndHistory ref="collectAndHistory" :options="btnsOptions" />
          </template>
        </search-bar>
      </div>
      <div slotslot="grid" class="page-main">
        <gridBar
          ref="dataTable"
          v-if="tableOptions.isEnable"
          v-model:options="tableOptions"
          :pageAsideLeft="$attrs.pageAsideLeft"
          @rowClick="rowClick"
          @tableSuccess="tableSuccess"
          @selectChange="(list) => (selectRows = list)"
        >
          <template v-if="mergeToolOptions.isEnable" v-slot:tool-left>
            <tool-bar
              :options="mergeToolOptions.options"
              v-model:conditions="toolCds"
              @change="reloadTable"
              @success="toolLoadSuccess"
            >
            </tool-bar>
          </template>
          <!-- <template
            v-for="item in formatScopeColumns"
            :slotslot="typeof item === 'string' ? item : item.field"
            slot-scope="{ scope }"
          >
            <slot v-if="typeof item === 'string'" :name="item" :scope="scope" />
            <formatField
              v-else
              :key="item.field"
              :slotName="item.field"
              :scope="scope"
            />
          </template> -->
        </gridBar>
      </div>
      <tabContent
        v-if="sideOptions.isEnable"
        slotslot="aside"
        ref="tabContent"
        v-model:checkRow="checkRow"
        v-model:options="sideOptions.options"
      >
        <!-- 数据详情：插槽模板 -->
        <template v-slot:custom="{ row }">
          <slot name="custom" :row="row"></slot>
        </template>
      </tabContent>
    </Layout>
    <el-dialog
      width="400px"
      title="下载搜索文件"
      v-model:visible="selectDialog.visible"
      :close-on-click-modal="false"
      :before-close="cancelUpdate"
      append-to-body
    >
      <el-form
        ref="fileForm"
        label-width="85px"
        :model="selectDialog.form"
        :rules="selectDialog.rules"
        @submit.prevent
      >
        <el-form-item label="导出数量：" prop="fileNumber">
          <el-input
            :controls="false"
            v-model.number.trim="selectDialog.form.fileNumber"
            placeholder="请输入1-200的整数"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="文件名称："
          style="margin-bottom: 0"
          prop="fileName"
        >
          <el-input
            type="text"
            placeholder="请输入文件名称"
            v-model.trim="selectDialog.form.fileName"
            maxlength="200"
          >
          </el-input>
        </el-form-item>
      </el-form>

      <span slotslot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitUpdate">确定</el-button>
        <el-button type="info" @click="cancelUpdate">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="导出搜索结果"
      v-model:visible="exportDialog.isEnable"
      width="360px"
      :close-on-click-modal="false"
      class="export-dialog"
      @beforeClose="closeExportForm"
    >
      <el-form
        :model="exportForm"
        :rules="exportDialog.rules"
        @submit.prevent
        ref="diaForm"
        label-width="85px"
        class="export-form"
      >
        <el-form-item label="导出数量：" prop="number">
          <el-input
            :controls="false"
            v-model.number.trim="exportForm.number"
            placeholder="请输入1-5000的整数"
          ></el-input>
        </el-form-item>
        <el-form-item label="文件名称：" prop="fileName">
          <el-input
            type="text"
            v-model.trim="exportForm.fileName"
            :maxlength="50"
            class="keyword exportName"
            placeholder="请输入文件名"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="primary" @click="pxportYes">确定</el-button>
        <el-button type="info" @click="closeExportForm">取消</el-button>
      </span>
    </el-dialog>
    <addUserTag
      v-if="tag.isShow"
      ref="addUserTag"
      :selectRows="selectRows"
      @success="tagSuccess"
    />
  </div>
</template>
<script>
import _ from "lodash";
import { getSessionParam } from "@PAGE/platform.js";
import { parseTime } from "@LIB/date";
import { exportEsData, deleteEs, deleteDb } from "@/api/TZ/index.js";
import { exporter } from "@TOOLS/export.js";
import { isString } from "@LIB/validate.js";
import { isIntegerNum } from "@LIB/regex.js";
import { mapGetters, mapState } from "vuex";
import downloadFile from "@MIXINS/TZ/download-file-mixin.js";
import searchBar from "@COMP/TZ/searchbar";
import toolBar from "@COMP/TZ/toolbar";
import gridBar from "@COMP/TZ/gridbar";
import tabContent from "@COMP/TZ/tabContent";
// import formatField from "@COMP/TZ/pageLayout/modules/formatFields.vue";
export default {
  components: {
    searchBar,
    toolBar,
    gridBar,
    tabContent,
    // formatField,
    Layout: () => import("@COMP/TZ/pageLayout/modules/layout.vue"),
    addUserTag: () => import("@COMP/TZ/usertag"),
    collectAndHistory: () => import("@COMP/TZ/collectAndHistory/index.vue"),
  },
  name: "pageLayout",
  mixins: [downloadFile],
  props: {
    searchbar: {
      type: Object,
    },
    toolbar: {
      type: Object,
    },
    gridbar: {
      type: Object,
    },
    tabConfig: {
      type: Object,
      default() {
        return {
          isEnable: true,
          options: {},
        };
      },
    },
  },
  data() {
    return {
      // searchBar查询条件
      searchParams: {},
      // toolbar查询条件
      toolCds: [],
      // 表格最后拼接的条件
      tableCds: [],
      // 表格选中行
      checkRow: null,
      // toolbar配置
      toolOptions: {
        isEnable: true,
        primaryKey: null,
        esExportUrl: "/api/file/searchExcel", // 导出ES数据接口
        dbExportUrl: "/api/dataBase/exportExcel", // 导出数据库接口
        esDeleteUrl: "/api/search/batchDeleteByUpdate", // ES 删除数据接口
        dbDeleteUrl: "/api/dataBase/update", // DB 删除数据接口
        options: [],
      },
      // table配置
      tableOptions: {
        isEnable: true,
        url: "", // 接口地址
        columns: [],
        // 配置操作列
        actionColumn: {
          isEnable: false,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "140",
          field: "action-column",
        },
        where: {},
        conditions: [], // 条件
        pagination: {}, // 分页
        defaultSort: null, // 默认排序
        // defaultSort: "{prop: 'date', order: 'descending'}",
      },
      //table的选择列
      selectRows: [],
      // toolBar基础配置
      toolConfig: {
        base_myCollect: {
          name: "我的收藏",
          type: "base_myCollect",
          class: "to_right",
          defaultSeach: true,
        },
        base_addUserTag: {
          name: "添加用户标签",
          type: "button",
          icon: "iconfont icon-tag",
          handler: this.addUserTag,
        },
        base_exportBtn: {
          name: "导出文件",
          type: "button",
          icon: "iconfont icon-export",
          handler: this.exportEsData,
        },
        base_exportSelect: {
          name: "导出数据",
          type: "button",
          icon: "iconfont icon-export",
          handler: this.exportSelect,
        },
        base_downloadChoseFile: {
          name: "下载选择文件",
          type: "button",
          handler: this.downloadChoseFile,
        },
        base_downloadSearchFile: {
          name: "下载搜索文件",
          type: "button",
          handler: this.downloadSearchFile,
        },
        base_exportSearch: {
          name: "导出搜索结果",
          type: "button",
          handler: this.exportSearch,
        },
        base_deleteSelect: {
          name: "删除选中数据",
          type: "button",
          handler: this.deleteSelect,
        },
        base_deleteSearch: {
          name: "删除搜索结果",
          type: "button",
          handler: this.deleteSearch,
        },
        base_more: {
          name: "更多",
          type: "dropdown",
          dropList: [
            "base_exportSearch",
            "base_deleteSelect",
            "base_deleteSearch",
          ],
        },
        base_eventType: {
          name: "攻击类型",
          type: "eventType",
          value: "",
          field: "event_typeB",
        },
        base_autoFresh: { name: "自动刷新", type: "autoFresh" },
      },
      // 导出搜索结果 弹出框 内容块
      exportForm: {
        number: "",
        fileName: "",
      },
      // 导出搜索结果 弹出框
      exportDialog: {
        isEnable: false,
        rules: {
          fileName: [
            {
              required: true,
              message: "请输入文件名称",
              trigger: "blur",
            },
          ],
          number: [
            { required: true, message: "导出数量不能为空", trigger: "blur" },
            { type: "number", message: "导出数量必须为数值" },
            { validator: this.changeExportNumber, trigger: "blur" },
          ],
        },
      },
      // 用户标签 弹出框
      tag: {
        isShow: false,
      },
      paneSize: 25, // 侧边栏默认宽度
      // 在工具栏加载完毕中执行查询方法。
      useToolSearch: false,
    };
  },
  beforeCreate() {
    this.$store.commit("tabContent/setRow", null);
  },
  created() {
    this.tableOptions = { ...this.tableOptions, ...this.gridbar };
  },
  computed: {
    ...mapGetters(["pageinfo", "$toolBar"]),
    ...mapState({
      searchBarColumns: (state) => state.searchBar.searchBarColumns || [],
    }),
    /**
     * 合并toolbar配置项
     */
    mergeToolOptions() {
      let options = _.assign({}, this.toolOptions, this.toolbar);
      if (options.isEnable) {
        let toolConfig = this.toolConfig;
        options.options = options.options.map((item) => {
          let itemObj = toolConfig[item.field];
          let idata = item;
          if (itemObj) {
            idata = { ...itemObj, ...item };
          }
          if (idata.dropList && idata.dropList.length) {
            //n可以为字符串 可以为对象
            idata.dropList = idata.dropList.map((n) =>
              isString(n) ? toolConfig[n] ?? { name: n } : n
            );
          }
          return idata;
        });
      }
      return options;
    },
    /**
     *  查询栏 配置
     */
    searchOptions() {
      return {
        isEnable: true,
        isEs: true,
        tools: {
          collect: {
            isEnable: true,
          },
          history: {
            isEnable: true,
          },
        },
        time: { isEnable: true },
        ...this.searchbar,
      };
    },
    /**
     * 是否是ES数据库
     */
    isEs() {
      return this.searchOptions.isEs;
    },
    /**
     *  工具按钮 配置项
     */
    btnsOptions() {
      return {
        collect: { isEnable: true },
        history: { isEnable: true },
        ...this.searchOptions.tools,
      };
    },
    /**
     *  右侧侧边栏 配置项
     */
    sideOptions() {
      const tabConfig = this.tabConfig;
      return {
        isEnable: false,
        ...tabConfig,
      };
    },
    /**
     *  主Key
     */
    primaryKey() {
      return this.mergeToolOptions?.primaryKey ?? this.pageinfo.primaryKey;
    },
    /**
     *  未格式化的列
     */
    formatScopeColumns() {
      // 界面列模板
      const scopedSlots = this.$slots;
      const tableColumns = this.searchBarColumns;

      let pageScope = [];
      let customScope = [];

      // 如果表格显示列为空 则不需要插槽
      if (!tableColumns.length) {
        return [];
      }

      for (let item in scopedSlots) {
        pageScope.push(item);
      }
      customScope = tableColumns.filter((d) => !pageScope.includes(d.field));
      pageScope = pageScope.concat(customScope);
      return pageScope;
    },
  },
  mounted() {
    this.$store.commit("plug/setPageLayout", this);
  },
  methods: {
    /**
     * 触发查询按钮
     */
    search() {
      // 我的收藏-清除当前选中项
      this.clearCollect();
      // 重置表格参数
      this.resetTableParams();
      // 加载表格数据
      this.reloadTable();
    },
    /**
     * 重置表格参数
     */
    resetTableParams() {
      if (this.$refs.dataTable) {
        // 查询第一页
        this.$refs.dataTable.pagination.currentPage = 1;
      }
    },
    /**
     * 加载表格数据
     */
    reloadTable() {
      // 表达式赋值
      this.tableOptions.expression = this.searchParams.expression ?? null;
      // 拼接工具栏条件
      this.tableOptions.conditions = [].concat(
        this.searchParams.conditions,
        this.toolCds
      );
      // 查询前 条件钩子
      this.$emit("beforeReloadTable", this.tableOptions.conditions);
      // 表格查询
      this.$refs["dataTable"] && this.$refs["dataTable"].reloadTable();
      // 加入历史记录
      this.addHistory();
    },
    /**
     * 重置选中收藏
     */
    clearCollect() {
      const collectOptions = this.getCollectOptions();
      if (collectOptions) {
        const base_myCollect = this.$toolBar?.$refs?.base_myCollect ?? null;
        // 取消所有选中
        base_myCollect &&
          base_myCollect[0] &&
          base_myCollect[0].setCheckState();
      }
    },
    /**
     * 获取我的收藏配置项
     */
    getCollectOptions() {
      const collectOptions = (this.mergeToolOptions?.options ?? []).filter(
        (d) => d.field === "base_myCollect"
      )[0];
      if (!this.mergeToolOptions.isEnable || !collectOptions) {
        return null;
      }
      return collectOptions;
    },

    /**
     * 加入历史记录
     */
    addHistory() {
      this.btnsOptions.history.isEnable &&
        (this.searchParams.conditions.length > 0 ||
          this.searchParams.expression) &&
        this.$refs["collectAndHistory"] &&
        this.$refs["collectAndHistory"].addHistory(this.searchParams);
    },
    /**
     * 查询栏 加载完毕
     */
    searchLoadSuccess() {
      // 跳转条件
      const jumpParams = getSessionParam();
      // // 全局时间设置
      // const globalTime = localStorage.getItem("globalTime");
      // 判断参数跳转
      if (jumpParams) {
        // 取消默认收藏查询
        this.cancelCollectDefaultSeach();
        this.$refs["searachBar"].loadCondition(jumpParams);
        setTimeout(() => {
          // 执行查询事件
          this.search();
        }, 50);
      } else {
        // 如果不使用我的收藏 则直接查询
        if (!this.mergeToolOptions.isEnable || !this.getCollectOptions()) {
          setTimeout(() => {
            // 执行查询事件
            this.search();
          }, 50);
        } else {
          // 在工具栏加载成功后 执行search方法。
          // 此处用于备注，防止被误删
          this.useToolSearch = true;
        }
      }
    },
    /**
     * 工具栏加载成功
     */
    toolLoadSuccess() {
      // 工具栏加载成功后，进行查询。
      if (this.useToolSearch) {
        setTimeout(() => {
          // 执行查询事件
          this.search();
        }, 50);
      }
    },
    /**
     * 取消历史记录的默认查询
     */
    cancelCollectDefaultSeach() {
      const collectOptions = this.getCollectOptions();
      if (collectOptions) {
        // 取消默认收藏查询
        collectOptions.defaultSeach = false;
      }
    },
    /**
     * 添加用户标签
     */
    addUserTag() {
      if (!this.selectRows || this.selectRows.length == 0) {
        return this.$message("请至少选择一条数据");
      }
      this.tag.isShow = true;
    },
    /**
     * 关闭用户标签
     */
    tagSuccess(params) {
      this.tag.isShow = false;
      // 动态修改标签值 不刷新界面
      if (params) {
        const { tags, isCover, ids } = params;
        let data = this.$refs?.dataTable?.tableData || [];
        data.forEach((d) => {
          if (ids.includes(d.indexid)) {
            let tagList = isCover ? tags : [...(d.usertag || []), ...tags];
            d.usertag = [...new Set(tagList)]; //数组去重
          }
        });
        // 这里要手动更改选中的数据值，当表格数据被更改但是未重新勾选时，selectRows数据不会被更新。
        this.selectRows.forEach((d) => {
          let tagList = isCover ? tags : [...(d.usertag || []), ...tags];
          d.usertag = [...new Set(tagList)]; //数组去重
        });
      }
    },
    /**
     * 行点击事件
     */
    rowClick(val) {
      if (typeof this._events["rowClick"] === "object") {
        this.$emit("rowClick", val);
      } else {
        this.$store.commit("tabContent/setRow", val);
        this.checkRow = val;
      }
    },
    /**
     * 触发下拉切换事件
     */
    selectChange(val, item) {
      this.$emit("change", item);
    },
    // 删除选中数据
    /**
     *
     */
    deleteSelect() {
      let selectRows = this.selectRows;
      if (!selectRows || selectRows.length == 0) {
        return this.$message("请至少选择一条数据进行删除！");
      }
      this.$confirm("确认删除已选数据吗？", "提示", {
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          let conditions = [
            {
              field: this.isEs ? "_id" : this.primaryKey,
              op: "equal",
              value: this.getRowIds().join("|"),
            },
          ];
          let cacheParam = this.$refs.dataTable.getCacheParam()?.params;
          let cacheConditions = JSON.parse(cacheParam).conditions;
          let params = {
            params: JSON.stringify({
              conditions: cacheConditions.concat(conditions),
              indexName: this.pageinfo.indexName,
              indexType: this.pageinfo.indexName,
              doc: this.isEs ? { isdelete: 1 } : { IS_DELETE: 1 },
            }),
          };
          let fun = this.isEs ? deleteEs : deleteDb;
          const deleteUrl = this.isEs
            ? this.mergeToolOptions.esDeleteUrl
            : this.mergeToolOptions.dbDeleteUrl;
          fun(params, deleteUrl).then(() => {
            this.$message("删除成功！");
            this.reloadTable();
          });
        })
        .catch(() => {});
    },
    /**
     * 删除搜索结果
     */
    deleteSearch() {
      this.$confirm("确认删除当前搜索结果吗？", "提示", {
        message: "确认删除当前搜索结果吗？",
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          const searchParams = this.$refs.dataTable.getCacheParam()?.params;
          const conditions = JSON.parse(searchParams).conditions;
          const expression = JSON.parse(searchParams).expression;

          let params = {
            params: JSON.stringify({
              conditions,
              expression,
              indexName: this.pageinfo.indexName,
              indexType: this.pageinfo.indexName,
              doc: this.isEs ? { isdelete: 1 } : { IS_DELETE: 1 },
              limit: 10000,
            }),
          };
          let fun = this.isEs ? deleteEs : deleteDb;
          const deleteUrl = this.isEs
            ? this.mergeToolOptions.esDeleteUrl
            : this.mergeToolOptions.dbDeleteUrl;

          fun(params, deleteUrl).then(() => this.reloadTable());
        })
        .catch(() => {});
    },
    /**
     * 导出选中数据
     */
    exportSelect() {
      if (!this.selectRows || this.selectRows.length == 0) {
        return this.$message("请至少选择一条数据进行导出！");
      }
      let dataParams = this.$refs["dataTable"].getCacheParam();
      dataParams.page = 1;
      let params = JSON.parse(dataParams.params);
      let field = "_id";
      if (!this.isEs) {
        field = this.primaryKey ?? "ID";
      }
      params.conditions.push({
        field: field,
        op: "equal",
        value: this.getRowIds().join("|"),
      });
      dataParams.params = params;
      this.exportBase(dataParams);
    },
    /**
     * 获取id列表
     */
    getRowIds() {
      let pk = this.primaryKey ?? (this.isEs ? "indexid" : "ID");
      let ids = [];
      this.selectRows.forEach((item) => ids.push(item[pk]));
      return ids;
    },
    // 下载选择文件
    downloadChoseFile() {
      this.downloadType = "chose";
      this.downloadFiles();
    },
    // 下载搜索文件
    downloadSearchFile() {
      this.downloadType = "select";
      this.downloadFiles();
    },
    /**
     * 导出搜索结果
     */
    exportSearch() {
      // 如果导出数据库
      if (!this.isEs) {
        let dataParams = this.$refs["dataTable"].getCacheParam();
        dataParams.params = JSON.parse(dataParams.params);
        dataParams.limit = 5000;
        this.exportBase(dataParams);
      } else {
        this.exportDialog.isEnable = true;
        this.exportForm = {
          number: null,
          fileName: new Date().format("yyyyMMddhhmmss"),
        };
        this.$refs["diaForm"]?.resetFields();
      }
    },
    /**
     * 关闭导出搜索结果弹出框
     */
    closeExportForm() {
      this.exportDialog.isEnable = false;
    },
    /**
     * 确认 导出搜索结果
     */
    pxportYes() {
      this.$refs["diaForm"].validate((valid) => {
        if (valid) {
          let dataParams = this.$refs["dataTable"].getCacheParam();
          dataParams.params = JSON.parse(dataParams.params);
          dataParams.limit = this.exportForm.number;
          dataParams.page = 1; //导出搜索结果只能从第一页开始
          this.exportBase(dataParams, this.exportForm.fileName);
          this.closeExportForm();
        } else {
          return false;
        }
      });
    },
    /*
     * 导出数据：toolBar通用导出方法
     *
     * ES-api：/api/file/searchExcel
     * 数据库-api：/api/dataBase/exportExcel
     */
    exportBase(params, fileName) {
      let columns = this.getColumns();
      let filterFileName = this.filterFileName(
        fileName ?? parseTime(new Date(), "{y}{m}{d}{h}{i}{s}")
      );
      let param = {
        fileType: "xlsx",
        fileName: filterFileName,
        titles: JSON.stringify(columns),
        dataParams: JSON.stringify(params),
        module: this.$route.meta.text,
      };
      this.isEs
        ? exportEsData(param).then((res) =>
            exporter({
              action: this.mergeToolOptions.esExportUrl,
              key: res.data,
            })
          )
        : exporter({
            action: this.mergeToolOptions.dbExportUrl,
            ...param,
          });
    },

    /**
     * 过滤文件名称
     */
    filterFileName(name) {
      return name;

      // .replace(/[\/?？\、*"“<>|]/g, "");
    },
    /**
     * 处理表格显示列
     */
    getColumns() {
      // 获取表格的显示列
      let columns = this.gridbar.columns || this.pageinfo.columns || [];
      let exportColumn = [];
      columns.forEach(
        (item) =>
          !item.hide &&
          item.ischecked &&
          exportColumn.push({ field: item.field, title: item.title })
      );
      return exportColumn;
    },
    /**
     * 初始化默认查询
     */
    tableSuccess(tableData) {
      const tablePlug = this.$refs["dataTable"];
      const $baseTable = tablePlug?.$refs?.dataTable ?? null;
      if (typeof this._events["tableSuccess"] === "object") {
        this.$emit("tableSuccess");
      } else {
        if (this.sideOptions.isEnable) {
          const firstTableData = tableData[0] ?? null;
          if (firstTableData) {
            // 更改表格选中行样式
            $baseTable.setCurrentRow(firstTableData);
            // 清空 当前选中行数据
            tablePlug.currentRow = {};
            // 执行click 重新赋值选中行数据
            tablePlug.rowClick(firstTableData);
          } else {
            this.$store.commit("tabContent/setRow", null);
            this.checkRow = null;
          }
        }
      }
    },

    /**
     * 验证导出搜索输入值
     */
    changeExportNumber(rule, value, callback) {
      if (!isIntegerNum(value)) {
        callback(new Error("导出数量必需为正整数"));
      } else if (value < 1) {
        callback(new Error("导出数量不小于1"));
      } else if (value > 5000) {
        callback(new Error("导出数量不大于5000"));
      } else {
        callback();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-layout {
  height: 100%;
  min-width: 1050px;
  overflow-x: auto;
  position: relative;
  aside {
    height: 50px;
    width: 50px;
    position: absolute;
    right: 0;
    z-index: 1;
    top: calc(50% - 25px);
    background: red;
  }
}

.export-dialog :deep(.el-dialog__body) {
  padding: 24px;

  .export-form .el-form-item:last-child {
    margin: 0px;
  }
}
</style>

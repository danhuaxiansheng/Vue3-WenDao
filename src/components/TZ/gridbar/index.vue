<template>
  <div class="page-table">
    <div v-if="enableToolBar" class="toolBar">
      <div
        v-if="enableToolLeft"
        class="element-tooltar__content element-tooltar__left"
      >
        <slot name="tool-left"></slot>
      </div>
      <div
        v-if="enableToolRight"
        class="element-tooltar__content element-tooltar__right"
      >
        <slot name="tool-rigth">
          <ColumnSet
            v-if="!pageAsideLeft && columnConfig.isEnable"
            v-model:columns="setColumns"
          />
          <TableSet
            v-if="!pageAsideLeft && enableSetTableStyle"
            @update="updateModules"
          />
        </slot>
      </div>
    </div>
    <el-table
      ref="dataTable"
      height="calc(100% - 110px)"
      v-loading.fullscreen="isLoading"
      highlight-current-row
      current-row-to-selection
      tooltip-effect="light"
      :class="tableModules.border ? 'has_border' : ''"
      :data="tableData"
      :row-key="getRowKey"
      :default-sort="defaultSort"
      :size="tableModules.size"
      :border="true"
      :stripe="tableModules.stripe"
      @selection-change="handleSelectionChange"
      @row-click="rowClick"
      @sort-change="sortChange"
    >
      <el-table-column
        type="selection"
        v-if="isEnaleSelect"
        fixed="left"
        width="48"
        align="center"
      >
      </el-table-column>

      <!-- :resizable="true"  -->
      <template v-for="(item, index) in tableColumns" :key="index + item.id">
        <el-table-column
          :column-key="index.toString()"
          :prop="item.prop"
          :label="item.label"
          :fixed="item.fixed"
          :min-width="item.width"
          :align="item.align"
          :sortable="item.sortable"
          :sort-orders="sortRules"
          :show-overflow-tooltip="
            enableTooltip.includes(item.prop) ? false : true
          "
        >
          <!-- <slot :name="item.prop" :scope="scope" slot-scope="scope">
            {{ scope.row[item.prop] }}
          </slot> -->
        </el-table-column>
      </template>
      <!-- 操作列 -->
      <el-table-column
        v-if="actionColumn.isEnable"
        :fixed="actionColumn.fixed"
        :label="actionColumn.label"
        :align="actionColumn.align"
        :width="actionColumn.width"
      >
        <!-- <slot
          :name="actionColumn.field"
          :scope="scope"
          slot-scope="scope"
        ></slot> -->
      </el-table-column>
    </el-table>
    <el-pagination
      v-bind="pagination"
      @size-change="sizeChange"
      :pager-count="5"
      @current-change="currentChange"
    >
      <span class="discrib">{{ pagination.discrib }}</span>
    </el-pagination>
  </div>
</template>

<script>
import { getTableData } from "@/api/TZ/index.js";
import TableSet from "./modules/tableSet.vue";
import ColumnSet from "./modules/columnSet.vue";
// import { columnDrop } from "./modules/sortable.js"
import { mapGetters, mapState } from "vuex";
export default {
  components: { TableSet, ColumnSet },
  name: "gridBar",
  props: {
    pageAsideLeft: [Boolean],
    options: {
      type: Object,
      default: () => {
        return {
          url: "/api/search/singleCommon",
          columns: [], // 展示列
          enableTooltip: [], // 需要禁用tips的字段
          conditions: [], // 条件内容
          pagination: {}, // 分页设置
          enableSetColumns: true, // 是否开启 显示列设置
          enableSetTableStyle: true, // 设置表格样式
          defaultSort: {}, // 默认排序字段
        };
      },
    },
  },
  data() {
    return {
      isLoading: false,
      tableData: [],
      multipleSelection: [],
      // 表格分页配置
      pagination: {
        total: 0,
        pageSize: 50,
        currentPage: 1,
        consumeTime: "",
        pageSizes: [50, 100, 200],
        layout: "slot, sizes, prev, pager, next, jumper",
      },
      where: {
        conditions: [],
        indexName: this.$store.state.user.pageinfo.indexName, //查询的索引名称
        indexType: this.$store.state.user.pageinfo.indexName, //查询的索引类型
        // needFields: null, //指定只返回某些字段
        // filterFields: null, //指定不返回某些字段
        // onlyCount: false, //是否只返回该条件匹配的数量 (默认false)
        // group: null, //根据字段去重（目前只支持单个字段）
        // groupsize: null, //需要显示的组数（不传默认为10组）
        // topSize: null, //分组后每组取得数据条数
        // topicType: null, //专题类型 （如：对应 TopicTypeEnum，1.木马邮件 2.木马附件）
        // rule: null, //专题规则对象
        // sortField: null, //排序字段 "time"
        // sortOrder: null //排序类型  "desc"
      },
      defaultSort: {}, // defaultSort: "{prop: 'date', order: 'descending'}",
      // 点击表格字段 依次出现的排序顺序
      sortRules: ["descending", "ascending", null],
      // 当前查询条件
      cacheParam: {},
      tableColumns: [],
      setColumns: [],
      // 当前选中行 --判断当前选中行是否更改 避免界面重复请求
      currentRow: {},

      // 排序时 是否触发查询
      sortSearch: true,
    };
  },
  watch: {
    "options.columns": {
      handler() {
        this.initColumns();
      },
      immediate: true,
    },
    // 用于设置显示列
    setColumns: {
      deep: true,
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
          this.tableColumns = JSON.parse(
            JSON.stringify(newVal.filter((d) => d.ischecked))
          );
          // 设置排序状态
          this.refreshSort();
        }
      },
    },
  },
  computed: {
    ...mapGetters(["pageinfo"]),
    ...mapState({
      // 表格缓存的设置
      tableModules: (state) => state.gridBar.options || {},
    }),
    //是否支持多选
    isEnaleSelect() {
      return this.options.isEnaleSelect ?? true;
    },
    // 接口地址
    url() {
      return this.options.url ?? "/api/search/singleCommon";
    },
    // 被禁用tips的字段
    enableTooltip() {
      return this.options.enableTooltip ?? [];
    },
    // 设置表格格式
    enableSetTableStyle() {
      return this.options.enableSetTableStyle ?? true;
    },
    // 表格列配置
    columnConfig() {
      let options = {
        // 列设置功能 是否开启
        isEnable: this.options.enableSetColumns ?? true,
        // 表格列
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
      };
      if (!this.options.columns || this.options.columns.length == 0) {
        options.columns = this.getColumnsFormat(
          this.$store.state.user.pageinfo.columns
        );
      } else {
        options.columns = this.options.columns;
      }
      // 操作列配置
      options.actionColumn = {
        ...options.actionColumn,
        ...this.options.actionColumn,
      };
      return options;
    },
    // 操作列
    actionColumn() {
      return this.columnConfig?.actionColumn ?? { isEnable: false };
    },
    // 禁用toolbar插槽
    enableToolBar() {
      return this.enableToolLeft || this.enableToolRight;
    },
    // 是否禁用toolbar 左侧子组件
    enableToolLeft() {
      return this.$slots["tool-left"] ?? false;
    },
    // 是否禁用toolbar 右侧子组件
    enableToolRight() {
      // 是否开启 显示列设置
      // 设置表格样式
      return this.columnConfig.isEnable || this.enableSetTableStyle;
    },
  },
  created() {
    // 默认排序
    if (this.options.defaultSort) {
      this.defaultSort = this.options.defaultSort;
      this.where.sortField = this.defaultSort.prop;
      this.where.sortOrder = this.getSortOrder(this.defaultSort.order);
    }
  },
  mounted() {
    this.$store.commit("plug/setTable", this);
    this.pagination.pageSize = parseInt(
      this.$store.state.gridBar.pageSize ?? 50
    );
  },
  methods: {
    /**
     * 初始化列
     */
    initColumns() {
      this.setColumns = JSON.parse(JSON.stringify(this.columnConfig.columns));
      this.tableColumns = JSON.parse(
        JSON.stringify(this.columnConfig.columns.filter((d) => d.ischecked))
      );
    },
    /**
     * 设置列
     */
    updateModules(val) {
      this.$store.commit("gridBar/setOptions", val);
      this.$refs["dataTable"] && this.$refs["dataTable"].doLayout();
    },
    /**
     * 获取列的key值
     */
    getRowKey(row) {
      let primaryKey = row[this.$store.state.user.pageinfo.primaryKey];
      if (!primaryKey) {
        primaryKey = row?.id ?? row?.indexid ?? row?.ID;
      }
      return primaryKey;
    },
    /**
     * 获取 表格条件
     */
    getWhere() {
      // 表达式赋值
      if (!this.options.expression) {
        delete this.where.expression;
      } else {
        this.where.expression = this.options.expression ?? null;
      }
      // 条件赋值
      this.where.conditions = JSON.parse(
        JSON.stringify(this.options.conditions)
      );
      const where = { ...this.where, ...(this.options.where ?? {}) };
      return JSON.stringify(where);
    },
    /**
     * 表个列宽处理
     */
    getColumnWidth(row) {
      return row.width ? row.width : undefined;
    },
    /**
     * 列字段格式化
     */
    getColumnsFormat(data) {
      let list = [];
      data.forEach((ele) => {
        let item = { ...ele, showOverflowTooltip: true };
        if (!item.hide) {
          item.hide = false;
          item.prop = item.field;
          item.label = item.title;
          // 后端排序需将sortable更改为custom
          if (item.sort) {
            item.sortable = "custom";
          }
          item.width = this.getColumnWidth(item);
          list.push(item);
        }
      });
      return list;
    },
    /**
     * 表格数据加载
     */
    reloadTable() {
      this.loader();
    },
    /**
     * 分页数更改
     */
    sizeChange(pageSize) {
      this.pagination.currentPage = 1;
      this.pagination.pageSize = pageSize;
      this.$store.commit("gridBar/setPageSize", pageSize);
      this.loader();
    },
    /**
     * 当前页更改
     */
    currentChange(current) {
      this.pagination.currentPage = current;
      this.loader();
    },
    /**
     * 表格复选框修改
     */
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.$emit("selectChange", JSON.parse(JSON.stringify(val)));
    },
    /**
     * 修改排序
     */
    sortChange(sort) {
      // 修改排序
      this.updateSort(sort);
      // 设置显示列之后，重置排序，此时不需要查询
      if (!this.sortSearch) {
        this.sortSearch = true;
        return;
      }
      //重置我的收藏 选中
      this.clearCollect();
      // 查询数据
      this.loader();
    },
    /**
     * 修改排序
     */
    refreshSort() {
      const where = this.where;
      const sortField = where.sortField;
      let sortOrder = where.sortOrder;
      if (sortField && sortOrder) {
        sortOrder = sortOrder == "desc" ? "descending" : "ascending";
        this.$nextTick(() => {
          // 排序时 不触发查询
          this.sortSearch = false;
          // 设置排序选中
          this.$refs["dataTable"].sort(sortField, sortOrder);
        });
      }
    },
    /**
     * 重置选中收藏
     */
    clearCollect() {
      const toolBar = this.$store.state.plug.toolBar;
      if (!toolBar) {
        return;
      }
      const fitData = toolBar.options.filter(
        (d) => d.field === "base_myCollect"
      )[0];
      if (!fitData) {
        return;
      }
      // 取消所有选中
      toolBar.$refs?.base_myCollect[0]?.setCheckState();
    },

    /**
     * 修改排序参数
     */
    updateSort(sort) {
      this.where.sortField = sort.prop;
      this.where.sortOrder = this.getSortOrder(sort.order);
    },

    /**
     * 格式化排序格式
     */
    getSortOrder(key) {
      if (!key) {
        return null;
      }
      return (key || "").includes("desc") ? "desc" : "asc";
    },
    /**
     * 行点击事件
     */
    rowClick(val) {
      console.time("rowclick");
      // 如果更改了当前选中行 则触发事件
      if (JSON.stringify(this.currentRow) !== JSON.stringify(val)) {
        this.$emit("rowClick", val);
        this.currentRow = val;
      }
    },
    /**
     * 获取缓存的查询条件
     */
    getCacheParam() {
      return JSON.parse(JSON.stringify(this.cacheParam));
    },
    /**
     * 获取当前的查询参数
     */
    getParams() {
      this.cacheParam = {
        page: this.pagination.currentPage,
        limit: this.pagination.pageSize,
        params: this.getWhere(),
      };
      return { ...this.cacheParam, ...this.options.extendParams };
    },
    /**
     * 表格数据处理
     */
    loader() {
      this.isLoading = true;
      getTableData({
        url: this.url, //'/api/search/singleCommon',
        data: this.getParams(),
        // 主要用于 防抖
        // clearCache 是否对相同请求进行覆盖（中断上一个请求）
        clearCache: true,
        // 标识 防止不同场景下的请求 被一并中断
        cacheName: "tableSearch",
      })
        .then((res) => {
          this.isLoading = false;
          this.tableData = res.data;
          this.pagination.total = res.total;
          this.pagination.discrib = `共${
            res.realTotal || res.total || 0
          }条，用时${res.consumeTime}`;
          this.$emit("tableSuccess", this.tableData);
        })
        .catch((res) => {
          // 手动中断上一个请求 不关闭遮罩
          if (res.name !== "abort") {
            this.isLoading = false;
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./style/index.scss";
</style>

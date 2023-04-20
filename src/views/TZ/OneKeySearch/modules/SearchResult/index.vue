<template>
  <el-empty v-if="!tableData.length"></el-empty>
  <div v-else class="element-result__wrap">
    <!-- 头部快捷筛选区 -->
    <module-switch :modules="switchModules"></module-switch>
    <!-- 底部表格+聚合展示区 -->
    <div class="element-result__body">
      <div class="element-result__left">
        <!-- 数据过滤 -->
        <data-filter
          :filter="filter"
          :complexConditions="complexConditions"
        ></data-filter>
        <div class="element-table__wrap">
          <data-table :table-data="tableData" :keyword="keyword"></data-table>
          <el-pagination
            v-bind="pagination"
            @size-change="sizeChange"
            @current-change="currentChange"
            :pager-count="5"
          >
            <span class="discrib">{{ pagination.discrib }}</span>
          </el-pagination>
        </div>
      </div>
      <div class="element-result__right">
        <cluster-statistics :modules="modules"></cluster-statistics>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "SearchResult",
  props: {
    keyword: {
      type: String,
      default: "",
    },
    searchResult: {
      type: Object,
    },
    isRefreshModel: {
      type: Boolean,
      default: true,
    },
    complexConditions: {
      type: Array,
    },
  },
  data() {
    return {
      // 当前模块
      modules: [],
      // 缓存模块
      switchModules: [],
      filter: {
        reponseTime: "",
        total: 0,
      },
      tableData: [],
      pagination: {
        //分页设置
        total: 200,
        discrib: "共0条",
        pageSize: this.pageSize,
        currentPage: 1,
        consumeTime: "",
        pageSizes: [50, 100, 200],
        layout: "slot, sizes, prev, pager, next, jumper",
      },
    };
  },
  computed: {
    ...mapState({
      pageSize: (state) => parseInt(state.gridBar.pageSize) || 50,
    }),
  },
  watch: {
    searchResult: {
      handler(newVal) {
        this.bindSearchResult(newVal);
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    bindSearchResult(result) {
      // 模块切换-数据
      this.modules = result.model;
      if (this.isRefreshModel) {
        this.switchModules = this.modules;
      }
      // 过滤-条数/耗时
      this.filter = {
        reponseTime: result.reponseTime,
        total: result.total,
      };
      // 构建：表格数据
      this.tableData = result.data || [];
      // 构建：表格分页数据（需求：只查看前200条数据）
      this.pagination.total = result.total > 200 ? 200 : result.total;
      this.pagination.discrib = `共计${this.pagination.total}条`;
    },
    sizeChange(val) {
      this.pagination.pageSize = val;
      this.$store.commit("onekeySearch/setCurPageSize", val);
    },
    currentChange(val) {
      this.pagination.currentPage = val;
      // Vuex状态缓存
      this.$store.commit("onekeySearch/setCurPageNum", val);
    },
  },
  components: {
    moduleSwitch: () => import("./moduleSwitch.vue"),
    dataFilter: () => import("./dataFilter.vue"),
    dataTable: () => import("./dataTable.vue"),
    clusterStatistics: () => import("./clusterStatistics.vue"),
  },
};
</script>

<style lang="scss" scoped>
.element-result__wrap {
  height: 100%;
  .element-result__body {
    height: calc(100% - 40px);
    > div {
      display: inline-block;
      height: 100%;
      float: left;
    }
    .element-result__left {
      padding-right: 16px;
      height: calc(100% + 16px);
      width: calc(100% - 304px);
      .element-table__wrap {
        overflow-y: auto;
        height: calc(100% - 50px);
        margin-top: 16px;
      }
      .element-table__body {
        height: calc(100% - 48px);
        padding-right: 16px;
        overflow-y: auto;
      }
      .el-pagination {
        text-align: center;
        margin-top: 8px;
      }
    }
    .element-result__right {
      width: 304px;
      position: relative;
      padding-left: 0;
    }
  }
}
</style>

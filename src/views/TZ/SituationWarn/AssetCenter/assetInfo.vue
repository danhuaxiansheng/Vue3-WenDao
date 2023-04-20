<template>
  <div
    class="asset_info"
    :class="project1126 ? 'is_table' : ''"
    v-loading="loading"
  >
    <el-tabs v-if="project1126" v-model="tabActive" type="card">
      <el-tab-pane
        :key="item.name"
        v-for="item in tabList"
        :label="item.label"
        :name="item.name"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="info_container">
      <search-bar
        ref="searachBar"
        :options="searchOptions"
        v-model:params="searchParams"
        @search="reloadTable"
        @onload="searchLoadSuccess"
        @reset="reloadTable"
      >
      </search-bar>
      <div class="list_container">
        <template v-if="project1126">
          <table-tool
            :sortField="sortField"
            :tabActive="tabActive"
          ></table-tool>
          <table-info
            :resData="resData"
            :key="tabActive"
            :tabActive="tabActive"
          >
          </table-info>
        </template>
        <template v-else>
          <card-tool :sortField="sortField"></card-tool>
          <card-info :resData="resData"></card-info>
        </template>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="reloadTable"
          :pager-count="5"
          v-model:current-page="pager.currentPage"
          :page-sizes="pager.pageSizes"
          v-model:page-size="pager.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pager.total"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { getResData } from "@API/TZ/AssetCenter.js";
import { getSessionParam } from "@PAGE/platform.js";
export default {
  name: "assetInfo",
  props: {
    nodepicked: {
      type: Array,
      default() {
        return [];
      },
    },
    notGroupid: Boolean,
  },
  provide() {
    return {
      activeMenu: () => {
        return this.tabList.filter((item) => item.name == this.tabActive)[0];
      },
    };
  },
  data: () => ({
    loading: false,
    // searchBar查询条件
    searchParams: {},
    // searchbar配置
    searchOptions: {
      isEs: true,
      time: {
        isEnable: true,
        field: "detecttime",
        title: "发现时间",
        defualtOptions: "最近7天",
        clearable: false,
        global: false, // 应用全局-功能按钮
      },
      condition: {
        useExpression: false, // 禁用表达式
        custom: false,
        columns: null,
      },
    },
    // toolbar资产排序
    sortField: "detecttime",
    pager: {
      currentPage: 1,
      total: 0,
      pageSizes: [50, 100, 200],
      pageSize: 50,
    },
    resData: [],
    // 表格模式下选择的标签页
    tabActive: "businessSystem",
    tabList: [
      { name: "businessSystem", label: "业务系统" },
      { name: "safetyEquipment", label: "安全设备" },
      { name: "networkEquipment", label: "网络设备" },
      { name: "terminalEquipment", label: "终端设备" },
      { name: "serverEquipment", label: "服务器设备" },
      { name: "otherEquipment", label: "其他设备" },
      { name: "internetExport", label: "互联网出口信息" },
      { name: "segmentInformation", label: "网段信息" },
      { name: "portService", label: "端口服务信息" },
      { name: "cloudPlatform", label: "云平台信息" },
      { name: "roomInformation", label: "机房信息" },
      { name: "serviceData", label: "业务数据信息" },
    ],
  }),
  beforeCreate() {
    this.project1126 = this.$store.getters.project1126;
  },
  created() {
    this.$bus.$on("updateAssetTable", (sortField) => {
      sortField && (this.sortField = sortField);
      this.reloadTable();
    });
    this.$bus.$on("updateAssetItem", ({ indexid, changes }) => {
      let ids = indexid.split(",");
      this.resData.forEach((item) => {
        if (ids.includes(item.indexid)) {
          changes.forEach(({ key, value }) => {
            this.$set(item, key, value);
          });
        }
      });
    });
    // this.$once("hook:beforeDestroy", () => {
    //   this.$bus.$off("updateAssetTable");
    // });
    // this.$once("hook:beforeDestroy", () => {
    //   this.$bus.$off("updateAssetItem");
    // });
    // 获取页面searchbar映射
    if (this.project1126) {
      this.getSearchbarMap();
    }
  },
  watch: {
    tabActive() {
      this.resData = [];
      this.pager.total = 0;
      this.reloadTable();
      this.getSearchbarMap();
      this.searchParams = []; // 切换选项卡重置条件
    },
  },
  methods: {
    async getSearchbarMap() {
      const searchMap = await this.$store.dispatch("tz/searchMap");
      this.searchOptions.condition.columns = searchMap[this.tabActive] ?? [];
      // this.searchOptions.condition.columns = [{ title: "情报对象", field: "value" }];
    },
    getParams() {
      let conditions = this.$lodash.unionWith(
          [],
          this.searchParams.conditions,
          [
            {
              connector: "and",
              field: "groupid",
              op: "equal",
              value: this.nodepicked.join(","),
            },
          ]
        ),
        params = {
          conditions,
          onlyCount: false, //是否只返回该条件匹配的数量 (默认false)
          indexName: this.$store.state.user.pageinfo.indexName, //查询的索引名称
          indexType: this.$store.state.user.pageinfo.indexName, //查询的索引类型
          sortField: this.sortField,
          sortOrder: "desc",
        };
      return JSON.stringify(params);
    },
    reloadTable() {
      this.loading = true;
      let apiUrl = this.project1126
        ? "/api/asset1126/assetAll"
        : "/api/threat/asset/qryAssetList";
      this.$nextTick(() => {
        let params = {
          page: this.pager.currentPage,
          limit: this.pager.pageSize,
          notGroupid: this.notGroupid,
          params: this.getParams(),
        };
        if (this.project1126) params.indexType = this.tabActive;
        getResData(params, apiUrl)
          .then((_) => {
            this.loading = false;
            this.resData = _.data;
            this.pager.total = _.total;
          })
          .catch(() => {
            this.loading = false;
          });
      });
    },

    // 查询栏 加载完毕
    searchLoadSuccess() {
      // 跳转条件
      const jumpParams = getSessionParam();
      // 判断参数跳转
      if (jumpParams) {
        this.$refs["searachBar"].loadCondition(jumpParams);
      }
      // 执行查询事件
      this.$emit("onload");
      // this.search();
    },

    handleSizeChange() {
      this.pager.currentPage = 1;
      this.reloadTable();
    },
  },
  components: {
    searchBar: () => import("@COMP/TZ/searchbar"),
    cardTool: () => import("./assetCard/toolbar.vue"),
    cardInfo: () => import("./assetCard/dataList.vue"),
    tableTool: () => import("./assetTable/toolbar.vue"),
    tableInfo: () => import("./assetTable/dataList.vue"),
  },
};
</script>

<style lang="scss" scoped>
$navHeight: 48px;
.asset_info {
  height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.el-tabs) {
    height: auto;
    .el-tabs__header {
      height: auto;
      border: none;
      background: #fff;
      margin-bottom: 0;
      .el-tabs__nav-prev,
      .el-tabs__nav-next {
        line-height: $navHeight;
        height: $navHeight;
        padding: 0 3px;
      }
      .el-tabs__nav {
        border: none;
        .el-tabs__item {
          height: $navHeight;
          line-height: $navHeight;
          font-weight: normal;
          padding: 0 15px;
          border: none;
          &.is-active {
            background: #f1f6fd;
            color: $highColor;
            &:after {
              display: none;
            }
          }
        }
      }
    }
    .el-tabs__content {
      display: none;
    }
  }
  .info_container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    .list_container {
      flex: 1;
      min-height: 0;
      margin-top: 16px;
      display: grid;
      grid-template-rows: 62px auto 60px;
      .el-pagination {
        text-align: center;
        padding: 16px;
      }
    }
  }
  &:not(.is_table) {
    .search-bar,
    .list_container {
      @include cardStyle;
    }
  }
  &.is_table .info_container {
    @include cardStyle;
    margin: 16px;
    .list_container {
      margin-top: 0;
      grid-template-rows: 62px auto 52px;
      border-top: 1px solid $lineColor;
      .el-pagination {
        padding: 8px 16px;
      }
    }
  }
}
</style>

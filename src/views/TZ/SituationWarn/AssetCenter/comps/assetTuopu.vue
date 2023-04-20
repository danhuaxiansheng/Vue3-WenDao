<template>
  <el-dialog
    :title="title"
    v-model:visible="visible"
    width="880px"
    v-loading="isLoading"
    :close-on-click-modal="false"
  >
    <div class="chart_container">
      <div class="my_chart" ref="myChart"></div>
      <el-empty v-show="!mChart"></el-empty>
    </div>
    <el-table
      ref="dataTable"
      :height="200"
      :data="tableData"
      v-loading="tableIsLoading"
      empty-text="暂无相关数据"
    >
      <el-table-column
        v-for="item in columns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width"
        :formatter="item.format"
        :sortable="item.sortable"
        show-overflow-tooltip
      >
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="loadTable(true)"
      v-model:current-page="pager.currentPage"
      :page-sizes="pager.pageSizes"
      :pager-count="5"
      v-model:page-size="pager.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pager.total"
    >
    </el-pagination>
  </el-dialog>
</template>

<script>
import { tuoGraph, tuoTable } from "@API/TZ/AssetCenter.js";
import pageSettings from "../../modules/pageSettings-asset.js";
import * as echarts from "echarts";
export default {
  name: "assetTuopu",
  data() {
    return {
      title: "资产拓扑",
      targetItem: {},
      visible: false,
      isLoading: false,
      tableIsLoading: false,
      mChart: null,
      tableData: [],
      columns: [
        {
          prop: "communicationType",
          label: "通信类型",
          width: "94",
          sortable: false,
        },
        { prop: "sip", label: "源IP", width: "132", sortable: true },
        { prop: "sipGroupName", label: "源IP组", width: "94", sortable: false },
        { prop: "siparea", label: "源IP地址", width: "104", sortable: false },
        { prop: "dip", label: "目的IP", width: "132", sortable: true },
        {
          prop: "dipGroupName",
          label: "目的IP组",
          width: "94",
          sortable: false,
        },
        { prop: "diparea", label: "目的IP地址", width: "104", sortable: false },
      ],
      pager: {
        currentPage: 1,
        pageSize: 50,
        pageSizes: [50, 100, 150, 200],
        total: 0,
      },
    };
  },
  methods: {
    reset() {
      this.tableData = [];
      this.mChart && this.mChart.dispose();
      this.mChart = null;
    },
    init(targetItem) {
      if (this.targetItem.indexid !== targetItem.indexid) {
        this.targetItem = { ...targetItem };
        this.reset();
        this.getTuopuData();
        this.loadTable();
      }
      this.visible = true;
    },
    getTuopuData() {
      this.isLoading = true;
      tuoGraph({ assetIp: this.targetItem.ip, size: 10 })
        .then((res) => {
          this.isLoading = false;
          if (!res.data) return;
          let chartOption = pageSettings.getTuopuChart(res.data);
          this.mChart = echarts.init(this.$refs.myChart, "macarons");
          this.mChart.setOption(chartOption);
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    loadTable(loadingShow) {
      loadingShow && (this.tableIsLoading = true);
      tuoTable({
        assetIp: this.targetItem.ip,
        page: this.pager.currentPage,
        limit: this.pager.pageSize,
      })
        .then((res) => {
          this.tableData = [...res.data] ?? [];
          this.pager.total = this.tableData.length;
          this.tableIsLoading = false;
        })
        .catch(() => {
          this.tableIsLoading = false;
        });
    },
    handleSizeChange() {
      this.pager.currentPage = 1;
      this.loadTable(true);
    },
  },
};
</script>

<style lang="scss" scoped>
.chart_container {
  height: 340px;
  position: relative;
  .my_chart {
    height: 100%;
  }
  .el-empty {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
}
.el-table :deep(.el-empty__image) {
  display: none;
}
.el-pagination {
  margin-top: 16px;
  text-align: center;
}
</style>

<template>
  <div class="element-page__content">
    <pageLayout
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :gridbar="gridOptions"
      :tabConfig="tabConfig"
    >
      <template v-slot:action-column="{ scope }">
        <el-button
          class="element-table__button"
          @click.stop="getEmlBrowseData(scope.row)"
        >
          <i class="iconfont icon-table-detail"></i>详情
        </el-button>
      </template>
    </pageLayout>

    <el-dialog
      title="操作详情"
      v-model:visible="dialogConfig.visible"
      width="778px"
      height="508px"
    >
      <el-table
        height="calc(100% - 41px)"
        highlight-current-row
        current-row-to-selection
        :data="dialogConfig.emlBrowseData"
        :row-key="getRowKey"
        size="small"
        :border="true"
        @sort-change="sortChange"
      >
        <el-table-column
          property="EML_KEY"
          label="邮件主键"
          width="180"
        ></el-table-column>
        <el-table-column
          property="SUBJECT"
          label="主题"
          width="355"
        ></el-table-column>
        <el-table-column
          property="BROWSE_TIME"
          label="浏览时间"
          :sortable="true"
          width="164"
        ></el-table-column>
      </el-table>

      <el-pagination
        v-bind="dialogConfig.pagination"
        @size-change="sizeChange"
        :pager-count="5"
        @current-change="currentChange"
      >
        <span class="discrib">{{ dialogConfig.pagination.discrib }}</span>
      </el-pagination>
    </el-dialog>
  </div>
</template>

<script>
// import _ from "lodash";
import { postEmlBrowse } from "@/api/TZ/AuditSystem/EmlBrowseStatis.js";
export default {
  name: "OperateAuditNew",
  data() {
    return {
      dialogConfig: {
        visible: false,
        sortOrder: "desc",
        emlBrowseData: [],
        // 表格分页配置
        pagination: {
          total: 0,
          pageSize: 50,
          currentPage: 1,
          consumeTime: "",
          discrib: "",
          pageSizes: [50, 100, 200],
          layout: "slot, sizes, prev, pager, next, jumper",
        },
      },
      searchOptions: {
        isEnable: true,
        isEs: false,
        time: {
          field: "BROWSE_TIME",
          title: "最后浏览时间",
          defualtOptions: "最近24小时",
          clearable: true,
          global: true,
        },
        condition: {
          useExpression: false,
          custom: false,
        },
      },
      // toolBar配置
      toolOptions: {
        isEnable: true,
        primaryKey: "USER_ID",
        dbExportUrl: "/api/dataBase/exportEmlBrowse", // 导出数据库接口
        options: [
          // 导出选中数据
          { field: "base_exportSelect" },
          // 导出搜索结果
          { field: "base_exportSearch", icon: "iconfont icon-export" },
          // 我的收藏
          { field: "base_myCollect" },
        ],
      },
      // tabContent配置
      tabConfig: {
        isEnable: false,
      },
      gridOptions: {
        url: "/api/dataBase/qryEmlBrowse",
        enableSetColumns: false,
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "180",
          field: "action-column",
        },
        defaultSort: {
          prop: "BROWSE_TIME",
          order: "descending",
        },
      },
    };
  },
  methods: {
    getEmlBrowseData() {
      const $state = this.$store.state;
      const searchTimeRange = $state.plug.searchBar.timeValue;
      const postParams = {
        indexName: $state.user.pageinfo.indexName,
        indexType: $state.user.pageinfo.indexName,
        sortField: "BROWSE_TIME",
        sortOrder: this.dialogConfig.sortOrder,
        topSize: null,
        group: null,
        conditions: [
          { field: "USER_ID", value: "admin", op: "equal" },
          {
            field: "BROWSE_TIME",
            value: searchTimeRange?.join(" - ") || "",
            op: "range",
          },
        ],
      };
      //请求数据
      postEmlBrowse({
        page: this.dialogConfig.pagination.currentPage,
        limit: this.dialogConfig.pagination.pageSize,
        params: JSON.stringify(postParams),
      }).then((res) => {
        this.dialogConfig.emlBrowseData = res.data || [];
        this.dialogConfig.pagination.total = res.total;
        this.dialogConfig.pagination.discrib = `共${res.total || 0}条，用时${
          res.consumeTime
        }`;
        this.dialogConfig.visible = true;
      });
    },
    getRowKey(row) {
      let primaryKey = row[this.$store.state.user.pageinfo.primaryKey];
      if (!primaryKey) {
        primaryKey = row?.id ?? row?.indexid ?? row?.ID;
      }
      return primaryKey;
    },
    sortChange(sortable) {
      let sort = "desc";
      if (sortable.order == "ascending") {
        sort = "asc";
      }
      this.dialogConfig.sortOrder = sort;
    },
    sizeChange(pageSize) {
      this.dialogConfig.pagination.currentPage = 1;
      this.dialogConfig.pagination.pageSize = pageSize;
      this.getEmlBrowseData();
    },
    currentChange(current) {
      this.dialogConfig.pagination.currentPage = current;
      this.getEmlBrowseData();
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>

<style lang="scss" scoped>
.element-link__tag {
  @include ellipsis;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: $highColor;
  }
}
:deep(.el-pagination) {
  text-align: center;
  margin-top: 8px;
}
:deep(.el-dialog__body) {
  height: calc(100% - 42px);
}
</style>

<template>
  <div class="search_history">
    <div class="toolbar">
      <el-date-picker
        v-model="timeArr"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        unlink-panels
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        @change="timeChange"
        end-placeholder="结束日期"
        align="right"
      >
      </el-date-picker>
      <el-input
        placeholder="请输入内容"
        suffix-icon="iconfont icon-search"
        v-model="keyword"
        @change="loadData"
      >
      </el-input>
    </div>
    <div class="find_area" v-show="findAreaShow">
      已勾选 {{ rowpicks.length }} 项
      <span class="pointer" @click="deleteData">删除</span>
    </div>
    <el-table
      :data="tableData"
      @selection-change="selectChange"
      height="calc(100% - 90px)"
    >
      <el-table-column type="selection" width="35"> </el-table-column>
      <el-table-column
        label="查询时间"
        prop="F_CreatorTime"
        width="130"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column label="查询内容" prop="F_ShowData" show-overflow-tooltip>
      </el-table-column>
      <el-table-column label="操作" width="50">
        <template v-slotslot="scope">
          <i
            class="iconfont icon-search"
            @click="doSearch(scope.row)"
            title="查询"
          ></i>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      small
      layout="prev, pager, next"
      :total="pager.total"
      :pager-count="5"
      :page-size="pager.pageSize"
      v-model:current-page="pager.pageIndex"
      @current-change="() => loadData()"
      @size-change="() => loadData()"
    >
    </el-pagination>
  </div>
</template>

<script>
import { findHistory, deleteHistory } from "@/api/TZ/index";
import setting from "@/setting.js";
export default {
  name: "searchHistory",
  data() {
    return {
      keyword: "",
      timeValue: "",
      timeArr: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近1周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近1个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近3个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      tableData: [],
      pager: {
        total: 0,
        pageSize: 50,
        pageIndex: 1,
      },
      findAreaShow: false,
      rowpicks: [],
      pageinfo: this.$store.state.user.pageinfo || {},
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    /**
     * 获取历史记录
     */
    loadData() {
      let param = {
        page: this.pager.pageIndex,
        limit: this.pager.pageSize,
        pageId: this.pageinfo.pageId,
        systemId: setting.WdSystemID,
        params: this.getParams(),
      };
      findHistory(param).then((res) => {
        this.pager.total = res.total;
        this.tableData = res.data;
      });
    },
    getParams() {
      return JSON.stringify({
        sortOrder: "desc",
        sortField: "F_CreatorTime",
        time: this.timeValue,
        keyword: this.keyword,
      });
    },
    timeChange(val) {
      this.timeValue = val ? val.join(" - ") : "";
      this.loadData();
    },
    selectChange(list) {
      this.rowpicks = list;
      this.findAreaShow = !!this.rowpicks.length;
    },
    deleteData() {
      this.$confirm("确认删除已选数据吗？", "提示", {
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          let ids = [];
          let param = {
            systemId: setting.WdSystemID,
            fids: [],
          };
          this.rowpicks.forEach((n) => {
            ids.push(n.F_Id);
          });
          param.fids = JSON.stringify(ids);
          deleteHistory(param).then(() => {
            this.$message.success("删除成功！");
            // 删除数据后，当页的数据有可能被清空，此时应当查询第一页数据
            if (ids.length === this.tableData.length) {
              this.pager.pageIndex = 1;
            }
            this.loadData();
          });
        })
        .catch(() => {});
    },
    doSearch(history) {
      this.$emit("search", history);
    },
  },
};
</script>

<style lang="scss" scoped>
.search_history {
  height: 100%;
  position: relative;
  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .el-input {
      width: calc(50% - 6px);
    }
    :deep(.el-date-editor) {
      width: calc(50% - 6px);

      .el-range-separator {
        width: 26px;
      }
      .el-range-input {
        width: 40%;
      }
    }
  }
  .find_area {
    position: absolute;
    color: #fff;
    background: $highColor;
    top: 0;
    width: 100%;
    line-height: 40px;
    padding: 0 20px;
    i {
      margin-right: 36px;
    }
    span {
      float: right;
      margin-left: 40px;
    }
  }
  .el-table {
    :deep(.cell) {
      padding: 0 8px;
    }
  }
  .el-pagination {
    margin-top: 16px;
    text-align: center;
  }
}
</style>

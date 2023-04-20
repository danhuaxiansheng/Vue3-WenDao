<template>
  <div class="search_collect" v-loading="loading">
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
      <i class="el-icon-close" @click="findAreaShow = !findAreaShow"></i>
      已勾选 {{ rowpicks.length }} 项
      <span class="pointer" @click="deleteData()">删除</span>
      <span class="pointer" @click="findAreaShow = !findAreaShow">取消</span>
    </div>
    <el-table
      :data="tableData"
      @selection-change="selectChange"
      height="calc(100% - 90px)"
    >
      <el-table-column type="selection" width="40"> </el-table-column>
      <el-table-column
        label="收藏名称"
        prop="F_SaveName"
        width="150"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        label="收藏时间"
        prop="F_CreatorTime"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column label="操作" width="110">
        <template v-slotslot="scope">
          <div class="btn_container">
            <i
              class="iconfont icon-collect"
              :class="{ active: scope.row.F_IsDefault }"
              @click="setDefault(scope.row)"
              :title="scope.row.F_IsDefault ? '取消默认' : '设为默认'"
            ></i>
            <i
              class="iconfont icon-search"
              @click="doSearch(scope.row)"
              title="查询"
            ></i>
            <i
              class="iconfont icon-delete"
              @click="deleteData(scope.row.F_Id)"
              title="删除"
            ></i>
            <i
              class="iconfont icon-table-detail"
              @click="details(scope.row)"
              title="详情"
            ></i>
          </div>
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
    <el-dialog
      title="条件详情"
      v-model:visible="dialogVisible"
      width="560px"
      :modal="false"
      :close-on-click-modal="false"
      @beforeClose="dialogVisible = false"
    >
      <el-highlight class="highlight-font" :keys="['并且', '或者']">
        {{ detailsTxt }}
      </el-highlight>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >关闭</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  findCollect,
  deleteCollect,
  setDefaultCollect,
  setCancelCollect,
} from "@/api/TZ/index";
import setting from "@/setting.js";
export default {
  name: "searchCollect",
  data() {
    return {
      keyword: "",
      timeArr: [],
      rowpicks: [],
      timeValue: "",
      detailsTxt: "",
      loading: false,
      dialogVisible: false,
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
      pageinfo: this.$store.state.user.pageinfo || {},
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    /**
     * 获取收藏记录
     */
    loadData() {
      let param = {
        page: this.pager.pageIndex,
        limit: this.pager.pageSize,
        pageId: this.pageinfo.pageId,
        systemId: setting.WdSystemID,
        params: this.getParams(),
      };
      findCollect(param).then((res) => {
        this.pager.total = res.total;
        this.tableData = res.data;
      });
    },
    getParams() {
      return JSON.stringify({
        time: this.timeValue,
        keyword: this.keyword,
        sortOrder: "desc",
        sortField: "F_CreatorTime",
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
    deleteData(id) {
      this.$confirm(id ? "确认删除？" : "确认删除已选数据吗？", "提示", {
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          let ids = [];
          let param = {
            systemId: setting.WdSystemID,
            fids: [],
          };
          if (id) {
            ids.push(id);
          } else {
            this.rowpicks.forEach((n) => {
              ids.push(n.F_Id);
            });
          }
          param.fids = JSON.stringify(ids);
          this.loading = true;
          deleteCollect(param).then(() => {
            this.loading = false;
            this.$message.success("删除成功！");
            // 删除数据后，当页的数据有可能被清空，此时应当查询第一页数据
            if (ids.length === this.tableData.length) {
              this.pager.pageIndex = 1;
            }
            this.loadData();
            // 删除数据后 需要对“我的收藏”下拉框进行数据同步
            this.updateDropdown();
          });
        })
        .catch(() => {});
    },
    details(row) {
      this.detailsTxt = row.F_ShowData;
      this.dialogVisible = true;
    },
    setDefault(row) {
      let param = {
        fids: row.F_Id || row.fids,
        pageId: this.pageinfo.pageId,
        systemId: setting.WdSystemID,
      };
      let fun = row.F_IsDefault ? setCancelCollect : setDefaultCollect;
      this.loading = true;
      fun(param).then(() => {
        row.F_IsDefault = !row.F_IsDefault;
        this.$message.success(row.F_IsDefault ? "已设置为默认" : "已取消默认");
        // 只有一个默认
        if (row.F_IsDefault) {
          this.tableData.forEach((d) => {
            if (d.F_Id !== row.F_Id) {
              d.F_IsDefault = false;
            }
          });
        }
        this.loading = false;
      });
    },
    doSearch(row) {
      this.$emit("search", JSON.parse(row.F_SaveData));
    },

    /**
     * 对“我的收藏” 下拉数据进行同步
     */
    updateDropdown() {
      const base_myCollect =
        this.$store.state.plug?.toolBar?.$refs?.base_myCollect[0] ?? null;
      base_myCollect && base_myCollect.loadCollect();
    },
  },
};
</script>

<style lang="scss" scoped>
.search_collect {
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
    .btn_container {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      .iconfont {
        font-size: 18px;
        padding: 0 2px;
        &.active {
          color: #f96d19;
        }
      }
    }
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

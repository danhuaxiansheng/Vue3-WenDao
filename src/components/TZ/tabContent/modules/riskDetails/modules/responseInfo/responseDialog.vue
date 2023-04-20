<template>
  <el-dialog
    title="交互详情"
    width="1020px"
    append-to-body
    v-model:visible="visible"
    :before-close="handleClose"
  >
    <div class="elemnt-response__dialog">
      <el-radio-group :slow="false" class="radio-group" v-model="activeName">
        <el-radio-button label="Headers"></el-radio-button>
        <el-radio-button label="Response"></el-radio-button>
      </el-radio-group>
      <div class="res-content">
        <responseContent
          v-if="activeName === 'Headers'"
          :options="options"
          :row="row"
        />
        <el-input
          v-else
          type="textarea"
          class="res-text"
          resize="none"
          :autofocus="false"
          placeholder="暂无数据"
          readonly
          v-model="responseDetails"
        >
        </el-input>
      </div>
      <i
        class="el-icon-arrow-left element-location__icon"
        @click="setLocationData(-1)"
      ></i>
      <i
        class="el-icon-arrow-right element-location__icon"
        @click="setLocationData(1)"
      ></i>
    </div>
    <span slotslot="footer" class="dialog-footer">
      <div class="footer-pager">
        <span class="curPage">{{ page }}</span
        >/
        <span class="allPage">{{ total }}</span>
      </div>
      <div>
        <a class="data-location" @click="locationData"
          ><i class="iconfont icon-location"></i>定位该条数据</a
        >
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </span>
  </el-dialog>
</template>
<script>
import responseContent from "./responseContent.vue";

// import { generalQuery } from "@/api/TZ/tabContent/riskDetails/response.js";
import { formatPayload } from "@PAGE/platform.js";
import { mapGetters, mapState } from "vuex";
export default {
  name: "responseDialog",
  components: { responseContent },
  props: {
    // 当前内容块名称
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    // visible: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  data() {
    return {
      activeName: "Headers",
      responseDetails: "",
      total: 0,
      page: 1, //当前第几条数据
      row: null,
      visible: true,
    };
  },
  computed: {
    ...mapGetters(["$table", "pageinfo"]),
    ...mapState({
      storeRow: (state) => state.tabContent.row,
      // 表格数据
      tableData: (state) => state.plug.table.tableData ?? [],
    }),
  },
  created() {
    this.row = this.storeRow;
    this.setLocation();
    this.buildResponse();
  },
  methods: {
    /**
     * 关闭弹出框
     */
    handleClose() {
      this.$emit("update:visible", false);
    },

    /**
     * 构建请求详情
     */
    buildResponse: function (data = null) {
      let _code = "";
      const row = (data ? data : this.storeRow) ?? null;
      const indexName = this.pageinfo.indexName;
      if (!row) {
        return;
      }
      switch (true) {
        // case row.hasOwnProperty("h-res-data"):
        //   _code = row["h-res-data"];
        //   break;
        // case row.hasOwnProperty("responsedata") ||
        //   row.hasOwnProperty("h-res-body"):
        //   _code = row["responsedata"] || row["h-res-body"];
        //   break;
        // case row.hasOwnProperty("responddata"):
        //   _code = row["responddata"];
        //   break;
        //HTTP页面需要查询接口
        case typeof indexName == "string" && indexName == "http-*":
          // var params = {
          //   ids: row.indexid,
          //   indexName: row.indexname,
          //   needFields: ["h-res-data"],
          // };
          // 待验证
          // generalQuery({ params: JSON.stringify(params) }).then((res) => {
          //   let resData = res?.data ?? {};
          //   _code = resData["h-res-data"] ?? formatPayload(resDataHtml);
          //   this.responseDetails = _code;
          // });
          break;
      }
      _code = formatPayload(_code);
      this.responseDetails = _code;
    },

    /**
     * 设置当前数据所在位置
     */
    setLocation() {
      let page = 0;
      this.tableData.some((n, m) => {
        if (n.indexid === this.storeRow.indexid) {
          page = m;
          return true;
        } else return false;
      });
      this.total = this.tableData.length;
      this.page = page + 1;
    },

    /**
     * 定位数据
     */
    locationData() {
      const currRow = this.tableData[this.page - 1];
      currRow &&
        // 更改表格选中行样式
        (this.$table.$refs?.dataTable.setCurrentRow(currRow),
        // 清空 当前选中行数据
        (this.$table.currentRow = {}),
        // 执行click 重新赋值选中行数据
        this.$table.rowClick(currRow),
        // 关闭弹出框
        this.handleClose());
    },

    /**
     * 切换详情数据
     */
    setLocationData(num) {
      const data = this.tableData ?? [];
      const catNum = this.page + num;
      if (catNum < 1) {
        this.$message.warning("当前数据已经是第一条");
        return;
      } else if (catNum > data.length) {
        this.$message.warning("当前数据已经是最后一条");
        return;
      } else {
        this.page = catNum;
        this.row = data[catNum - 1];
        this.buildResponse(data[catNum - 1]);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.elemnt-response__dialog {
  height: 520px;
  text-align: center;
  position: relative;
   :deep( .el-tabs__nav ){
    width: 100%;
    text-align: center;
  }

  .element-location__icon {
    position: absolute;
    top: 236px;
    cursor: pointer;
    font-size: 25px;
    color: $highColor;
    &.el-icon-arrow-left {
      left: -14px;
    }
    &.el-icon-arrow-right {
      right: 0px;
    }
  }
}

.res-content {
  height: calc(100% - 18px);
  position: relative;
  overflow-y: auto;
  text-align: left;
  margin: 10px 26px 0px;
  .res-text {
    height: 100%;
     :deep( textarea ){
      background-color: #f9fcfe;
      height: 100%;
    }
     :deep( textarea:hover) {
      border-color: #f9fcfe;
    }
  }
   :deep(.element-sub_content) span {
    font-size: 14px;
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .data-location {
    cursor: pointer;
    user-select: none;
    padding-right: 36px;
  }
  .footer-pager {
    padding-left: 40px;
  }
}
</style>

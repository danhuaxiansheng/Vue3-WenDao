<template>
  <!-- 标签 -->
  <div
    class="packages-content"
    :class="isLr ? 'left-right-panle' : ''"
    v-loading="loading"
  >
    <div class="panle-item package-item">
      <!-- 数据包 -->
      <label class="item-title">数据包详情</label>
      <div class="table_border">
        <el-table
          ref="packageTable"
          size="mini"
          :height="isLr ? 'calc(100% - 55px)' : 'auto'"
          :data="packageData"
          highlight-current-row
          :style="{ minWidth: packageColWidths }"
          @row-click="rowClick"
        >
          <template v-for="item in packageCols">
            <el-table-column
              v-if="item.type"
              :key="item.label"
              :type="item.type"
              align="center"
              :label="item.label"
              :min-width="!isLr ? item.minWidth : item.width"
            >
            </el-table-column>
            <el-table-column
              v-else
              :key="item.prop"
              :prop="item.prop"
              :label="item.label"
              :min-width="!isLr ? item.minWidth : item.width"
              show-overflow-tooltip
            >
              <!-- <slot :name="item.prop" :scope="scope" slot-scope="scope">
                {{ getTableContent(scope.row, item.prop) }}
              </slot> -->
            </el-table-column>
          </template>
        </el-table>

        <el-pagination
          v-if="isLr"
          :pager-count="5"
          v-bind="pagination"
          @size-change="sizeChange"
          @current-change="currentChange"
        >
          <span class="discrib">{{ pagination.discrib }}</span>
        </el-pagination>
      </div>
    </div>
    <div class="panle-item playload-item" ref="playload">
      <!-- 负载信息 -->
      <aside v-show="positionY" :style="{ top: `${positionY}px` }"></aside>
      <label class="item-title">负载信息</label>
      <el-table
        size="mini"
        class="playload"
        :height="isLr ? 'calc(100% - 35px)' : 'auto'"
        highlight-current-row
        :style="{ minWidth: playLoadColWidths }"
        :data="list"
      >
        <template>
          <el-table-column
            :key="playLoadCols[0].label"
            type="index"
            align="center"
            :label="playLoadCols[0].label"
            :min-width="
              !isLr ? playLoadCols[0].minWidth : playLoadCols[0].width
            "
          >
          </el-table-column>

          <el-table-column
            :prop="playLoadCols[1].prop"
            :label="playLoadCols[1].label"
            :key="playLoadCols[1].label"
            :min-width="
              !isLr ? playLoadCols[1].minWidth : playLoadCols[1].width
            "
            show-overflow-tooltip
          >
            <template v-slotslot="scope">
              <span class="ellipsis em-panle">
                <template
                  v-for="(item, inx) in scope.row[playLoadCols[1].prop]"
                  :key="inx"
                >
                  &nbsp;
                  <em
                    @mousemove="setActive(scope.row, inx)"
                    @mouseout="unSetActive(scope.row, inx)"
                    :class="item.isActive ? 'active' : ''"
                    v-html="item.text"
                  ></em>
                </template>
              </span>
            </template>
          </el-table-column>

          <el-table-column
            :prop="playLoadCols[2].prop"
            :label="playLoadCols[2].label"
            :key="playLoadCols[2].label"
            :min-width="
              !isLr ? playLoadCols[2].minWidth : playLoadCols[2].width
            "
            show-overflow-tooltip
          >
            <template v-slotslot="scope">
              <span class="ellipsis em-panle">
                <template
                  v-for="(item, inx) in scope.row[playLoadCols[2].prop]"
                  :key="inx"
                >
                  <!-- &nbsp; -->
                  <em
                    @mousemove="setActive(scope.row, inx)"
                    @mouseout="unSetActive(scope.row, inx)"
                    :class="item.isActive ? 'active' : ''"
                    v-html="item.text"
                  ></em>
                </template>
              </span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
  </div>
</template>

<script>
import { getPackages } from "@/api/TZ/index.js";
import { mapState } from "vuex";
export default {
  name: "flowIndex",
  props: {
    dataList: {
      type: Array,
    },
    // 是否左右布局
    isLr: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 默认配置
      defaultOptions: {
        isEnable: true, // 是否启用
        isShow: true, // 是否隐藏
        isFold: false,
      },
      list: [],
      packageColWidths: "auto",
      playLoadColWidths: "auto",
      packageCols: [],
      playLoadCols: [],
      reqData: [],
      // 表格分页配置
      pagination: {
        total: 0,
        pageSize: 50,
        currentPage: 1,
        consumeTime: "",
        pageSizes: [50, 100, 200],
        layout: "slot, sizes, prev, pager, next, jumper",
      },
      loading: false,
      positionY: 0,
    };
  },
  created() {
    let packageColList = [
      { type: "index", label: "序号", width: 44 },
      { prop: "SrcAddr", label: "源IP", width: this.isLr ? 134 : 114 },
      { prop: "SrcPort", label: "源端口", width: this.isLr ? 90 : 80 },
      { prop: "DstAddr", label: "目的IP", width: this.isLr ? 134 : 114 },
      { prop: "DstPort", label: "目的端口", width: this.isLr ? 100 : 90 },
      { prop: "Payload", label: "负载长度", width: this.isLr ? 100 : 70 },
      { prop: "Length", label: "原始帧长度", width: this.isLr ? 103 : 100 },
      { prop: "Time", label: "交互时间", width: 151 },
    ];
    if (this.isLr) packageColList.shift(); // 弹窗里没有序号这一列
    let packageColWidths = packageColList
        .map((item) => item.width)
        .reduce((prev, curr) => prev + curr),
      packageCols = packageColList.map((item) => ({
        ...item,
        minWidth: `${(item.width * 100) / packageColWidths}%`,
      }));
    let playLoadColList = [
        { type: "index", label: "序号", width: 60 },
        { prop: "tempHex", label: "16进制数据", width: 314 },
        { prop: "tempAscii", label: "ASCII数据", width: 132 },
      ],
      playLoadColWidths = playLoadColList
        .map((item) => item.width)
        .reduce((prev, curr) => prev + curr),
      playLoadCols = playLoadColList.map((item) => ({
        ...item,
        minWidth: `${(item.width * 100) / playLoadColWidths}%`,
        widths: 370,
      }));
    this.packageColWidths = this.isLr ? "auto" : `${packageColWidths}px`;
    this.playLoadColWidths = this.isLr ? "auto" : `${playLoadColWidths}px`;
    this.packageCols = packageCols;
    this.playLoadCols = playLoadCols;
  },
  watch: {
    dataList: {
      deep: true,
      handler(arr) {
        this.data = [];
        if (arr && arr.length > 0) {
          this.setTableSelect();
        }
      },
    },
  },
  computed: {
    ...mapState({ storeRow: (state) => state.tabContent.row }),
    packageData() {
      return this.isLr ? this.reqData : this.dataList;
    },
  },
  mounted() {
    if (this.isLr) {
      this.setData();
    } else {
      this.setTableSelect();
    }
  },
  methods: {
    rowClick(val) {
      this.bindLoadData(val);
    },
    sizeChange(pageSize) {
      this.pagination.currentPage = 1;
      this.pagination.pageSize = pageSize;
      this.setData();
    },
    getTableContent(row, item) {
      if (item == "DstPort" || item == "SrcPort") {
        return row[item] || "";
      }
      return row[item];
    },
    /**
     * 当前页更改
     */
    currentChange(current) {
      this.pagination.currentPage = current;
      this.setData();
    },
    // 设置表格默认选择第一条
    setTableSelect() {
      this.$nextTick(() => {
        this.$refs["packageTable"].setCurrentRow(
          this.$refs["packageTable"].data[0]
        );
        this.bindLoadData(this.$refs["packageTable"].data[0]);
      });
    },
    setData() {
      let starttime = this.storeRow.time || this.storeRow["@createtime"];
      let params = {
        params: JSON.stringify({
          userid: this.$store.state.user.userName, //获取用户名
          sessionids: this.storeRow.sessionid,
          starttime: starttime,
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
        }),
      };
      this.reqData = [];
      if (this.storeRow.pcapfileflag && this.storeRow.pcapfileflag === "存在") {
        this.loading = true;
        getPackages(params)
          .then((res) => {
            this.loading = false;
            if (res.status === 200) {
              if (!res.data || res.data.length === 0) {
                this.$message({
                  message: "暂未关联到会话信息！",
                  type: "warning",
                });
              } else {
                this.reqData = res.data;
                this.pagination.total = res.total;
                this.setTableSelect();
              }
            } else {
              this.$message.error("请求失败！");
            }
          })
          .catch((res) => {
            // 手动中断上一个请求 不关闭遮罩
            if (res.name !== "abort") {
              this.loading = false;
            }
          });
      } else {
        this.$message.warning("数据包不存在!");
      }
    },
    bindLoadData: function (data) {
      if (!data) return;
      this.$nextTick(() => {
        let activeTr = document.querySelector(".left-right-panle .current-row");
        if (!activeTr) return;
        let asidePosition = activeTr.getBoundingClientRect();
        let containerPosition = this.$refs.playload.getBoundingClientRect();
        this.positionY =
          asidePosition.y - containerPosition.y + activeTr.offsetHeight / 2;
      });
      let list = [];
      var asciidata = data.ASCIIData,
        hexdataArr = data.HexData,
        rows = [],
        chrows = [];

      let hexList = [];
      //构建16进制数据
      for (var i = 0; i < hexdataArr.length; i++) {
        if (i % 2 == 0) {
          hexList.push({
            text: hexdataArr[i] + hexdataArr[i + 1],
            isActive: false,
          });
        }
        if (i % 16 == 15) {
          hexList.push({
            text: "&nbsp;",
            isActive: false,
          });
        }
        if (i % 32 === 31) {
          rows.push(JSON.parse(JSON.stringify(hexList)));
          hexList = [];
        }
      }

      let asciiList = [];
      //构建ASCII数据
      for (var b = 0; b < asciidata.length; b++) {
        asciiList.push({
          text: asciidata[b],
          isActive: false,
        });
        if (b % 16 === 7) {
          asciiList.push({
            text: "&nbsp;&nbsp;&nbsp;",
            isActive: false,
          });
        }
        if (b % 16 === 15) {
          chrows.push(JSON.parse(JSON.stringify(asciiList)));
          asciiList = [];
        }
      }

      hexList.length > 0 && rows.push(hexList);
      asciiList.length > 0 && chrows.push(asciiList);

      rows.forEach((item, inx) => {
        list.push({
          tempHex: item,
          tempAscii: chrows[inx] || [],
        });
      });

      this.list = !this.isLr ? list.slice(0, 6) : list;
    },
    setActive(item, inx) {
      item.tempAscii[inx] && (item.tempAscii[inx].isActive = true);
      item.tempHex[inx] && (item.tempHex[inx].isActive = true);
    },
    unSetActive(item, inx) {
      item.tempAscii[inx] && (item.tempAscii[inx].isActive = false);
      item.tempHex[inx] && (item.tempHex[inx].isActive = false);
    },
  },
};
</script>

<style lang="scss" scoped>
.packages-content {
  width: 100%;
  height: 100%;
}
.item-title {
  padding-left: 14px;
  height: 36px;
  line-height: 34px;
  color: $highColor;
  font-weight: bold;
  position: relative;
  font-size: 14px;
}

.el-pagination {
  margin-top: 10px;
}

em {
  font-style: normal;
  color: $mainColor;
}

.mr-3 {
  margin-right: 3px;
}

.em-panle {
  text-align: left;
}

.panle-item {
  overflow: auto;
  .el-table {
    font-size: 12px;
     :deep(tr) {
      background-color: #f9fcfe;
    }
  }
}

.left-right-panle {
  display: flex;
  gap: 24px;
  .table_border {
    height: calc(100% - 35px);
    border: 1px solid rgba(179, 167, 167, 0.1);
  }
  .panle-item {
    min-width: 0;
    flex: 1;
    overflow: visible;
    .el-table {
      font-size: 14px;
    }
  }
  .panle-item.playload-item {
    flex-basis: 580px;
    flex-grow: 0;
    background-color: #fff;
    padding: 2px;
    margin-top: -2px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1), 0px -4px 5px rgba(0, 0, 0, 0.06);
    position: relative;
    aside {
      position: absolute;
      width: 0;
      height: 0;
      left: -10px;
      background: red;
      &::before,
      &::after {
        content: "";
        width: 0;
        height: 0;
        position: absolute;
        left: 0;
        top: -8px;
      }
      &::before {
        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        border-right: 10px solid #fff;
        z-index: 2;
      }
      &::after {
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 10px solid rgba(198, 206, 214, 0.58);
        left: -1px;
        top: -9px;
        z-index: 1;
      }
    }
  }
}
.active {
  background-color: yellow;
}
</style>

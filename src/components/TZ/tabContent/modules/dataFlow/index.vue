<template>
  <div class="dataFlow" v-loading="loading">
    <el-empty mode="hard" v-if="!reqData || reqData.length == 0"></el-empty>
    <div v-else>
      <template v-for="(item, key) in moduleOptions">
        <el-row
          class="dataFlow-panle"
          :id="key"
          :key="key"
          v-if="item.isEnable"
        >
          <!-- 按钮事件 -->
          <el-row class="btn-panle" v-if="key === 'topBtns'">
            <el-button icon="iconfont icon-export" @click="exportData"
              >导出Pcap包
            </el-button>
          </el-row>
          <!-- 数据流 -->
          <template v-else-if="key === 'flow'">
            <el-panel class="flow-panle" shadow="never" theme="border-left">
              <template v-slot:title>
                <div class="title-group">
                  <span>{{ item.title }}</span>
                  <div class="btn-group" v-show="getFlowData(reqData).length">
                    <i
                      class="iconfont icon-download"
                      title="下载"
                      @click="downFlow"
                    ></i>
                    <i
                      class="iconfont icon-table-detail"
                      title="查看详情"
                      @click="detailsFlow"
                    ></i>
                  </div>
                </div>
              </template>
              <flow :dataList="getFlowData(reqData)" />
            </el-panel>
          </template>
          <template v-else-if="key === 'flow1'">
            <el-panel class="flow-panle" shadow="never" theme="border-left">
              <template v-slot:title>
                <div class="title-group">
                  <span>{{ item.title }}</span>
                  <div class="btn-group">
                    <i
                      class="iconfont icon-download"
                      title="下载"
                      @click="downFlow"
                    ></i>
                    <i
                      class="iconfont icon-table-detail"
                      title="查看详情"
                      @click="detailsFlow"
                    ></i>
                  </div>
                </div>
              </template>
              <flow :dataList="reqData.slice(0, 6)" />
            </el-panel>
          </template>
          <!-- 数据包 -->
          <template v-else-if="key === 'flowPackage'">
            <el-panel class="packages-panle" shadow="never" theme="border-left">
              <template v-slot:title>
                <div class="title-group">
                  <span>
                    {{ item.title }}
                  </span>
                  <div class="btn-group">
                    <i
                      class="iconfont icon-table-detail"
                      title="查看详情"
                      @click="detailsPackage"
                    ></i>
                  </div>
                </div>
              </template>
              <packages :dataList="reqData.slice(0, 4)" />
            </el-panel>
          </template>
        </el-row>
      </template>
    </div>
    <el-dialog
      title="数据流详情"
      v-model:visible="flowVisible"
      width="1020px"
      @beforeClose="flowVisible = false"
    >
      <flow flowClass="aside" :dataList="reqData.slice(0, 5000)" />
    </el-dialog>

    <el-dialog
      title="数据包详情"
      v-model:visible="packageVisible"
      width="1328px"
      height="520px"
      @beforeClose="packageVisible = false"
    >
      <packages v-if="packageVisible" :isLr="true" />
    </el-dialog>
  </div>
</template>

<script>
import { getPackages } from "@/api/TZ/index.js";
import { exporter } from "@TOOLS/export.js";
import { mapState } from "vuex";
export default {
  name: "dataFlow",
  components: {
    flow: () => import("./modules/flow"),
    packages: () => import("./modules/packages"),
  },
  props: {
    options: {
      type: Object,
    },
  },
  data() {
    return {
      moduleOptions: {
        // 顶部按钮
        topBtns: {
          title: "",
          isEnable: true,
          isFold: false,
        },
        // 数据流
        flow: {
          title: "数据流",
          isEnable: true, // 是否启用
          isHide: false, // 是否隐藏
          isFold: false, // 是否折叠
          useBtn: true, // 是否使用按钮
        },
        // 数据包
        flowPackage: {
          title: "数据包",
          isEnable: true, // 是否启用
          isHide: false, // 是否隐藏
          isFold: false, // 是否折叠
          useBtn: true, // 是否使用按钮
        },
      },
      reqData: [],
      loading: false,
      flowVisible: false,
      packageVisible: false,
    };
  },
  watch: {
    storeRow: {
      deep: true,
      handler() {
        this.init();
      },
    },
  },
  computed: {
    ...mapState({ storeRow: (state) => state.tabContent.row }),
  },
  created() {
    this.reqData = [];
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.storeRow) {
        this.setData();
      } else {
        this.clear();
      }
    },
    clear() {
      this.reqData = [];
    },
    setData() {
      let starttime = this.storeRow.time || this.storeRow["@createtime"];
      let params = {
        params: JSON.stringify({
          userid: this.$store.state.user.userName, //获取用户名
          sessionids: this.storeRow.sessionid,
          starttime: starttime,
          page: 1,
          limit: 200,
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
      }
      // else {
      //     this.$message.warning('数据包不存在！');
      // }
    },
    getFlowData(data) {
      let flow = [];
      data.length &&
        data.forEach((item) => {
          if (item.ASCIIData && flow.length < 6) {
            flow.push(item);
          }
        });
      return flow;
    },
    /**
     * 导出包
     */
    exportData() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试。");
        return false;
      }
      let starttime = this.storeRow.time || this.storeRow["@createtime"];
      let params = {
        userid: this.$store.state.user.userName, //获取用户名
        sessionids: this.storeRow.sessionid,
        starttime: starttime,
        page: 1,
        limit: 200,
      };
      exporter({
        action: "/api/transfer/getPackagesPcapFile",
        fileType: "zip",
        params: JSON.stringify(params),
      });
    },
    /**
     * 下载
     */
    downFlow() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试。");
        return false;
      }
      let starttime = this.storeRow.time || this.storeRow["@createtime"];
      let conditionJson = {
        userid: this.$store.state.user.userName, //获取用户名
        sessionids: this.storeRow.sessionid,
        starttime: starttime,
      };
      exporter({
        action: "/api/transfer/getPackagesFile",
        fileType: "zip",
        params: JSON.stringify(conditionJson),
      });
    },
    /**
     * 数据流详情
     */
    detailsFlow() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试。");
        return false;
      }
      if (!this.reqData || this.reqData.length === 0) {
        this.$message.warning("暂无数据!");
        return false;
      }
      this.flowVisible = true;
    },
    /**
     *  数据包详情
     */
    detailsPackage() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试。");
        return false;
      }
      if (!this.reqData || this.reqData.length === 0) {
        this.$message.warning("暂无数据!");
        return false;
      }
      this.packageVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-panel) {
  margin-bottom: 8px;
  .el-header-pro {
    height: 31px;
    .el-header-pro__content {
      padding: 0 12px;
      font-weight: bold;
      border: none;
      position: relative;
    }
  }
  .el-panel__body {
    padding: 0;
  }
}
.dataFlow {
  height: 100%;
  width: 100%;
  padding-right: 7px;
}
.el-button {
  margin: 2px 0 9px 0;
  font-size: 14px;
  padding: 0px 10px;
  height: 30px;
  border-color: #e8e8e8;
  [class*="icon-"] + span {
    margin-left: 2px;
  }
}

.dataFlow .dataFlow-panle:last-child {
  height: calc(100% - 28px - 207px);
}

.packages-panle {
  height: 100%;
}

.packages-panle :deep(.el-card__body) {
  height: calc(100% - 43px);
}

.dataFlow :deep(.el-panel__body) {
  height: 100%;
  padding: 0;
}

.dataFlow :deep(.el-header-pro__content) {
  width: 100%;
}
.el-card {
  border: 0px;
}

.title-group {
  width: 100%;
  @include flexCenter($justify: space-between);
  i + i {
    margin-left: 5px;
    padding-left: 5px;
  }
}

.title-group i {
  font-weight: normal;
  font-size: 16px;
  cursor: pointer;
}
.el-dialog__wrapper :deep(.el-dialog__body) {
  height: calc(100% - 42px);
}
</style>

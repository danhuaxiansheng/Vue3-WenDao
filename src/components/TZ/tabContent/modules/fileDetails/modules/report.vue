<template>
  <el-collapse-item name="report">
    <template v-slot:title>
      <div class="element-file__title">
        {{ fileType }}分析报告
        <el-tooltip
          popper-class="element-arrow_tooltip"
          placement="bottom"
          effect="light"
        >
          <div slotslot="content" class="element-tooltip__content">
            <h4>静态风险区间</h4>
            <span class="riskHigh">高<b></b>：X ≥ 100</span>
            <span class="riskMiddle">中<b></b>：80＜ X ＜100</span>
            <span class="riskLow">低<b></b>：X ≤ 80</span>
          </div>
          <i class="iconfont icon-help"></i>
        </el-tooltip>
      </div>
      <el-button-group v-if="dynamicEdition">
        <el-button
          is-icon
          size="mini"
          title="预览分析报告"
          @click.stop="previewReport"
          icon="iconfont icon-preview"
        ></el-button>
        <el-button
          is-icon
          size="mini"
          title="下载分析报告"
          @click.stop="downloadReport"
          icon="iconfont icon-export"
        ></el-button>
      </el-button-group>
    </template>
    <div class="element-report__content">
      <!-- 报告分析：分数 -->
      <ul class="element-risk__score">
        <li class="element-risk__head">
          <span :class="staticRisk.fileriskClass"
            >静态分析
            <b :title="staticRisk.title"></b>
            <em>{{ staticRisk.value || "-" }}</em>
          </span>
          <span v-if="dynamicEdition" :class="dynamicRisk.fileriskClass"
            >动态分析
            <b :title="dynamicRisk.title"></b>
            <em>{{ dynamicRisk.value || "-" }}</em>
          </span>
        </li>
      </ul>
      <!-- 报告分析：内容 -->
      <el-collapse
        v-model="activeModules"
        icon-placement="left"
        class="element-collapse__child"
      >
        <!-- 静态分析 -->
        <el-collapse-item :title="staticField.title" :name="staticField.name">
          <ul class="dataDetails-label">
            <li
              v-for="list in staticField.child"
              :key="list.field"
              v-show="data[list.field] && data[list.field] != '无'"
            >
              <span
                class="element-content__left"
                :title="list.title"
                :data-field="list.field"
                >{{ list.title }}</span
              >
              <span
                class="element-content__right"
                :class="{ ellipsis: list.field == 'olevba' }"
              >
                {{ data[list.field] || "-" }}
              </span>
              <el-button
                is-icon
                size="mini"
                v-show="list.event"
                title="查看详情"
                icon="el-icon-fullscreen"
                class="element-full__button"
                @click.stop="openFullDialog(list)"
              ></el-button>
            </li>
          </ul>
          <!-- 查看详情弹窗 -->
          <el-dialog
            width="620px"
            :title="staticDialog.title"
            v-model:visible="staticDialog.visible"
            :close-on-click-modal="false"
            class="element-static__result"
          >
            <!-- 静态结果 -->
            <ul
              class="dataDetails-label"
              v-if="staticDialog.staticType == 'staticriskresult'"
            >
              <li v-for="list in staticDialog.staticResult" :key="list.field">
                <span class="element-content__left">{{ list.name }}</span>
                <span class="element-content__right">{{
                  staticDialog.staticData[list.field] || "无"
                }}</span>
              </li>
            </ul>
            <!-- 静态描述 -->
            <ul
              class="dataDetails-label"
              v-else-if="staticDialog.staticType == 'staticdesc'"
            >
              <li
                v-for="(data, inx) in staticDialog.staticData"
                style="padding: 0 4px"
                :key="inx"
              >
                {{ data }}
              </li>
            </ul>
            <!-- 结构异常/内嵌RTF/VBA宏 -->
            <el-input
              v-else
              type="textarea"
              class="content"
              aria-disabled="true"
              :value="staticDialog.staticData"
            ></el-input>
          </el-dialog>
        </el-collapse-item>

        <el-collapse-item
          title="网络行为"
          v-show="reportData.networkInfo && reportData.networkInfo.length"
          name="networkInfo"
        >
          <ul class="dataDetails-label">
            <li v-for="(list, inx) in reportData.networkInfo" :key="inx">
              <span class="element-content__left">{{ list.action }}</span>
              <span class="element-content__right">{{ list.networkData }}</span>
            </li>
          </ul>
        </el-collapse-item>

        <el-collapse-item
          title="自启动"
          v-show="reportData.autostart && reportData.autostart.length"
          name="autostart"
        >
          <ul class="dataDetails-label">
            <li v-for="(list, inx) in reportData.autostart" :key="inx">
              <span class="element-content__left">{{ list.type }}</span>
              <span class="element-content__right">{{ list.path }}</span>
            </li>
          </ul>
        </el-collapse-item>

        <el-collapse-item
          title="释放文件"
          v-show="reportData.dropInfo && reportData.dropInfo.length"
          name="dropInfo"
        >
          <ul class="dataDetails-label">
            <li v-for="(list, inx) in reportData.dropInfo" :key="inx">
              <span
                :title="list.name"
                class="element-content__right ellipsis"
                style="width: 100%; padding: 0 8px"
                >{{ list.name }}</span
              >
            </li>
          </ul>
        </el-collapse-item>

        <el-collapse-item
          title="进程动作"
          v-show="
            reportData.processBehavior && reportData.processBehavior.length
          "
          name="processBehavior"
        >
          <ul class="dataDetails-label">
            <li v-for="(list, inx) in reportData.processBehavior" :key="inx">
              <span
                :title="list.name"
                class="element-content__right ellipsis"
                style="width: 100%; padding: 0 8px"
                >{{ list.process }}</span
              >
            </li>
          </ul>
        </el-collapse-item>

        <el-collapse-item
          title="数据包行为"
          v-show="
            reportData.networkDataPackage &&
            reportData.networkDataPackage.length
          "
          name="networkDataPackage"
        >
          <el-table
            :data="reportData.networkDataPackage"
            class="element-table__network"
            height="250"
            lazy
            border
            size="mini"
            style="width: 100%"
          >
            <el-table-column
              prop="port"
              label="地址:端口"
              min-width="120"
              :show-overflow-tooltip="true"
            >
              <template v-slotslot="scope">
                {{ scope.row.ip + ":" + scope.row.port }}
              </template>
            </el-table-column>
            <el-table-column prop="dataLen" label="长度" min-width="60">
            </el-table-column>
            <el-table-column
              prop="data"
              label="二进制"
              min-width="130"
              :show-overflow-tooltip="true"
            >
            </el-table-column>
            <el-table-column
              prop="asciiString"
              label="字符"
              min-width="130"
              :show-overflow-tooltip="true"
            >
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-collapse-item>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
import setting from "@/setting.js";
import { exporter } from "@TOOLS/export.js";
import {
  getDynamicReport,
  downloadReportData,
  relateStaticResult,
} from "@/api/TZ/tabContent/fileDetails/index.js";
import { getAnalysisScore } from "@PAGE/platform.js";
export default {
  name: "reportIndex",
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    fileType: {
      type: String,
      default: "附件",
    },
    isRelate: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    data: {
      handler() {
        this.getFileReport();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      activeModules: ["static", "networkDataPackage"],
      staticField: {
        name: "static",
        title: "静态分析",
        child: [
          { field: "staticdesc", title: "静态描述", event: "staticdescEvent" },
          {
            field: "staticriskresult",
            title: "静态详情",
            event: "staticriskresultEvent",
          },
          { field: "mraptor", title: "结构异常", event: "mraptorEvent" },
          { field: "oleobj", title: "内嵌PKG" },
          { field: "msodde", title: "DDE链接" },
          { field: "isdigitalsign", title: "是否数字签名" },
          { field: "rtfobj", title: "内嵌RTF", event: "rtfobjEvent" },
          { field: "olevba", title: "VBA宏", event: "olevbaEvent" },
        ],
      },
      staticDialog: {
        title: "",
        visible: false,
        staticData: {},
        staticType: "staticriskresult",
        staticResult: [
          { name: "MD5：", field: "md5" },
          { name: "特征检测结果：", field: "kaspersky" },
          { name: "病毒库检测结果：", field: "clamav" },
          { name: "规则检测结果：", field: "loki" },
          { name: "文件名检测结果：", field: "filename" },
          { name: "静态分析时间：", field: "@createtime" },
        ],
      },
      defaultReport: {
        networkInfo: [], //网络行为
        autostart: [], //自启动
        dropInfo: [], //释放文件
        processBehavior: [], //执行流程
        networkDataPackage: [], //数据包行为
      },
      reportData: {},
    };
  },
  computed: {
    ...mapState({
      dynamicEdition: (state) => state.user.baseLine == 3,
      indexName: (state) => state.user.pageinfo.indexName,
    }),
    // 静态风险值
    staticRisk() {
      return getAnalysisScore([80, 100], this.data["staticfilerisk"]);
    },
    // 动态风险值
    dynamicRisk() {
      return getAnalysisScore([11, 21], this.data["filerisk"]);
    },
    relateIndex() {
      return this.isRelate ? "inf-attachment" : this.indexName;
    },
  },
  methods: {
    // 获取分析报告
    getFileReport() {
      if (this.dynamicEdition) {
        this.$emit("showLoading", true);
        let apiParams = {
          isDownload: false,
          tableName: "inf-file",
          column: "reportjsonfile",
          rowkey: this.data.sha256,
          indexId: this.data.indexid,
          fileId: this.data.fileid || "",
          indexName: this.relateIndex,
        };
        getDynamicReport(apiParams)
          .then((res) => {
            // 静态分析
            if (this.data.staticscanstatus == "分析完成") {
              // this.data.staticdesc = res.data.staticdesc || "";
              // this.buildStaticData();
            }
            // 动态分析
            if (
              this.data.taskstate == "分析完成" &&
              JSON.stringify(res.data) != "{}"
            ) {
              this.reportData = _.merge({}, this.defaultReport, res.data);
            }
            this.$emit("showLoading", false);
          })
          .catch((err) => {
            console.log(err);
            this.$emit("showLoading", false);
          });
      }
    },
    // 预览分析报告
    previewReport() {
      const apiUrl = setting.ApiUrl + "/file/findAnalysis";
      const reportUrl = `/fileTemplate/fileDetails/fileDetails.html?&rowkey=${
        this.data.sha256
      }&fileName=filename&tableName=inf-file&column=reportjsonfile&url=${apiUrl}&indexName=${
        this.relateIndex
      }&ids=${this.data.indexid}&fileid=${this.data.fileid || ""}`;

      window.open(reportUrl);
    },
    // 下载分析报告
    downloadReport() {
      const apiParams = {
        tableName: "inf-file",
        rowkey: this.data.sha256,
        rowKeyField: "sha256",
        column: "reportjsonfile",
        isDownload: true,
        fileType: "",
        indexName: this.relateIndex,
        indexId: this.data.indexid,
        fileId: this.data.fileid || "",
        fileName: "filename",
        isCache: true,
      };
      // 下载分析报告
      downloadReportData(apiParams).then((res) => {
        if (res.status == 200) {
          exporter({
            action: "/api/file/findAnalysis",
            key: res.data,
          });
        } else
          this.$message({ message: res.msg || "报告下载失败!", type: "error" });
      });
    },
    // 查看详情
    openFullDialog(list) {
      // 更新类别
      this.staticDialog.staticType = list.field;
      // 构建数据
      if (list.event == "staticriskresultEvent") {
        this.$emit("showLoading", true);
        let apiParams = {
          params: JSON.stringify({
            indexName: "inf-static-scan-result",
            type: "inf-static-scan-result",
            ids: this.data.md5,
          }),
        };
        relateStaticResult(apiParams)
          .then((res) => {
            if (res.status == 200) {
              this.staticDialog.staticData = res.data[0];
              this.staticDialog.title = list.title;
              this.staticDialog.visible = true;
            }
            this.$emit("showLoading", false);
          })
          .catch(() => {
            this.$emit("showLoading", false);
          });
      } else {
        this.staticDialog.staticData = this.data[list.field];
        this.staticDialog.title = list.title + "详情";
        this.staticDialog.visible = true;
      }
      // switch (list.event) {
      //     // 静态详情
      //     case "staticriskresultEvent":

      //         break;
      //     // 静态描述
      //     case "staticdescEvent":
      //         break;
      //     // 结构异常
      //     // 内嵌RTF
      //     // VBA宏
      //     default:

      // }
      // this.staticDialog.title = list.title;
      // this.staticDialog.visible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.dataDetails-label {
  margin-top: 1px;
  .element-full__button {
    line-height: 30px;
  }
}
.element-arrow_tooltip,
.element-risk__head {
  font-size: 12px;
  span {
    display: inline-block;
    background-color: #fff6f1;
    padding: 2px 8px;
    text-align: center;
    min-width: 138px;
    &:first-child {
      margin-right: 8px;
    }
    &.riskLow {
      b {
        background-color: $highColor;
      }
      em {
        color: $highColor;
      }
    }
    &.riskMiddle {
      b {
        background-color: $warnTextColor;
      }
      em {
        color: $warnTextColor;
      }
    }
    &.riskHigh {
      b {
        background-color: $dangerColor;
      }
      em {
        color: $dangerColor;
      }
    }
  }
  b {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    margin: 0 4px;
  }
}
.element-tooltip__content {
  span {
    margin: 0;
    padding: 0;
    display: block;
    text-align: left;
    background-color: transparent;
  }
}
 :deep(.element-static__result) {
  .el-dialog__body {
    max-height: 486px;
  }
  .dataDetails-label {
    margin-top: 0px;
    .element-content__left {
      text-align: right;
    }
    .element-content__left,
    .element-content__right {
      font-size: 14px;
    }
  }
  .content {
    padding: 4px;
  }
  .el-textarea__inner {
    height: 430px;
    resize: none;
  }
}
</style>

<template>
  <div class="page-layout element-container__full" v-loading="loading">
    <div class="element-list__panel">
      <div class="element-list__container">
        <div class="element-list__title">文件风险统计</div>
        <div class="element-list__body element-list__risktype">
          <ul class="element-page__content element-risk__type">
            <li
              v-for="item in riskType"
              :class="{ pointer: item.total }"
              @click="searchByRange(item)"
              :key="item.range"
            >
              <p class="type name">{{ item.name }}</p>
              <p class="type">
                <span class="total">{{ item.total }}</span>
                <span class="today" v-show="item.today">
                  <i class="iconfont icon-point-up"></i>
                  {{ item.today }}</span
                >
              </p>
              <p class="icon">
                <svg-icon
                  :css="{ width: '80px', height: '80px' }"
                  :href="item.icon"
                >
                </svg-icon>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div class="element-list__container">
        <div class="element-list__title">文件分析状态</div>
        <div class="element-list__body">
          <el-empty v-if="!analysisState"></el-empty>
          <div v-else class="element-page__content" ref="analysisState"></div>
        </div>
      </div>
    </div>

    <div class="element-list__panel">
      <div class="element-list__container">
        <div class="element-list__title">文件类型分布</div>
        <div class="element-list__body">
          <el-empty v-if="!fileTypeState"></el-empty>
          <div v-else class="element-page__content" ref="fileTypeState"></div>
        </div>
      </div>
      <div class="element-list__container">
        <div class="element-list__title">任务解析状态</div>
        <div class="element-list__body">
          <el-empty v-if="!fileTaskState"></el-empty>
          <div v-else class="element-page__content" ref="fileTaskState"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import echartConfig from "./modules/pageSettings.js";
import { setSessionParam } from "@PAGE/platform.js";
import { homePage, fileType, taskState } from "@API/TZ/FileAnalysis/index.js";
export default {
  name: "FileIndex",
  data() {
    return {
      loading: false,
      loadState: 0,
      analysisState: true,
      fileTypeState: true,
      fileTaskState: true,
      riskType: [
        {
          name: "高危",
          range: "21 - 100",
          total: 0,
          today: 0,
          type: "top",
          icon: "icon-high-risk",
        },
        {
          name: "中危",
          range: "16 - 20",
          total: 0,
          today: 0,
          type: "middle",
          icon: "icon-middle-risk",
        },
        {
          name: "低危",
          range: "11 - 15",
          total: 0,
          today: 0,
          type: "low",
          icon: "icon-low-risk",
        },
        {
          name: "无风险",
          range: "0 - 10",
          total: 0,
          today: 0,
          type: "zero",
          icon: "icon-none-risk",
        },
      ],
      conditionJson: {
        indexName: "inf-upload-file",
        indexType: "inf-upload-file",
        conditions: [],
        group: "filetype",
      },
    };
  },
  watch: {
    loadState: {
      handler(newVal) {
        if (newVal == 3) {
          this.loading = false;
        }
      },
    },
  },
  created() {
    this.loadState = 0;
    this.loading = true;
    this.getPageData();
  },
  methods: {
    getPageData() {
      this.getHomePageData(); //文件风险统计/文件分析状态
      this.getFileType(); //文件类型分布
      this.getTaskState(); //任务解析状态
    },
    // 获取风险统计/分析状态统计
    getHomePageData() {
      let isdelete = { field: "isdelete", op: "equal", value: "0" };
      let conditions = JSON.parse(JSON.stringify(this.conditionJson));
      conditions.openToday = true;
      conditions.aggGroup = "filerisk";
      conditions.tagGroup = "taskstate";
      conditions.conditions.push(isdelete);
      let apiParams = {
        params: JSON.stringify(conditions),
      };
      homePage(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.bindFileRisk(res.data);
            this.bindAnalysisState(res.data.tag);
          }
          this.loadState += 1;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 获取文件类型分布
    getFileType() {
      let apiParams = this.buildApiParams();
      fileType(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.bindFileTypeState(res.data);
          }
          this.loadState += 1;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 获取任务解析状态
    getTaskState() {
      let apiParams = this.buildApiParams();
      taskState(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.bindTaskState(res.data);
          }
          this.loadState += 1;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    buildApiParams() {
      let conditions = JSON.parse(JSON.stringify(this.conditionJson));
      delete conditions.conditions;
      conditions.onlyCount = false;
      let apiParams = {
        params: JSON.stringify(conditions),
      };

      return apiParams;
    },
    // 绑定风险统计
    bindFileRisk(data) {
      this.riskType.forEach((item) => {
        item.total = data[item.type].total;
        item.today = data[item.type].todyCount;
      });
    },
    // 绑定分析状态
    bindAnalysisState(data) {
      if (!data.length) {
        this.analysisState = false;
        return;
      }
      this.analysisState = true;
      // 构建echarts数据
      let chartOpt = echartConfig.fileAnalysisState(data);
      let chart = this.renderEcharts(chartOpt, "analysisState");
      if (chart) {
        chart.on("click", (params) => {
          let paramValue = "";
          switch (params.data.name) {
            case "全部":
              paramValue = "-999";
              break;
            case "未分析":
            case "等待分析":
              paramValue = "0|6";
              break;
            case "正在分析":
              paramValue = "1|10";
              break;
            case "分析完成":
              paramValue = "2";
              break;
            case "分析失败":
              paramValue = "3|4|7|31|32|33";
              break;
            case "不分析":
              paramValue = "5";
              break;
          }
          setSessionParam({
            isJson: true,
            type: "_blank",
            url: "/TZ/FileAnalysis/FileList",
            sessionName: "paramListSession",
            data: {
              conditions: [
                { field: "@createtime", value: "", op: "range" },
                { field: "taskstate", value: paramValue, op: "equal" },
              ],
            },
          });
        });
      }
    },
    bindFileTypeState(data) {
      if (!data.length) {
        this.fileTypeState = false;
        return;
      }
      this.fileTypeState = true;
      let chartOpt = echartConfig.fileTypeState(data);
      let chart = this.renderEcharts(chartOpt, "fileTypeState");
      // 绑定点击事件
      if (chart) {
        chart.getZr().on("click", (params) => {
          var pointInPixel = [params.offsetX, params.offsetY];
          if (chart.containPixel("grid", pointInPixel)) {
            var pointInGrid = chart.convertFromPixel(
                { seriesIndex: 0 },
                pointInPixel
              ),
              xIndex = pointInGrid[0],
              op = chart.getOption(),
              value = op.xAxis[0].data[xIndex];
            setSessionParam({
              isJson: true,
              type: "_blank",
              url: "/TZ/FileAnalysis/FileList",
              sessionName: "paramListSession",
              data: {
                conditions: [
                  { field: "@createtime", value: "", op: "range" },
                  { field: "filetype", value: value, op: "equal" },
                ],
              },
            });
          }
        });
      }
    },
    // 绑定任务状态
    bindTaskState(data) {
      if (!data.total) {
        this.fileTaskState = false;
        return;
      }
      this.fileTaskState = true;
      let chartOpt = echartConfig.fileTaskState(data);
      this.renderEcharts(chartOpt, "fileTaskState");
    },
    renderEcharts(chartOpt, refname) {
      let chart = null,
        dom = this.$refs[refname];
      if (dom) {
        chart = echarts.init(dom);
        chart.setOption(chartOpt, true);
        window.addEventListener("resize", chart.resize);
      }
      return chart;
    },
    searchByRange(item) {
      if (item.total) {
        setSessionParam({
          isJson: true,
          type: "_blank",
          url: "/TZ/FileAnalysis/FileList",
          sessionName: "paramListSession",
          data: {
            conditions: [
              { field: "@createtime", value: "", op: "range" },
              { field: "filerisk", value: item.range, op: "range" },
            ],
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.element-list__panel {
  height: calc(50% - 8px);
  &:first-child {
    margin-bottom: 16px;
  }
}
.element-list__container {
  @include cardStyle;
  height: 100%;
  display: inline-block;
  &:first-child {
    width: calc(65% - 16px);
    margin-right: 16px;
  }
  &:last-child {
    width: 35%;
  }
  .element-list__title {
    @include cardTitle;
  }
  .element-list__body {
    height: calc(100% - 48px);
    overflow-y: auto;
    padding: 16px;
  }
  .element-list__risktype {
    padding: 40px 48px;
  }
}
.element-risk__type {
  @include flexCenter($justify: space-between);
  li {
    flex: 1;
    height: 100%;
    position: relative;
    p {
      width: 100%;
    }
    .type {
      padding: 0 13.8%;
      &:first-child {
        margin-top: 14.6%;
        margin-bottom: 8px;
      }
      &:nth-child(2) {
        @include flexCenter($justify: space-between);
      }
      .total {
        font-size: 24px;
        font-weight: bold;
        color: $mainColor;
      }
      .today {
        color: #ff0000;
        .iconfont {
          font-weight: bold;
        }
      }
    }
    &:not(:last-child) {
      margin-right: 16px;
    }
    &:first-child {
      background-color: rgba(236, 65, 77, 0.1);
      .name {
        color: $dangerColor;
      }
    }
    &:nth-child(2) {
      background-color: rgba(246, 163, 27, 0.1);
      .name {
        color: $yellow;
      }
    }
    &:nth-child(3) {
      background-color: rgba(26, 115, 232, 0.1);
      .name {
        color: $highColor;
      }
    }
    &:last-child {
      background-color: rgba(52, 168, 83, 0.1);
      .name {
        color: $successColor;
      }
    }
    .icon {
      text-align: right;
      padding-right: 8%;
      position: absolute;
      left: 0;
      bottom: 8%;
    }
  }
}
</style>

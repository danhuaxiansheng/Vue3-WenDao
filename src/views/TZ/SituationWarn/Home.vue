<template>
  <div
    class="page-layout element-container__full element-page__scroll"
    v-loading.body="isLoading"
  >
    <div class="tool_bar">
      <!-- <auto-fresh @fresh="initData()"></auto-fresh> -->
      <el-radio-group :slow="false" v-model="timePick" @change="initData(true)">
        <el-radio-button label="today">今天</el-radio-button>
        <el-radio-button label="seven">最近7天</el-radio-button>
        <el-radio-button label="all">全部</el-radio-button>
      </el-radio-group>
      <el-button @click="exportReport">导出报告</el-button>
    </div>
    <div
      class="module_list clear"
      :class="item.class"
      v-for="(item, key) in moduleList"
      :key="key"
    >
      <h4 class="module_title">
        {{ item.title }}
      </h4>
      <div class="module_container">
        <div
          class="card_item"
          :class="card.key"
          v-for="card in item.modules"
          :key="card.key"
        >
          <div class="card_title">
            <p>{{ card.name }}</p>
            <!-- 资产实时日志右侧单选组 -->
            <el-radio-group
              v-model="timeLogRadioPick"
              @change="getData(card)"
              v-if="card.key == 'timeLog'"
              size="mini"
            >
              <el-radio-button :label="5" plain>5条</el-radio-button>
              <el-radio-button :label="10" plain>10条</el-radio-button>
              <el-radio-button :label="30" plain>30条</el-radio-button>
            </el-radio-group>
            <!-- 运行情况右侧显示已运行时间 -->
            <p v-if="card.key == 'running'" class="running_time">
              已运行：<em>
                <!-- {{ runningData.runtime | formatSeconds }} -->
              </em>
            </p>
            <!-- 网络连接状态-刷新按钮 -->
            <el-button
              v-if="card.key == 'network'"
              size="mini"
              @click="getData(card)"
            >
              <i class="iconfont icon-refresh"></i> 刷新
            </el-button>
          </div>
          <div class="card_container">
            <template v-if="pageDataConfig[card.key].resData != null">
              <el-empty v-if="!pageDataConfig[card.key].resData"></el-empty>
              <template v-else>
                <!-- 威胁统计 -->
                <ol v-if="card.key == 'alarm'">
                  <li v-for="p in alarmData" :key="p.valKey">
                    <i
                      class="pic_icon"
                      :style="{ backgroundPosition: p.iconPosition }"
                    ></i>
                    <div>
                      <p>{{ p.name }}</p>
                      <p
                        class="count"
                        @click="linkTo(p)"
                        :class="{ no_jump: timePick == 'all' }"
                      >
                        {{ pageDataConfig[card.key].resData[p.valKey] }}
                      </p>
                    </div>
                  </li>
                </ol>
                <!-- 模块统计 -->
                <div
                  class="card_content module_content element-page__scroll"
                  v-else-if="card.key == 'module'"
                >
                  <ul>
                    <li v-for="item in moduleData" :key="item.moduleName">
                      <div
                        class="progress_label ellipsis"
                        :title="item.moduleName"
                      >
                        {{ item.moduleName }}
                      </div>
                      <div class="progress_bar_container">
                        <div
                          class="progress_bar"
                          :style="{ width: item.percent }"
                        ></div>
                      </div>
                      <div class="progress_count">{{ item.count }}</div>
                    </li>
                  </ul>
                </div>
                <!-- 运行情况 -->
                <div
                  class="card_content running_content"
                  v-else-if="card.key == 'running'"
                >
                  <p>
                    <span class="label-time label-time__server">
                      服务器时间<em>（{{ runningData.sysTime }}）</em>
                    </span>
                  </p>
                  <ul>
                    <li v-for="item in runningData.list || []" :key="item.name">
                      <div
                        class="progress_label ellipsis"
                        :title="item.tempModule"
                      >
                        {{ item.tempModule }}
                      </div>
                      <div class="progress_bar_container">
                        <div
                          class="progress_bar"
                          :class="item.color"
                          :style="{ width: item.percent }"
                        ></div>
                      </div>
                      <div class="progress_count ellipsis">
                        {{ item.percent }}
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- card内容区（echart容器） -->
                <div v-else class="card_content" :ref="card.key">
                  <!-- 表格 -->
                  <el-table
                    v-if="['timeLog', 'network'].includes(card.key)"
                    :class="card.key"
                    :data="pageDataConfig[card.key].resData"
                    tooltip-effect="light"
                    border
                    :max-height="pageDataConfig[card.key].tableHeight"
                  >
                    <el-table-column
                      v-for="item in tableConfig[card.key]"
                      :key="item.prop"
                      :prop="item.prop"
                      :label="item.label"
                      :min-width="item.minWidth"
                      :formatter="item.format"
                      show-overflow-tooltip
                    >
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  alarm,
  // retrieveClassify,
  module,
  trend,
  asset,
  timeLog,
  flow,
  running,
  network,
} from "@API/TZ/home.js";
import moment from "moment";
import * as echarts from "echarts";
import getConfig from "./modules/pageSettings-home.js";
import { setSessionParam } from "@PAGE/platform.js";
import { exporter } from "@TOOLS/export.js";

export default {
  name: "homeIndex",
  data() {
    let timeLogCols = [
        { label: "攻击时间", prop: "flow_time", width: 130 },
        { label: "源IP", prop: "source_endpoint_ip", width: 125 },
        { label: "目的IP", prop: "destination_endpoint_ip", width: 125 },
        { label: "资产类型", prop: "assetType", width: 80 },
        { label: "攻击类型", prop: "event_typeB", width: 90 },
        { label: "来源模块", prop: "attackfrom", width: 90 },
      ],
      networkCols = [
        {
          label: "序号",
          prop: "inx",
          width: 84,
          format: (row, column, cellValue, index) => index + 1,
        },
        { label: "网口", prop: "name", width: 157 },
        {
          label: "连接状态",
          prop: "status",
          width: 153,
          format: this.formatNetState,
        },
        { label: "IP地址", prop: "ip", width: 234 },
      ],
      timeLogWidths = timeLogCols
        .map((item) => item.width)
        .reduce((prev, curr) => prev + curr),
      timeLogCol = timeLogCols.map((item) => ({
        ...item,
        minWidth: `${(item.width * 100) / timeLogWidths}%`,
      })),
      networkWidths = networkCols
        .map((item) => item.width)
        .reduce((prev, curr) => prev + curr),
      networkCol = networkCols.map((item) => ({
        ...item,
        minWidth: `${(item.width * 100) / networkWidths}%`,
      }));
    return {
      timer: null, // 运行时间的定时器
      timePick: "today",
      isLoading: false,
      moduleList: [
        {
          title: "风险概况",
          class: "risk_info",
          fresh: true, // 自动刷新
          modules: [
            { name: "威胁统计", key: "alarm" }, // timeRange：是否收时间范围控制
            { name: "模块统计", key: "module" },
            { name: "近7日风险数据趋势", key: "trend" },
            { name: "资产类型排行", key: "asset" },
            { name: "资产实时日志", key: "timeLog" },
          ],
        },
        {
          title: "设备状态",
          class: "equip_state",
          modules: [
            { name: "流量接收情况", key: "flow" },
            { name: "运行情况", key: "running" },
            { name: "网络连接状态", key: "network" },
          ],
        },
      ],
      pageDataConfig: {
        //威胁统计
        alarm: {
          getData: alarm,
          resData: {},
          paramsOut: true,
          timeRange: true,
        },
        //模块统计
        module: {
          getData: module,
          resData: null,
          paramsOut: true,
          timeRange: true,
          handlerData: this.handlerModuleData,
        },
        //7日数据风险趋势
        trend: {
          getData: trend,
          resData: null,
          chartConfig: getConfig.riskTrend,
        },
        //资产类型排行
        asset: {
          getData: asset,
          resData: null,
          chartConfig: getConfig.assetRank,
        },
        //资产实时日志
        timeLog: {
          getData: timeLog,
          resData: null,
          paramsOut: true,
          tableHeight: 310,
        },
        //流量接收情况
        flow: {
          getData: flow,
          resData: null,
          timeRange: true,
          chartConfig: getConfig.flowReceive,
        },
        //运行情况
        running: {
          getData: running,
          resData: null,
          handlerData: this.handlerRunningData,
        },
        //网络连接状态
        network: { getData: network, resData: null, tableHeight: 240 },
      },
      alarmData: [
        {
          name: "告警数量",
          valKey: "alarmCount",
          dataType: "alarmCount",
          iconPosition: "0 0",
        },
        {
          name: "风险资产",
          valKey: "alarmAssetCount",
          dataType: "alarmAssetCount",
          iconPosition: "0 -75px",
        },
        {
          name: "违规互联",
          valKey: "violationCount",
          dataType: "violationCount",
          iconPosition: "0 -150px",
        },
        {
          name: "APT告警",
          valKey: "alarmAptCount",
          dataType: "alarmAptCount",
          iconPosition: "0 -225px",
        },
      ],
      tableConfig: { timeLog: timeLogCol, network: networkCol },
      // 模块统计
      moduleData: [],
      // 资产实时日志单选
      timeLogRadioPick: 5,
      // 运行情况
      runningData: {
        runtime: "",
        sysTime: "",
        list: [],
      },
      indexName: "module",
    };
  },
  async mounted() {
    this.initData();
  },

  methods: {
    initData(timeRangChangeOnly) {
      this.moduleList.forEach((item) => {
        item.modules.forEach((module, index) => {
          index < 6 && this.getData(module, timeRangChangeOnly);
        });
      });
    },
    /**
     * @param { Boolean } timeRangChangeOnly 是否只是修改时间范围
     *
     */
    async getData(module, timeRangChangeOnly) {
      this.isLoading = true;
      let key = module.key,
        dataConfig = this.pageDataConfig[key],
        params = dataConfig.timeRange ? { ...this.timeRangeParam } : {};
      if (timeRangChangeOnly && !dataConfig.timeRange) {
        // 切换时间（今天、最近7天、全部）时，只需要重新加载timeChangeReload为true的模块
        return false;
      }
      switch (key) {
        // 模块统计
        case "module":
          params.indexName = this.indexName;
          break;
        // 资产实时日志
        case "timeLog":
          params = { count: this.timeLogRadioPick };
          break;
      }
      if (dataConfig.paramsOut) {
        params = { params: JSON.stringify(params) };
      }
      dataConfig.getData(params).then((res) => {
        this.isLoading = false;
        dataConfig.resData =
          Array.isArray(res.data) && !res.data.length ? "" : res.data;
        if (!res.data) return;
        // 配置echart图表
        if (dataConfig.chartConfig) {
          let chartOpt = dataConfig.chartConfig(res.data);
          this.$nextTick(() => {
            let dom = this.$refs[key];
            if (dom) {
              // 解决接口还没返回路由就跳走导致的报错
              var chart = echarts.init(dom[0]);
              chart.setOption(chartOpt, true);
              window.addEventListener("resize", chart.resize);
            }
          });
        }

        // 设置table的高度
        if (Object.hasOwnProperty.call(dataConfig, "tableHeight")) {
          this.$nextTick(() => {
            let dom = this.$refs[key];
            if (dom) {
              // 解决接口还没返回路由就跳走导致的报错
              let height = window.getComputedStyle(dom[0]).height;
              dataConfig.tableHeight = parseInt(height) - 32;
            }
          });
        }
        // 其他处理情况（模块统计、运行情况）
        let handlerData = dataConfig.handlerData;
        if (handlerData && typeof handlerData == "function") {
          handlerData(res.data);
        }
      });
    },
    refreshNetwork() {},
    linkTo(commonParam) {
      if (this.timePick == "all") return;
      let timeRange = this.formatTime(this.timePick),
        dataType = commonParam.dataType;

      let sTime = `${timeRange.startTime} 00:00:00`,
        eTime = `${timeRange.endTime} 23:59:59`,
        timeRanage = sTime + " - " + eTime,
        jumpObj = {};
      switch (dataType) {
        case "alarmCount": //告警日志
          jumpObj.url = "/TZ/SituationWarn/AlarmLog";
          jumpObj.name = "AlarmLog";
          jumpObj.conditions = [
            { field: "@createtime", op: "range", value: timeRanage },
          ];
          break;
        case "alarmAssetCount": //资产管理
          jumpObj.url = "/TZ/SituationWarn/AssetCenter";
          jumpObj.name = "AssetCenter";
          jumpObj.conditions = [
            { field: "detecttime", op: "range", value: timeRanage },
            {
              conds: [
                {
                  field: "risklevel",
                  op: "equal",
                  value: "16",
                  connector: "or",
                },
                {
                  field: "risklevel",
                  op: "equal",
                  value: "21",
                  connector: "and",
                },
              ],
            },
          ];
          break;
        case "violationCount": //违规互联
          jumpObj.url = "/TZ/SituationWarn/AlarmLog";
          jumpObj.name = "AlarmLog";
          jumpObj.conditions = [
            { field: "@createtime", op: "range", value: timeRanage },
          ];
          jumpObj.expression =
            '{"query":{"query_string":{"query":"issipasset:1 OR isdipasset:1"}}}';
          break;
        case "alarmAptCount": //告警日志-增加条件攻击类型为APT攻击
          jumpObj.url = "/TZ/SituationWarn/AlarmLog";
          jumpObj.name = "AlarmLog";
          jumpObj.conditions = [
            { field: "@createtime", op: "range", value: timeRanage },
            { field: "event_typeB", op: "equal", value: "apt" },
          ];
          break;
      }
      setSessionParam({
        isJson: true,
        sessionName: jumpObj.name,
        type: "_blank",
        url: jumpObj.url,
        data: {
          conditions: jumpObj.conditions || "",
          expression: jumpObj.expression || "",
        },
      });
    },
    // 构建模块统计数据
    handlerModuleData(data) {
      const maxCount = data[0]?.count ?? 0,
        list = [];
      data.forEach(function (item) {
        var percent = (item.count / maxCount).toFixed(2) * 100;
        item.count && (percent = Math.max(percent, 2)); //非0情况下给最小值
        list.push({
          moduleName: item.moduleName,
          percent: percent + "%",
          count: item.count,
        });
      });
      this.moduleData = list;
    },
    // 构建运行情况相关数据
    handlerRunningData(data) {
      var hardwares = data.sysInfo.hardwares[0] || {};
      //CPU
      let runningList = [
        {
          name: "CPU",
          percent: hardwares.usedCpu,
          color: hardwares.cpuStatus.toLocaleLowerCase(),
        },
        {
          name: "内存",
          used: hardwares.usedMemory,
          total: hardwares.totalMemory,
          percent: hardwares.memoryUsedPercent,
          color: hardwares.memoryStatus.toLocaleLowerCase(),
        },
        {
          name: "硬盘",
          used: hardwares.usedDisk,
          total: hardwares.totalDisk,
          percent: hardwares.diskUsedPercent,
          color:
            hardwares.diskStatus && hardwares.diskStatus.toLocaleLowerCase(),
        },
      ];
      runningList.forEach((item) => {
        item.tempModule =
          item.name +
          (item.used ? "（" + item.used + " / " + item.total + "）" : "");
        let parseValue = parseFloat(item.percent);
        if (item.color && item.color.toLocaleLowerCase() !== "red") {
          //超过50%但小于75%的为黄色
          if (parseValue > 50 && parseValue < 80) {
            item.color = "yellow";
          } else if (parseValue > 80) {
            item.color = "red";
          }
        }
      });
      this.runningData = {
        runtime: data.sysInfo.runtime,
        sysTime: data.sysTime,
        list: runningList,
      };
      this.timer && window.clearInterval(this.timer);
      // this.timer = setInterval(() => {
      //   this.runningData.runtime++;
      // }, 1000);
    },
    formatTime(time) {
      let timeDict = { today: 0, seven: 7, all: 30 };
      return {
        startTime: moment()
          .subtract(timeDict[time], "days")
          .format("YYYY-MM-DD"),
        endTime: moment().format("YYYY-MM-DD"),
      };
    },
    formatNetState(data, row, status) {
      let statusText = "连接成功",
        svgClass = "net-success";
      switch (status) {
        case "DOWN":
          statusText = "连接失败";
          svgClass = "net-failed";
          break;
        case "UNKNOWN":
          statusText = "未知";
          svgClass = "net-unknown";
          break;
      }
      return (
        <p>
          <svg-icon
            style={{ width: "34px", height: "19px" }}
            href={`icon-${svgClass}`}
          ></svg-icon>
          <span>{statusText}</span>
        </p>
      );
    },
    exportReport() {
      let param = { ...this.timeRangeParam };
      param.indexName = this.indexName;

      exporter({
        action: "/api/index/exportIndexReport",
        params: JSON.stringify(param),
      });
    },
  },
  computed: {
    timeRangeParam() {
      let param = {
        today: true,
        day: 0,
      };
      switch (this.timePick) {
        case "seven":
          param = {
            today: false,
            day: 7,
          };
          break;
        case "all":
          param.today = false;
          break;
      }
      return param;
    },
  },
  components: {
    // autoFresh: () => import("@COMP/TZ/autoFresh"),
  },
  beforeUnmount() {
    this.timer && window.clearInterval(this.timer);
  },
};
</script>

<style lang="scss" scoped>
@import "@STYLES/TZ/Content/Home/index.scss";
</style>

<template>
  <div class="layout">
    <pageLayout
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :tabConfig="tabConfig"
      :gridbar="gridOptions"
    >
      <!-- 攻击类型 -->
      <template v-slot:attacktype="{ scope }">
        <tags
          :options="{ round: false, type: 'danger' }"
          class="table-tag"
          :data="scope.row.attacktype || []"
        ></tags>
      </template>
      <!-- 源IP -->
      <template v-slot:sattack="{ scope }">
        <span
          class="sattackDetail ellipsis"
          @click.stop="ipDetails(scope.row)"
          >{{ scope.row.sattack }}</span
        >
      </template>

      <!-- 来源模块 -->
      <template v-slot:attackfrom="{ scope }">
        <tags
          :options="{ round: false }"
          class="table-tag"
          :data="scope.row.attackfrom || []"
        ></tags>
      </template>

      <template v-slot:attackdescriptions="{ scope }">
        <div class="event-panle">
          <span class="ellipsis">{{ getEventName(scope.row) }}</span>
          <a @click.stop="eventDetails(scope.row)" title="更多描述">
            <i class="el-icon-pending"></i>
          </a>
        </div>
      </template>
    </pageLayout>

    <el-dialog
      title="更多描述"
      v-model:visible="eventDialog"
      width="760px"
      height="600px"
      class="describe-dialog"
      :close-on-click-modal="false"
      @beforeClose="eventClose"
    >
      <div class="describe-container">
        <div class="describe-header">
          <div class="card-title">
            <span>目的IP列表</span>
          </div>
          <div class="describe-tag-container">
            <el-radio-group v-model="activeKey" @change="activeChange">
              <el-radio-button
                v-for="item in detailsList"
                :key="item.dattack"
                class="describe-tag-radio"
                :label="item.dattack"
              >
                {{ item.dattack }}</el-radio-button
              >
            </el-radio-group>
          </div>
        </div>
        <div class="describe-content">
          <div
            class="content-plane"
            v-for="item in attackFroms"
            :key="item.attackfrom"
          >
            <div class="content-title">
              <span>{{ item.attackfrom }}</span>
            </div>
            <div class="content-container">
              <div
                class="detail-plane"
                v-if="
                  item.attackDescription.risktag &&
                  item.attackDescription.risktag.length
                "
              >
                <div class="detail-plane__title">
                  <span>威胁标签</span>
                </div>
                <div class="describe-threat-container">
                  <tags
                    :options="{ className: 'noBorder', type: 'danger' }"
                    :data="item.attackDescription.risktag"
                  />
                </div>
              </div>
              <div
                class="detail-plane"
                v-if="
                  item.attackDescription.usertag &&
                  item.attackDescription.usertag.length
                "
              >
                <div class="detail-plane__title">
                  <span>用户标签</span>
                </div>
                <div class="describe-user-container">
                  <tags
                    :options="{ className: 'usertag' }"
                    :data="item.attackDescription.usertag"
                  />
                </div>
              </div>
              <div
                class="detail-plane"
                v-if="
                  item.attackDescription.description &&
                  item.attackDescription.description.length
                "
              >
                <div class="detail-plane__title">
                  <span>威胁摘要</span>
                </div>
                <div class="describe-abstract-container">
                  <tags
                    :options="{ className: 'noBorder', type: 'danger' }"
                    :data="item.attackDescription.description"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="content-plane">
            <div class="content-title"><span>攻击链路</span></div>
            <div class="content-container" v-loading="eventLoading">
              <div
                class="chart-plane"
                id="riskTreeChart"
                :style="{ height: planeHeight }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <!-- <span slotslot="footer"
                class="dialog-footer">
                <el-button type="primary"
                    @click="eventClose">关闭</el-button>
            </span> -->
    </el-dialog>
  </div>
</template>
<script>
import { getTableData } from "@/api/TZ/index.js";
import { setSessionParam } from "@PAGE/platform.js";
import * as echarts from "echarts";

import tags from "@COMP/TZ/tags";
export default {
  name: "AlarmLog",
  data() {
    return {
      // searchBar的查询条件
      searchOptions: {
        isEnable: true,
        time: {
          field: "@createtime",
          title: "入库时间",
          defualtOptions: "最近24小时",
          clearable: false,
          global: false, // 应用全局-功能按钮
          dateLimit: 30, // 30天范围内
        },
        // condition: {
        //     useExpression: false, // 禁用表达式
        // },
        tools: {
          collect: {
            isEnable: false,
          },
          history: {
            isEnable: false,
          },
        },
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        options: [
          { field: "base_addUserTag", useBtn: false },
          { field: "base_autoFresh", handler: this.refreshData },
          { field: "attacktypeforquery", type: "eventType", class: "to_right" },
          { field: "risklevel", class: "to_right" },
        ],
      },
      gridOptions: {
        url: "/api/index/riskLogCommon",
        defaultSort: { prop: "@createtime", order: "descending" },
      },
      tabConfig: { isEnable: false },

      // 更多详情
      eventDialog: false,
      eventLoading: false,
      activeKey: "",
      planeHeight: "197px",
      detailsList: [],
      chartData: [],
      echrtDom: null,
    };
  },
  computed: {
    attackFroms() {
      if (this.detailsList && this.detailsList.length > 0) {
        let fData =
          this.detailsList.filter((d) => d.dattack === this.activeKey)[0] || {};
        return fData?.attackFroms ?? [];
      }
      return [];
    },
  },
  methods: {
    getEventName(row) {
      let data = JSON.parse(row.attackdescriptions),
        attackFroms = data[0].attackFroms[0],
        attackDescription = attackFroms
          ? attackFroms.attackDescription
          : {
              description: [],
              risktag: [],
              usertag: [],
            };
      let risktag = attackDescription.risktag,
        usertag = attackDescription.usertag,
        tempDesc = attackDescription.description;
      tempDesc = tempDesc.join(";").replace(/</g, "&lt;");

      let description = tempDesc ? tempDesc.split(";") : [],
        arr = description.concat(risktag, usertag);
      if (!arr.length) return "";

      var text = arr.join("；").replace(/</g, "&lt;");
      return text;
    },
    eventClose() {
      this.eventDialog = false;
    },
    refreshData() {
      // 重新加载条件 -不触发查询
      this.$store.state.plug.pageLayout.reloadTable();
    },
    eventDetails(row) {
      this.detailsList =
        row.attackdescriptions && JSON.parse(row.attackdescriptions);
      this.activeKey = this.detailsList[0]?.dattack || "";
      this.getDetailsData(row);
      this.eventDialog = true;
    },
    // 查看IP详情
    ipDetails(row) {
      var dateTime =
          (row["@createtime"] && row["@createtime"].split(" ")[0]) || "",
        jumpTime = dateTime
          ? dateTime + " 00:00:00 - " + dateTime + " 23:59:59"
          : this.$store.state.plug.searchBar.timeValue.join(" - "),
        jumpParam = {
          data: {
            expression: "",
            conditions: [
              {
                field: "sip",
                op: "equal",
                value: row["sip"],
                connector: "and",
              },
              {
                field: "@createtime",
                op: "equal",
                value: jumpTime,
                connector: "and",
              },
            ],
          },
          isJson: true,
          // notOpen: true,
          sessionName: "paramListSession",
          type: "_blank",
          url: "/TZ/SituationWarn/AlarmLog",
        };
      //跳转
      setSessionParam(jumpParam);
    },
    activeChange() {
      this.bindDescribeChart();
    },
    // 获取图表数据
    getDetailsData(row) {
      let conditions = [{ field: "sattack", op: "equal", value: row.sattack }];
      if (this.$store.state.plug.searchBar.timeValue) {
        conditions.push({
          field: "time",
          op: "range",
          value: this.$store.state.plug.searchBar.timeValue.join(" - "),
        });
      }
      this.chartData = [];
      this.eventLoading = true;
      getTableData({
        url: "/api/threat/riskAnaly/qryAttackLink",
        data: {
          params: JSON.stringify({
            conditions: conditions,
          }),
        },
      })
        .then((res) => {
          this.chartData = res.data;
          this.bindDescribeChart();
          this.eventLoading = false;
        })
        .catch(() => {
          this.eventLoading = false;
        });
    },
    bindDescribeChart: function () {
      let chartData = this.chartData;
      let showCharData = [];

      if (this.activeKey != "全部") {
        showCharData.push({
          name: chartData[0].name,
          children: chartData[0].children.filter(
            (item) => item.name == this.activeKey
          ),
        });
      } else showCharData = chartData;

      if (
        chartData[0] &&
        chartData[0].children &&
        chartData[0].children.length > 0
      ) {
        let totalLenth = 0;
        chartData[0].children.forEach((item) => {
          totalLenth =
            totalLenth + (item.children.length ? item.children.length : 1);
        });
        this.planeHeight = totalLenth > 10 ? totalLenth * 20 + "px" : "197px";
      }

      if (this.echrtDom) {
        // 消除数据
        this.echrtDom.dispose();
      }
      this.$nextTick(() => {
        var chartOpt = {
          grid: { left: "22%", bottom: "15%", top: "10%", right: "13%" },
          tooltip: {
            trigger: "item",
            borderColor: "transparent",
            backgroundColor: "rgba(89,89,89,0.95)",
            textStyle: {
              color: "#fff",
            },
            triggerOn: "mousemove",
            formatter: "{b}",
          },
          series: [
            {
              type: "tree",
              data: showCharData,
              top: "1%",
              left: "2%",
              bottom: "1%",
              right: "18%",

              symbol: "circle",
              symbolSize: 6,
              itemStyle: {
                color: "#1A73E8",
                borderColor: "#1A73E8",
              },
              label: {
                position: "right",
                vertivcalAlign: "middle",
                algin: "right",
                fontSize: 12,
                color: "#424242",
                formatter: function (item) {
                  var name =
                    item.name &&
                    (item.name.length > 15
                      ? item.name.substring(0, 15) + "..."
                      : item.name);

                  return name;
                },
              },
              lineStyle: {
                color: "rgba(0,0,0,.1)",
              },

              emphasis: {
                focus: "descendant",
              },

              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750,
            },
          ],
        };
        var myChart = echarts.init(document.getElementById("riskTreeChart"));
        myChart.setOption(chartOpt, true);
        this.echrtDom = myChart;
      });
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
    tags,
  },
};
</script>

<style lang="scss" scoped>
@import "@STYLES/TZ/Content/SituationWarn/ThreatEvent.scss";

.layout {
  height: 100%;
  width: 100%;
}

.event-panle {
  display: flex;
  align-items: center;
}

.event-panle > span {
  padding-right: 30px;
}
.event-panle > a {
  line-height: 16px;
  margin-left: -30px;
}
.el-icon-pending {
  color: $highColor;
  cursor: pointer;
  font-size: 18px;
  margin-left: 3px;
}

.sattackDetail {
  text-decoration: underline;
  cursor: pointer;
}

.el-radio-button  :deep( .el-radio-button__inner) {
  padding: 0 8px;
  margin-bottom: 4px;
  @include ellipsis;
  display: inline-block;
  height: 28px;
  line-height: 26px;
  text-align: center;
  font-size: 12px;
  color: $highColor;
  background-color: $dropdownMenuActive;
  cursor: pointer;
  max-width: 300px;
  position: relative;
  border: 1px solid $highColor;
}

.el-radio-button.is-active  :deep( .el-radio-button__inner ){
  background-color: $highColor;
  color: #ffffff;
}

.describe-tag-radio {
  margin-right: 8px;
}
</style>

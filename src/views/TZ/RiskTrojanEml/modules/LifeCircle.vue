<template>
  <el-panel shadow="never" theme="border-left" :border="false">
    <!-- <div slotslot="header"
            class="el-float el-header-pro el-header-pro--border-left">
            <div class="el-header-pro__content element-life__circle">
                <span>生命周期</span>
                <el-date-picker v-model="timeValue"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :editable="false"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    align="right">
                </el-date-picker>
            </div>
        </div> -->
    <div class="element-timeline__content">
      <el-empty v-if="!activities.length"></el-empty>
      <el-timeline v-else :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time"
        >
          <span>
            发件<a
              @click="checkRiskEml(activity.time)"
              class="el-highlight el-highlight--primary pointer"
              >{{ activity.count }}</a
            >次
          </span>
          <span class="element-circle__eml" title="高危邮件数">
            <i class="iconfont icon-fish-risk"></i>
            {{ activity.top }}
          </span>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-panel>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { getTimeByFlag } from "@TOOLS/dateTools.js";
import { setSessionParam } from "@PAGE/platform.js";
import { postLifeCircle } from "@API/TZ/RiskTrojanEml/index.js";
export default {
  name: "LifeCirle",
  props: {
    row: {
      type: Object,
    },
    mainTime: {
      type: String,
      default: "time",
    },
  },
  computed: {
    ...mapState({
      indexName: (state) => state.user.pageinfo.indexName || "",
    }),
    ...mapGetters(["$searchBar"]),
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: "最近30分钟",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近1小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "当天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近24小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近7天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
        ],
        onPick: ({ maxDate, minDate }) => {
          this.pickMinDate = minDate;
          this.pickMaxDate = maxDate;
        },
        disabledDate: (time) => {
          // 判断是否存在日期限制
          if (!this.timeConfig.dateLimit) {
            return false;
          } else {
            // 未选择结束时间 计算时间范围
            if (this.pickMinDate && !this.pickMaxDate) {
              const one =
                parseInt(this.timeConfig.dateLimit) * 24 * 3600 * 1000;
              const minTime = this.pickMinDate.getTime() - one;
              const maxTime = this.pickMinDate.getTime() + one;
              return time.getTime() < minTime || time.getTime() > maxTime;
            } else {
              return false;
            }
          }
        },
      },
      timeConfig: {
        dateLimit: true,
      },
      timeValue: [],
      activities: [],
    };
  },
  watch: {
    row: {
      handler(nVal, oVal) {
        if (nVal != oVal) {
          this.updateLifeCircle();
        }
      },
      immediate: true,
      deep: true,
    },
    timeValue: {
      handler(nVal, oVal) {
        if (nVal != oVal) {
          this.updateLifeCircle();
        }
      },
    },
  },
  created() {
    this.timeValue = this.$searchBar.timeValue || [];
  },
  methods: {
    buildContions() {
      let time =
          this.timeValue && this.timeValue.length
            ? this.timeValue.join(" - ")
            : "",
        conditions = [
          { field: "time", op: "range", value: time },
          { field: "froms", value: this.row["froms"], op: "equal" },
        ];
      return conditions;
    },
    updateLifeCircle() {
      let searchConditions = this.buildContions();
      searchConditions.push({ field: "isdelete", value: 0, op: "equal" });
      let apiParams = {
        params: JSON.stringify({
          indexName: this.indexName,
          indexType: this.indexName,
          moreGroups: "risklevel",
          conditions: searchConditions,
          timeGroup: "time",
          interval: "day",
          sortField: this.mainTime,
          sortOrder: "desc",
        }),
      };
      postLifeCircle(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.activities = res.data;
          }
        })
        .catch(() => {});
    },
    checkRiskEml(time) {
      let linkConditions = this.buildContions(),
        circleTime = time + " 00:00:00 - " + time + " 23:59:59";
      linkConditions[0].value = circleTime;
      // 跳转
      setSessionParam({
        isJson: true,
        type: "_blank",
        url: "/TZ/RiskTrojanEml/TrojanEml",
        sessionName: "paramListSession",
        data: { conditions: linkConditions },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
 :deep(.element-life__circle ){
  @include flexCenter($justify: space-between);
  padding-right: 0 !important;
  .el-date-editor--datetimerange.el-input__inner {
    width: 198px;
    height: 24px;
    line-height: 24px;
    padding: 0 8px;
    @include flexCenter($justify: flex-start);
    * {
      font-size: 12px;
    }
    .el-range-separator {
      min-width: 24px;
    }
    .el-range-input {
      width: 70px;
    }
    .el-icon-date {
      top: 0 !important;
    }
    .el-range__close-icon {
      top: -1px;
    }
  }
}
 :deep(.element-timeline__content ){
  padding-top: 16px;
  max-height: 200px;
  overflow-y: auto;
  .pointer {
    text-decoration: underline;
  }
  .el-timeline-item {
    padding-bottom: 16px;
  }
  .el-timeline-item__content {
    padding-right: 16px;
    @include flexCenter($justify: space-between);
  }
  .el-timeline-item__node:before {
    background-color: #fff;
  }
  .element-circle__eml {
    @include flexCenter;
    .iconfont {
      margin-right: 4px;
    }
  }
}
</style>

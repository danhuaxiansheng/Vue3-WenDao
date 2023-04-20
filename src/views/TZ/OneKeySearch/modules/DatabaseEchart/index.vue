<template>
  <div class="element-searchbox__echart">
    <h2>全库数据</h2>
    <div class="element-chart__content" ref="surveyCharts"></div>
  </div>
</template>
<script>
import * as echarts from "echarts";
import echartConfig from "./echart-confing.js";

export default {
  name: "DatabaseEchart",
  props: {
    echartData: {
      type: Array,
    },
  },
  data() {
    return {};
  },
  computed: {
    // ...mapState({
    //     indexName: (state) => state.user.pageinfo.indexName,
    // })
  },

  watch: {
    echartData: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.initEchart();
        }
      },
    },
  },
  methods: {
    initEchart() {
      // 初始化 echarts数据
      let chartOpt = echartConfig.dataBase(this.echartData);
      let dom = this.$refs["surveyCharts"];
      if (dom) {
        var chart = echarts.init(dom);
        chart.setOption(chartOpt, true);
        window.addEventListener("resize", chart.resize);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.element-searchbox__echart {
  margin: 0 auto;
  width: 58.8%;
  min-height: 380px;
  height: calc(100% - 400px);
  h2 {
    text-align: left;
    font-weight: bold;
    padding: 20px 0 0 40px;
  }
  .element-chart__content {
    width: 100%;
    height: calc(100% - 56px);
    padding: 0 20px 10px 20px;
  }
}
</style>

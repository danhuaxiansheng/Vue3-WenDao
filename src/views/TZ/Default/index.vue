<template>
  <pageLayout
    :searchbar="searchOptions"
    :toolbar="toolOptions"
    :gridbar="gridOptions"
    :tabConfig="tabConfig"
  >
  </pageLayout>
</template>
<script>
import _ from "lodash";
export default {
  name: "DefaultModel",
  data() {
    const pageInfo = this.$route.meta;
    const defaultConfig = {
      // searchBar的查询条件
      searchOptions: {
        isEnable: true,
        time: {
          field: "time",
          title: "捕获时间",
          defualtOptions: "最近24小时",
          dateLimit: 30, // 30天范围内
          clearable: true,
          global: true, // 应用全局-功能按钮
        },
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [
          //用户标签
          { field: "base_addUserTag" },
          // 导出选中数据
          { field: "base_exportSelect" },
          // 更多
          { field: "base_more" },
          // 我的收藏
          { field: "base_myCollect" },
        ],
      },
      // 侧边栏配置
      tabConfig: {
        isEnable: true,
        options: {
          riskDetails: {
            isEnable: true,
            text: "数据详情",
            options: {
              // 风险等级
              riskLevel: {
                isEnable: true,
                btns: [{ field: "base_exportData" }],
              },
              threatOrg: { isEnable: true }, //'威胁组织'
              threatLabel: { isEnable: true }, //'威胁标签'
              userTag: {
                isEnable: true, // 是否启用
              },
              // 附件风险
              fileRisk: { isEnable: true },
            },
          },
          dataFlow: { isEnable: true, text: "会话分析" },
        },
      },
      gridOptions: {
        defaultSort: { prop: "time", order: "descending" },
      },
    };
    // pageConfig的js文件遵循model组件路径规则，目前仅支持浅拷贝到data数据当中。后续可以优化为深拷贝形式扩展（类似echarts.option）
    const pageConfig = this.getPageConfig(pageInfo.index + ".js");
    return pageConfig ? _.assign({}, defaultConfig, pageConfig) : defaultConfig;
  },
  methods: {
    getPageConfig(path) {
      let pageConfig = null;
      try {
        pageConfig = require("@/views" + path);
      } catch {
        pageConfig = null;
      }
      return pageConfig;
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
    // searchBar: () => import("@COMP/TZ/searchbar"),
  },
};
</script>

<style lang="scss" scoped></style>

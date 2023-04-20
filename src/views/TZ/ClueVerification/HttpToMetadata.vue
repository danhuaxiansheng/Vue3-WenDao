<template>
  <pageLayout
    :searchbar="searchOptions"
    :toolbar="toolOptions"
    :gridbar="gridOptions"
    :tabConfig="tabConfig"
  >
    <!-- 响应信息 -->
    <template v-slot:responsedata="{ scope }">
      <el-popover
        placement="top-start"
        trigger="hover"
        popper-class="element-tab__popover"
        :content="formatPayload(scope.row.responsedata)"
      >
        <span class="ellipsis" slotslot="reference">{{
          formatPayload(scope.row.responsedata)
        }}</span>
      </el-popover>
    </template>
    <template v-slot:responseheader="{ scope }">
      <el-popover
        placement="top-start"
        trigger="hover"
        popper-class="element-tab__popover"
        :content="formatPayload(scope.row.responseheader)"
      >
        <span class="ellipsis" slotslot="reference">{{
          formatPayload(scope.row.responseheader)
        }}</span>
      </el-popover>
    </template>
  </pageLayout>
</template>
<script>
import { formatPayload } from "@PAGE/platform.js";
export default {
  name: "HttpToMetadata",
  data() {
    return {
      // searchBar的查询条件
      searchOptions: {
        time: {
          field: "@createtime",
          title: "入库时间",
          defualtOptions: "最近30分钟",
          clearable: false,
          global: false, // 应用全局-功能按钮
        },
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [
          // 导出选中数据
          { field: "base_exportSelect" },
          // 导出搜索结果
          { field: "base_exportSearch", icon: "iconfont icon-export" },
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
              riskLevel: {
                isEnable: true,
                title: "风险等级",
                btns: [{ field: "base_exportData" }],
              },
              //交互详情
              responseInfo: {
                isEnable: true,
                title: "交互详情",
                headerKeys: {
                  General: { isEnable: false },
                },
              },
            },
          },
          dataFlow: { isEnable: true, text: "会话分析" },
        },
      },
      gridOptions: {
        enableTooltip: ["responsedata", "responseheader"],
        defaultSort: { prop: "@createtime", order: "descending" },
      },
    };
  },
  methods: {
    formatPayload(value) {
      return value && formatPayload(value);
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>
<style lang="scss" scoped></style>

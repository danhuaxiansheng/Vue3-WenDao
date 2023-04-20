<template>
  <pageLayout
    @beforeReloadTable="beforeReloadTable"
    :searchbar="searchOptions"
    :toolbar="toolOptions"
    :gridbar="gridOptions"
    :tabConfig="tabConfig"
    ref="pageLayoutRef"
  >
  </pageLayout>
</template>
<script>
export default {
  name: "FTPFileTransferLow",
  data() {
    return {
      // 表格选中行
      checkRow: null,
      // 表格复选行
      selectRows: [],
      // searchBar的查询条件
      searchOptions: {
        isEnable: true,
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
          {
            field: "base_more_self",
            name: "更多",
            type: "dropdown",
            dropList: [
              "base_downloadChoseFile",
              "base_downloadSearchFile",
              "base_exportSearch",
              "base_deleteSelect",
              "base_deleteSearch",
            ],
          },
          { field: "risklevel", class: "to_right" },
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
                btns: [
                  { field: "base_exportData" },
                  { field: "base_exportFile" },
                ],
              },
            },
          },
          fileDetails: {
            isEnable: true,
            text: "文件详情",
            options: {
              fileType: "文件",
            },
          },
          dataFlow: { isEnable: true, text: "会话分析" },
        },
      },
      gridOptions: {
        defaultSort: { prop: "time", order: "descending" },
      },
    };
  },
  methods: {
    beforeReloadTable(conditions) {
      // 表格默认查未删除
      conditions.push({ field: "isdelete", value: 0, op: "equal" });
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>

<style lang="scss" scoped>
 :deep(.elemnt-response__dialog) {
    background-color: red;
    .el-radio-group {
        .el-radio-button:nth-child(2) {
            // 需求：不展示response内容
            display: none;
        }
    }
}
</style>

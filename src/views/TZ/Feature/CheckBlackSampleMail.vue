<template>
  <pageLayout
    ref="pageLayout"
    :searchbar="searchOptions"
    :toolbar="toolOptions"
    :gridbar="gridOptions"
    :tabConfig="tabConfig"
  >
  </pageLayout>
</template>
<script>
export default {
  name: "HttpMetadata",
  data() {
    return {
      // searchBar的查询条件
      searchOptions: {
        time: {
          field: "time",
          title: "捕获时间",
          defualtOptions: "最近24小时",
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
          {
            field: "base_more_self",
            name: "更多",
            type: "dropdown",
            dropList: [
              {
                name: "导出选择附件",
                type: "button",
                icon: "iconfont icon-export",
                handler: this.exportBatchAtt,
              },
              "base_exportSearch",
              "base_deleteSelect",
              "base_deleteSearch",
            ],
          },
          { field: "risktag", class: "to_right" },
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
                  {
                    name: "导出附件",
                    type: "button",
                    icon: "iconfont icon-export",
                    handler: this.exportAttachment,
                  },
                ],
              },
            },
          },
          emlDetails: { isEnable: true, text: "邮件详情" },
          fileDetails: {
            isEnable: true,
            text: "附件详情",
            options: {
              isRelate: true, // 是否单独关联附件
              relateUrl: "/api/search/generalQuery", //关联附件的api地址
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
    exportBatchAtt() {
      this.$refs["pageLayout"].downloadFiles();
    },

    // 导出附件-单条导出
    exportAttachment() {
      this.$refs["pageLayout"].downloadType = "single";
      this.$refs["pageLayout"].downloadFiles();
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>

<style lang="scss" scoped></style>

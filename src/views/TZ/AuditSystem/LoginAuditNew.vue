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
export default {
  name: "OperateAuditNew",
  data() {
    return {
      searchOptions: {
        isEnable: true,
        isEs: false,
        time: {
          field: "CREATE_TIME",
          title: "登录时间",
          defualtOptions: "最近24小时",
          clearable: true,
          global: true,
        },
        condition: {
          useExpression: false,
          custom: false,
        },
      },
      // toolBar配置
      toolOptions: {
        isEnable: true,
        primaryKey: "ID",
        options: [
          // 导出选中数据
          { field: "base_exportSelect" },
          // 导出搜索结果
          { field: "base_exportSearch", icon: "iconfont icon-export" },
          // 我的收藏
          { field: "base_myCollect" },
        ],
      },
      // tabContent配置
      tabConfig: {
        isEnable: false,
      },
      gridOptions: {
        url: "/api/dataBase/find",
        enableSetColumns: false,
        defaultSort: {
          prop: "CREATE_TIME",
          order: "descending",
        },
      },
    };
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
  },
};
</script>

<style lang="scss" scoped>
.element-link__tag {
  @include ellipsis;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: $highColor;
  }
}
</style>

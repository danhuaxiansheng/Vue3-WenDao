<template>
  <div class="element-page__content">
    <pageLayout
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :gridbar="gridOptions"
      :tabConfig="tabConfig"
    >
      <template v-slot:INFO="{ scope }">
        <a
          class="element-link__tag"
          @click="showInfo(scope.row['INFO'])"
          title="查看详情"
          >{{ scope.row["INFO"] }}</a
        >
      </template>
    </pageLayout>
    <el-dialog
      title="操作详情"
      width="500px"
      height="300px"
      v-model:visible="infoDialogVisible"
    >
      <div v-html="infoDetail"></div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "OperateAuditNew",
  data() {
    return {
      infoDetail: "",
      infoDialogVisible: false,
      searchOptions: {
        isEnable: true,
        isEs: false,
        time: {
          field: "CREATE_TIME",
          title: "操作时间",
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
        enableTooltip: ["INFO"],
        enableSetColumns: false,
        defaultSort: {
          prop: "CREATE_TIME",
          order: "descending",
        },
      },
    };
  },
  methods: {
    showInfo(value) {
      this.infoDetail = value
        .replace(/(\n)|(\r\n)/g, "<br>")
        .replace(/。;/g, "；")
        .replace(/，;/g, "；")
        .replace(/,;/g, "；")
        .replace(/;,/g, "，")
        .replace(/;。/g, "。")
        .replace(/，。/g, "。")
        .replace(/,。/g, "。");
      this.infoDialogVisible = true;
    },
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

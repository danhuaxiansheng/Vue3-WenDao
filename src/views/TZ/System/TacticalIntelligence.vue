<template>
  <div class="element-container__full">
    <div class="element-page__content element-page__menu">
      <el-tabs class="element-page__content" v-model="activeName">
        <el-tab-pane label="黑名单" name="blackList">
          <div class="element-page__body">
            <PageContent
              v-if="activeName == 'blackList'"
              :pageType="activeName"
              :key="activeName"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="白名单" name="whiteList">
          <div class="element-page__body">
            <PageContent
              v-if="activeName == 'whiteList'"
              :pageType="activeName"
              :key="activeName"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import PageContent from "./modules-Feature/PageContent.vue";
export default {
  name: "TacticalIntelligence",
  data() {
    return {
      activeName: "blackList",
    };
  },
  components: {
    PageContent,
  },
};
</script>

<style lang="scss" scoped>
:deep(.element-page__content) {
  > .el-tabs__header .el-tabs__active-bar {
    display: none;
  }
  > .el-tabs__content {
    padding-top: 0;
  }
}
:deep(.element-page__body) {
  height: 100%;
  .element-page__content {
    display: flex;
    flex-direction: column;
    .page-table {
      flex-grow: 1;
    }
  }
}
</style>

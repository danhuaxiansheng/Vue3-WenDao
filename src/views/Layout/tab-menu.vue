<template>
  <div
    class="element-tab_menu"
    v-if="tabMenuList.length"
    :class="
      tabMenuList.length == 1 ? 'element-tab__second' : 'element-tab__third'
    "
  >
    <el-tabs
      class="element-page__content"
      v-if="tabMenuList[0]"
      v-model="tabMenuList[0].activeTab"
      type="card"
      @tab-click="hanlderTabChange"
    >
      <el-tab-pane
        v-for="item in tabMenuList[0].menuOptions"
        :key="item.fullName"
        :label="item.fullName"
        :name="item.fullName"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="tag_group" v-if="tabMenuList[1]">
      <el-tag
        v-for="item in tabMenuList[1].menuOptions"
        :key="item.fullName"
        :class="{ unselected: item.fullName !== tabMenuList[1].activeTab }"
        @click="hanlderTagChange(item)"
        effect="dark"
        size="small"
      >
        {{ item.fullName }}
      </el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: "tabMenu",
  props: {
    tabMenuVisible: {
      // 是否渲染二、三级菜单
      type: Boolean,
      default() {
        return false;
      },
    },
    currentModule: {
      // 当前菜单所处的大板块
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      buildTabInfoFlag: false, // 构建多级菜单的标识
      tabMenuList: [], // 当前多级菜单
    };
  },
  mounted() {
    this.buildTabData();
  },
  watch: {
    "$route.path"() {
      this.buildTabData();
    },
  },
  methods: {
    /**
     *  构建多级菜单相关数据
     */
    buildTabData() {
      let moduleInfo = this.$store.state.user.moduleInfo,
        encodeArr = ["icon-situationAnalysis"], // 需要排除的encode(点击系统logo的时候，currentModule.enCode会被赋值)
        menuList = moduleInfo.modules ?? [],
        currentModuleInState = moduleInfo.currentModule ?? {}, // 大模块切换时，才会触发state里存储的currentModule的值的变化
        tabList = this.getTabInfo(menuList); // 路由切换时，动态对比获取当前模块相关的最新数据
      this.tabMenuList = tabList.slice(1); // 当前页面下的多级菜单
      // 当处于场景分析子系统时，tabMenuVisible为true
      let tabMenuVisible =
          currentModuleInState.enCode &&
          !encodeArr.includes(currentModuleInState.enCode),
        currentModule = tabMenuVisible ? currentModuleInState : {};
      this.$emit("update:tabMenuVisible", tabMenuVisible);
      this.$emit("update:currentModule", currentModule);
    },
    getTabInfo(data) {
      this.buildTabInfoFlag = false;
      let tabMenuList = [],
        tabList = this.buildTabInfo(data);
      let tabSelect = this.$route.meta.text,
        tabId = "";
      for (let i = tabList.length - 1; i >= 0; i--) {
        let list = [...tabList[i]],
          active_tab = list.filter(
            (item) => item.fullName == tabSelect || item.id == tabId
          )[0];
        if (active_tab) {
          tabSelect = "";
          tabId = active_tab.parentId;
          tabMenuList.unshift({
            menuOptions: list,
            activeTab: active_tab.fullName,
          });
        }
      }
      return tabMenuList;
    },
    buildTabInfo(data, list = [...data], tabList = []) {
      let pageName = this.$route.meta.text;
      if (!this.buildTabInfoFlag) tabList.push([...list]);
      let pageNames = list.map((item) => item.fullName);
      if (pageNames.includes(pageName)) {
        this.buildTabInfoFlag = true;
      } else if (list.length) {
        list.forEach((item) => {
          let modelList = data.map((item) => item.fullName);
          if (modelList.includes(list[0].fullName) && !this.buildTabInfoFlag)
            tabList = [[...list]];
          if (Array.isArray(item.childNodes) && item.childNodes.length)
            this.buildTabInfo(data, [...item.childNodes], tabList);
          return this.buildTabInfoFlag;
        });
      }
      return tabList;
    },
    hanlderTabChange(tab) {
      let tabPick = this.tabMenuList[0].menuOptions.filter(
        (item) => item.fullName == tab.name
      )[0];
      this.$router.push(tabPick.urlAddress);
    },
    hanlderTagChange(tag) {
      if (tag.fullName !== this.tabMenuList[1].activeTab) {
        this.$router.push(tag.urlAddress);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.element-page__menu {
  .el-tabs {
    height: auto;
    :deep(.el-tabs__content) {
      padding-top: 0;
    }
  }
  .tag_group {
    background: #fff;
    padding: 6px 16px;
    border-left: 1px solid $tabBorderColor;
    border-right: 1px solid $tabBorderColor;
  }
  .el-tag {
    cursor: pointer;
    &.unselected {
      background: transparent;
    }
  }
}
</style>

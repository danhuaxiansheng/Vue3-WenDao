<template>
  <div class="element-result__module">
    <el-tabs
      size="mini"
      v-model="selectModule"
      @tab-click="switchModule($event)"
    >
      <el-tab-pane
        v-for="module in moduleList"
        :key="module.indexName"
        :name="module.indexName"
        :pageUrl="module.urlAddress"
        :label="getLabel(module)"
      >
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "moduleSwitch",
  props: {
    modules: {
      type: Array,
    },
  },
  data() {
    return {
      selectModule: "",
      moduleList: [],
    };
  },
  watch: {
    modules: {
      handler(newVal) {
        // 默认选中全部
        this.selectModule = "0";
        this.buildSwitchModules(newVal);
      },
      immediate: true,
    },
  },
  methods: {
    buildSwitchModules(modules) {
      let total = {
        count: 0,
        niceName: "全部",
        indexName: "",
      };
      if (modules.length) {
        modules.forEach((module) => {
          total.count += module.count;
        });
      }
      this.moduleList = [total, ...this.modules];
    },
    getLabel(module) {
      return `${module.niceName}(${module.count})`;
    },
    switchModule(tab) {
      this.$store.commit("onekeySearch/setCurIndexName", tab.name);
      this.$store.commit("onekeySearch/setCurPageUrl", tab.$attrs.pageUrl);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.element-result__module) {
  height: 40px;
  .el-tabs__nav-wrap {
    padding: 0 40px 0 0;
    .el-tabs__nav-next,
    .el-tabs__nav-prev {
      height: 0;
      width: 0;
      border: 6px solid transparent;
      top: 4px;
      & > i {
        display: none;
      }
    }
    .el-tabs__nav-prev {
      left: inherit;
      right: 20px;
      border-right-color: $highColor;
    }
    .el-tabs__nav-next {
      border-left-color: $highColor;
    }
  }
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs__active-bar {
    display: none;
  }
  .el-tabs__item {
    padding-right: 16px !important;
    margin-bottom: 16px;
    &:not(:last-of-type)::after {
      display: inline-block;
      content: "";
      position: absolute;
      height: 12px;
      width: 1px;
      right: 0;
      top: 6px;
      background-color: $lineColor;
    }
    &.is-active {
      color: #fff;
      background-color: $highColor;
      &::after {
        display: none;
      }
    }
  }
}
</style>

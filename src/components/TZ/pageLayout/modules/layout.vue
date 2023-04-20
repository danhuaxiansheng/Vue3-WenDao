<template>
  <div
    class="layout-container"
    ref="container"
    :class="layoutPro ? 'layer_new' : 'layer_old'"
  >
    <div v-if="layoutPro" class="header">
      <slot name="search"></slot>
    </div>
    <el-split :class="{ aside_hide: !isShowSide }">
      <el-split-pane
        ref="tabGrid"
        :size="100 - paneSize"
        :class="!layoutPro ? 'flex_container' : ''"
      >
        <slot v-if="!layoutPro" name="search"></slot>
        <div class="table_grid">
          <div
            class="grid_scroll"
            :style="`min-width: ${gridContainerWidth}px`"
          >
            <slot name="grid"></slot>
          </div>
        </div>
      </el-split-pane>
      <el-split-pane
        v-if="isShowSide"
        :maxSize="80"
        :minSize="paneSize"
        :size="paneSize"
      >
        <slot name="aside"></slot>
      </el-split-pane>
    </el-split>
  </div>
</template>

<script>
export default {
  name: "pageLayoutBox",
  props: {
    // 是否使用最新的布局方式（最新的布局search在水平方向会拉通展示，旧版布局aside在竖直方向会拉通展示）
    layoutPro: [Boolean, String],
    layoutAsideLeft: [Boolean],
  },
  data() {
    return {
      asideWidth: 320, // 最小宽度，单位px，动态计算百分比
      paneSizeOrigin: 0, // 原始百分比
      paneSize: 0, // 侧边栏默认宽度
      gridContainerWidth: "auto",
    };
  },
  computed: {
    // 是否有侧边栏
    isShowSide() {
      // 在build模式下 $slots.aside为空，而default插槽会存在
      // return !!this.$slots.aside
      return this.$parent.sideOptions.isEnable;
    },
  },
  mounted() {
    this.initPaneSize();
    // this.$nextTick(() => this.setGridSize());
    // window.addEventListener('resize', this.setGridSize);
    // this.$once('hook:beforeDestroy', () => {
    //     window.removeEventListener('resize', this.setGridSize)
    // })
  },
  methods: {
    // setGridSize() {
    //     let containerWidth = parseInt(window.getComputedStyle(this.$refs.tabGrid.$el).width) - 20;
    //     this.gridContainerWidth = containerWidth;
    // },
    /**
     * 初始化右侧边栏宽度百分比
     */
    initPaneSize() {
      if (this.isShowSide) {
        let elRect = this.$refs.container.getBoundingClientRect();
        let paneSizeOrigin = Math.round((this.asideWidth * 100) / elRect.width);
        this.paneSizeOrigin = paneSizeOrigin;
        this.paneSize = paneSizeOrigin;
        // this.$forceUpdate();
      }
    },
  },
  watch: {
    layoutAsideLeft() {
      this.initPaneSize();
    },
  },
};
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100%;
  .table_grid {
    height: calc(100% - 64px);
    overflow-x: auto;
    .grid_scroll {
      height: 100%;
      :deep(.page-main) {
        height: 100%;
        .page-table {
          padding: 0 16px;
        }
      }
    }
  }
  .flex_container {
    display: flex;
    flex-direction: column;
    .table_grid {
      min-height: 0;
      flex-grow: 1;
    }
  }
  :deep(.page-header) {
    .search-bar {
      padding-bottom: 0;
    }
  }
  :deep(.el-split.el-split--vertical) {
    & > .el-split__splitter {
      background: #d8e7fc;
      width: 5px;
      border: none;
    }
    &.aside_hide > .el-split__splitter {
      width: 0;
    }
  }
  .header {
    margin-bottom: 16px;
    :deep(.search-bar) {
      @include cardStyle;
    }
  }
  &.layer_new {
    display: flex;
    flex-direction: column;
    .el-split {
      min-height: 0;
      flex: 1;
    }
    :deep(.page-header) {
      .search-bar {
        padding-bottom: 16px;
      }
    }
    .table_grid {
      height: 100%;
      .el-split {
        height: calc(100% - 80px);
      }
    }
  }
}
</style>

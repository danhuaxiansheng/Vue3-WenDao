// 渲染button按钮
<template>
  <div class="element-render__button">
    <template v-for="item in options" :key="item.field">
      <!-- Button按钮 -->
      <el-button
        v-if="item.type == 'button'"
        :disabled="freshTimer || item.disabled"
        :key="item.field"
        v-bind="{
          icon: item.icon,
          class: item.class,
          type: item.btnType,
        }"
        @click="item.handler(item)"
      >
        {{ item.name }}
      </el-button>
      <!-- Select下拉 -->
      <el-select
        v-else-if="item.type == 'select'"
        :class="item.class"
        :disabled="freshTimer || item.disabled"
        :placeholder="item.name"
        v-model="item.value"
        @change="(val) => item.handler(val, item)"
      >
        <el-option
          v-for="option in item.selectList"
          :key="option.key"
          :label="option.value"
          :value="option.key"
        >
          <span>{{ getOptionText(option, item) }}</span>
        </el-option>
      </el-select>
      <!-- Dropdown下拉菜单 -->
      <el-dropdown
        v-else-if="item.type == 'dropdown'"
        :class="item.class"
        :disabled="freshTimer || item.disabled"
        @command="
          (menu) =>
            menu && (menu.handler ? menu.handler() : item.handler(menu.name))
        "
      >
        <el-button icon="iconfont icon-more">
          {{ item.name }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slotslot="dropdown">
          <template v-if="item.dropList && item.dropList.length">
            <el-dropdown-item
              v-for="drop in item.dropList"
              :command="drop"
              :key="drop.name"
            >
              {{ drop.name }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>
<script>
export default {
  name: "renderButton",
  components: {
    // CollectSelect: () => import("./collectSelect"),
    // ToolMultipleSelect: () => import("./toolMultipleSelect"),
    // AutoFresh: () => import("@COMP/TZ/autoFresh"),
  },
  props: {
    freshTimer: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  // data() {
  //     return {}
  // },
  methods: {
    getOptionText(option, tool) {
      let defaultText = "无";
      if (tool.isSearchBar) defaultText = "全部";
      return option.key ? option.value : defaultText;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-render__button {
  display: inline;
  .to_right {
    float: right;
  }
  > * {
    margin-right: 8px;
  }
  .el-button + .el-button {
    margin-left: 0;
  }
  .el-button {
    padding: 0 8px;
    height: 30px;
    line-height: 28px;
  }
}
</style>

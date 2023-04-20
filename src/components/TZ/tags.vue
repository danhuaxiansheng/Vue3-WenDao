<template>
  <!-- 标签 -->
  <div class="element-tags__content" v-if="tagOptions.isEnable">
    <slot></slot>
    <template v-if="tagList && tagList.length > 0">
      <el-tag
        v-for="(tag, inx) in tagList || []"
        size="small"
        class="tag"
        :round="tagOptions.round"
        :key="inx"
        :type="tagOptions.type"
        :disable-transitions="false"
        :closable="closable"
        :class="{ 'tag-inline': tagOptions.limit != 0 }"
        :hit="true"
        v-show="tag.length"
        @mousemove="active = true"
        @mouseleave="active = false"
        @close="handleClose(tag, inx)"
      >
        <span class="ellipsis" :title="handleTitle(tag)">{{
          getName(tag)
        }}</span>
        <i v-if="residueLength != 0" class="tag-badge">{{ residueLength }}</i>
      </el-tag>
    </template>
  </div>
</template>

<script>
export default {
  name: "tagsIndex",
  props: {
    data: {
      type: [Array, String],
      default() {
        return [];
      },
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      active: false,
    };
  },
  computed: {
    tagOptions() {
      let defaultOptions = {
        isEnable: true, // 是否启用
        closable: false, // 是否可以移除
        round: true, // 是否为圆形
        type: "", // 文本内容形式
        limit: 0, // 展示前多少条，0不限制；剩余数量用数字标识
      };
      return { ...defaultOptions, ...this.options };
    },
    tagList() {
      let list = this.data ?? [];
      if (typeof list === "string") {
        list = [list];
      }
      this.tagOptions.limit != 0 &&
        (list = list.slice(0, this.tagOptions.limit));

      return list;
    },
    residueLength() {
      const dataLength = (this.data || []).length;
      const tagLength = this.tagList.length;

      if (this.tagOptions.limit === 0 || dataLength <= tagLength) {
        return 0;
      }

      return dataLength > 99 ? "99+" : dataLength;
    },
    closable() {
      return this.tagOptions.closable;
      // return this.tagOptions.closable && this.active
    },
  },
  methods: {
    handleTitle(tag) {
      return this.residueLength ? "" : this.getName(tag);
    },
    /**
     * 删除标签
     */
    handleClose(val, inx) {
      this.$emit("delete", val, inx);
    },
    /**
     * 获取名称
     */
    getName(item) {
      return typeof item === "object" && item.name ? item.name : item;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-tags__content {
  @include flexCenter($align: flex-start, $justify: left);

  flex-wrap: wrap;
  > .el-button {
    margin-right: 8px;
    margin-bottom: 8px;
  }
  // 全局样式，勿动
  .tag {
    display: flex;
    max-width: 180px;
    height: 28px;
    line-height: 26px;
    position: relative;
    margin-left: 0;
    margin-right: 8px;
    :deep(.ellipsis) {
      flex: 1;
      text-align: center;
      & + i.el-icon-close {
        top: 5px;
      }
    }
    .tag-badge {
      position: absolute;
      top: -1px;
      left: calc(100% - 6px);
      text-align: center;
      color: #fff;
      font-size: 12px;
      border-radius: 8px;
      min-width: 16px;
      line-height: 16px;
      padding: 0 2px;
      background-color: $highColor;
    }
    &.el-tag--danger .tag-badge {
      background-color: $dangerColor;
    }
  }
  &.table-tag {
    flex-wrap: nowrap;
  }
}
</style>

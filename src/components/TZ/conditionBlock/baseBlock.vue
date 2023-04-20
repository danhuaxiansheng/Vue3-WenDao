<template>
  <div class="conditions-block-item">
    <span class="brackets left-brackets" v-if="condition.hasLeft">(</span>
    <span class="match-text">
      <span @click="details(condition)" :title="getText(condition)">
        {{ getText(condition) }}</span
      >
      <i
        class="pointer iconfont icon-close"
        title="删除"
        @click.stop="deleteCondition()"
      ></i>
    </span>
    <span class="brackets right-brackets" v-if="condition.hasRight">)</span>
    <!-- <el-select v-if="showConnector"
            class="match-connector"
            v-model.trim="condition.connector"
            placeholder="请选择">
            <el-option label="并且"
                value="and"> </el-option>
            <el-option label="或者"
                value="or"> </el-option>
        </el-select> -->
  </div>
</template>

<script>
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js";
import { isArray } from "@LIB/validate.js";
export default {
  name: "baseBlock",
  data() {
    return {};
  },
  props: {
    condition: {
      type: Object,
      default: () => {},
    },
    showConnector: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    options: {
      type: Object,
      require: true,
    },
  },
  methods: {
    /**
     * 获取当前字段的配置
     */
    getColConfig(field) {
      return this.columns.filter((d) => d.value === field)[0] || null;
    },

    /**
     * 获取展示的文本
     */
    getText(item) {
      let cd = this.getColConfig(item.field);
      // 获取title
      let title = cd?.label ?? item.field;
      let mode = searachBarTools.getModeTitle(item.op);
      let text = item.value;
      // 如果是下拉字段
      if (cd && cd.dropDownList && cd.dropDownList.length > 0) {
        let fd = cd.dropDownList.filter((d) => d.value === item.value)[0];
        if (fd) {
          text = fd.label;
        }
      }
      if (isArray(text)) text = text.join(" - ");
      return title + (mode.text + text).replace(" - ", "至");
    },

    /**
     * 修改
     */
    details() {
      this.$emit("details", this.condition);
    },

    /**
     * 删除
     */
    deleteCondition() {
      this.$emit("delete", this.condition);
    },
  },
};
</script>

<style lang="scss" scoped>
.conditions-block-item {
  position: relative;
  display: flex;
  float: left;
  list-style: none;
  margin-bottom: 5px;
  .brackets {
    margin: 0 4px;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
  }

  .match-text {
    padding: 4px 3px 4px 3px;
    border: 1px dashed #c6ced6;
    color: $mainColor;
    max-width: 200px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 20px;
    margin: 0 3px;
    position: relative;
    i {
      position: absolute;
      right: 2px;
      top: 6px;
    }
  }

  .match-connector {
    width: 70px;
    line-height: 27px;
    margin: 0px 3px;
    height: 29px;
    :deep(.el-input__inner) {
      height: 29px;
      line-height: 29px;
    }
  }
}

.border-red {
  .match-text {
    border-color: red;
  }
}

// .left-error .left-brackets {
//     color: red;
// }

// .right-error .right-brackets {
//     color: red;
// }
</style>

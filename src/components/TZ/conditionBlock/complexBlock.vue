<template>
  <div class="conditions-block-wrap">
    <div class="conditions-block__title">
      <el-tooltip
        placement="bottom"
        effect="light"
        popper-class="element-arrow_tooltip"
      >
        <div slotslot="content" class="block-tip">
          仅支持一级条件嵌套，括号中不允许再含有括号。<br />
          正确格式：A & ( B || C )<br />
          错误格式：A & ( B & ( C || D ) )
        </div>
        <i class="iconfont icon-help"></i>
      </el-tooltip>
      <span class="content-title">条件预览：</span>
    </div>
    <ul>
      <template v-for="(item, i) in conditions">
        <li
          :key="item.field + i"
          v-if="!valueIsEmpty(item.value)"
          :class="item.bracketsError ? 'bracketsError' : ''"
        >
          <baseBlock
            :key="item.field + i"
            :class="hasErrorClass(item, i)"
            :condition="item"
            :columns="columns"
            :options="options"
            @details="updateClick(item, i)"
            @delete="deleteClick(i)"
          />
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js";
export default {
  name: "complexBlock",
  data() {
    return {
      isLeft: false, // 左括号
      isRight: false, // 右括号
    };
  },
  props: {
    conditions: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Object,
      default() {
        return {
          custom: true, // 是否使用自定义字段
          columns: [],
        };
      },
    },
  },
  components: {
    baseBlock: () => import("@COMP/TZ/conditionBlock/baseBlock.vue"),
  },
  computed: {
    columns() {
      return this.options.columns || [];
    },
  },
  watch: {
    conditions: {
      handler() {
        this.initVaild();
      },
      deep: true,
      immediate: true,
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
     * 验证内容块
     */
    valueIsEmpty(value) {
      let isEmpty = searachBarTools.valueIsEmpty(value);
      // // 有值被清空后 需要清空错误信息
      // (isEmpty && item.errorMsg) && this.setMsg("", inx);
      // 数据为空时 不展示提示栏
      return isEmpty;
    },
    /**
     * 设置错误信息
     */
    setMsg(msg, inx) {
      this.$emit("errorMsg", msg, inx);
    },
    /**
     * 增加错误样式
     */
    hasErrorClass(item, inx) {
      const fieldConfig = this.getColConfig(item.field);
      let vaildSuccess = searachBarTools.validateModelByValue(
        fieldConfig,
        item.op,
        item.value
      );
      let msg = "";
      let className = "";
      if (vaildSuccess.code === 2) {
        className += " border-red";
        msg = vaildSuccess.message;
      }
      item.errorMsg !== msg && this.$emit("errorMsg", msg, inx);
      return className;
    },
    /**
     * 初始化验证格式
     */
    initVaild() {
      // 验证括号格式是否正确
      this.vaildBrackets();
    },

    /**
     * 验证括号
     */
    vaildBrackets() {
      const conditions = this.conditions;
      let list = [];
      let indexList = [];
      let errorIndex = -1;
      let leftArr = "";
      conditions.forEach((d, inx) => {
        if (!this.valueIsEmpty(d.value)) {
          if (d.hasLeft) {
            list.push("(");
            indexList.push(inx);
          }
          if (d.hasRight) {
            list.push(")");
            indexList.push(inx);
          }
        } else {
          // 如果输入框内容为空 则清空错误提示语
          d.errorMsg && this.setMsg("", inx);
        }
      });

      for (var i = 0; i < list.length; i++) {
        let value = list[i];
        if (
          (i === 0 && value === ")") ||
          leftArr === value ||
          (!leftArr && value === ")")
        ) {
          errorIndex = indexList[i];
          break;
        }
        leftArr = value === ")" ? "" : value;
      }

      if (errorIndex === -1 && leftArr) {
        errorIndex = indexList[indexList.length - 1];
      }

      if (errorIndex > -1) {
        this.setBracketsState(errorIndex, true);
      }

      // 对比值变更 修改当前状态
      conditions.forEach((d, i) => {
        if (i === errorIndex) return;
        if (d.bracketsError) {
          this.setBracketsState(i, false);
        }
      });
    },
    /**
     * 设置括号状态
     */
    setBracketsState(inx, val) {
      let data = JSON.parse(JSON.stringify(this.conditions[inx]));
      if (data.bracketsError === val || (!val && !data.bracketsError)) {
        return;
      }
      data.bracketsError = val;
      this.$set(this.conditions, inx, data);
    },
    /**
     * 删除条件
     */
    deleteClick(i) {
      this.$emit("delete", i);
    },
    /**
     * 聚焦文本
     */
    updateClick() {
      // 高亮 对应条件
    },
  },
};
</script>

<style lang="scss" scoped>
.conditions-block-wrap {
  position: relative;
  margin-top: 8px;
  @include flexCenter($align: flex-start, $justify: flex-start);
  ul {
    box-sizing: border-box;
    position: relative;
    width: calc(100% - 88px);
    max-height: 102px;
    overflow-y: auto;
    li {
      :deep(.conditions-block-item) {
        margin-bottom: 5px;
        .match-text i {
          top: 3px;
        }
      }
    }
    li:last-child :deep(.match-connector) {
      display: none;
    }
  }

  .icon-help {
    cursor: pointer;
    color: #fd9125;
    margin-right: 4px;
  }
  .content-title {
    display: inline-block;
    color: $highColor;
    font-size: 13px;
    line-height: 27px;
    font-weight: bold;
  }
}

.bracketsError :deep(.brackets) {
  color: red;
}
.block-tip {
  font-size: 12px;
}
</style>

<template>
  <div class="conditions-block-wrap">
    <ul class="condition-block__preview">
      <li
        v-for="(item, i) in conditions"
        :key="i"
        :class="item.bracketsError ? 'bracketsError' : ''"
      >
        <baseBlock
          :id="'base_block' + i"
          :class="item.errorMsg ? 'border-red' : ''"
          :condition="item"
          :columns="columns"
          :showConnector="i !== conditions.length - 1"
          @details="updateClick(item, i)"
          @delete="
            () => {
              deleteClick(i);
            }
          "
        />
      </li>
    </ul>
    <el-dialog
      title="修改条件"
      v-model:visible="updateVisible"
      width="392px"
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <div class="update-conditions-wrap">
        <Condition
          v-if="updateVisible"
          ref="condition"
          :options="dialogOptions"
          v-model="updateForm"
        />
      </div>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateYes">确定</el-button>
        <el-button type="info" @click="handleClose">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js";
export default {
  name: "simpleBlock",
  components: {
    baseBlock: () => import("@COMP/TZ/conditionBlock/baseBlock.vue"),
    Condition: () => import("@COMP/TZ/condition/index.vue"),
  },
  data() {
    return {
      // 修改弹出框
      updateVisible: false,
      updateForm: {},
      updateIndex: -1, // 被修改数据的索引
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
  watch: {
    conditions: {
      handler() {
        this.vaildBrackets();
      },
      deep: true,
      // immediate: true
    },
  },
  computed: {
    columns() {
      return this.options.columns || [];
    },
    dialogOptions() {
      return {
        // 字段禁止切换 true/false
        fieldDisabled: true,
        ...this.options,
      };
    },
  },
  methods: {
    /**
     * 删除条件
     */
    deleteClick(i) {
      const list = this.conditions;
      list.splice(i, 1);
      this.$emit("update:conditions", list);
    },
    /**
     * 修改条件事件
     */
    updateClick(item, inx) {
      this.updateForm = JSON.parse(JSON.stringify(item));
      this.updateIndex = inx;
      this.updateVisible = true;
    },
    /**
     * 关闭弹出框
     */
    handleClose() {
      this.updateVisible = false;
      this.updateForm = {};
    },
    /**
     * 验证括号
     */
    vaildBrackets() {
      let indexList = [];
      let list = [];
      this.conditions.forEach((d, inx) => {
        if (!searachBarTools.valueIsEmpty(d.value)) {
          if (d.hasLeft) {
            list.push("(");
            indexList.push(inx);
          }
          if (d.hasRight) {
            list.push(")");
            indexList.push(inx);
          }
        }
      });
      let errorIndex = -1;
      let leftArr = "";

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
      this.conditions.forEach((d, i) => {
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
     * 确认修改后 验证格式
     */
    updateYes() {
      let vaModel = this.$refs["condition"].validate();
      if (vaModel.code === 1) {
        // 验证通过后 设置数据
        this.updateCondition();
      } else {
        // 是否弹出错误提示语
        this.$message.error(vaModel.message);
      }
    },
    /**
     * 数据验证通过后 进行修改
     */
    updateCondition() {
      let newVal = JSON.parse(JSON.stringify(this.updateForm));

      // 如果数据未修改 关闭弹出框
      if (
        JSON.stringify(newVal) ===
        JSON.stringify(this.conditions[this.updateIndex])
      ) {
        this.handleClose();
        return;
      }

      const isRepeat = searachBarTools.findRepeat(
        this.conditions,
        newVal,
        this.updateIndex
      );
      // 如果数据重复 则不允许添加
      if (isRepeat) {
        this.$message.error("条件已存在！");
      } else {
        this.handleClose();

        const list = this.conditions;
        list.splice(this.updateIndex, 1, newVal);
        // this.conditions.splice(this.updateIndex, 1, newVal);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.condition-block__preview) {
  li .match-text > span {
    cursor: pointer;
  }
}
.conditions-block-wrap {
  position: relative;
  margin-top: 8px;
  ul {
    box-sizing: border-box;
    padding-left: 56px;
    position: relative;
    width: 100%;
    height: 29px;
    overflow-y: auto;
  }

  ul::before {
    content: "条件区：";
    position: absolute;
    display: inline-block;
    color: $highColor;
    left: 0;
    top: 5px;
    font-size: 14px;
    font-weight: bold;
  }

  :deep(.update-conditions-wrap) {
    .baseConditions-wrap {
      display: grid;
      height: 130px;

      .field-select {
        width: 276px;
        margin-left: 76px;
        margin-bottom: 15px;
        border: none;
        color: #545454;
      }

      .match-select {
        width: 276px;
        margin-left: 76px;
        margin-bottom: 15px;
        border: none;
        color: #545454;
        input {
          color: #545454;
        }
      }
      .value-box-mode {
        width: 276px;
        margin-left: 76px;
        margin-bottom: 15px;
        color: #545454;

        input {
          color: #545454;
        }
      }

      .field-select::before {
        content: "匹配字段：";
        position: absolute;
        left: -71px;
        line-height: 32px;
      }

      .match-select::before {
        content: "匹配模式：";
        position: absolute;
        left: -71px;
        line-height: 32px;
      }

      .value-box-mode::before {
        display: block;
        content: "匹配内容：";
        position: absolute;
        left: 5px;
        line-height: 32px;
      }

      .start-input {
        width: calc(50% - 3.1px);
      }
      .end-input {
        width: calc(50% - 3.1px);
      }
      .el-date-editor {
        width: 100%;
      }
      .el-button {
        display: none;
      }
    }
  }
}
.bracketsError :deep(.brackets) {
  color: red;
}
</style>

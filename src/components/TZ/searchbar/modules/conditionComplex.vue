<template>
  <div class="condition-complex-wrap">
    <ul>
      <li
        class="condition-complex-item"
        v-for="(item, i) in cacheConditions"
        :key="i"
      >
        <el-select class="match-brackets" v-model="item.hasLeft" placeholder="">
          <el-option :label="' '" :value="false"> </el-option>
          <el-option label="(" :value="true"> </el-option>
        </el-select>

        <Condition
          :id="'cache' + i"
          ref="condition"
          :options="options"
          :value="item"
        />

        <el-select
          class="match-brackets"
          v-model="item.hasRight"
          placeholder=""
        >
          <el-option :label="' '" :value="false"> </el-option>
          <el-option label=")" :value="true"> </el-option>
        </el-select>

        <el-select
          class="match-connector"
          v-model="item.connector"
          placeholder="请选择"
        >
          <el-option label="并且" value="and"> </el-option>
          <el-option label="或者" value="or"> </el-option>
        </el-select>

        <el-button
          class="btn-group"
          title="新增"
          is-icon
          icon="iconfont icon-add"
          @click="addCondition(i)"
        ></el-button>

        <el-button
          class="btn-group"
          title="删除"
          is-icon
          icon="iconfont icon-subtract"
          @click="deleteCondition(i)"
        ></el-button>

        <span class="error-tip">{{ item.errorMsg }}</span>
      </li>
    </ul>
    <div class="complex-block">
      <complexBlock
        v-if="cacheConditions && cacheConditions.length > 0"
        :options="options"
        v-model:conditions="cacheConditions"
        @delete="deleteCondition"
        @errorMsg="updateMsg"
      >
      </complexBlock>
    </div>
  </div>
</template>

<script>
import Condition from "@COMP/TZ/condition/index.vue";
import complexBlock from "@COMP/TZ/conditionBlock/complexBlock.vue";
export default {
  name: "conditionComplex",
  components: { Condition, complexBlock },
  data() {
    return {
      // 修改弹出框
      updateVisible: false,
      updateForm: {},
      updateIndex: -1, // 被修改数据的索引
      cacheConditions: [],
    };
  },
  watch: {
    conditions: {
      handler() {
        this.initConditions();
      },
      deep: true,
      immediate: true,
    },
  },
  props: {
    // 过滤不展示的字段
    options: {
      type: Object,
      default() {
        return {
          fieldDisabled: false, // 字段禁止切换 true/false
          custom: true, // 是否使用自定义字段
          columns: [],
          max: 16, //条件最多
          min: 3, //条件最少
        };
      },
    },
    conditions: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    /**
     * 初始化数据
     */
    initConditions() {
      let tempList = [];
      let concatList = [];
      const minConditionsNumber = this.options.min || 3;
      const conditions = JSON.parse(JSON.stringify(this.conditions));
      // 动态创造模板
      for (var i = 0; i < minConditionsNumber; i++) {
        tempList.push(this.getTempCondition());
      }
      // 合并条件
      if (conditions.length < this.options.min) {
        tempList.splice(conditions.length - 1, conditions.length);
        concatList = conditions.concat(tempList);
      } else {
        concatList = conditions;
      }
      this.cacheConditions = concatList;
    },
    /**
     * 获取条件模板
     */
    getTempCondition() {
      // 条件模板
      return {
        field: "",
        op: "",
        value: "",
        connector: "and",

        hasLeft: false, // 含有左括号
        hasRight: false, // 含有右括号
        errorMsg: "", // 错误提示语
        bracketsError: false, // 括号规则是否错误
      };
    },

    /**
     * 删除条件
     */
    deleteCondition(i) {
      if (this.cacheConditions.length <= this.options.min) {
        this.cacheConditions.splice(i, 1, this.getTempCondition());
        // 手动触发事件
        this.$nextTick(() => {
          this.$refs["condition"][i].fieldChange();
        });
      } else {
        this.cacheConditions.splice(i, 1);
      }
    },

    /**
     * 新增条件
     */
    addCondition(i) {
      if (this.cacheConditions.length >= this.options.max) {
        this.$message.warning(`最多支持${this.options.max}个条件!`);
      } else {
        this.cacheConditions.splice(i + 1, 0, this.getTempCondition());
      }
    },

    /**
     * 提示错误信息
     */
    updateMsg(msg, i) {
      let str = this.cacheConditions[i].errorMsg;
      if (str == msg || (!str && !msg)) {
        return false;
      }
      this.cacheConditions[i].errorMsg = msg;
      this.cacheConditions.splice(i, 1, this.cacheConditions[i]);
    },
  },
};
</script>

<style lang="scss" scoped>
.condition-complex-wrap {
  position: relative;
  padding: 8px 0px;
  ul {
    max-height: 240px;
    overflow-y: auto;
  }
  .error-tip {
    color: #e91e63;
    margin-left: 15px;
    max-width: 180px;
    @include ellipsis;
    display: inline-block;
    height: 100%;
    line-height: 30px;
  }
  .condition-complex-item {
    display: flex;
    margin-bottom: 8px;

    .match-brackets {
      width: 50px;
      margin-right: 10px;
      margin-left: 10px;
    }
    .match-connector {
      width: 70px;
    }

    .match-brackets + .match-brackets {
      margin-left: 0px;
    }

    .el-button + .el-button {
      margin-left: 0px;
    }
    .el-button.is-icon {
      width: 26px;
    }
  }
}
</style>

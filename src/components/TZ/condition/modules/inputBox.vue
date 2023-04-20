<template>
  <div class="value-box-mode">
    <!-- 下拉框 -->
    <template v-if="concatOptions.boxType === 'select'">
      <Select v-model="val" filterable :placeholder="concatOptions.placeholder">
        <Option
          v-for="item in concatOptions.dropDownList"
          :key="item.value"
          v-bind="item"
        />
      </Select>
    </template>

    <!-- 输入框 -->
    <template v-if="concatOptions.boxType === 'input'">
      <template v-if="concatOptions.type === 'port'">
        <Input
          :placeholder="concatOptions.placeholder"
          v-model="val"
          clearable
          :max="concatOptions.max || 65535"
          :min="concatOptions.min || 0"
          type="number"
          :maxlength="concatOptions.maxlength || 5"
        />
      </template>

      <template v-else-if="concatOptions.type === 'ip'">
        <Input
          :placeholder="concatOptions.placeholder"
          v-model="val"
          clearable
          :maxlength="concatOptions.maxlength || 50"
        />
      </template>

      <template v-else-if="concatOptions.type === 'number'">
        <Input
          :placeholder="concatOptions.placeholder"
          type="number"
          v-model="val"
          clearable
          :maxlength="concatOptions.maxlength || 30"
          :max="concatOptions.max"
          :min="concatOptions.min"
        />
      </template>

      <template v-else-if="concatOptions.type === 'password'">
        <Input
          :placeholder="concatOptions.placeholder"
          type="password"
          v-model="val"
          clearable
          autocomplete="off"
          :maxlength="concatOptions.maxlength || 50"
        />
      </template>

      <template v-else>
        <Input
          :placeholder="concatOptions.placeholder"
          v-model.trim="val"
          clearable
          :maxlength="concatOptions.maxlength || 1000"
        />
      </template>
    </template>

    <!-- 时间区间 -->
    <template v-if="concatOptions.boxType === 'datetimerange'">
      <DatePicker
        v-model="rangeValue"
        type="datetimerange"
        :picker-options="pickerOptions"
        :editable="false"
        range-separator="-"
        start-placeholder="开始日期"
        unlink-panels
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        end-placeholder="结束日期"
        align="right"
      >
      </DatePicker>
    </template>

    <!-- 区间输入框 -->
    <template v-if="concatOptions.boxType === 'range-input'">
      <template v-if="concatOptions.type === 'port'">
        <Input
          class="start-input"
          placeholder="起始端口"
          type="number"
          v-model="rangeValue[0]"
          max="65535"
          min="0"
          clearable
          maxlength="5"
        />
        <span class="split">-</span>
        <Input
          class="end-input"
          placeholder="结束端口"
          type="number"
          v-model="rangeValue[1]"
          max="65535"
          min="0"
          clearable
          maxlength="5"
        />
      </template>
      <template v-else-if="concatOptions.type === 'ip'">
        <Input
          class="start-input"
          placeholder="起始IP"
          v-model="rangeValue[0]"
          clearable
          maxlength="50"
        />
        <span class="split">-</span>
        <Input
          class="end-input"
          placeholder="结束IP"
          v-model="rangeValue[1]"
          clearable
          maxlength="50"
        />
      </template>
      <template v-else-if="concatOptions.type === 'number'">
        <Input
          class="start-input"
          placeholder="起始数值"
          type="number"
          v-model="rangeValue[0]"
          clearable
          :max="concatOptions.max"
          maxlength="30"
          :min="concatOptions.min"
        />
        <span class="split">-</span>
        <Input
          class="end-input"
          placeholder="结束数值"
          type="number"
          v-model="rangeValue[1]"
          clearable
          :max="concatOptions.max"
          maxlength="30"
          :min="concatOptions.min"
        />
      </template>
      <template v-else>
        <Input
          class="start-input"
          placeholder="起始值"
          :maxlength="concatOptions.maxlength || 200"
          v-model.trim="rangeValue[0]"
          clearable
        />
        <span class="split">-</span>
        <Input
          class="end-input"
          placeholder="结束值"
          :maxlength="concatOptions.maxlength || 200"
          v-model.trim="rangeValue[1]"
          clearable
        />
      </template>
    </template>
  </div>
</template>

<script>
import { Input, Select, Option, DatePicker } from "element-plus";
import { getTimeByFlag } from "@TOOLS/dateTools.js";
import searachBarTools from "../utils/searachBarTools.js";
export default {
  name: "inputBox",
  components: { Select, Input, Option, DatePicker },
  data() {
    return {
      rangeValue: [],
      val: "",
      // 时间快捷栏配置
      pickerOptions: {
        shortcuts: [
          {
            text: "最近30分钟",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近1小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "当天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近24小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近7天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
        ],
      },
    };
  },
  props: {
    // 基础值配置
    options: {
      type: Object,
      default() {
        return {
          // type: '',             // 字段类型
          // min: null,            // （数值、IP格式生效） 格式
          // max: null,            // （数值、IP格式生效） 格式
          // placeholder: '',
          // maxlength: null,
        };
      },
    },
    value: {
      type: [String, Array, Number],
      default: "",
    },
  },
  computed: {
    concatOptions() {
      return {
        ...this.options,
        boxType: this.getBoxType(), // 输入框 类型
        dropDownList: this.options?.dropDownList || [],
      };
    },
  },
  watch: {
    value() {
      this.init();
    },
    val(nVal) {
      this.$emit("input", nVal);
      // this.$emit("change")
    },
    rangeValue(nVal) {
      if (!nVal) {
        nVal = [];
      } else if (nVal && nVal.length > 0 && !nVal[0] && !nVal[1]) {
        nVal = [];
      }
      this.$emit("input", nVal);
      // this.$emit("change")
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if ("object" === typeof this.value) {
        this.rangeValue !== this.value && (this.rangeValue = this.value);
      } else {
        this.val !== this.value && (this.val = this.value);
      }
    },
    /**
     * 获取输入框类型
     */
    getBoxType() {
      let type = this.options?.type || "string";
      let matchType = this.options?.matchType || "equal";

      if (this.options?.dropDownList && this.options?.dropDownList.length > 0) {
        return "select";
      }

      if (type === "date" || type === "time") {
        // 设输入框类型
        return "datetimerange";
      }

      return searachBarTools.isRange(matchType) ? "range-input" : "input";
    },
  },
};
</script>

<style lang="scss" scoped>
.value-box-mode {
  width: 190px;
  display: inline-flex;
  background-color: #f1f3f4;
  .split {
    line-height: 30px;
  }
  .start-input {
    input {
      padding-right: 18px;
    }
  }

  .end-input {
    input {
      padding-right: 18px;
    }
  }
  :deep(.el-date-editor) {
    .el-icon-date {
      top: 2px;
    }
    .el-range-separator {
      width: 23px;
      display: inline-block;
      line-height: 23.1px;
    }
    .el-range-input {
      text-align: left;
    }
  }
}
</style>

<style>
.el-date-range-picker .el-picker-panel__sidebar {
  width: 100px;
}
</style>

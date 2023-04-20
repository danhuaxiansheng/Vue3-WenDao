<template>
  <div class="baseConditions-wrap">
    字段选取
    <Select
      class="field-select"
      v-model="value[valueFormat.field]"
      filterable
      placeholder="请选择"
      :disabled="fieldDisabled"
      @change="fieldChange"
    >
      <template v-for="item in columns">
        <!-- 自定义字段 特殊判断 -->
        <template v-if="customField.value === item.value">
          <Option
            class="disabled-options"
            v-if="options.custom"
            :key="item.value"
            :value="item.value"
            disabled
          >
            <div @click="customDialog = true">
              <span class="search-label ellipsis label">{{ item.label }}</span>
            </div>
          </Option>
        </template>
        <!-- 普通字段 -->
        <Option
          v-else
          :key="item.value"
          :value="item.value"
          :label="item.label"
        >
          <span class="search-label ellipsis">{{ item.label }}</span>
        </Option>
      </template>
    </Select>

    <!-- 匹配模式 -->
    <Select
      class="match-select"
      v-model="value[valueFormat.type]"
      filterable
      placeholder="请选择"
      @change="matchChange"
    >
      <Option v-for="item in matchList" :key="item.value" v-bind="item" />
    </Select>

    <!-- 输入框 -->
    <inputBox :options="valueModel" v-model="value[valueFormat.value]" />

    <!-- 自定义字段 -->
    <!-- <customField
      v-if="customDialog"
      v-model:isShow="customDialog"
      v-model:columns="options.columns"
      @yes="customSuccess"
    /> -->
  </div>
</template>

<script>
import { Select, Option } from "element-plus";
import searachBarTools from "./utils/searachBarTools.js";
import inputBox from "./modules/inputBox";
// import customField from "./modules/customField.vue";

export default {
  name: "ConditionBase",
  components: {
    inputBox,
    Select,
    Option,
    // customField,
  },
  data() {
    return {
      // 输入框类型
      valueModel: {},
      // 字段类型
      fieldTypeList: searachBarTools.getTypeList(),
      // 自定义字段
      customField: {
        value: "otherField",
        label: "自定义",
        disabled: true,
        validate: false, // 跳过格式验证
      },
      // 自定义字段 -弹出框
      customDialog: false,
      value: {},
    };
  },
  props: {
    options: {
      type: Object,
      default() {
        return {
          // 是否使用自定义字段
          custom: false,
          // 是否禁用字段下拉框
          fieldDisabled: false,
          // 配置属性名称
          valueFormat: {
            field: "field",
            type: "op",
            value: "value",
          },
          // 列名称
          columns: [
            // {
            //     value: 'id',// 字段
            //     label: '主键',
            //     disabled: false,// 是否禁用
            //     placeholder: "请输入主键",   // 输入框提示语 默认使用title
            //     maxLength: 50,     // 输入框最大字符长度   - 除固定格式（时间格式、mac) 外生效
            //     min: 0,            // （数值、IP格式生效） 格式
            //     max: 0,            // （数值、IP格式生效） 格式
            //     type: "string",     // 字段类型
            //     dropDownList: [{ value: 'id', label: '主键'}]
            //     matchList: ["equal", "notEqual"], // 支持的匹配方式
            //     validate:false,  // 不参与格式验证
            // }
          ],
        };
      },
    },

    // 基础值配置
    // value: {
    //     type: Object,
    //     default() {
    //         return {
    //             // field: "",
    //             // type: '',
    //             // value: ''
    //         }
    //     }
    // },
  },
  watch: {
    value: {
      handler(nVal, oVal) {
        if (nVal === oVal) {
          return;
        }
        this.setOptions();
      },
      immediate: true,
      deep: true,
    },
    columns: {
      deep: true,
      handler(nVal, oVal) {
        if (nVal === oVal) {
          return;
        }
        this.$emit("input", {});
      },
    },
  },
  computed: {
    // 查询栏 字段
    columns() {
      let list = this.options.columns || [];
      // 如果使用自定义字段功能
      if (this.options.custom) {
        if (!list.filter((d) => d.value === this.customField.value)[0]) {
          list.push(JSON.parse(JSON.stringify(this.customField)));
        }
      }
      return list;
    },
    // 禁用字段下拉
    fieldDisabled() {
      return this.options.fieldDisabled ? true : false;
    },
    // 配置属性名称
    valueFormat() {
      return (
        this.options?.valueFormat ?? {
          field: "field",
          type: "op",
          value: "value",
        }
      );
    },
    // 当前选中字段
    field() {
      return this.value[this.valueFormat.field] || this.columns[0]?.value || "";
    },
    // 当前字段对象
    fieldModel() {
      return (
        this.columns.filter((d) => d.value === this.field)[0] ||
        this.columns[0] ||
        {}
      );
    },
    // 字段类型
    fieldType() {
      return (this.fieldModel.type || "string").toLocaleLowerCase();
    },
    // 匹配模式列表
    matchList() {
      let list =
        this.fieldModel?.matchList ||
        this.fieldTypeList[this.fieldType]?.modeList;
      return list.map((d) => {
        return { label: searachBarTools.getModeTitle(d).label || "", value: d };
      });
    },
    // 当前选中的模式
    matchType() {
      return this.value[this.valueFormat.type] || this.matchList[0].value || "";
    },
  },
  methods: {
    /**
     * 设置基础字段设置
     */
    setOptions() {
      this.setValueObj(this.valueFormat.field, this.field);
      this.setValueObj(this.valueFormat.type, this.matchType);
      // 修改输入框类型
      this.setBoxModel(this.matchType);
      this.setValueObj(
        this.valueFormat.value,
        this.value[this.valueFormat.value] ?? this.getDefaultValue()
      );
    },
    /**
     * 触发模式修改
     */
    fieldChange() {
      let matchType = this.matchList[0]?.value ?? "";
      // 模式为空字符时 不做更改
      if (matchType) {
        this.value[this.valueFormat.type] = matchType;
        this.matchChange();
      }
    },
    /**
     * 模式修改后 更改输入框类型 并清空值
     */
    matchChange() {
      this.setBoxModel(this.matchType);
      this.valueChange();
    },
    /**
     * 设置输入框
     */
    setBoxModel(key) {
      this.valueModel = {
        type: this.fieldType,
        matchType: key,
        min: this.fieldModel?.min ?? null, // （数值、IP格式生效） 格式
        max: this.fieldModel?.max ?? null, // （数值、IP格式生效） 格式
        placeholder: this.getPlaceholder(), // 输入框/下拉框 提示语
        maxlength:
          this.fieldModel?.maxlength ?? this.fieldModel?.maxLength ?? null,
        dropDownList: this.fieldModel?.dropDownList ?? null,
      };
    },
    /**
     * 输入框/下拉框 提示语
     */
    getPlaceholder() {
      // 用户自定义
      if (this.fieldModel?.placeholder) {
        return this.fieldModel?.placeholder;
      }
      // 下拉选择
      if (
        this.fieldModel?.dropDownList &&
        this.fieldModel?.dropDownList.length > 0
      ) {
        return "请选择" + (this.fieldModel.label || "");
      }
      // 普通输入框
      return "请输入" + (this.fieldModel.label || "");
    },
    /**
     * 重置输入框内容
     */
    valueChange() {
      this.value[this.valueFormat.value] = this.getDefaultValue();
    },
    /**
     * 初始化 对象
     */
    setValueObj(key, value) {
      if ("undefined" === typeof this.value[key]) {
        this.$set(this.value, key, value);
      } else {
        this.value[key] = value;
      }
    },
    /**
     * 获取默认数据
     */
    getDefaultValue() {
      let value = searachBarTools.isRange(this.matchType) ? [] : "";
      // 如果是下拉框模式 默认选中全部
      if (
        this.valueModel.dropDownList &&
        this.valueModel.dropDownList.length > 0
      ) {
        value = this.valueModel.dropDownList[0]?.value ?? "-999";
      }
      return value;
    },
    /**
     * 通用验证
     */
    validate() {
      if (this.fieldModel.validate === false) {
        return {
          code: 1,
          message: "验证通过",
        };
      }
      // 自定义校验
      if ("function" === typeof this.fieldModel.validateFormat) {
        const isTrue = this.fieldModel.validateFormat(this.value);
        if ("boolean" === typeof isTrue) {
          return {
            code: isTrue ? 1 : 2,
            message: isTrue ? "验证通过。" : "格式错误！",
          };
        } else if ("object" === typeof isTrue) {
          return {
            code: isTrue.code,
            message: isTrue.message,
          };
        } else
          return {
            code: "4",
            message: this.fieldModel.label + "的自定义格式返回格式错误",
          };
      }

      return searachBarTools.validateModelByValue(
        this.fieldModel,
        this.value[this.valueFormat.type],
        this.value[this.valueFormat.value]
      );
    },
    /**
     * 自定义对象 添加成功
     */
    customSuccess(mode) {
      this.$emit("addField", mode);
      this.columns.splice(this.columns.length - 1, 0, mode);
      this.value[this.valueFormat.field] = mode.value;
      // 手动选择字段
      this.fieldChange();
    },
  },
};
</script>

<style lang="scss" scoped>
.disabled-options.is-disabled {
  color: #424242;
  cursor: pointer;
}

.disabled-options .icon-add-circle {
  margin-right: 3px;
}

.el-select-dropdown.el-popper {
  padding: 0px;
}

.baseConditions-wrap {
  position: relative;
  display: inline-flex;
  // height: 32px;
  .field-select {
    width: 103px;
    border-right: 1px solid #0000001a;
  }
  .match-select {
    width: 81px;
    border-right: 1px solid #0000001a;
  }
}
.search-label {
  display: inline-block;
  max-width: 180px;
}
</style>

<template>
  <Dialog
    title="自定义字段"
    v-model:visible="visible"
    width="470px"
    :before-close="close"
    :close-on-click-modal="false"
  >
    <div>
      <Form
        ref="form"
        :model="customForm"
        :rules="customRules"
        label-width="85px"
      >
        <FormItem label="字段：" prop="value">
          <Input
            v-model.trim="customForm.value"
            placeholder="请输入字段"
            maxlength="30"
          />
        </FormItem>
        <FormItem label="字段名：">
          <Input
            v-model="customForm.label"
            placeholder="请输入字段名（可选）"
            maxlength="50"
          />
        </FormItem>
        <FormItem label="字段类型：" prop="type">
          <Select
            v-model="customForm.type"
            placeholder="请选择字段类型"
            @change="fieldTypeChange"
          >
            <Option
              v-for="(item, key) in fieldTypeList"
              :key="key"
              :label="item.label"
              :value="key"
            ></Option>
          </Select>
        </FormItem>
        <FormItem label="查询模式：" prop="matchList">
          <CheckboxGroup v-model="customForm.matchList">
            <Checkbox
              v-for="item in mapMachList"
              :label="item.key"
              :key="item.key"
              :checked="item.checked"
            >
              {{ item.label }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
      <HighLight class="highlight-font" :keys="['切换', '刷新']">
        注意：刷新或者切换页面后，自定义字段设置将会失效。
      </HighLight>
    </div>
    <span slotslot="footer" class="dialog-footer">
      <Button type="primary" @click="customYes">确定</Button>
      <Button type="info" @click="close">取消</Button>
    </span>
  </Dialog>
</template>
<script>
import {
  Form,
  FormItem,
  Select,
  Option,
  Input,
  CheckboxGroup,
  Checkbox,
  HighLight,
  Button,
  Dialog,
} from "element-plus";
import searachBarTools from "../utils/searachBarTools.js";

export default {
  data() {
    let that = this;
    var changeField = (rule, value, callback) => {
      let cm = that.columns.filter((d) => d.value === value)[0];
      if (cm) {
        callback(new Error("字段已存在"));
      } else {
        callback();
      }
    };
    return {
      // 字段类型
      fieldTypeList: searachBarTools.getTypeList(),
      // 自定义字段
      visible: true,
      customForm: {
        matchList: [], // 匹配类型
        type: "string", // 字段类型
      },
      // 自定义字段的验证规则
      customRules: {
        value: [
          { required: true, message: "请输入字段", trigger: "blur" },
          { validator: changeField, trigger: "change" },
          {
            min: 1,
            max: 30,
            message: "长度在 1 到 30 个字符",
            trigger: "blur",
          },
        ],
        type: [
          { required: true, message: "请选择字段类型", trigger: "change" },
        ],
        matchList: [
          {
            type: "array",
            required: true,
            message: "请至少选择一种查询模式",
            trigger: "change",
          },
        ],
      },
    };
  },
  components: {
    Form,
    FormItem,
    Select,
    Option,
    Input,
    CheckboxGroup,
    Checkbox,
    HighLight,
    Button,
    Dialog,
  },
  props: {
    // 基础值配置
    columns: {
      type: Array,
      default() {
        return [
          // {
          //     value: 'id',// 字段
          //     label: '主键',
          //     disabled: false,// 是否禁用
          //     placeholder: "请输入主键",   // 输入框提示语 默认使用title
          //     maxLength: 50,     // 输入框最大字符长度   - 除固定格式（时间格式、mac) 外生效
          //     min: 0,            // （数值、IP格式生效） 格式
          //     max: 0,            // （数值、IP格式生效） 格式
          //     type: "string",     // 字段类型
          //     dropDownList: [
          //     value: 'id',// 字段
          //     label: '主键',
          // ],   // 当数据为预设值值
          //     matchList: ["equal", "notEqual"], // 支持的匹配方式
          //     validate:false,  // 不参与格式验证
          // }
        ];
      },
    },
  },
  computed: {
    fieldMode() {
      return this.fieldTypeList[this.customForm.type || "string"];
    },
    mapMachList() {
      return this.fieldMode.modeList.map((key) => {
        let mode = searachBarTools.getModeTitle(key);
        mode.key = key;
        mode.checked = true;
        return mode;
      });
    },
  },
  methods: {
    close() {
      this.$emit("update:isShow", false);
    },
    /**
     * 自定义字段
     */
    customYes() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.setField();
          this.close();
        } else {
          return false;
        }
      });
    },
    setField() {
      let mode = {
        label: this.customForm?.label || this.customForm?.value, // 展示的名称
        value: this.customForm.value,
        matchList: this.customForm.matchList,
        type: this.customForm.type,
      };
      this.$emit("yes", mode);
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    /**
     * 修改字段类型
     */
    fieldTypeChange() {
      // 必须重置   -- 组件切换后 可能还继续选中了当前没有的选项
      this.$nextTick(() => {
        this.customForm.matchList = this.mapMachList.map((item) => item.key);
      });
    },
  },
};
</script>
<style scoped>
.highlight-font {
  font-size: 12px;
  font-family: "Microsoft YaHei";
  line-height: 24px;
  color: #9e9e9e;
}
</style>

<template>
  <!-- （单条）新增弹窗 -->
  <div class="element-tool__event">
    <el-dialog
      class="element-form__dialog"
      :title="addDialog.update ? '编辑' : '新增'"
      v-model:visible="addDialog.visible"
      width="600px"
      height="664px"
      :before-close="addDialogReset"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addDialog.ruleForm"
        :rules="addDialog.rules"
        ref="ruleForm"
        @submit.prevent
        label-width="auto"
      >
        <el-form-item
          v-for="(item, index) in addDialog.ruleFormLabel"
          :key="index"
          :label="item.label + '：'"
          :prop="item.form.require ? item.field : ''"
        >
          <!-- textarea输入框 -->
          <div
            class="element-textarea__item"
            v-if="item.form.type == 'textarea'"
          >
            <el-input
              v-model="addDialog.ruleForm[item.field]"
              type="textarea"
              :placeholder="'请输入' + item.label"
              maxlength="1000"
              autocomplete="off"
            >
            </el-input>
            <!-- 是否有模板 -->
            <a
              v-if="item.form.template && item.temp.url"
              class="download"
              target="_blank"
              :href="item.temp.url"
            >
              <i class="iconfont icon-table-detail"></i>
              {{ item.temp.fileName }}
            </a>
          </div>

          <!-- input输入框 -->
          <el-input
            v-else-if="item.form.type == 'input'"
            v-model="addDialog.ruleForm[item.field]"
            :placeholder="'请输入' + item.label"
            maxlength="255"
            autocomplete="off"
          >
          </el-input>

          <!-- select下拉选择 -->
          <el-select
            v-else-if="item.form.type == 'select'"
            v-model="addDialog.ruleForm[item.field]"
            filterable
            :placeholder="'请选择' + item.label"
          >
            <el-option
              v-for="option in item.form.options"
              :key="option.value"
              :value="option.value"
              :label="option.key"
            >
            </el-option>
          </el-select>

          <!-- 级联下拉选项 -->
          <el-cascader
            v-else-if="item.form.type == 'cascader'"
            v-model="addDialog.ruleForm[item.field]"
            :placeholder="'请选择' + item.label"
            :options="item.form.options"
            :props="{ expandTrigger: 'hover' }"
            filterable
          ></el-cascader>

          <!-- switch开关 -->
          <el-switch
            v-else-if="item.form.type == 'switch'"
            v-model="addDialog.ruleForm[item.field]"
            active-color="#34a853"
            inactive-color="#c8c9ca"
          >
          </el-switch>

          <!-- 时间框 -->
          <el-date-picker
            v-else-if="item.form.type == 'time'"
            v-model="addDialog.ruleForm[item.field]"
            type="datetime"
            :placeholder="'请选择' + item.label"
            :default-date="item.form.defaultDate"
            :default-time="item.form.defaultTime"
            value-format="yyyy-MM-dd hh:mm:ss"
          >
          </el-date-picker>

          <!-- radio单选框 -->
          <el-radio-group
            v-else-if="item.form.type == 'radio'"
            v-model="addDialog.ruleForm[item.field]"
          >
            <el-radio
              v-for="radio in item.form.radios"
              :key="radio.value"
              :label="radio.value"
              >{{ radio.key }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- <span #footer="footer" class="dialog-footer">
        <el-button type="info" @click="addDialogReset">取消</el-button>
        <el-button type="primary" @click="addDialogSubmit">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import { isNullOrEmpty } from "@LIB/base.js";
import pageSettings from "./pageSettings";

export default {
  name: "pageToolEvents",
  props: {
    acceptType: {
      type: Object,
      require: true,
    },
  },
  data() {
    return {
      addDialog: {
        update: false,
        visible: false,
        ruleForm: {},
        rules: {},
        ruleFormLabel: [],
      },
    };
  },
  created() {
    let rules = {},
      ruleFormLabel = [],
      pageConfig = this.getPageConfig();
    // 初始化：构造表单选项
    pageConfig.forEach((item) => {
      // 构建表单项
      if (item.label) ruleFormLabel.push(item);
      // 构造表单所需rules
      if (item.form.require)
        rules[item.field] = [
          { required: true, message: `请输入${item.label}`, trigger: "blur" },
        ];
    });

    this.addDialog.rules = rules;
    this.addDialog.ruleFormLabel = ruleFormLabel;
  },
  methods: {
    getPageConfig() {
      let pageId = this.$store.state.user.pageinfo.pageId,
        pageConfig = pageSettings.getFieldsByType(pageId);
      return pageConfig;
    },
    // 初始化-打开新增弹窗
    openAddDialog(row) {
      let ruleForm = {},
        isAdd = isNullOrEmpty(row), //row没值 则为新增
        pageConfig = this.getPageConfig();
      // 初始化：构造表单选项
      pageConfig.forEach((item) => {
        ruleForm[item.field] = item.value;
      });

      if (isAdd) {
        // 新增
        this.addDialog.ruleForm = ruleForm;
        this.addDialog.update = false;
      } else {
        // 编辑
        this.addDialog.ruleForm = row;
        this.addDialog.update = true;
      }
      // 打开弹窗
      this.addDialog.visible = true;
    },
    // 单条新增-确认
    addDialogSubmit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$emit("addDialogSubmit", {
            formData: JSON.parse(JSON.stringify(this.addDialog.ruleForm)),
            update: this.addDialog.update,
          });
          this.addDialog.visible = false;
        }
      });
    },
    // 新增弹窗-重置
    addDialogReset() {
      this.$refs["ruleForm"].resetFields();
      this.addDialog.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.element-form__dialog) {
  .el-date-editor.el-input,
  .el-date-editor.el-input__inner {
    width: 100%;
  }
  .download {
    color: $highColor;
    cursor: pointer;
  }
}
</style>

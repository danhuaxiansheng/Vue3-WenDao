<template>
  <div class="dialog-form">
    <el-dialog
      :width="dialog_config.width"
      :title="dialog_config.title"
      :close-on-click-modal="false"
      v-model:visible="dialog_config.visible"
      @close="cancel"
      v-loading.fullscreen="dialog_config.loading"
      footerBorder
    >
      <el-form
        ref="dialogForm"
        :rules="dialog_config.rules"
        :model="dialog_config.formData"
        :label-width="dialog_config.labelWidth"
        @submit.prevent
        label-position="right"
      >
        <el-form-item
          v-for="(item, index) in formColumn"
          :key="index"
          :label="item.label + '：'"
          :prop="item.field"
        >
          <el-input
            v-if="item.formConfig && item.formConfig.type == 'input'"
            v-model="dialog_config.formData[item.field]"
            :placeholder="getInputPla(item.label, item.type)"
            :maxLength="item.maxLength || 50"
          >
          </el-input>

          <el-upload
            drag
            name="file"
            multiple
            :limit="10"
            :auto-upload="false"
            action=""
            :file-list="fileList"
            :on-error="onError"
            :on-change="onChange"
            :with-credentials="true"
            :on-exceed="onExceed"
            v-if="item.formConfig && item.formConfig.type == 'upload'"
          >
            <div>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
            </div>
          </el-upload>

          <el-input
            v-if="item.formConfig && item.formConfig.type == 'password'"
            v-model="dialog_config.formData[item.field]"
            type="password"
            :placeholder="getInputPla(item.label, item.type)"
            :maxLength="item.maxLength || 50"
          >
          </el-input>

          <el-input
            type="textarea"
            v-else-if="item.formConfig && item.formConfig.type == 'textarea'"
            :placeholder="getInputPla(item.label, item.type)"
            :rows="4"
            v-model="dialog_config.formData[item.field]"
            :maxLength="item.maxLength || 250"
          ></el-input>

          <el-select
            v-else-if="item.formConfig && item.formConfig.type == 'select'"
            v-model="dialog_config.formData[item.field]"
            :placeholder="getInputPla(item.label, item.type)"
          >
            <el-option label="请选择" value=""></el-option>
            <el-option
              v-for="(option, i) in item.formConfig.options"
              :key="i"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>

          <el-select
            multiple
            collapse-tags
            v-else-if="item.formConfig && item.formConfig.type == 'selectGroup'"
            v-model="dialog_config.formData[item.field]"
            :placeholder="getInputPla(item.label, item.type)"
          >
            <el-option-group
              v-for="(group, i) in item.formConfig.options"
              :key="i"
              :label="group.label"
            >
              <el-option
                v-for="option in group.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-option-group>
          </el-select>

          <InputTree
            v-if="item.formConfig && item.formConfig.type == 'inputTree'"
            :options="item.formConfig.options"
            :props="item.formConfig.treeProp"
            v-model="dialog_config.formData[item.field]"
            :placeholder="getInputPla(item.label, item.type)"
          >
          </InputTree>
        </el-form-item>
      </el-form>
      <span slotslot="footer">
        <el-button type="primary" @click="yes">确定</el-button>
        <el-button type="info" @click="cancel">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import InputTree from "./InputTree.vue";

export default {
  components: { InputTree },
  name: "dialog-form",
  props: {
    // dialog_config: {
    //   type: Object,
    //   default: function () {
    //     return {
    //       title: "弹出框",
    //       loading: false, //是否启用遮罩
    //       visible: true, //是否启用
    //       width: "480px",
    //       labelWidth: "100px",
    //       rules: {
    //         // user_name: [
    //         //   {
    //         //     required: true,
    //         //     message: "请输入",
    //         //     trigger: "blur",
    //         //   },
    //         //   {
    //         //     min: 2,
    //         //     max: 50,
    //         //     message: "长度在 2 到 50 个字符",
    //         //   },
    //         // ],
    //       },
    //       formData: {}, //表单数据 ---自动填充
    //       column: [
    //         //     { label: "用户名", field: "user_name", maxLength: "50", type: "input" },
    //         //     {
    //         //       label: "中文名",
    //         //       field: "chinese_name",
    //         //       maxLength: "50",
    //         //       type: "input",
    //         //     },
    //         //     {
    //         //       label: "是否正确",
    //         //       field: "isTrue",
    //         //       type: "select",
    //         //       options: [
    //         //         { label: "是", value: "1" },
    //         //         { label: "否", value: "0" },
    //         //       ],
    //         //     },
    //       ],
    //     };
    //   },
    // },
  },
  data() {
    return {
      fileList: [],
      formColumn: [],

      dialog_config: {},
    };
  },
  beforeMount() {
    let ruleid = this.$store.state.user.roles[0];
    //过滤不需要在表单显示的内容
    let newColumn = this.dialog_config.column.concat();
    for (let i = newColumn.length - 1; i >= 0; i--) {
      let cif = newColumn[i].formConfig;

      if (cif && cif.notUse) {
        newColumn.splice(i, 1);
      } else {
        if (typeof cif.options == "function") {
          cif.options = cif.options();
        }
        //对下拉列表进行权限过滤
        let newOption = [];
        for (var n in cif.options) {
          let nop = cif.options[n];
          if (
            !nop.roles ||
            (nop.roles && nop.roles.length > 0 && nop.roles.includes(ruleid))
          ) {
            newOption.push(nop);
          }
        }

        cif.options = newOption;
      }
    }
    this.formColumn = newColumn;
  },
  methods: {
    onError() {
      this.erFn("上传发生错误，请稍后重试");
    },
    onExceed(file, fileList) {
      this.waFn("最多同时上传" + fileList.length + "个文件！");
    },
    onChange(file, fileList) {
      this.fileList = fileList;
      this.dialog_config.formData.file = fileList;
    },
    treeSelect() {
      this.$refs.inputTree;
    },
    treeChange() {
      this.$refs;
    },

    getInputPla(val, type) {
      let str;
      switch (type) {
        case "textarea":
        case "input":
          "请输入" + val;
          break;
        default:
          "请选择" + val;
          str = "";
      }
      return str;
    },
    cancel() {
      this.$emit("cancel");
    },
    yes() {
      let $dialogForm = this.$refs["dialogForm"];
      this.$emit("yes", this.dialog_config.formData, $dialogForm);
    },
  },
};
</script>

<style>
.dialog-form .el-autocomplete .el-textarea__inner,
.dialog-form .el-input .el-textarea__inner {
  height: 85px;
  min-height: 85px !important;
}

.dialog-form .el-upload-drag .el-upload-dragger {
  width: 100%;
  height: 100px;
}
.dialog-form .el-upload-drag,
.dialog-form .el-upload--text {
  width: 100%;
}

.dialog-form textarea {
  resize: none;
}

.el-form .el-form-item .el-select .el-select__tags .el-tag.el-tag--info {
  max-width: calc(100% - 57px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>

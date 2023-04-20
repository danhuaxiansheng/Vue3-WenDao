<template>
  <div class="element-tool__event">
    <!-- （单条）新增弹窗 -->
    <el-dialog
      class="element-form__dialog"
      :title="addDialog.update ? '编辑规则' : '新增规则'"
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
              v-model.trim="addDialog.ruleForm[item.field]"
              type="textarea"
              :placeholder="'请输入' + item.label"
              maxlength="2000"
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
            v-model.trim="addDialog.ruleForm[item.field]"
            :placeholder="'请输入' + item.label"
            :disabled="
              addDialog.disabledFields.includes(item.field) &&
              addDialog.disabled
            "
            maxlength="255"
            autocomplete="off"
          >
          </el-input>

          <!-- select下拉选择 -->
          <el-select
            v-else-if="item.form.type == 'select'"
            v-model="addDialog.ruleForm[item.field]"
            filterable
            :disabled="
              addDialog.disabledFields.includes(item.field) &&
              addDialog.disabled
            "
            :placeholder="'请选择' + item.label"
          >
            <el-option
              v-for="option in item.form.options"
              :key="option.key"
              :value="option.key"
              :label="option.value"
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

      <template #footer>
        <span class="dialog-footer">
          <el-button type="info" @click="addDialogReset">取消</el-button>
          <el-button type="primary" @click="addDialogSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量新增弹窗 -->
    <el-dialog
      class="element-form__dialog"
      v-loading="uploadDialog.loading"
      :title="uploadDialog.isCover ? '覆盖导入' : '追加导入'"
      v-model:visible="uploadDialog.visible"
      width="560px"
      :before-close="uploadCancel"
      :close-on-click-modal="false"
    >
      <el-form ref="ruleForm" label-width="38px">
        <el-upload
          class="element-upload__area element-add__batch"
          drag
          :limit="1"
          :accept="acceptType.type.join(',')"
          action=""
          :multiple="false"
          ref="upload"
          :data="uploadDialog.uploadData"
          :auto-upload="false"
          :on-error="onUploadError"
          :with-credentials="true"
          :on-success="onUploadSuccess"
          :on-change="onUploadChange"
          :on-remove="onUploadSuccess"
          :on-exceed="onExceed"
        >
          <div>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              <em>点击上传</em> / 或将文件拖拽到此区域
            </div>
          </div>
        </el-upload>
        <el-form-item label="">
          <ul class="element-add__tips">
            <li>
              1、文件类型：{{ acceptType.type.join(" / ") }}；
              <a
                v-if="acceptType.type.includes('.xlsx')"
                class="high"
                target="_self"
                @click.prevent="downloadExcel"
                >XLSX规则模板</a
              >
            </li>
            <li>2、文件大小：不超过<span class="high">10M</span>；</li>
            <li>3、文件编码：UTF-8 无BOM格式；</li>
            <li
              v-show="uploadDialog.isCover"
              class="el-highlight el-highlight--danger"
            >
              4、覆盖导入会将数据库中现有非系统内置规则全部清空后再导入，请谨慎使用！
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <!-- 嵌套内层弹窗 -->
      <el-dialog
        width="300px"
        title="导入结果"
        v-model:visible="uploadDialog.innerVisible"
        :show-close="false"
        :close-on-click-modal="false"
        append-to-body
      >
        <div class="element-upload__result">
          <p>
            <i class="el-icon el-icon-pending-filled"></i>总记录数（条）：{{
              uploadDialog.uploadResult.total
            }}
          </p>
          <p>
            <i class="el-icon el-icon-success"></i>导入成功（条）：{{
              uploadDialog.uploadResult.success
            }}
          </p>
          <p>
            <i class="el-icon el-icon-warning"></i>重复数据（条）：{{
              uploadDialog.uploadResult.repeat
            }}
          </p>
          <p>
            <i class="el-icon el-icon-error"></i>
            导入失败（条）：{{ uploadDialog.uploadResult.error }}
          </p>
          <p v-if="uploadDialog.uploadResult.key">
            <i class="el-icon el-icon-description"></i>
            <a
              class="el-highlight el-highlight--primary"
              @click="downUploadError(uploadDialog.uploadResult)"
              >错误信息.xlsx</a
            >
          </p>
        </div>
        <!-- 里弹窗底部 -->
        <!-- <span slotslot="footer" class="dialog-footer">
          <el-button type="primary" @click="closeDialogAll">确认</el-button>
        </span> -->
      </el-dialog>

      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="uploadCancel">取消</el-button>
        <el-button type="primary" @click="uploadSubmit">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { exporter } from "@TOOLS/export.js";
import { isNullOrEmpty, isString } from "@LIB/base.js";
import pageSettings from "./pageSettings";
import { batchUploadRules } from "@API/TZ/Feature/index.js";

export default {
  name: "pageToolEvents",
  props: {
    acceptType: {
      type: Object,
      require: true,
    },
  },
  computed: {
    ...mapGetters(["$pageLayout"]),
    ...mapState({
      indexName: (state) => state.user.pageinfo.indexName,
      searchBarColumns: (state) => state.searchBar.searchBarColumns,
    }),
  },
  data() {
    return {
      // 新增弹窗
      addDialog: {
        update: false,
        visible: false,
        disabled: false,
        disabledFields: ["name", "ruleType", "usageLevel"],
        ruleForm: {},
        rules: {},
        ruleFormLabel: [],
      },
      fileList: [],
      uploadData: {},
      riskDropList: [], //风险类型-下拉选项
      // 上传弹窗配置
      uploadDialog: {
        isCover: false, // 是否覆盖导入
        visible: false,
        loading: false,
        innerVisible: false,
        uploadResult: {},
      },
      downTemplateUrl: "/api/file/downTemplate",
      downExcelErrorUrl: "/api/file/downLoadExcel",
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
          {
            required: true,
            message: `请输入${item.label}`,
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (isString(value) && value.trim() === "") {
                callback(new Error(`请输入有效的${item.label}！`));
              } else {
                callback();
              }
            },
          },
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
    // 绑定风险类型下拉选项
    refreshRiskList() {
      this.addDialog.ruleFormLabel.some((label) => {
        if (label.field == "risk") {
          this.searchBarColumns.some((column) => {
            if (column.field == "risk") {
              console.log(column.dropDownList);
              label.form.options = column.dropDownList.slice(1); //不要“全部”下拉选项
            }
            return column.field == "risk";
          });
        }
        return label.field == "risk";
      });
    },
    // 初始化-打开新增弹窗
    openAddDialog(row) {
      let ruleForm = {},
        isAdd = isNullOrEmpty(row), //row没值 则为新增
        pageConfig = this.getPageConfig();

      // 初始化：构造表单选项
      pageConfig.forEach((item) => {
        if (item.field == "risk") {
          this.refreshRiskList();
        }
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
          this.addDialog.disabled = false;
          this.addDialog.visible = false;
        }
      });
    },
    // 新增弹窗-重置
    addDialogReset() {
      this.$refs["ruleForm"].resetFields();
      this.addDialog.disabled = false;
      this.addDialog.visible = false;
    },
    // 初始化-打开批量导入弹窗
    openUploadDialog(isCover) {
      this.uploadDialog.isCover = isCover;
      this.uploadDialog.visible = true;
    },
    onExceed() {
      this.$message({ message: "单次最多上传一个文件！", type: "error" });
    },
    onUploadError() {
      this.$message({ message: "上传错误，请重试！", type: "error" });
    },
    onUploadChange(file) {
      let result = this.confirmUploadResult(file);
      if (result) {
        this.uploadData = {
          file: file.raw,
          fileNames: JSON.stringify({ file: file.name }),
        };
        this.fileList.push(file);
      }
    },
    confirmUploadResult(file) {
      let fileName = file.name;
      let index = fileName.lastIndexOf(".");
      let fileLength = fileName.length;
      let fileType = fileName.substring(index, fileLength);

      if (!this.acceptType.type.includes(fileType)) {
        this.$message({
          message: `仅支持${this.acceptType.type.join("或")}类型文件上传！`,
          type: "error",
        });
        this.onUploadSuccess();
        return false;
      }
      return true;
    },

    onUploadSuccess() {
      //清空上传列表
      this.$refs["upload"].clearFiles();
      this.uploadData = {};
      this.fileList = [];
      this.$pageLayout.search();
    },
    onUploadBefore() {
      let flieList = this.uploadData.file;
      if (!flieList) {
        this.$message({ message: "请上传文件！", type: "warning" });
        return false;
      }
      let fileName = flieList.name;
      let index = fileName.lastIndexOf(".");
      let fileLength = fileName.length;
      let fileType = fileName.substring(index, fileLength);

      if (!this.acceptType.type.includes(fileType)) {
        this.$message({
          message: `仅支持${this.acceptType.type.join("或")}类型文件上传！`,
          type: "error",
        });
        this.onUploadSuccess();
        return false;
      }
      return true;
    },
    uploadSubmit() {
      let beforeUpload = this.onUploadBefore();
      if (!beforeUpload) return;
      let formData = new FormData();
      let indexName = this.$store.state.user.pageinfo.indexName;
      this.uploadDialog.loading = true;
      // 构造form表单数据
      formData.append("table", indexName);
      formData.append("isCover", this.uploadDialog.isCover);
      formData.append("file", this.uploadData.file);
      // 批量导入
      batchUploadRules(formData)
        .then((res) => {
          if (res.status == 200) {
            //打开内弹窗
            this.uploadDialog.uploadResult = res.data;
            this.uploadDialog.innerVisible = true;
          } else {
            this.$message({
              type: "error",
              message: res.msg || "上传失败！",
            });
          }
          this.uploadDialog.loading = false;
        })
        .catch(() => {
          this.uploadDialog.loading = false;
        });
    },
    uploadCancel() {
      this.uploadDialog.isCover = false;
      this.uploadDialog.visible = false;
    },
    closeDialogAll() {
      this.onUploadSuccess();
      this.uploadDialog.visible = false;
      this.uploadDialog.innerVisible = false;
    },
    getRiskValueByType(type) {
      let riskVal = "";
      this.searchBarColumns.some((column) => {
        if (column.field == "risk") {
          column.dropDownList.some((option) => {
            if (option.value == type) {
              riskVal = option.key;
            }
            return option.value == type;
          });
        }
        return column.field == "risk";
      });
      return riskVal;
    },
    // 下载模板
    downloadExcel() {
      exporter({
        action: this.downTemplateUrl,
        table: this.indexName,
      });
    },
    // 下载错误信息
    downUploadError(result) {
      exporter({
        action: this.downExcelErrorUrl,
        key: result.key,
      });
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
  .el-input.is-disabled .el-input__inner {
    opacity: 1;
  }
}
.element-upload__result {
  p {
    line-height: 32px;
  }
  .el-icon {
    font-size: 18px;
    margin-right: 4px;
    &.el-icon-pending-filled {
      color: $highColor;
    }
    &.el-icon-success {
      color: $successColor;
    }
    &.el-icon-warning {
      color: $yellow;
    }
    &.el-icon-error {
      color: $dangerColor;
    }
  }
  .el-highlight {
    cursor: pointer;
  }
}
</style>

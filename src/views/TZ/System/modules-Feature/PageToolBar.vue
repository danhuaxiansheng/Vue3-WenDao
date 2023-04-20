<template>
  <div class="element-page__toolBar">
    <!-- <tool-bar slotslot="tool-left"
            v-if="toolOptions.isEnable"
            :options="toolOptions.options"
            v-model:conditions="toolCds">
        </tool-bar> -->

    <div class="element-tooltar__content">
      <div class="aggType">
        <el-button
          v-for="item in toolBarData.aggType"
          :class="{ active: item.typeCode == apiSearchParams.typeCode }"
          :key="item.typeCode"
          @click="switchAggType(item.typeCode)"
        >
          {{ `${item.type + "(" + item.count + ")"}` }}
        </el-button>
      </div>
    </div>
    <!-- 新增弹出框 -->
    <el-dialog
      class="element-form__dialog"
      :title="pageType == 'blackList' ? '黑名单新增' : '白名单新增'"
      v-model:visible="dialogConfig.visible"
      :before-close="handleClose"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogConfig.ruleForm"
        :rules="dialogConfig.rules"
        ref="ruleForm"
        label-width="90px"
      >
        <el-radio-group
          v-model="activeName"
          :slow="false"
          style="margin-bottom: 20px; width: 100%; text-align: center"
        >
          <el-radio-button label="单个新增"></el-radio-button>
          <el-radio-button label="批量新增"></el-radio-button>
        </el-radio-group>

        <div class="element-add__content">
          <div class="element-add__single" v-show="activeName == '单个新增'">
            <el-form-item label="IOC类型：">
              <el-select
                v-model="dialogConfig.ruleForm.typeCode"
                placeholder="请选择IOC类型"
              >
                <el-option label="IP" :value="1"></el-option>
                <el-option
                  label="DNS"
                  v-show="pageType == 'blackList'"
                  :value="2"
                ></el-option>
                <el-option
                  label="URL"
                  v-show="pageType == 'blackList'"
                  :value="3"
                ></el-option>
                <el-option
                  label="邮箱账号"
                  v-show="pageType == 'blackList'"
                  :value="4"
                ></el-option>
                <el-option label="证书HASH" :value="5"></el-option>
                <el-option
                  label="文件HASH"
                  v-show="pageType == 'blackList'"
                  :value="9"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="IOC内容：" prop="value">
              <el-input
                v-model="dialogConfig.ruleForm.value"
                placeholder="请输入明文的IOC内容"
                maxlength="255"
                autocomplete="off"
              ></el-input>
            </el-form-item>
            <el-form-item label="信誉等级：" v-if="pageType == 'blackList'">
              <el-radio-group v-model="dialogConfig.ruleForm.threatLevel">
                <el-radio :label="1">可疑</el-radio>
                <el-radio :label="2">危险</el-radio>
                <el-radio :label="3">高危</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="长期有效：" v-if="pageType == 'blackList'">
              <el-radio-group v-model="dialogConfig.ruleForm.expiryEnable">
                <el-radio :label="0">是</el-radio>
                <el-radio :label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="有效期至："
              v-if="
                pageType == 'blackList' &&
                dialogConfig.ruleForm.expiryEnable == 1
              "
              prop="expiryTime"
            >
              <el-date-picker
                v-model="dialogConfig.ruleForm.expiryTime"
                type="datetime"
                placeholder="请选择有效时间"
                fefault-date="2099-12-31"
                default-time="23:59:59"
                value-format="yyyy-MM-dd hh:mm:ss"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="特征备注：" v-if="pageType == 'blackList'">
              <el-input
                v-model="dialogConfig.ruleForm.dataTag"
                placeholder="请输入特征备注"
                maxlength="255"
                autocomplete="off"
              ></el-input>
            </el-form-item>
            <el-form-item label="特征备注：" v-if="pageType == 'whiteList'">
              <el-input
                v-model="dialogConfig.ruleForm.remark"
                placeholder="请输入特征备注"
                maxlength="255"
                autocomplete="off"
              ></el-input>
            </el-form-item>
            <el-form-item label="组织名称：" v-if="pageType == 'blackList'">
              <el-input
                v-model="dialogConfig.ruleForm.groupId"
                placeholder="请输入组织名称"
                maxlength="255"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </div>

          <div class="element-add__batch" v-show="activeName == '批量新增'">
            <el-upload
              class="element-upload__area"
              drag
              :limit="1"
              :accept="dialogConfig.acceptType.join(',')"
              action=""
              :multiple="false"
              ref="upload"
              :data="uploadData"
              :auto-upload="false"
              :on-error="onUploadError"
              :with-credentials="true"
              :on-success="onUploadSuccess"
              :on-change="onUploadChange"
              :on-exceed="onExceed"
              :on-remove="onUploadSuccess"
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
                <li>1、文件类型：.xlsx；</li>
                <li>2、文件大小：不超过<span class="high">5M</span>；</li>
                <li>3、文件编码：UTF-8 无BOM格式；</li>
                <li>
                  4、内容字段：{{ templateFields[pageType] }}。
                  <a class="high" @click="downloadTemplate">下载模板</a>
                </li>
              </ul>
            </el-form-item>
          </div>
        </div>
      </el-form>

      <!-- 嵌套内层弹窗 -->
      <el-dialog
        width="300px"
        title="导入结果"
        v-model:visible="innerVisible"
        :show-close="false"
        :close-on-click-modal="false"
        append-to-body
      >
        <div class="element-upload__result">
          <p>
            <i class="el-icon el-icon-pending-filled"></i>总记录数（条）：{{
              uploadResult.total
            }}
          </p>
          <p>
            <i class="el-icon el-icon-success"></i>导入成功（条）：{{
              uploadResult.success
            }}
          </p>
          <p>
            <i class="el-icon el-icon-warning"></i>重复数据（条）：{{
              uploadResult.repeat
            }}
          </p>
          <p>
            <i class="el-icon el-icon-error"></i>导入失败（条）：{{
              uploadResult.fail
            }}
          </p>
          <p>
            <i class="el-icon el-icon-description"></i>
            <a
              class="el-highlight el-highlight--primary"
              @click="downloadFailExcel"
              >异常数据.xlsx</a
            >
          </p>
        </div>
        <!-- 里弹窗底部 -->
        <!-- <span slotslot="footer" class="dialog-footer">
          <el-button type="primary" @click="closeDialogAll">确认</el-button>
        </span> -->
      </el-dialog>

      <!-- 外弹窗底部 -->
      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import searchBarConfig from "./pageSettings.js";
import { exporter } from "@TOOLS/export.js";
import {
  deleteRule,
  singleAddRule,
  batchImportRules,
} from "@API/TZ/IntelligenceManage/TacticalIntelligence.js";
export default {
  name: "ToolBarContent",
  props: {
    pageType: {
      type: String,
      default: "blackList",
    },
    pageApiConfig: {
      type: Object,
    },
    // 聚合信息数据
    aggListData: {
      type: Object,
      default() {
        return {
          aggSource: [],
          aggType: [],
        };
      },
    },
    apiSearchParams: {
      type: Object,
    },
    selectRows: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      activeName: "单个新增",
      innerVisible: false,
      fileList: [],
      uploadData: {},
      uploadResult: {},
      templateFields: {
        blackList:
          "情报对象、类型、信誉等级、组织名称、特征备注、情报来源、情报发现时间、有效期",
        whiteList: "情报对象、类型、备注、情报来源、情报发现时间",
      },
      // toolbar查询条件
      toolCds: [],
      toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [],
      },
      // toolBar数据
      toolBarData: {
        userCount: 0,
        systemCount: 0,
        aggType: [],
      },
      // 新增弹出框配置
      dialogConfig: {
        visible: false,
        acceptType: [".xlsx"],
        ruleForm: {
          value: "",
          typeCode: 1,
          threatLevel: 1,
          groupId: "",
          expiryEnable: 1,
          expiryTime: "2099-12-31 23:59:59",
          dataTag: "",
          remark: "",
          md5Enable: 0, //是否密文(md5)输入：0-否 1-是
          importEnable: 0, //黑名单标识，白名单不需要此参数
          sourceCode: 1, //规则来源：0-系统内置 1-用户添加 2-平台生产
          sourceId: "", //来源线索类型，当类型为“平台生产”时必填
          relaType: "", //来源线索类型，当类型为“平台生产”时必填
          sourceField: "", //来源线索类型，当类型为“平台生产”时必填
        },
        rules: {
          value: [{ required: true, message: "请输入内容", trigger: "blur" }],
          expiryTime: [
            { required: true, message: "请选择有效期", trigger: "blur" },
          ],
        },
      },
    };
  },
  watch: {
    aggListData: {
      handler(newVal, odlVal) {
        if (newVal != odlVal) {
          this.updateAggListDara(newVal);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    updateAggListDara(aggListData) {
      aggListData.aggSource.forEach((item) => {
        if (item.sourceCode === 0) {
          this.toolBarData.systemCount = item.count;
        } else if (item.sourceCode === 1) {
          this.toolBarData.userCount = item.count;
        }
      });
      //渲染toolBar（用户添加、系统内置）
      this.toolOptions.options = this.formatToolbarOptions(
        searchBarConfig.getToolBtn()
      );
      // 渲染agg类型
      this.toolBarData.aggType = aggListData.aggType;
    },
    formatToolbarOptions(options) {
      options.forEach((item) => {
        item.handler = this[item.handler];
        switch (item.field) {
          case "systemCount":
          case "userCount":
            item.name = `${
              item.name + "(" + this.toolBarData[item.field] + ")"
            }`;
            break;
        }
      });
      return options;
    },
    switchAggType(code) {
      if (this.apiSearchParams.typeCode != code) {
        // this.apiSearchParams.typeCode = code;
        this.$emit("toolBarSearch");
      }
    },
    // toolBar新增事件
    addFeatureRules() {
      this.dialogConfig.visible = true;
    },
    // 新增弹窗 确认事件
    handleSubmit() {
      if (this.activeName == "单个新增") {
        this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
            const ruleForm = this.dialogConfig.ruleForm;
            let params = {
              ...ruleForm,
            };
            //长期有效时，时间默认传2099
            if (!params.expiryEnable) {
              params.expiryTime = "2099-12-31 23:59:59";
            }

            if (this.pageType == "whiteList") {
              delete params.threatLevel;
              delete params.groupId;
              delete params.expiryEnable;
              delete params.expiryTime;
              delete params.importEnable;
              delete params.md5Enable;
              delete params.relaType;
              delete params.sourceField;
              delete params.sourceId;
              delete params.dataTag;
            }
            //调用新增接口 - （单条新增）
            this.singleAddRuleData(params);
          }
        });
      } else {
        this.batchUploadData();
      }
    },
    // 单条新增
    singleAddRuleData(params) {
      let apiUrl = this.pageApiConfig.singleAddUrl;
      //接口请求
      singleAddRule(apiUrl, params)
        .then(() => {
          this.$message({ message: "数据新增成功！", type: "success" });
          //重新加载表格
          this.$emit("toolBarSearch");
          //关闭弹窗
          this.dialogConfig.visible = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    //定义的toolBar导出事件 - 在pageSettings.json里面定义了方法名
    exportFeatureRules() {
      if (!this.selectRows.length) {
        this.$message({ message: "请至少选择一条数据进行导出！" });
        return;
      }
      let ids = this.selectRows.map((item) => item.id);
      exporter({
        action: this.pageApiConfig.exportUrl,
        ids: ids.join(","),
      });
    },
    //定义的toolBar删除事件 - 在pageSettings.json里面定义了方法名
    deleteFeatureRules() {
      if (!this.selectRows.length) {
        this.$message({ message: "请至少选择一条数据进行删除！" });
        return;
      }
      this.$confirm("确定删除此数据吗？", "提示", {
        message: "确定删除此数据吗？",
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          //调用数据更新接口
          this.deleteRuleData();
        })
        .catch(() => {});
    },
    // 删除规则
    deleteRuleData() {
      let apiUrl = this.pageApiConfig.deleteBatchUrl,
        ids = this.selectRows.map((item) => item.id);
      ids = ids.join(",");

      //接口请求
      deleteRule(apiUrl, { ids })
        .then(() => {
          this.$message({ message: "删除成功！", type: "success" });
          this.$emit("toolBarSearch");
        })
        .catch((error) => {
          console.log(error);
        });
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

      if (!this.dialogConfig.acceptType.includes(fileType)) {
        this.$message({
          message: `仅支持${this.dialogConfig.acceptType.join(
            "或"
          )}类型文件上传！`,
          type: "error",
        });
        this.onUploadSuccess();
        return false;
      }
      return true;
    },
    // 批量上传
    batchUploadData() {
      let beforeUpload = this.onUploadBefore();
      if (!beforeUpload) return;

      let formData = new FormData(),
        apiUrl = this.pageApiConfig.importUrl;
      // 构造form表单数据
      formData.append("file", this.uploadData.file);
      formData.append("fileNames", this.uploadData.fileNames);
      // 批量导入
      batchImportRules(apiUrl, formData)
        .then((res) => {
          if (res.status == 200) {
            //打开内弹窗
            this.uploadResult = res.data;
            this.innerVisible = true;
          } else {
            this.$message({
              type: "error",
              message: res.msg || "上传失败！",
            });
          }
          // this.$message({ message: "上传成功！", type: "success" });
          // this.$emit("toolBarSearch");
        })
        .catch((error) => {
          console.log(error);
        });
    },

    onExceed() {
      this.$message({ message: "单次最多上传一个文件！", type: "error" });
    },
    onUploadError() {
      this.$message({ message: "上传错误，请重试！", type: "error" });
    },
    // 清除form缓存
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

      if (!this.dialogConfig.acceptType.includes(fileType)) {
        this.$message({
          message: `仅支持${this.dialogConfig.acceptType.join(
            "或"
          )}类型文件上传！`,
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
    },
    handleClose() {
      //清空上传列表
      this.onUploadSuccess();
      this.dialogConfig.visible = false;
    },
    closeDialogAll() {
      this.innerVisible = false;
      this.handleClose();
      this.$emit("toolBarSearch");
    },
    // 下载导入模板
    downloadTemplate() {
      exporter({
        action: this.pageApiConfig.excelTempUrl,
        fileName: "",
      });
    },
    //导出“导入失败明细”数据
    downloadFailExcel() {
      exporter({
        action: this.pageApiConfig.importFailedUrl,
        fileName: this.uploadResult.fileName,
      });
    },
  },
  components: {
    // toolBar: () => import("@COMP/TZ/toolbar"),
  },
};
</script>
<style lang="scss" scoped>
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

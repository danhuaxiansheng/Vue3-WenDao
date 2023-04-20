<template>
  <div class="element-container__full">
    <div class="searchbar-header__container">
      <el-form
        :model="ruleForm"
        :inline="true"
        ref="ruleForm"
        :rules="taskDialog.rules"
        label-width="100px"
        :item-width="`260px`"
        class="demo-ruleForm"
      >
        <el-form-item label="任务名称：" prop="TASK_NAME">
          <el-input
            v-model="ruleForm.TASK_NAME"
            placeholder="请输入任务名称"
            maxlength="200"
          ></el-input>
        </el-form-item>

        <el-form-item label="创建时间：">
          <el-date-picker
            v-model="ruleForm.CREATE_TIME"
            :picker-options="pickerOptions"
            :clearable="true"
            :append-to-body="false"
            :editable="false"
            :default-time="['00:00:00', '23:59:59']"
            class="time_pick"
            type="datetimerange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="timeChange"
          >
          </el-date-picker>

          <!-- 全局应用 按钮 -->
          <template v-if="timeConfig.global && timeGlobal.isShow">
            <el-button
              type="text"
              class="time-global"
              :disabled="timeGlobalDisabled"
              primary
              >全局应用</el-button
            >
          </template>
        </el-form-item>
      </el-form>
      <div class="el-search-header-buttons">
        <el-button type="primary" class="search-btn" @click="search"
          >查询</el-button
        >
        <el-button type="info" class="reset-btn" @click="reset">重置</el-button>
      </div>
    </div>
    <div class="el-table__container">
      <gridBar ref="dataTable" v-model:options="tableOptions">
        <template v-slot:tool-left>
          <tool-bar :options="toolOptions.options"></tool-bar>
        </template>
        <!-- 解析进度 -->
        <template v-slot:UPLOAD_TYPE="{ scope }">
          <svg-icon
            :title="formatTaskType(scope.row).title"
            :href="`icon-${formatTaskType(scope.row).className}`"
          >
          </svg-icon>
        </template>
        <!-- 解析进度 -->
        <template v-slot:FINISH_ANALYSIS_SAMPLE="{ scope }">
          <div class="el-sample__content">
            <span class="el-sample__text">{{
              `${scope.row["ZIP_SUCC_COUNT"]}/${scope.row["ZIP_COUNT"]}`
            }}</span>
            <el-progress
              :percentage="getAnalysisState(scope.row, 'finish')"
              :show-text="false"
              :stroke-width="6"
              status="success"
            ></el-progress>
          </div>
        </template>
        <!-- 分析进度 -->
        <template v-slot:ANALYSIS_SAMPLE="{ scope }">
          <div class="el-sample__content">
            <span class="el-sample__text">{{
              `${scope.row["ANALYSIS_SAMPLE"]}/${scope.row["SAMPLE_NUMBER"]}`
            }}</span>
            <el-progress
              :percentage="getAnalysisState(scope.row, 'sample')"
              :show-text="false"
              :stroke-width="6"
              status="success"
            ></el-progress>
          </div>
        </template>
        <!-- 风险/正常 -->
        <template v-slot:FILE_RISK="{ scope }">
          <span class="el-highlight el-highlight--danger">{{
            scope.row.FILE_RISK
          }}</span
          >/{{ scope.row.FILE_NORMAL }}
        </template>
        <!-- 操作列配置 -->
        <template v-slot:action-column="{ scope }">
          <el-button
            type="text"
            icon="iconfont icon-delete"
            @click="deleteData(scope.row)"
            primary
            >删除</el-button
          >
          <el-button
            type="text"
            icon="iconfont icon-table-detail"
            @click="jumpDetails(scope.row)"
            primary
            >详情</el-button
          >
        </template>
      </gridBar>
    </div>

    <!-- 新增弹出框 -->
    <el-dialog
      class="element-form__dialog"
      title="创建任务"
      v-loading.sync="taskDialog.loading"
      :element-loading-text="'上传中...(' + taskDialog.uploadProgress + '%)'"
      v-model:visible="taskDialog.visible"
      :before-close="handleClose"
      width="730px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="ruleForm"
        :model="taskDialog.ruleForm"
        :rules="taskDialog.rules"
        label-width="90px"
      >
        <el-radio-group
          v-model="taskDialog.activeName"
          :slow="false"
          @change="changeTasktype"
          style="margin-bottom: 16px; width: 100%; text-align: center"
        >
          <el-radio-button label="demo">本地样本</el-radio-button>
          <el-radio-button label="pack">本地压缩包</el-radio-button>
        </el-radio-group>

        <el-form-item
          :label="
            taskDialog.activeName == 'demo' ? '上传样本：' : '上传压缩包：'
          "
        >
          <el-upload
            class="element-upload__area"
            drag
            ref="upload"
            :limit="1"
            :accept="
              taskDialog.activeName == 'demo'
                ? ''
                : taskDialog.acceptType.join(',')
            "
            action=""
            :multiple="false"
            :data="taskDialog.uploadData"
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
        </el-form-item>
        <el-form-item v-show="taskDialog.activeName == 'demo'">
          <ul class="element-add__tips">
            <li>
              1、单样本文件大小不超过<span
                class="el-highlight el-highlight--primary"
                >50M</span
              >，支持邮件、脚本文件、可执行文件等多种类型；
            </li>
            <li>2、批量样本文件上传请压缩后使用压缩包上传功能；</li>
            <li>
              3、上传样本需要进行病毒、木马分析，为了分析的准确性，单个样本大概需要5分钟，请耐心等待。
            </li>
          </ul>
        </el-form-item>
        <el-form-item v-show="taskDialog.activeName == 'pack'">
          <ul class="element-add__tips">
            <li>
              1、压缩包内单文件大小不超过<span
                class="el-highlight el-highlight--primary"
                >50M（超过的文件不分析）</span
              >、总大小不超过<span class="el-highlight el-highlight--primary"
                >1G</span
              >；支持<span class="el-highlight el-highlight--primary"
                >7z、rar、zip</span
              >等压缩类型；
            </li>
            <li>
              2、支持加密压缩包，上传时请根据操作流程填写正确的解压密码，否则会解析失败；
            </li>
            <li>
              3、上传样本需要进行病毒、木马分析，为了分析的准确性，单个样本大概需要5分钟，请耐心等待。
            </li>
          </ul>
        </el-form-item>
        <el-form-item
          label="是否加密："
          v-show="taskDialog.activeName == 'pack'"
        >
          <el-radio-group v-model="taskDialog.ruleForm.encryption">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="解压密码："
          v-if="taskDialog.ruleForm.encryption"
          prop="password"
        >
          <el-input
            v-model="taskDialog.ruleForm.password"
            maxlength="200"
            placeholder="请输入解压密码"
          ></el-input>
        </el-form-item>

        <el-form-item label="任务名称：" prop="taskName">
          <el-input
            v-model="taskDialog.ruleForm.taskName"
            maxlength="200"
            placeholder="请输入任务名称"
          ></el-input>
        </el-form-item>

        <!-- <el-form-item label="上传进度："
                    v-if="taskDialog.activeName=='pack'">
                    <el-progress :percentage="taskDialog.uploadProgress"
                        :text-inside="true"
                        :stroke-width="12"
                        status="success"></el-progress>
                </el-form-item> -->
      </el-form>

      <!-- <span slotslot="footer"
                class="dialog-footer">
                <el-button type="info"
                    @click="handleClose">取消</el-button>
                <el-button type="primary"
                    @click="handleSubmit">确认</el-button>
            </span> -->
    </el-dialog>
  </div>
</template>

<script>
import { isNullOrEmpty } from "@LIB/base.js";
import { getTimeByFlag } from "@TOOLS/dateTools.js";
import { deleteDBData, uploadFileData } from "@/api/TZ/FileAnalysis/index.js";
import { setSessionParam } from "@PAGE/platform.js";

export default {
  name: "UploadFile",
  components: {
    toolBar: () => import("@COMP/TZ/toolbar"),
    gridBar: () => import("@COMP/TZ/gridbar"),
  },
  data() {
    return {
      // 时间快捷栏设置
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
        onPick: ({ maxDate, minDate }) => {
          this.pickMinDate = minDate;
          this.pickMaxDate = maxDate;
        },
        disabledDate: (time) => {
          // 判断是否存在日期限制
          if (!this.timeConfig.dateLimit) {
            return false;
          } else {
            // 未选择结束时间 计算时间范围
            if (this.pickMinDate && !this.pickMaxDate) {
              const one =
                parseInt(this.timeConfig.dateLimit) * 24 * 3600 * 1000;
              const minTime = this.pickMinDate.getTime() - one;
              const maxTime = this.pickMinDate.getTime() + one;
              return time.getTime() < minTime || time.getTime() > maxTime;
            } else {
              return false;
            }
          }
        },
      },
      timeConfig: {
        clearable: true,
      },
      ruleForm: {
        TASK_NAME: "",
        CREATE_TIME: [], // 时间内容
      },
      taskDialog: {
        visible: false,
        loading: false,
        activeName: "demo",
        uploadProgress: 0,
        acceptType: [".zip", ".rar", ".7z"],
        fileList: [],
        ruleForm: {
          taskName: "",
          encryption: false,
          password: "",
        },
        rules: {
          taskName: [
            { required: true, message: "任务名称不能为空", trigger: "blur" },
          ],
          password: [
            { required: true, message: "解压密码不能为空", trigger: "blur" },
          ],
        },
        uploadData: {}, // 上传文件
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        options: [
          {
            name: "创建任务",
            type: "button",
            icon: "iconfont icon-add",
            handler: this.createUploadTask,
          },
        ],
      },
      tableOptions: {
        url: "/api/dataBase/find", // 接口地址
        columns: [],
        isEnaleSelect: false,
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "140",
          field: "action-column",
        },
        where: {
          onlyCount: false,
          indexName: "tb_upload_task",
          conditions: [],
          sortOrder: "desc",
          sortField: "CREATE_TIME",
        },
        conditions: [], // 条件
        pagination: {}, // 分页
        defaultSort: {
          prop: "CREATE_TIME",
          order: "descending",
        },
      },
    };
  },
  created() {
    // 执行查询事件
    setTimeout(() => {
      this.search();
    }, 50);
  },
  methods: {
    timeChange(val) {
      this.ruleForm.timeValue = val ? val : [];
    },
    search() {
      const searchConditions = [
        { field: "IS_DELETE", op: "equal", value: "0" },
      ];
      // 任务名称参数
      if (this.ruleForm["TASK_NAME"]) {
        searchConditions.push({
          field: "TASK_NAME",
          op: "contain",
          value: this.ruleForm["TASK_NAME"],
        });
      }
      // 创建时间参数
      if (this.ruleForm["CREATE_TIME"].length) {
        searchConditions.push({
          field: "CREATE_TIME",
          op: "range",
          value: this.ruleForm["CREATE_TIME"].join(" - "),
        });
      }
      this.tableOptions.where.conditions = searchConditions;
      this.$refs["dataTable"].reloadTable();
    },
    reset() {
      this.ruleForm.TASK_NAME = "";
      this.ruleForm.CREATE_TIME = [];
    },
    formatTaskType(row) {
      let className = "",
        title = "";

      switch (row.UPLOAD_TYPE) {
        case 1:
          className = "server-folder";
          title = "服务器文件夹";
          break;
        case 2:
          className = "a-ract";
          title = "单样本";
          break;
        case 3:
          className = "zipPackage-ract";
          title = "压缩包";
          break;
        case 4:
          className = "ftp-ract";
          title = "FTP服务器";
          break;
        case 5:
          className = "file-ract";
          title = "共享文件夹";
          break;
        default:
          className = "url-ract";
          title = "URL文件";
      }
      return {
        className,
        title,
      };
    },
    getAnalysisState(row, type) {
      const error = row["ERRO_CAUSE"];
      const result = isNullOrEmpty(error);

      const sampleNum = result
        ? row[type == "finish" ? "ZIP_SUCC_COUNT" : "ANALYSIS_SAMPLE"]
        : 1;
      const totalNum = result
        ? row[type == "finish" ? "ZIP_COUNT" : "SAMPLE_NUMBER"]
        : 1;

      if (!sampleNum && !totalNum) {
        return 0;
      }
      return (sampleNum / totalNum) * 100;
    },
    changeTasktype() {
      this.onUploadSuccess();
      this.taskDialog.ruleForm.taskName = "";
    },
    createUploadTask() {
      this.taskDialog.visible = true;
    },
    handleClose() {
      //清空上传列表
      this.onUploadSuccess();
      this.taskDialog.visible = false;
    },
    onUploadSuccess() {
      //清空上传列表
      this.$refs["upload"].clearFiles();
      this.$refs["ruleForm"].resetFields();
      this.taskDialog.uploadData = {};
      this.taskDialog.fileList = [];
      this.taskDialog.uploadProgress = 0;
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
        this.taskDialog.uploadData = {
          file: file.raw,
          fileNames: JSON.stringify({ file: file.name }),
        };
        this.formatTaskName(file.name);
        this.taskDialog.fileList.push(file);
      }
    },
    formatTaskName(filename) {
      let lastIndex = filename.lastIndexOf("."),
        tempname = filename.substr(0, lastIndex);
      //   lastIndex < 0 && (tempname = dataObj.name);
      this.taskDialog.ruleForm.taskName = tempname;
    },
    confirmUploadResult(file) {
      let fileName = file.name;
      let index = fileName.lastIndexOf(".");
      let fileLength = fileName.length;
      let fileType = fileName.substring(index, fileLength);

      // 文件大小验证：样本-50M,压缩包-1G
      const isDemo = this.taskDialog.activeName == "demo";
      const maxFileSize = isDemo ? 52428800 : 1073741824;
      if (file.size > maxFileSize) {
        this.$message({
          message: `${isDemo ? "样本" : "压缩包"}大小不能超过${
            isDemo ? "50M" : "1G"
          }！`,
          type: "error",
        });
        this.onUploadSuccess();
        return false;
      }
      // 文件类型验证
      if (
        this.taskDialog.activeName == "pack" &&
        !this.taskDialog.acceptType.includes(fileType)
      ) {
        this.$message({
          message: `仅支持${this.taskDialog.acceptType.join(
            "|"
          )}类型文件上传！`,
          type: "error",
        });
        this.onUploadSuccess();
        return false;
      }
      return true;
    },
    onUploadBefore() {
      let fileList = this.taskDialog.uploadData.file;
      if (!fileList) {
        this.$message({ message: "请上传文件！", type: "warning" });
        return false;
      }
      // 验证上传结果
      let result = this.confirmUploadResult(fileList);
      return result;
    },
    handleSubmit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let beforeUpload = this.onUploadBefore();
          if (!beforeUpload) return;
          // 上传文件
          this.uploadFile();
        }
      });
    },
    uploadFile() {
      let formData = new FormData();
      // 构造form表单数据
      formData.append(
        "uploadType",
        this.taskDialog.activeName == "demo" ? 2 : 3
      ); // 2-样本,3-压缩包
      formData.append("taskName", this.taskDialog.ruleForm.taskName);
      if (this.taskDialog.ruleForm.password)
        formData.append("packagePassword", this.taskDialog.ruleForm.password);
      formData.append("file", this.taskDialog.uploadData.file);
      // 获取文件上传进度
      const uploadEvent = (progressEvent) => {
        this.taskDialog.uploadProgress = Number(
          ((progressEvent.loaded / progressEvent.total) * 100).toFixed(1)
        );
      };
      // 开启遮罩
      this.taskDialog.loading = true;
      // 文件上传-方法调用
      uploadFileData(formData, uploadEvent)
        .then((res) => {
          if (res.status == 200) {
            if (this.taskDialog.activeName == "pack") {
              // 压缩包 进度条状态
              this.$msgbox({
                type: "success",
                customClass: "wd_dailog",
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                dangerouslyUseHTMLString: true,
                message: `<h3 class="title">上传成功</h3><p class="txt">${
                  this.taskDialog.activeName == "demo" ? "样本" : "压缩包"
                }文件已上传完成。</p>`,
              }).then(() => {
                // 重置/关闭遮罩
                this.onUploadSuccess();
                this.taskDialog.visible = false;
                // 查询数据
                this.search();
              });
            } else {
              this.$message({
                message: "上传成功！",
                type: "success",
              });
              // 重置/关闭遮罩
              this.onUploadSuccess();
              this.taskDialog.visible = false;
              // 查询数据
              this.search();
            }
          } else {
            // 压缩包 进度条状态
            if (this.taskDialog.activeName == "pack")
              this.taskDialog.uploadProgress = 0;
            this.$message({
              message: res.msg || "上传失败！",
              type: "error",
            });
          }
          this.taskDialog.loading = false;
        })
        .catch(() => {});
    },
    deleteData(row) {
      this.$confirm("确定删除此数据吗？", "提示", {
        customClass: "wd_dailog",
        type: "warning",
      })
        .then(() => {
          // 提交删除
          let apiParams = {
            params: JSON.stringify({
              indexName: "tb_upload_task",
              conditions: [{ field: "ID", value: row["ID"], op: "equal" }],
            }),
          };
          deleteDBData(apiParams)
            .then((res) => {
              if (res.status == 200) {
                this.search();
                this.$message({
                  message: "数据删除成功！",
                  type: "success",
                });
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    },
    jumpDetails(row) {
      setSessionParam({
        isJson: true,
        type: "_blank",
        url: "/TZ/FileAnalysis/FileList",
        sessionName: "paramListSession",
        data: {
          conditions: [
            { field: "taskid", value: row.ID, op: "equal" },
            {
              field: "@createtime",
              value: this.ruleForm.CREATE_TIME.join(" - "),
              op: "range",
            },
          ],
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.el-progress-bar__outer) {
  background-color: #e2e2e2;
  .el-progress-bar__innerText {
    margin-top: -4px;
  }
}
:deep(.searchbar-header__container) {
  padding-top: 14px;
  position: relative;
  @include cardStyle;
  @include flexCenter($justify: flex-start);
  .el-form-item {
    margin-bottom: 16px;
  }
  .el-search-header-buttons {
    margin-bottom: 16px;
  }
  .el-picker-panel__sidebar {
    width: 95px;
  }
  .el-date-editor--datetimerange.el-input__inner {
    width: 370px;
  }
}
:deep(.el-table__container) {
  height: calc(100% - 78px);
  margin-top: 16px;
  .page-table {
    padding: 0 16px;
  }
}
:deep(.el-sample__content) {
  @include flexCenter($justify: flex-end);
  flex-wrap: wrap;
  .el-sample__text {
    font-size: 12px;
    line-height: 12px;
    margin-bottom: 2px;
  }
  .el-progress {
    width: 100%;
  }
}
:deep(.element-form__dialog) {
  .element-add__tips,
  .element-upload__area .el-upload-dragger {
    width: 550px;
  }
  .element-add__tips li {
    line-height: 26px;
  }
  .el-progress {
    line-height: 32px;
  }
  .el-upload-list__item {
    max-width: 550px;
  }
  .el-form-item {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>

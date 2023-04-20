<template>
  <div class="page-layout element-container__full" v-loading="loading">
    <div
      class="element-list__container"
      v-for="(fileType, inx) in fileTypeConfig"
      :key="inx"
    >
      <div class="element-list__title">
        {{ fileType.category }}
        <el-button @click="openAddDialog" v-if="fileType.class == 'fileType'">
          <i class="iconfont icon-add"></i>添加类型
        </el-button>
      </div>
      <div class="element-list__body">
        <div
          class="element-list__wrap"
          v-for="item in fileType.catelist"
          :key="item.type"
        >
          <div class="element-item__title">{{ item.type }}：</div>
          <div class="element-list__content">
            <el-checkbox
              :indeterminate="item.isIndeterminate"
              v-model="item.checkAll"
              @change="checkedAllProtocols($event, item, fileType.class)"
              >全选
            </el-checkbox>
            <el-checkbox-group
              v-model="item[fileType.class + 'Checked']"
              @change="checkedSingleProtocol($event, item, fileType.class)"
            >
              <el-tag
                v-for="list in item[fileType.class]"
                :closable="!item[fileType.class + 'Default'].includes(list)"
                :key="list"
                @close="removeFileType(list, item.type)"
              >
                <el-checkbox :label="list"></el-checkbox>
              </el-tag>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <div class="element-button__content">
      <el-button type="primary" @click="saveFileTypes">确定</el-button>
    </div>

    <el-dialog
      class="element-form__dialog"
      title="添加文件类型"
      v-model:visible="addFileType.visible"
      width="420px"
      height="264px"
      :before-close="cancelDialog"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addFileType.ruleForm"
        :rules="addFileType.rules"
        ref="ruleForm"
        label-width="auto"
        @submit.prevent
      >
        <el-form-item label="文件类型：">
          <el-select
            v-model="addFileType.ruleForm.fileType"
            placeholder="请选择文件类型"
          >
            <el-option
              v-for="item in addFileType.fileList"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="后缀名：" prop="fileSuffix">
          <el-input
            maxlength="15"
            show-word-limit
            placeholder="请输入后缀名"
            v-model.trim="addFileType.ruleForm.fileSuffix"
          ></el-input>
        </el-form-item>
      </el-form>

      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="addDialogSubmit">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import {
  getFileTypes,
  saveFileTypes,
  modifyFileTypes,
} from "@API/TZ/System/index.js";
export default {
  name: "FileTypeCinfig",
  data() {
    return {
      loading: false,
      fileTypeConfig: [],
      addFileType: {
        visible: false,
        fileList: [],
        ruleForm: {
          fileType: "Office",
          fileSuffix: "",
        },
        rules: {
          fileSuffix: [
            {
              required: true,
              validator: this.validateFileName,
              trigger: "blur",
            },
          ],
        },
      },
    };
  },
  created() {
    this.loading = true;
    getFileTypes().then((res) => {
      if (res.status == 200) {
        // 构造协议类型数据
        let protocolTypes = [
          {
            type: "协议类型",
            item: [...res.data.check_protocol],
          },
        ];
        let protocolResult = this.builDataStructure(protocolTypes, "protocol");
        // 构造文件类型数据
        let fileTypeResult = this.builDataStructure(
          res.data.save_file_type,
          "fileType"
        );
        this.fileTypeConfig = [
          {
            class: "protocol",
            category: "协议类型",
            catelist: protocolResult,
          },
          {
            class: "fileType",
            category: "文件类型",
            catelist: fileTypeResult,
          },
        ];
      }
      this.loading = false;
    });
  },
  methods: {
    validateFileName(rule, value, callback) {
      value = value.toString().toLocaleLowerCase();
      if (value.trim() === "") {
        callback(new Error("后缀名不能为空"));
      } else if (/[\u4E00-\u9FA5]/.test(value)) {
        callback(new Error("后缀名不能含中文"));
      } else if (this.existFileType(value)) {
        value;
        callback(new Error(`${value}在该类型下已存在`));
      } else {
        callback();
      }
    },
    // 构造数据结构
    builDataStructure(data, listType) {
      let result = [];
      let fileKeys = [];
      data.forEach((list) => {
        let dataItem = {
          type: list.type,
          checkAll: false,
          isIndeterminate: false,
          [`${listType}`]: [],
          [`${listType}Checked`]: [],
          [`${listType}Default`]: [],
        };
        list.item.forEach((item) => {
          let typeName = item.suffix || item.protocol;
          dataItem[`${listType}`].push(typeName);
          if (item.switch) {
            dataItem[`${listType}Checked`].push(typeName);
          }
          if (item.default || listType === "protocol") {
            dataItem[`${listType}Default`].push(typeName);
          }
        });
        dataItem.checkAll =
          dataItem[`${listType}`].length ===
          dataItem[`${listType}Checked`].length;
        dataItem.isIndeterminate =
          dataItem[`${listType}`].length !=
          dataItem[`${listType}Checked`].length;
        result.push(dataItem);
        if (listType == "fileType") fileKeys.push(list.type);
      });
      // 构造“添加类型”的下拉选项
      this.addFileType.fileList = [...fileKeys, "自定义"];
      return result;
    },
    // 全选事件
    checkedAllProtocols(val, list, type) {
      list[type + "Checked"] = val ? list[type] : [];
      list.isIndeterminate = false;
    },
    // 单选事件
    checkedSingleProtocol(value, list, type) {
      let checkedCount = value.length;
      let listCount = list[type].length;
      list.checkAll = checkedCount === listCount;
      list.isIndeterminate = checkedCount > 0 && checkedCount < listCount;
    },
    removeFileType(fileSuffix, fileType) {
      this.$confirm("确定删除该文件类型？", "提示", {
        customClass: "wd_dailog",
      })
        .then(() => {
          this.updateFileType("delete", { fileSuffix, fileType });
        })
        .catch(() => {});
    },
    // 构造接口参数
    buildApiParams() {
      let apiParams = [];
      this.fileTypeConfig.forEach((fileType) => {
        let defaultType = fileType.class === "protocol" ? "protocol" : "suffix";
        let category = [];
        fileType.catelist.forEach((cate) => {
          let cateList = [];
          let checkedList = cate[fileType.class + "Checked"];
          let defaultList = cate[fileType.class + "Default"];

          cate[fileType.class].forEach((item) => {
            let list = {
              [defaultType]: item,
              switch: checkedList.includes(item) ? 1 : 0,
            };
            if (fileType.class === "fileType")
              list.default = defaultList.includes(item);

            cateList.push(list);
          });
          if (defaultType == "protocol") category.push(cateList);
          else category.push({ item: cateList, type: cate.type });
        });
        apiParams.push(category);
      });
      return apiParams;
    },
    // 确定保存事件
    saveFileTypes() {
      this.loading = true;
      let result = this.buildApiParams();
      let apiParams = {
        params: JSON.stringify({
          check_protocol: result[0][0],
          save_file_type: result[1],
        }),
      };
      saveFileTypes(apiParams).then((res) => {
        if (res.status == 200) {
          this.$message({ message: "设置成功！", type: "success" });
          this.loading = false;
        }
      });
    },
    // 增加文件类型
    openAddDialog() {
      this.addFileType.visible = true;
    },
    // 新增时，判断是否已存在该类型
    existFileType(value) {
      let result = false;
      result = this.fileTypeConfig[1].catelist.some((item) => {
        return (
          item.type == this.addFileType.ruleForm.fileType &&
          item.fileType.includes(value)
        );
      });
      return result;
    },
    updateFileType(action, params) {
      let type = "",
        message = "",
        apiParams = {};
      const ruleForm = this.addFileType.ruleForm;
      if (action == "add") {
        message = "类型新增成功！";
        type = ruleForm.fileType;
        apiParams = {
          ...ruleForm,
          option: action,
        };
      } else {
        message = "类型删除成功！";
        type = params.fileType;
        apiParams = {
          fileType: params.fileType,
          fileSuffix: params.fileSuffix,
          option: action,
        };
      }
      modifyFileTypes(apiParams).then((res) => {
        if (res.status == 200) {
          this.$message({ message: message, type: "success" });
          // 更新当前列表
          this.fileTypeConfig[1].catelist.some((item) => {
            if (item.type == type) {
              if (action == "add") {
                item.fileType.push(ruleForm.fileSuffix);
                item.fileTypeChecked.push(ruleForm.fileSuffix);
              } else {
                let fileTypeIndex = item.fileType.indexOf(params.fileSuffix);
                let fileTypeCheckedIndex = item.fileTypeChecked.indexOf(
                  params.fileSuffix
                );
                // 删除数组
                fileTypeIndex > -1 && item.fileType.splice(fileTypeIndex, 1);
                fileTypeCheckedIndex > -1 &&
                  item.fileTypeChecked.splice(fileTypeCheckedIndex, 1);
              }
            }
          });
        }
        if (action == "add") this.cancelDialog(); // 关闭弹窗
      });
    },
    addDialogSubmit() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.updateFileType("add");
        }
      });
    },

    cancelDialog() {
      this.$refs["ruleForm"].resetFields();
      this.addFileType.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-list__container {
  @include cardStyle;
  height: calc(100% - 214px);
  &:first-child {
    height: 152px;
    margin-bottom: 16px;
  }
  .element-list__title {
    @include cardTitle;
  }
  .element-list__body {
    height: calc(100% - 48px);
    overflow-y: auto;
    padding: 16px;
    .element-list__wrap {
      @include flexCenter(flex-start, left);
      flex-wrap: wrap;
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    .element-item__title {
      font-weight: bold;
      line-height: 32px;
      width: 150px;
      text-align: right;
      padding-right: 16px;
    }
    .element-list__content {
      width: calc(100% - 150px);
      padding-top: 8px;
      > .el-checkbox {
        padding-left: 10px;
      }
      .el-tag {
        width: 16%;
        margin-left: 0;
        margin-top: 8px;
        background-color: transparent;
        &:hover {
          background-color: rgba(26, 115, 232, 0.1);
        }
      }
    }
  }
}
.element-button__content {
  text-align: right;
  margin-top: 16px;
}
</style>

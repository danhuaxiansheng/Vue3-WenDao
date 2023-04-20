<!-- 添加程序 -->
<template>
  <div class="dialog-content">
    <el-layer-dialog
      append-to-body
      title="批量上传"
      v-model:visible="dialog_config.visible"
      v-loading.fullscreen="dialog_config.loading"
      class="dialog-table"
      width="450px"
      :lock-scroll="true"
      @close="closeDialog"
      :dragDialog="true"
      :close-on-click-modal="false"
    >
      <el-row :span="24" class="dialog-table-content">
        <el-upload
          class="dialog-upload"
          :auto-upload="false"
          ref="upload"
          name="file"
          drag
          :multiple="dialog_config.multiple"
          :limit="10"
          :file-list="fileList"
          :show-file-list="true"
          :action="uploadUrl"
          :on-error="onError"
          :on-change="onChange"
          :with-credentials="true"
          :on-success="onSuccess"
          :on-exceed="onExceed"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slotslot="tip">
            <ul class="tip-panle">
              <li>1、文件类型：无限制；</li>
              <li>2、文件大小：建议不超过1GB；</li>
              <li>3、文件编码：UTF-8，无BOM格式；</li>
              <li v-if="tempUrl && tempUrl.length > 0">
                4、<a class="temp-a" :href="tempUrl" download>模板下载</a>；
              </li>
            </ul>
          </div>
        </el-upload>
      </el-row>
      <div slotslot="footer" class="dialog-footer">
        <el-button @click.prevent="submit" type="primary">确认</el-button>
        <el-button @click.prevent="closeDialog">取消</el-button>
      </div>
    </el-layer-dialog>
  </div>
</template>

<script>
export default {
  name: "dialog-content",
  props: {
    // dialog_config: {
    //   type: Object,
    //   default: function () {
    //     return {
    //       loading: false, //是否启用遮罩
    //       visible: false, //是否启用
    //       multiple: true,
    //       url: "api/tool-packet",
    //       tempUrl: "/static/template/software.xlsx",
    //     };
    //   },
    // },
  },
  data() {
    return {
      fileList: [],
      tempUrl: "", ///static/template/preprocessDisk.xlsx
      uploadUrl: "", //"preprocessDiskMonitor/import"
      dialog_config: {},
    };
  },
  methods: {
    onError() {
      this.$elMessage({ message: "上传发生错误，请稍后重试", type: "error" });
    },
    onExceed(file, fileList) {
      this.$elMessage({
        message: "最多同时上传" + fileList.length + "个文件！",
        type: "error",
      });
    },
    onChange(file, fileList) {
      this.fileList = fileList;
      //   let excelList = ["xlsx", "xlsm", "xls", "xlsb", "xltx", "xls", "csv"];
      //   this.fileList = fileList.slice(-10);
      //   let fileName = file.name;
      //   let index = fileName.lastIndexOf(".");
      //   let fileLength = fileName.length;
      //   let suffix = fileName.substring(index + 1, fileLength);
      //   if (excelList.indexOf(suffix.toLocaleLowerCase()) == -1) {
      //     this.waFn("仅支持excel/csv文件");
      //     this.fileList.pop();
      //     return false;
      //   }
    },
    onSuccess(res) {
      if (res.code == 0) {
        let data = res.data;
        this.$elMessage({
          message: `成功${data.succCount}条，失败${data.failCount}条，重复${data.repeat}条`,
          type: "success",
        });
        this.$emit("yes");
      } else {
        this.fileList.pop();
        this.$elMessage({
          message: res.msg,
          type: "error",
        });
      }
    },
    //请求数据函数
    submit() {
      if (this.fileList.length == 0) {
        this.$elMessage({ message: "未上传文件", type: "error" });
        return false;
      }
      this.$emit("yes", this.fileList);
      // this.$refs.upload.submit();
    },
    //关闭当前的弹出框
    closeDialog() {
      this.$emit("cancel");
    },
  },
  mounted() {
    this.uploadUrl = this.$axios.defaults.baseURL + this.dialog_config.url;
    this.tempUrl = this.dialog_config.tempUrl;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dialog-upload {
  text-align: center;
}

.el-upload-list__item,
.el-upload__tip {
  text-align: left;
}

.tip-panle li {
  display: block;
  color: #858a92;
  line-height: 28px;
  position: relative;
}

.temp-a {
  color: #409eff;
}

.footer-button {
  text-align: right;
}
</style>

<style>
.dialog-upload .el-upload-list {
  text-align: left;
  padding: 0px 25px;
}
.el-upload-dragger .el-icon-upload {
  margin: 28px 0 16px;
}
.dialog-table-content .el-upload-dragger {
  width: 342px;
  height: 140px;
}

.dialog-footer .el-button.el-button {
  padding: 6px 15px;
}
</style>

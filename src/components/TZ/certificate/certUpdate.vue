<template>
  <el-dialog
    width="560px"
    :title="certTitle"
    class="cert-update"
    v-model:visible="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    v-loading="loading"
    @close="handleClose"
  >
    <el-upload
      ref="upload"
      drag
      :accept="acceptType"
      :limit="1"
      action=""
      :on-change="uploadChange"
      :auto-upload="false"
      :show-file-list="false"
    >
      <div v-if="!fileData" class="cert_upload">
        <div class="el-upload__text">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            <em>点击上传</em> / 或将license文件拖到此处
          </div>
        </div>
      </div>
      <div v-else class="cert_file">
        <span class="cert-icon">
          <img
            src="~@AST/images/Login/icon-certificate.png"
            class="element-icon__certificate"
            alt="证书icon"
          />

          <i title="删除" @click.stop="deleteFile" class="iconfont icon-close">
          </i>
        </span>
        <p class="fileName">{{ fileName }}</p>
      </div>

      <div class="cert-update-tip" slotslot="tip">
        <ul class="element-add__tips" style="padding: 10px 40px; width: 100%">
          <li>
            1. 服务器产品序列号为：<span class="high">{{ certKey }}</span>
          </li>

          <li>
            2. 授权文件仅支持后缀为<span class="high">.license</span>类型文件
          </li>
        </ul>
      </div>
    </el-upload>

    <div slotslot="footer" class="dialog-footer">
      <el-button type="primary" @click="uploadYes">验证</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCertKey, uploadCert, verificationCert } from "@API/system.js";
export default {
  props: {
    certTitle: {
      type: String,
      default: "授权文件检验",
    },
  },
  data() {
    return {
      dialogVisible: true,
      loading: false,
      acceptType: ".license",
      fileData: null,
      fileName: "",
      certKey: "",
    };
  },
  created() {
    // 获取序列号
    getCertKey().then((d) => {
      this.certKey = d.data || "暂未获取到设备序列号";
    });
  },
  methods: {
    /**
     * dialog关闭
     */
    handleClose() {
      this.$emit("cancel");
    },

    /**
     *  上传文件
     */
    uploadChange(file) {
      this.$refs.upload.clearFiles();
      this.fileData = file.raw;
      this.fileName = file.name;
    },
    deleteFile() {
      this.$refs["upload"].clearFiles();
      this.fileData = null;
    },
    onUploadBefore() {
      let flieList = this.fileData;
      if (!flieList) {
        this.$message.warning("请上传文件！");
        return false;
      }

      let fileName = flieList.name;
      let index = fileName.lastIndexOf(".");
      let fileLength = fileName.length;
      let fileType = fileName.substring(index, fileLength);

      if (!this.acceptType.includes(fileType)) {
        this.$message({
          message: `仅支持${this.acceptType}类型文件上传！`,
          type: "error",
        });
        //清空上传列表
        this.deleteFile();
        return false;
      }
      return true;
    },
    /**
     * 系统升级
     */
    uploadYes() {
      let beforeUpload = this.onUploadBefore();
      if (!beforeUpload) return;

      let formData = new FormData();
      formData.append("file", this.fileData);
      this.loading = true;
      // 上传文件
      uploadCert(formData)
        .then((res) => {
          if (res.status === 200) {
            // 校验证书格式
            verificationCert()
              .then((result) => {
                let res = result.data || {};
                if (result.status === 200) {
                  var certificateStatus = res.status;
                  switch (certificateStatus) {
                    case -1:
                      this.$message({
                        message: "请先上传文件后验证！",
                        type: "error",
                      });
                      break;
                    case 0:
                    case 1:
                      this.$store.commit(
                        "user/SET_CERTSTATUS",
                        certificateStatus
                      );
                      //即将过期时，缓存过期提示语
                      if (certificateStatus == 1) {
                        localStorage.setItem("certificateDec", res.desc);
                      }
                      this.$message({
                        message: "证书正常，验证通过！",
                        type: "success",
                      });
                      this.$emit("yes");
                      break;
                    case 2:
                      // $UI.quickMessage(
                      //   "error",
                      //   data.desc || "证书已过期，请重新上传文件"
                      // );
                      break;
                  }
                } else
                  this.$message({
                    message:
                      res.desc || "证书验证不通过，请检查授权文件并重新上传！",
                    type: "error",
                  });
                this.loading = false;
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            this.$message({
              message: "文件上传失败，请重新上传！",
              type: "error",
            });
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message({
            message: "文件上传失败，请重新上传！",
            type: "error",
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.cert-update {
  :deep(.el-dialog__body) {
    text-align: center;
  }

  .cert-update-tip {
    text-align: left;
    line-height: 28px;
    margin-top: 8px;
  }

  .cert_file {
    height: 100%;
    padding-top: 32px;
    color: $mainColor;
    position: relative;
    .cert-icon {
      display: inline-block;
      width: 70px;
      height: 55px;
      position: relative;
      .el-icon-delete {
        position: absolute;
        right: 4px;
        color: $mainColor;
        font-size: 18px;
        top: -4px;
      }
    }
    .fileName {
      text-align: center;
      font-size: 14px;
      color: $mainColor;
      word-wrap: break-word;
    }
    .svg-icon {
      width: 100%;
      height: 100%;
      :deep(svg) {
        width: 100%;
        height: 100%;
      }
    }
  }

  .cert_upload {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    .icon-upload {
      font-size: 64px;
      color: $highColor;
      display: inline-block;
      margin-bottom: -46px;
    }
  }
  .element-icon__certificate {
    width: 54px;
    height: 48px;
  }
  .icon-close {
    position: absolute;
    right: -16px;
    top: -6px;
  }
}
</style>

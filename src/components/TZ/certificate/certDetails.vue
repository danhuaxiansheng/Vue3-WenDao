<template>
  <el-dialog
    :title="title"
    v-model:visible="visible"
    width="520px"
    v-loading="loading"
    :before-close="cancel"
    :close-on-click-modal="false"
  >
    <div class="element-certificate__content">
      <p v-for="item in column" :key="item.field">
        <em>{{ item.name }}</em
        >{{ item.value }}
      </p>
    </div>
    <span slotslot="footer" class="dialog-footer">
      <el-button type="primary" @click="downUrl">下载</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getCertInfo, downCert } from "@API/system.js";
import { signature } from "@TOOLS/signature";
export default {
  data() {
    return {
      title: "授权文件详情",
      loading: false,
      visible: true,
      rows: [],
      column: [
        { name: "产品名称：", field: "product", value: "" },
        { name: "产品基线：", field: "baseline", value: "" },
        { name: "发行人：", field: "issuer", value: "" },
        { name: "使用者：", field: "issuedTo", value: "" },
        { name: "硬件规格：", field: "specification", value: "" },
        { name: "机器码：", field: "mc", value: "" },
        { name: "发布时间：", field: "issueDateInMillis", value: "" },
        { name: "生效日期：", field: "startDateInMillis", value: "" },
        { name: "失效日期：", field: "expiryDateInMillis", value: "" },
      ],
    };
  },
  beforeMount() {
    this.initCert();
  },
  methods: {
    downUrl() {
      let certStatus = this.$store.state.user.certStatus;
      if (certStatus == "0" || certStatus == "1") {
        downCert().then(() => {
          let url = signature("/auth/authorization/licenseDownload");
          window.location.href = url;
          // window.open(url)
          this.$emit("yes");
        });
      } else {
        this.$message("请先将授权文件上传验证后，才可下载授权文件");
      }
    },
    initCert() {
      this.loading = true;
      getCertInfo()
        .then((res) => {
          if (res.status === 200) {
            this.buildCert(res.data);
          } else {
            this.$message("请求服务错误。");
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    buildCert(data) {
      this.column.forEach((item) => {
        if (item.field == "baseline") {
          switch (data[item.field]) {
            case "1":
              item.value = "基础版";
              break;
            case "2":
              item.value = "标准版";
              break;
            case "3":
              item.value = "专业版";
              break;
          }
        } else {
          item.value = data && data[item.field] ? data[item.field] : "无";
        }
      });
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style lang="scss" scoped>
.element-certificate__content {
  p {
    word-break: break-all;
    line-height: 32px;
    padding: 0 5px;
    background-color: #f9fcfe;
    margin-top: -1px;
    padding-left: 16px;
    border: 1px solid #e9f2fb;
    position: relative;
    .element-content__right em {
      @include ellipsis;
      font-weight: bold;
      left: 0;
      width: 106px;
      position: absolute;
      text-align: right;
    }
  }
}
:deep(.el-dialog__footer) {
  border-top: none;
  .el-button {
    height: 30px;
    width: 76px;
    margin-right: 5px;
  }
}
</style>

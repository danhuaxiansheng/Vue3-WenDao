<template>
  <div class="element-detail__wrap" v-loading="loading">
    <el-empty v-if="!hasEmlContent"></el-empty>
    <div v-else class="element-eml__content">
      <div class="card_title">
        <span :title="emlContent.subject">{{ subject }}</span>
        <el-dropdown @command="handelEmlCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-double-arrow-down" style="font-size: 18px"></i>
          </span>
          <el-dropdown-menu slotslot="dropdown">
            <el-dropdown-item
              v-for="drop in dropdown"
              :key="drop.name"
              :command="drop.method"
              class="element-eml__drop"
            >
              <i :class="drop.icon"></i>{{ drop.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="element-eml__body">
      <el-collapse v-model="emlBody.activeNames" icon-placement="left">
        <!-- 附件列表 -->
        <attachment-list :atts="attachment"></attachment-list>
        <!-- 邮件正文 -->
        <eml-content :eml="emlContent"></eml-content>
      </el-collapse>
    </div>
    <!-- 邮件头 -->
    <el-dialog
      title="邮件头"
      class="element-eml__dialog"
      v-model:visible="headerCoderVislble"
      width="1020px"
      height="520px"
      :modal="false"
      :close-on-click-modal="false"
      @beforeClose="headerCoderVislble = false"
    >
      <el-empty v-if="!emlContent.mailheader.length"></el-empty>
      <div v-else class="element-eml__code">
        <p v-for="(item, index) in emlContent.mailheader" :key="index">
          {{ formatMailCode(item) }}
        </p>
      </div>
    </el-dialog>
    <!-- 邮件源码 -->
    <el-dialog
      title="邮件源码"
      class="element-eml__dialog"
      v-model:visible="emlCodeVisible"
      width="1020px"
      height="520px"
      :modal="false"
      :close-on-click-modal="false"
      @beforeClose="emlCodeVisible = false"
    >
      <el-empty v-if="!formatEmlCode"></el-empty>
      <pre v-else class="element-eml__code">{{ formatEmlCode }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { formatHtml } from "@TOOLS/formatHtml.js";
import { getEmlDetails } from "@/api/TZ/tabContent/emlDetails/index.js";
import { downloadFileData } from "@/api/TZ/tabContent/fileDetails/index.js";
import { exporter } from "@TOOLS/export.js";

export default {
  name: "emlDetails",
  components: {
    AttachmentList: () => import("./modules/AttachmentList.vue"),
    EmlContent: () => import("./modules/EmlContent.vue"),
  },
  props: {
    checkRow: {
      type: Object,
      default: () => null,
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    checkRow: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.buildEmlContent();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      hasEmlContent: true,
      subject: "",
      dropdown: [
        {
          name: "查看邮件头",
          icon: "iconfont icon-preview",
          method: "checkHeaderCode",
        },
        {
          name: "查看邮件源码",
          icon: "iconfont icon-preview",
          method: "checkSourceCode",
        },
        {
          name: "下载邮件",
          icon: "iconfont icon-export",
          method: "downloadEml",
        },
      ],
      emlBody: {
        activeNames: ["attachment", "eml"],
      },
      // 附件信息
      attachment: {
        allAtt: [],
        originalAtt: [],
        unZipByDecryptAtt: [],
      },
      // 邮件信息
      emlContent: {
        mailheader: [],
      },
      emlCodeVisible: false,
      headerCoderVislble: false,
      formatEmlCode: "",
    };
  },

  methods: {
    // 请求邮件详情数据
    buildEmlContent() {
      if (this.checkRow.emlkey) {
        this.getEmlContent();
        this.hasEmlContent = true;
      } else this.hasEmlContent = false;
    },
    getEmlContent() {
      let apiParams = {
        emlIndexName: "inf-eml",
        attIndexName: "inf-attachment",
        emlKey: this.checkRow.emlkey,
      };
      this.loading = true;
      getEmlDetails(apiParams)
        .then((res) => {
          // 绑定附件
          this.attachment = res.data.atts || {};
          // 绑定邮件
          this.emlContent = res.data.eml || {};
          // 邮件审计
          this.addEmailBrowse(res.data.eml || {});
          this.subject = this.formatEmlName(this.emlContent.subject || "");
          this.loading = false;
        })
        .catch(() => {});
    },
    // 处理顶部点击事件
    handelEmlCommand(command) {
      this[command]();
    },
    // 查看邮件头
    checkHeaderCode() {
      this.headerCoderVislble = true;
    },
    // 查看邮件源码
    checkSourceCode() {
      if (this.emlContent.emlcontent) {
        let formatHtmlEvent = new formatHtml(this.emlContent.emlcontent, {
          indent_size: 12,
          indent_character: " ",
          max_char: 50,
          brace_style: "expand",
        });
        this.formatEmlCode = formatHtmlEvent.getValue();
      } else this.formatEmlCode = "";

      this.emlCodeVisible = true;
    },
    // 下载邮件
    downloadEml() {
      let params = this.emlContent;
      const apiParams = {
        params: JSON.stringify({
          indexName: "inf-eml",
          ids: params
            ? params.document_id || params.indexid
            : this.checkRow.indexid,
        }),
        tableName: "inf-eml",
        rowKeyField: "indexid",
        column: "emlcontent",
        fileName: "subject",
        defaultType: "eml",
        fileType: "fileType",
      };
      // 下载文件
      downloadFileData(apiParams)
        .then((res) => {
          exporter({
            action: "/api/file/download",
            key: res.data,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },
    formatEmlName(name) {
      if (!name) return "unknown";
      name.length > 18 &&
        (name = name.substr(0, 8) + "..." + name.substr(name.length - 8, 8));
      return name;
    },
    formatMailCode(mail) {
      return mail
        .replace(/</g, "&lt;")
        .replace(/''/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    // 邮件审计
    addEmailBrowse(eml) {
      if (eml.emlkey) {
        // let apiParams = {
        //   emlKey: eml.emlkey,
        //   subject: eml.subject,
        // };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.card_title) {
  @include cardTitle($height: 32px);
  padding-right: 8px;
  border: none;
}
:deep(.element-eml__body) {
  .el-collapse-item__header {
    height: 34px;
    line-height: 34px;
    font-weight: 700;
    padding-right: 8px;
    &,
    & > .el-collapse-item__arrow {
      color: $highColor;
    }
    & > .element-file__title {
      flex: 1;
    }
    .icon-help {
      margin-left: 4px;
      font-weight: normal;
      color: $warnTextColor;
    }
  }
  .el-empty {
    height: 160px;
  }
}
.element-eml__drop {
  @include flexCenter($justify: flex-start);
}
:deep(.element-eml__dialog) {
  .el-dialog__body {
    height: calc(100% - 42px);
  }
  .element-eml__code {
    height: 100%;
    padding: 8px;
    background-color: rgba(26, 115, 232, 0.08);
    overflow-y: auto;
    white-space: pre-wrap;
    font-family: "Microsoft YaHei";
  }
}
</style>

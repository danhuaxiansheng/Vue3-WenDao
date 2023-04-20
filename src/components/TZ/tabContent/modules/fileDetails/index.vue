<template>
  <div class="element-detail__wrap" style="padding: 0" v-loading.body="loading">
    <el-empty
      v-if="moduleOptions.isRelate && !attachment.allAtt.length"
    ></el-empty>
    <div v-else class="element-file__content">
      <!-- 附件标题 -->
      <div class="card_title">
        <span v-if="!moduleOptions.isRelate || attachment.allAtt.length < 2">{{
          formatFilename(fileData.filename)
        }}</span>
        <el-collapse
          v-else
          class="el-collapse__title"
          v-model="fileTitle.activeNames"
        >
          <!-- :disabled="true" -->
          <el-collapse-item
            name="fileTitle"
            :title="formatFilename(fileData.filename)"
          >
            <el-radio-group
              :slow="false"
              size="mini"
              v-model="fileTitle.activeType"
            >
              <el-radio-button label="allAtt">全部</el-radio-button>
              <el-radio-button label="originalAtt">
                {{ "原始" + moduleOptions.fileType }}
              </el-radio-button>
              <el-radio-button label="unZipByDecryptAtt">
                {{ "解压" + moduleOptions.fileType }}
              </el-radio-button>
            </el-radio-group>

            <!-- <el-empty v-if="true"></el-empty> -->
            <div class="element-fileTitle__content">
              <el-empty
                v-if="!attachment[fileTitle.activeType].length"
              ></el-empty>
              <ul v-else>
                <li
                  v-for="(file, index) in attachment[fileTitle.activeType]"
                  :class="{ active: fileData.filename == file.filename }"
                  @click.stop="switchFile(index)"
                  :key="file.indexid"
                >
                  <div class="element-file__score">
                    <span
                      class="dynamic-score"
                      :title="'动态分析：' + formatScoreTitle(file.filerisk)"
                      >{{ formatScore(file.filerisk) }}</span
                    >
                    <span
                      class="static-score"
                      :title="
                        '静态分析：' + formatScoreTitle(file.staticfilerisk)
                      "
                      >{{ formatScore(file.staticfilerisk) }}</span
                    >
                  </div>
                  <p class="ellipsis" :title="file.filename">
                    {{ formatFilename(file.filename) }}
                  </p>
                </li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>

        <el-button-group>
          <el-button
            is-icon
            size="mini"
            :title="'预览' + moduleOptions.fileType"
            @click.stop="previewFile"
            icon="iconfont icon-preview"
          ></el-button>
          <el-button
            is-icon
            size="mini"
            :title="'下载' + moduleOptions.fileType"
            @click.stop="downloadFile"
            icon="iconfont icon-export"
          ></el-button>
        </el-button-group>
      </div>
      <!-- 附件内容 -->
      <div class="card_content">
        <el-collapse v-model="fileBody.activeNames" icon-placement="left">
          <!-- 基本信息 -->
          <basic :data="fileData" :fileType="moduleOptions.fileType"></basic>
          <!-- 分析报告 -->
          <report
            :data="fileData"
            :isRelate="moduleOptions.isRelate"
            :fileType="moduleOptions.fileType"
            @showLoading="switchLoading"
          ></report>
          <!-- 网络统计 -->
          <statistics
            v-if="dynamicEdition"
            :data="fileData"
            :isRelate="moduleOptions.isRelate"
            :fileType="moduleOptions.fileType"
            @showLoading="switchLoading"
          ></statistics>
        </el-collapse>
      </div>
    </div>

    <el-dialog
      :title="moduleOptions.fileType + '预览'"
      class="element-preview__dialog"
      v-model:visible="preview.visible"
      width="1020px"
      height="520px"
      :modal="false"
      :close-on-click-modal="false"
      @beforeClose="preview.visible = false"
    >
      <el-empty v-if="!preview.content"></el-empty>
      <el-input
        v-else
        type="textarea"
        class="element-preview__content"
        aria-disabled="true"
        :value="preview.content"
      ></el-input>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray } from "@LIB/validate.js";
import { formatTitle } from "@PAGE/platform.js";
import { isNullOrEmpty } from "@LIB/base.js";
import { exporter } from "@TOOLS/export.js";
import {
  relateAttachment,
  downloadFileData,
  previewFileData,
} from "@/api/TZ/tabContent/fileDetails/index.js";
export default {
  name: "fileDetails",
  components: {
    basic: () => import("./modules/basic.vue"),
    report: () => import("./modules/report.vue"),
    statistics: () => import("./modules/statistics.vue"),
  },
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    storeRow: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.buildFileData();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      loading: false,
      fileData: {},
      attachment: {
        allAtt: [],
        originalAtt: [],
        unZipByDecryptAtt: [],
      },
      defaultOptions: {
        isRelate: false, //关联附件（是否单独从索引里查）
        fileType: "附件", //文件/附件
      },
      fileTitle: {
        activeType: "allAtt",
        activeNames: [], //"emanuel.exe"
      },
      fileBody: {
        activeNames: ["basic", "report", "statistics"],
      },
      preview: {
        visible: false,
        content: "",
      },
    };
  },
  computed: {
    moduleOptions() {
      //   return _.merge({}, this.defaultOptions, this.options);
      return {};
    },
    ...mapState({
      dynamicEdition: (state) => state.user.baseLine == 3,
      indexName: (state) => state.user.pageinfo.indexName,
      pageid: (state) => state.user.pageinfo.pageId,
      storeRow: (state) => state.tabContent.row,
    }),
  },
  methods: {
    buildFileData() {
      this.loading = true;
      if (!this.moduleOptions.isRelate) {
        // this.fileData = _.merge({}, this.storeRow);
        this.loading = false;
      } else {
        const specialPage = [
          "EnclosureRecord",
          "CheckBlackSampleMail",
        ].includes(this.pageid);
        let apiParams = specialPage
          ? {
              params: JSON.stringify({
                onlyCount: false,
                sortOrder: "desc",
                indexName: "inf-attachment",
                indexType: "inf-attachment",
                sortField: "@createtime",
                conditions: [
                  { field: "_id", op: "equal", value: this.storeRow.indexid },
                ],
              }),
            }
          : {
              indexName: "inf-attachment",
              indexType: "inf-attachment",
              emlKey: this.storeRow.emlkey,
            };
        // 关联查询附件信息
        relateAttachment(
          apiParams,
          this.moduleOptions.relateUrl || "/api/mail/check/searchAtt"
        )
          .then((res) => {
            if (res.status == 200) {
              this.attachment = isArray(res.data)
                ? { allAtt: res.data }
                : res.data;
              if (this.attachment.allAtt.length)
                this.fileData = this.attachment.allAtt[0];
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    switchFile(index) {
      let newfileData = this.attachment[this.fileTitle.activeType][index];
      // 放置重复点击同一个附件名称
      if (newfileData.indexid != this.fileData.indexid) {
        this.fileData = newfileData;
        this.blurFileList();
      }
    },
    // 关闭文件/附件下拉筛选
    blurFileList() {
      this.fileTitle.activeNames = [];
    },
    // 预览文件/附件
    previewFile() {
      const apiParams = {
        key: this.fileData.sha256,
        fileId: this.fileData.fileid || "",
        tableName: "inf-file",
        column: "filecontent",
      };
      this.loading = true;
      previewFileData(apiParams)
        .then((res) => {
          this.preview.content = res.data;
          this.preview.visible = true;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 下载文件/附件
    downloadFile() {
      const pageIndex = this.moduleOptions.isRelate
        ? "inf-attachment"
        : this.indexName;
      const filterPage = [
        "inf-upload-file",
        "inf-basic-ftp-file",
        "inf-basic-samba-file",
      ];
      const apiParams = {
        params: JSON.stringify({
          indexName: pageIndex,
          ids: this.fileData.indexid,
        }),
        tableName: "inf-file",
        rowKeyField: "sha256",
        fileName: "filename",
        fileType: filterPage.includes(this.indexName) ? "" : "filetype",
        defaultType: "",
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
    switchLoading(state) {
      this.loading = state;
    },
    formatScore(score) {
      return !isNullOrEmpty(score) ? score : "-";
    },
    formatScoreTitle(score) {
      return !isNullOrEmpty(score) ? score + "分" : "-";
    },
    formatFilename(name) {
      let formatText = formatTitle(name);
      return formatText;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-file__content {
  height: 100%;
  padding: 0 8px;
  overflow-y: auto;
}
.dataDetails-label {
  margin-top: 1px;
}
:deep(.card_title) {
  @include cardTitle($height: 32px);
  padding-right: 8px;
  border: none;
  z-index: 2;
  .el-collapse {
    border: none;
    width: calc(100% - 48px);
  }
  .el-collapse-item__header {
    border: none;
    height: 30px;
    line-height: 30px;
    font-weight: 700;
    display: block;
    @include ellipsis;
    position: relative;

    padding-right: 16px;
  }
  .el-collapse-item__arrow {
    position: absolute;
    top: 9px;
    right: -6px;
    color: $mainColor;
  }
  .el-collapse-item__wrap {
    width: calc(100% - 48px);
    position: absolute;
    left: 4px;
    top: 38px;
    padding: 8px;
    max-height: 310px;
    box-shadow: 1px -1px 5px rgba(0, 0, 0, 0.12), 0 5px 5px rgba(0, 0, 0, 0.12);
    text-align: center;
  }
  .element-fileTitle__content {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid $btnBorderColor;
    ul {
      max-height: 224px;
      overflow: auto;
    }
    li {
      font-weight: normal;
      line-height: 32px;
      padding: 0 8px;
      cursor: pointer;
      user-select: none;
      @include flexCenter($justify: flex-start);
      p {
        text-align: left;
        font-size: 12px;
      }
      &:hover {
        background-color: $barBg;
      }
      &.active {
        color: $highColor;
        background-color: rgba(26, 115, 232, 0.1);
      }
      .element-file__score {
        margin-right: 16px;
        span {
          padding: 0 2px;
          width: 28px;
          height: 18px;
          display: inline-block;
          line-height: 16px;
          text-align: center;
          font-size: 12px;
          &.dynamic-score {
            border: 1px solid #ffe0d2;
            color: $warnTextColor;
            background: #fef2ea;
          }
          &.static-score {
            border: 1px solid rgba(179, 167, 167, 0.1);
            color: $highColor;
            background: rgba(245, 245, 245, 0.9);
            margin-left: -1px;
          }
        }
      }
    }
  }
}
:deep(.card_content) {
  .el-collapse-item__header {
    height: 34px;
    line-height: 34px;
    font-weight: 700;
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
}
.element-arrow_tooltip {
  b {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    margin-right: 4px;
    background-color: $highColor;
    &.high {
      background-color: $dangerColor;
    }
    &.middle {
      background-color: $warnTextColor;
    }
  }
  h4 {
    font-weight: 700;
  }
}
:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
:deep(.element-collapse__child) {
  border: none;

  .el-collapse-item__header {
    font-size: 12px;
    position: relative;
    padding-left: 24px;
    color: $mainColor;
    > .el-collapse-item__arrow {
      position: absolute;
      left: 8px;
      top: 8px;
      color: $mainColor;
    }
  }
  .element-content__left {
    width: 30%;
    max-width: 150px;
  }
  .element-content__right {
    width: 70%;
  }
  .element-table__network {
    .cell {
      font-size: 12px;
    }
  }
}
:deep(.element-preview__dialog) {
  .el-dialog__body {
    height: calc(100% - 50px);
  }
  .element-preview__content {
    .el-textarea__inner {
      height: 422px;
      word-break: break-word;
      resize: none;
    }
  }
}
</style>

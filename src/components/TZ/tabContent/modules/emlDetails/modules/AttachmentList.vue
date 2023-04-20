<template>
  <el-collapse-item name="attachment">
    <template v-slot:title>
      <div class="element-file__title">
        附件列表 ({{ this.attachment.length }})
      </div>
      <el-dropdown @command="filterAttachmentType">
        <el-button type="text" size="mini" @click.stop>
          {{ filterText }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slotslot="dropdown">
          <el-dropdown-item
            v-for="drop in dropdown"
            :key="drop.name"
            :command="drop.method"
          >
            {{ drop.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>

    <div class="element-eml__attachment">
      <el-empty v-if="!attachment.length"></el-empty>
      <ul v-else class="element-eml__content">
        <li v-for="(att, inx) in attachment" :key="inx">
          <ul class="dataDetails-label element-title__content">
            <li class="element-eml__title">
              <span
                class="element-content__right ellipsis"
                :title="att.filename"
                >{{ formatFilename(att.filename) }}</span
              >
              <span class="element-content__left">{{ att.filesize }}</span>
            </li>
            <li>
              <span class="element-content__left">附件类型</span>
              <span class="element-content__right">{{ att.filetype }}</span>
            </li>
            <li>
              <span class="element-content__left">附件MD5</span>
              <span class="element-content__right">{{ att.md5 }}</span>
            </li>
            <li>
              <span class="element-content__left">附件风险</span>
              <span class="element-content__right element-eml__risk">
                <span class="riskVal" v-if="dynamicEdition">
                  动态
                  <em v-if="att.taskstate == '分析完成'"
                    >({{
                      checkIsNumber(att.filerisk) ? att.filerisk : "无"
                    }})</em
                  >
                  <i
                    v-else
                    :class="formatTaskState(att.taskstate).iconClass"
                    :title="'动态分析：' + att.taskstate"
                  ></i>
                </span>
                <span class="riskVal">
                  静态
                  <em v-if="att.staticscanstatus == '分析完成'"
                    >({{
                      checkIsNumber(att.staticfilerisk)
                        ? att.staticfilerisk
                        : "无"
                    }})</em
                  >
                  <i
                    v-else
                    :class="formatTaskState(att.staticscanstatus).iconClass"
                    :title="'静态分析：' + att.staticscanstatus"
                  ></i>
                </span>
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </el-collapse-item>
</template>

<script>
import { mapState } from "vuex";
import { isNumber } from "@LIB/validate.js";
import { formatTitle } from "@PAGE/platform.js";
export default {
  name: "AttachmentList",
  props: {
    atts: {
      type: Object,
      //   default: {
      //     allAtt: [],
      //     originalAtt: [],
      //     unZipByDecryptAtt: [],
      //   },
    },
  },
  watch: {
    atts: {
      handler() {
        this.filterAttachmentType("allAtt");
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    ...mapState({
      dynamicEdition: (state) => state.user.baseLine == 3,
    }),
  },
  data() {
    return {
      filterText: "全部附件",
      filterType: "",
      dropdown: [
        { name: "全部附件", method: "allAtt" },
        { name: "原始附件", method: "originalAtt" },
        { name: "解压附件", method: "unZipByDecryptAtt" },
      ],
      attachment: [],
    };
  },
  methods: {
    // 过滤附件类型
    filterAttachmentType(command) {
      this.dropdown.some((drop) => {
        if (drop.method == command) {
          this.filterText = drop.name;
          this.filterType = drop.method;
        }
        return drop.method == command;
      });
      this.attachment = this.atts[this.filterType] || [];
    },
    formatFilename(name) {
      let formatText = formatTitle(name);
      return formatText;
    },
    formatTaskState(state) {
      let taskState = {
        iconClass: "",
        formatState: state,
        originalState: state,
      };
      switch (state) {
        case "不分析":
          taskState.iconClass = "el-icon-remove-circle-filled";
          break;
        case "未分析":
        case "准备分析":
          taskState.iconClass = "el-icon-time-filled";
          taskState.formatState = "等待分析";
          break;
        case "正在分析":
        case "重置分析":
          taskState.iconClass = "el-icon-loading";
          taskState.formatState = "正在分析";
          break;
        case "分析失败":
        case "文件过大":
        case "分析超时":
        case "内部错误":
        case "文件不存在":
        case "获取文件错误":
          taskState.iconClass = "el-icon-error";
          taskState.formatState = "分析失败";
          break;
        case "分析完成":
          taskState.iconClass = "el-icon-success";
          break;
      }
      return taskState;
    },
    checkIsNumber(val) {
      return isNumber(val);
    },
  },
};
</script>

<style lang="scss" scoped>
.element-eml__content {
  margin-bottom: -1px;
  .element-content__right {
    width: 75%;
  }
}
.element-eml__title {
  background-color: rgba(26, 115, 232, 0.08);
  font-weight: 700;

  .element-content__right,
  .element-content__left {
    font-size: 14px;
  }

  .element-content__right {
    padding-left: 8px;
    flex: 1;
  }
  .element-content__left {
    color: $highColor;
    width: inherit;
  }
}
.element-eml__risk {
  @include flexCenter($justify: flex-start);
  .riskVal {
    margin-right: 16px;
    min-width: 80px;
    @include flexCenter($justify: flex-start);
    em {
      margin-left: 4px;
      color: $dangerColor;
    }
    i {
      font-size: 16px;
      margin-left: 4px;
    }
    // 不分析
    .el-icon-remove-circle-filled {
      color: $lightColor;
    }
    // 等待分析
    .el-icon-time-filled {
      color: $yellow;
    }
    // 正在分析
    .el-icon-loading {
      color: $highColor;
    }
    // 分析失败
    .el-icon-error {
      color: $dangerColor;
    }
    // 分析完成
    .el-icon-success {
      color: $successColor;
    }
  }
}
</style>

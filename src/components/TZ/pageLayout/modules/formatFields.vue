<template :slotslot="slotName">
  <div class="cell el-tooltip element-table__value">
    <!-- 源IP/目的IP/攻击者IP（值为数组） -->
    <div v-if="['sip', 'dip', 'ip'].includes(slotName)" class="element-ip__tag">
      <i
        v-if="row[slotName + `proxy`]"
        title="虚拟专用服务器"
        class="iconfont icon-vps"
      ></i>
      {{ isArray(row[slotName]) ? row[slotName].join(",") : row[slotName] }}
      <i
        v-if="row[slotName + `assets`] && row[slotName + `assets`].length"
        title="资产标记"
        @click="assetLink(slotName, row[slotName])"
        class="iconfont icon-money"
      ></i>
    </div>
    <!-- 源国家/目的国家/源地区/目的地区 -->
    <template
      v-else-if="
        [
          'sipcountry',
          'dipcountry',
          'siparea',
          'diparea',
          'firstarea',
        ].includes(slotName)
      "
    >
      {{ formatCountry(row[slotName]) }}
    </template>
    <!-- 用户标签/威胁标签/威胁组织 -->
    <template v-else-if="['risktag', 'aptname', 'usertag'].includes(slotName)">
      <tags
        :options="{
          round: false,
          type: slotName == 'usertag' ? '' : 'danger',
          limit: 1,
        }"
        :data="row[slotName]"
      ></tags>
    </template>
    <!-- 载荷信息 -->
    <template v-else-if="slotName == 'payload'">
      {{ formatPayload(row[slotName]) }}
    </template>
    <!-- 风险等级/信誉等级 -->
    <template
      v-else-if="['risklevel', 'alarmlevel', 'dangerlevel'].includes(slotName)"
    >
      <svg-icon
        :title="row[slotName]"
        :href="`icon-risk-${formatRisk(row[slotName])}`"
      >
      </svg-icon>
    </template>
    <!-- 载荷信息 -->
    <template
      v-else-if="
        ['from', 'to', 'requestcontact', 'requesturi'].includes(slotName)
      "
    >
      {{ formatXss(row[slotName]) }}
    </template>
    <!-- 载荷信息 -->
    <template v-else-if="['taskstate', 'staticscanstatus'].includes(slotName)">
      <span
        v-if="formatTaskState(row[slotName])"
        class="element-task__state"
        :title="formatTaskState(row[slotName]).originalState"
      >
        <i :class="formatTaskState(row[slotName]).iconClass"></i>
        {{ formatTaskState(row[slotName]).formatState }}
      </span>
    </template>
    <!-- 文件类型 -->
    <template v-else-if="slotName == 'filetype'">
      <svg-icon :title="row[slotName]" :href="formatFileType(row[slotName])">
      </svg-icon>
    </template>

    <!-- 数组类字段 -->
    <template v-else-if="isArray(row[slotName])">
      {{ row[slotName].join(",") }}
    </template>
    <template v-else>
      {{ row[slotName] }}
    </template>
  </div>
</template>
<script>
import { setSessionParam, linkAssets, formatPayload } from "@PAGE/platform.js";
import { isArray } from "@LIB/validate.js";

export default {
  name: "FormatFields",
  components: {
    // 基础标签
    tags: () => import("@COMP/TZ/tags"),
  },
  props: {
    slotName: {
      default: String,
    },
    scope: {
      default: Object,
    },
  },
  computed: {
    row() {
      return this.scope.row ?? {};
    },
  },
  methods: {
    isArray(value) {
      return isArray(value);
    },
    // 资产标识 跳转
    async assetLink(field, value) {
      let params = await linkAssets({ field, value, ip: value });
      setSessionParam(params);
    },
    formatRisk(value) {
      return { 高: "high", 危: "middle", 疑: "low" }[value] || "none";
    },
    formatCountry(value) {
      return (value && value.replace(/&nbsp;/g, " ")) || "";
    },
    // 格式化XSS
    formatXss(value) {
      return (value && value.replace(/&lt;/g, "<").replace(/&gt;/g, ">")) || "";
    },
    formatPayload(value) {
      return value && formatPayload(value);
    },
    // 动态分析/静态分析
    formatTaskState(value) {
      if (!value) return "";

      let taskState = {
        iconClass: "",
        formatState: value,
        originalState: value,
      };
      switch (value) {
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
    formatFileType(type) {
      const fileTypes = [
        "ascx",
        "apk",
        "ace",
        "xlt",
        "xsn",
        "rar",
        "xls",
        "xlsm",
        "unknown",
        "accdb",
        "rtf",
        "zip",
        "xlsx",
        "7z",
        "xps",
        "pps",
        "wps",
        "xltx",
        "xml",
        "vbs",
        "user",
        "swf",
        "sys",
        "txt",
        "sql",
        "scr",
        "sc",
        "reg",
        "rtf",
        "rnd",
        "pub",
        "psd",
        "ppt",
        "pptx",
        "pdf",
        "js",
        "ppsx",
        "php",
        "dll",
        "png",
        "pe",
        "jpg",
        "pot",
        "gz",
        "potx",
        "mdf",
        "pif",
        "pdb",
        "config",
        "mp3",
        "mdb",
        "jpeg",
        "mht",
        "lnk",
        "ldf",
        "ftp",
        "exe",
        "java",
        "gif",
        "elf",
        "sh",
        "so",
        "csproj",
        "hlp",
        "dotx",
        "eml",
        "dot",
        "docx",
        "dps",
        "default",
        "dat",
        "css",
        "doc",
        "cs",
        "chm",
        "html",
        "bat",
        "com",
        "bmp",
        "c",
        "bak",
      ];
      const iconType = fileTypes.indexOf(type) > -1 ? type : "unknown";
      return `icon-${iconType == "7z" ? "a-7z" : iconType}-ract`;
    },
  },
};
</script>

<style lang="scss">
@import "@COMP/TZ/pageLayout/style/formatFields.scss";
</style>

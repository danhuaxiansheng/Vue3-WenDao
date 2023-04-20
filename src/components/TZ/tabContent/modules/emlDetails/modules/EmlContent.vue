<template>
  <el-collapse-item title="邮件正文" name="eml">
    <el-empty v-if="!hasEmlContent"></el-empty>
    <div v-else class="element-eml__body">
      <iframe frameborder="0" id="EmailBodyIframe" style="width: 100%"></iframe>
    </div>
  </el-collapse-item>
</template>

<script>
import { isNullOrEmpty } from "@LIB/base.js";
import { formatHtmlXss } from "@PAGE/platform.js";

export default {
  name: "EmlContent",
  props: {
    eml: {
      type: Object,
    },
  },
  watch: {
    eml: {
      handler() {
        this.hasEmlContent = !isNullOrEmpty(this.eml.emlcontent);
        this.iframeHeight = 150;
        this.hasEmlContent && this.bindEmlContent();
      },
      immediate: false,
      deep: true,
    },
  },
  data() {
    return {
      hasEmlContent: true,
      iframeHeight: 150,
    };
  },
  methods: {
    bindEmlContent() {
      let emlContent = this.eml.emlcontent,
        emlBodyHtml = formatHtmlXss(emlContent);
      emlBodyHtml = emlBodyHtml
        .replace(/<script/g, "&lt;script")
        .replace(/\(/g, "（");

      let iframeElem = document.getElementById("EmailBodyIframe"),
        iframeWindow = iframeElem.contentWindow,
        emlIframeBody = iframeWindow.document.body;

      let styleSetting =
          "<style>body::-webkit-scrollbar {width: 4px;height: 0;}body::-webkit-scrollbar-track{background-color: #fff;}body::-webkit-scrollbar-thumb{background: rgba(0,0,0,0.2);border-radius: 4px;}</style >",
        iframeAppendHtml = styleSetting + emlBodyHtml;

      if (iframeWindow.document) {
        iframeElem.height = 0; //重置高度
        iframeWindow.document.write(iframeAppendHtml);
      }

      if (iframeWindow.document && emlIframeBody) {
        emlIframeBody.style["pointer-events"] = "none";
        emlIframeBody.style["word-break"] = "break-all";
        emlIframeBody.style["white-space"] = "pre-line";
        emlIframeBody.style["overflow"] = "elipsis";
        emlIframeBody.style["overflowX"] = "hidden";
        // 设置iframe的高度
        iframeElem.height = iframeWindow.document.documentElement.scrollHeight;
        iframeWindow.document.close();
      }
    },
  },
};
</script>

<style></style>

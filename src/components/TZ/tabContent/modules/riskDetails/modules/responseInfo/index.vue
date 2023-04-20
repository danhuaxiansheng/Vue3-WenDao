<template>
  <el-panel shadow="never" theme="border-left" :border="false">
    <template v-slot:title>
      <div class="title-panle">
        <span>
          {{ title }}
        </span>
        <a :title="`查看` + title" v-show="isEnableDetail">
          <i
            class="iconfont icon-table-detail"
            style="font-weight: normal"
            @click="showDetails = true"
          ></i>
        </a>
      </div>
    </template>
    <!-- 交互详情 -->
    <div class="card-body">
      <responseContent
        :options="options.headerKeys"
        @updateHeaders="updateHeaders"
        ref="resContent"
      ></responseContent>
    </div>
    <!-- 详情弹出框 -->
    <responseDialog
      v-if="showDetails"
      v-model:visible="showDetails"
      :options="options.headerKeys"
    ></responseDialog>
  </el-panel>
</template>
<script>
import { mapState } from "vuex";
// import { isNullOrEmpty } from "@LIB/base.js"
import responseContent from "./responseContent.vue";
import responseDialog from "./responseDialog.vue";

export default {
  name: "responseInfo",
  components: { responseContent, responseDialog },
  data() {
    return {
      // 详情弹出框
      showDetails: false,
      isEnableDetail: true,
    };
  },
  props: {
    // 当前内容块名称`
    options: {
      type: Object,
      default() {
        return {
          title: "",
          switchBtn: {
            isEnable: false, // 默认不启用
            btns: [{ title: "Headers" }, { title: "Response" }],
          },
          headerKeys: {},
        };
      },
    },
  },
  computed: {
    ...mapState({ tabRow: (state) => state.tabContent.row }),
    title() {
      return this.options.title ?? "交互详情";
    },
    /**
     * 头部按钮配置
     */
    switchBtn() {
      const config = {
        isEnable: false, // 默认不启用
        btns: [{ title: "Headers" }, { title: "Response" }],
      };
      return { ...config, ...this.options.switchBtn };
    },
  },
  methods: {
    // 是否有查看详情按钮
    updateHeaders(headers) {
      this.isEnableDetail = headers.length ? true : false;
    },
  },
};
</script>

<style lang="scss" scoped>
.title-panle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  a {
    cursor: pointer;
  }
}
</style>

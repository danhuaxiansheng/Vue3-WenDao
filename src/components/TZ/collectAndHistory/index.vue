<template>
  <div class="collectAndHistory-tools">
    <div class="search-tools" v-if="collectEnable || historyEnable">
      <i
        v-if="collectEnable"
        class="iconfont icon-star pointer"
        @click="openCollectDialog"
        title="加入收藏"
      ></i>
      <i
        v-if="historyEnable"
        class="iconfont icon-history pointer"
        @click="openTools()"
        title="历史记录"
      ></i>
    </div>
    <el-drawer
      v-model:visible="drawer.isEnable"
      direction="rtl"
      :with-header="false"
      :size="'500px'"
      :before-close="handleClose"
    >
      <el-tabs
        v-model="drawer.activeName"
        class="element-history__content"
        @tab-click="tabChange"
      >
        <el-tab-pane label="历史记录" name="history" v-if="historyEnable">
          <history-list ref="history" @search="historySearch"></history-list>
        </el-tab-pane>
        <el-tab-pane label="我的收藏" name="collect" v-if="collectEnable">
          <collect-list ref="collect" @search="collectSearch"></collect-list>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>

    <addDialog v-if="dialogEnable" @close="closeCollect"></addDialog>
  </div>
</template>

<script>
import setting from "@/setting.js";
import { addHistory } from "@/api/TZ/index.js";
import { getShowTxt } from "./modules/tools.js";
import { mapGetters } from "vuex";
export default {
  name: "collectAndHistory",
  components: {
    addDialog: () => import("./modules/addDialog.vue"),
    historyList: () => import("./modules/historyList.vue"),
    collectList: () => import("./modules/collectList.vue"),
  },
  data() {
    return {
      drawer: {
        isEnable: false,
        activeName: "history",
      },
      dialogEnable: false,
    };
  },
  props: {
    options: {
      type: Object,
      default() {
        return {
          collect: {
            isEnable: true,
          },
          history: {
            isEnable: true,
          },
        };
      },
    },
  },
  computed: {
    ...mapGetters(["$searchBar", "pageinfo"]),
    collectEnable() {
      return this.options.collect.isEnable ?? true;
    },
    historyEnable() {
      return this.options.history.isEnable ?? true;
    },
  },
  methods: {
    /**
     * 打开收藏弹出框
     */
    openCollectDialog() {
      const conditions = this.$searchBar.conditions;
      const maxCount = this.$searchBar.conditionOptions.max;

      if (maxCount && conditions.length > maxCount) {
        this.$message.warning(`收藏条件不能超过${maxCount}个！`);
        return;
      }
      this.dialogEnable = true;
    },
    /**
     * 加入历史记录
     */
    addHistory(params) {
      let hisParams = {
        F_QueryData: JSON.stringify(params),
        systemId: setting.WdSystemID,
        pageId: this.pageinfo.pageId,
        F_ShowData: getShowTxt(params),
      };
      addHistory(hisParams);
    },
    /**
     * 历史记录/我的收藏
     */
    openTools(key) {
      this.drawer.isEnable = true;
      if (key) {
        this.drawer.activeName = key;
      }
      // 重新展开后 刷新数据
      this.$refs[this.drawer.activeName]?.loadData();
    },
    /**
     * 切换历史记录 我的收藏
     */
    tabChange() {
      // 切换后 刷新数据
      this.$refs[this.drawer.activeName]?.loadData();
    },
    /**
     * 关闭历史记录/我的收藏
     */
    handleClose() {
      this.drawer.isEnable = false;
    },
    /**
     * 关闭 加入我的收藏 弹出框
     */
    closeCollect(message) {
      this.dialogEnable = false;
      if (message == "success") {
        this.$message.success("新增成功！");
        // 更新toolbar-我的收藏 下拉列表
        this.$store.state.plug?.toolBar?.$refs?.base_myCollect[0]?.loadCollect();
      }
    },
    /**
     * 历史记录溯源
     */
    historySearch(params) {
      const queryData = JSON.parse(params.F_QueryData);
      this.$parent.loadCondition(queryData);
      // 触发查询事件
      this.$parent.$emit("search");
    },
    /**
     * 我的收藏溯源
     */
    collectSearch(params) {
      this.$parent.loadCondition(params);
      // 触发查询事件
      this.$parent.$emit("search");
    },
  },
};
</script>

<style lang="scss" scoped>
.el-tabs--top {
  height: 100%;
  :deep(.el-tabs__content) {
    height: calc(100% - 48px);
    .el-tab-pane {
      height: 100%;
    }
    .el-pagination.is-background .el-pager li:not(.disabled).active {
      font-weight: normal;
    }
  }
}
</style>

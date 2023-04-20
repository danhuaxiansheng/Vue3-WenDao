<template>
  <div class="asset_tool_card">
    <div class="tool_container">
      <div v-show="!operate">
        <el-button icon="iconfont icon-add" @click="addAsset"
          >新增资产</el-button
        >
        <el-button
          icon="iconfont icon-batch-operate"
          @click="handlerOperate(true)"
          >批量操作
        </el-button>
      </div>
      <div v-show="operate">
        <el-button icon="iconfont icon-group" @click="hanlderGroup"
          >分组</el-button
        >
        <el-button icon="iconfont icon-export" @click="assetExport"
          >导出资产</el-button
        >
        <el-button icon="iconfont icon-delete" @click="delAsset"
          >删除资产</el-button
        >
        <el-button
          icon="iconfont icon-batch-exit"
          @click="handlerOperate(false)"
          >退出批量操作
        </el-button>
      </div>
      <el-dropdown @command="handlerCommand">
        <el-button icon="iconfont icon-sort">资产排序</el-button>
        <!-- <el-dropdown-menu slotslot="dropdown">
                    <el-dropdown-item :class="{active: sortField == item.sortField}"
                        v-for="item in sortList"
                        :key="item.sortField"
                        :command="item.sortField">
                        按{{item.sortName}}排序</el-dropdown-item>
                </el-dropdown-menu> -->
      </el-dropdown>
    </div>
    <asset-group ref="assetGroup" :checkeNodes="checkeNodes"></asset-group>
    <asset-add ref="assetAdd"></asset-add>
  </div>
</template>

<script>
import { delAsset } from "@API/TZ/AssetCenter.js";
import { exporter } from "@TOOLS/export.js";

export default {
  name: "assetToolCard",
  props: {
    selects: {
      type: Array,
      default: () => [],
    },
    sortField: {
      required: true,
      type: String,
    },
  },
  data: () => ({
    operate: false,
    sortList: [
      { sortName: "时间", sortField: "detecttime" },
      { sortName: "综合特征", sortField: "risklevel" },
    ],
  }),
  methods: {
    // 资产排序
    handlerCommand(sort) {
      this.$bus.$emit("updateAssetTable", sort);
    },
    // 批量操作
    handlerOperate(operate) {
      this.operate = operate;
      this.$bus.$emit("setOperate", operate);
    },
    addAsset() {
      this.$refs.assetAdd.init();
    },
    hanlderGroup() {
      if (!this.checkeNodes.length)
        return this.$message.warning("请勾选要分组的数据！");
      this.$refs.assetGroup.init();
    },
    assetExport() {
      var rows = this.checkeNodes.map((item) => item.indexid);
      if (rows.length <= 0)
        return this.$message.warning("请勾选要导出的数据！");

      if (rows.length > 5000)
        return this.$message.warning("最多支持导出5000条数据 !");

      exporter({
        fileType: "zip",
        action: "/api/threat/asset/exportAsset",
        ids: rows,
        isDownload: true,
      });
    },
    delAsset() {
      if (!this.checkeNodes.length)
        return this.$message.warning("请勾选要删除的数据！");
      this.$confirm(`资产将被永久删除，是否继续？`, "警告", {
        customClass: "wd_dailog",
        closeOnClickModal: false,
        type: "warning",
      }).then(() => {
        delAsset({
          ids: this.checkeNodes.map((item) => item.indexid).join(","),
        }).then(() => {
          this.$message.success("删除成功！");
          this.$bus.$emit("updateAssetTable");
        });
      });
    },
  },
  computed: {
    checkeNodes() {
      return this.$store.getters.checkeLists;
    },
  },
  components: {
    assetAdd: () => import("./addAsset.vue"),
    assetGroup: () => import("../comps/assetGroup.vue"),
  },
};
</script>

<style lang="scss" scoped>
.asset_tool_card {
  min-height: 0;
  padding: 0 14px;
  border-bottom: 1px solid $lineColor;
  .tool_container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

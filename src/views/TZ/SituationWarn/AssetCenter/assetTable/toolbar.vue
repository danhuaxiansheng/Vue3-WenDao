<template>
  <div class="asset_tool_table">
    <div class="tool_container">
      <el-button icon="iconfont icon-add" @click="addAsset">新增资产</el-button>
      <el-button icon="iconfont icon-group" @click="hanlderGroup"
        >设置分组</el-button
      >
      <el-button icon="iconfont icon-export">导出资产</el-button>
      <el-button icon="iconfont icon-delete" @click="delAsset"
        >删除资产</el-button
      >
    </div>
    <asset-group
      ref="assetGroup"
      :checkeNodes="checkeNodes"
      :indexType="tabActive"
    >
    </asset-group>
    <asset-add ref="assetAdd"></asset-add>
  </div>
</template>

<script>
import { delAsset } from "@API/TZ/AssetCenter.js";
export default {
  name: "assetTableTool",
  props: {
    tabActive: {
      type: String,
      required: true,
    },
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
    delAsset() {
      if (!this.checkeNodes.length)
        return this.$message.warning("请勾选要删除的数据！");
      this.$confirm(`资产将被永久删除，是否继续？`, "警告", {
        customClass: "wd_dailog",
        closeOnClickModal: false,
        type: "warning",
      }).then(() => {
        delAsset(
          {
            idList: JSON.stringify(
              this.checkeNodes.map((item) => item.indexid)
            ),
            indexType: this.tabActive,
          },
          "/api/asset1126/assetDelete"
        ).then(() => {
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
.asset_tool_table {
  padding: 0 14px;
  border-bottom: none;
  .tool_container {
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>

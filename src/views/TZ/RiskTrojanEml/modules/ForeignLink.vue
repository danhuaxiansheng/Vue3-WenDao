<template>
  <el-panel
    shadow="never"
    theme="border-left"
    :title="'钓鱼外链（' + (row.foreignlink.length || 0) + '）'"
    :border="false"
  >
    <el-table max-height="200" tooltip-effect="light" :data="tableData">
      <el-table-column
        prop="details"
        :show-overflow-tooltip="true"
        label="链接详情"
        width="180"
      >
      </el-table-column>
      <el-table-column
        prop="text"
        :show-overflow-tooltip="true"
        label="链接文字"
      >
      </el-table-column>
    </el-table>
  </el-panel>
</template>

<script>
import { mapState, mapGetters } from "vuex";
// import { getTimeByFlag } from "@TOOLS/dateTools.js";
// import { setSessionParam } from "@PAGE/platform.js";
// import { postLifeCircle } from "@API/TZ/RiskTrojanEml/index.js";
export default {
  name: "ForeignLink",
  props: {
    row: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      indexName: (state) => state.user.pageinfo.indexName || "",
    }),
    ...mapGetters(["$searchBar"]),
    tableData() {
      let tableData = [],
        foreign = this.row.foreignlink || [],
        fishDocStr = this.row.fishinglinkdocument,
        fishDocJson =
          fishDocStr && fishDocStr.toString().startsWith("{")
            ? JSON.parse(fishDocStr)
            : {};
      if (foreign.length) {
        foreign.sort().forEach((item) => {
          tableData.push({
            details: item,
            text: fishDocJson[item] || "-",
          });
        });
      }
      return tableData;
    },
  },
  data() {
    return {};
  },
  //   watch: {
  //     row: {
  //       handler(nVal, oVal) {
  //         if (nVal != oVal) {
  //         }
  //       },
  //       immediate: true,
  //       deep: true,
  //     },
  //   },
  methods: {},
};
</script>

<style lang="scss" scoped></style>

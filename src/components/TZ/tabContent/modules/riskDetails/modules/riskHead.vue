<template>
  <div class="element-risk__content" v-loading="loading">
    <el-popover
      v-if="
        storeRow &&
        (storeRow.risklevel || storeRow.alarmlevel || storeRow.dangerlevel)
      "
      placement="right"
      trigger="hover"
      popper-class="element-risk__popover"
    >
      <div class="element-risk__group">
        <svg
          class="icon pointer"
          aria-hidden="true"
          title="低风险"
          @click="updateRisk(11)"
        >
          <use xlink:href="#icon-risk-low"></use>
        </svg>
        <svg
          class="icon pointer"
          aria-hidden="true"
          title="中风险"
          @click="updateRisk(16)"
        >
          <use xlink:href="#icon-risk-middle"></use>
        </svg>
        <svg
          class="icon pointer"
          aria-hidden="true"
          title="高风险"
          @click="updateRisk(21)"
        >
          <use xlink:href="#icon-risk-high"></use>
        </svg>
      </div>
      <div
        slotslot="reference"
        class="element-risk__bg"
        :class="mainRisk"
      ></div>
    </el-popover>
    <!-- 功能按钮区 -->
    <render-button :options="mergeToolOptions" class="element-risk__btn">
    </render-button>
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import { modifyRisk } from "@/api/TZ/index.js";
export default {
  name: "riskHead",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    checkRow: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      // 遮罩框
      loading: false,
      // 按钮组配置
      toolConfig: {
        base_exportData: {
          name: "导出数据",
          type: "button",
          icon: "iconfont icon-export",
          handler: this.exportData,
        },
        base_exportFile: {
          name: "导出文件",
          type: "button",
          icon: "iconfont icon-export",
          handler: this.exportFile,
        },
      },
    };
  },
  computed: {
    ...mapGetters(["$searchBar", "$table", "$pageLayout", "pageinfo"]),
    ...mapState({
      storeRow: (state) => state.tabContent.row,
      searchBarColumns: (state) => state.searchBar.searchBarColumns,
      // 主Key
      primaryKey: (state) => state.user.pageinfo.primaryKey,
      /**
       * 合并toolbar配置项
       */
      mergeToolOptions() {
        let toolConfig = this.toolConfig;
        let btns = this.options.btns || [];
        return btns.map((item) => {
          let itemObj = toolConfig[item.field];
          let idata = item;
          if (itemObj) {
            idata = { ...itemObj, ...item };
          }
          return idata;
        });
      },
    }),
    // 获取风险标签
    mainRisk() {
      return this.getRiskClass();
    },
  },
  methods: {
    /**
     * 获取风险class
     */
    getRiskClass() {
      let row = this.storeRow;
      let className = "risk-none";
      let riskField = row.dangerlevel ? "dangerlevel" : "risklevel";
      let value = row[riskField];

      if (!row) {
        return className;
      }

      switch (true) {
        case value.includes("低") || value.includes("疑"):
          className = "risk-low";
          break;
        case value.includes("中") || value.includes("危"):
          className = "risk-middle";
          break;
        case value.includes("高"):
          className = "risk-high";
          break;
        default:
          className = "risk-none";
          break;
      }
      return className;
    },
    /**
     * 修改风险等级
     */
    updateRisk(riskVal) {
      let data = this.storeRow;
      if (!data) {
        this.$message.warning("数据未加载，请稍后再试。");
        return;
      }
      let riskField = data.dangerlevel ? "dangerlevel" : "risklevel";
      console.log(riskVal, data[riskField]);
      let filData = this.searchBarColumns.filter(
        (d) => d.field === riskField
      )[0];
      let value = riskVal;
      let valueText = riskVal;
      if (filData) {
        if (filData.dropDownList) {
          let newT = riskVal == 11 ? "0|11" : riskVal;
          let drData = filData.dropDownList.filter((d) => d.key == newT)[0];
          //相同选项不进行请求修改
          if (data[riskField] == drData.value) {
            return;
          }
          valueText = drData.value;
        }
      }
      var param = {
        indexName: this.pageinfo.indexName,
        id: data.indexid,
        number: value,
      };

      if (!data[riskField]) {
        this.$set(this.checkRow, riskField, valueText);
      }
      // else {
      //   this.checkRow[riskField] = valueText;
      // }
      this.loading = true;
      // 修改风险等级
      modifyRisk(param).then((res) => {
        let filterUserTags = (data.userTag || []).filter(
          (d) => !d.includes("纠正为")
        );
        let usertag = [].concat(filterUserTags, res.data);
        if (!data.usertag) {
          this.$set(this.checkRow, "usertag", usertag);
        }
        // else {
        //   this.checkRow.usertag = usertag;
        // }
        this.$emit("update:checkRow", this.checkRow);
        this.$message("风险等级修改记录已添加至用户标签");
        this.loading = false;
      });
    },

    /**
     *  导出数据
     */
    exportData() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试。");
        return;
      }
      let dataParams = this.$table.getCacheParam();
      let params = JSON.parse(dataParams.params);
      let field = "_id";
      // 非ES直接导出 会出现无数据的情况 -todo
      // if (!this.isEs) {
      //     field = this.primaryKey ?? "ID";
      // }
      dataParams.page = 1;
      params.conditions = [
        { field: field, op: "equal", value: this.storeRow[this.primaryKey] },
      ];
      dataParams.params = params;
      this.$pageLayout.exportBase(dataParams);
    },
    exportFile() {
      // 单条导出
      this.$pageLayout.downloadType = "single";
      this.$pageLayout.downloadFiles();
    },
  },
  components: {
    RenderButton: () => import("@COMP/TZ/toolbar/modules/renderButton.vue"),
  },
};
</script>

<style lang="scss" scoped>
//威胁等级SCSS样式
.element-risk__content {
  @include flexCenter(center, flex-start);
  .element-risk__bg {
    display: inline-block;
    position: relative;
    width: 89px;
    height: 70px;
    background: url("~@AST/images/TZ/tabContent/risklevel/icon-risk-none.svg")
      center center no-repeat;
    &.risk-none {
      background: url("~@AST/images/TZ/tabContent/risklevel/icon-risk-none.svg")
        center center no-repeat;
    }
    &.risk-low {
      background: url("~@AST/images/TZ/tabContent/risklevel/icon-risk-low.svg")
        center center no-repeat;
    }
    &.risk-middle {
      background: url("~@AST/images/TZ/tabContent/risklevel/icon-risk-middle.svg")
        center center no-repeat;
    }
    &.risk-high {
      background: url("~@AST/images/TZ/tabContent/risklevel/icon-risk-high.svg")
        center center no-repeat;
    }
  }
  :deep(.element-risk__btn) {
    @include flexCenter(center, flex-start);
    flex-wrap: wrap;
    .el-button {
      padding: 0 8px;
      margin-bottom: 8px;
      & + .el-button {
        margin-left: 0;
      }
      &:nth-child(2n) {
        margin-left: 8px;
      }
    }
  }
}
.element-risk__popover {
  padding: 8px;
  min-width: 135px;
  .element-risk__group {
    @include flexCenter(center, space-between);
  }
}
</style>

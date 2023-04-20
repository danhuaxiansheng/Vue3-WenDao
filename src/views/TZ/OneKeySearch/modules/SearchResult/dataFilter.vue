<template>
  <div class="element-result__filter">
    <div class="element-filter__left">
      <div class="element-search__result" v-show="!isFilter">
        <span
          >为您找到相关结果约
          <span class="element-highlight">{{ filter.total }}</span> 条，耗时
          <span class="element-highlight">{{ filter.reponseTime }}</span>
          秒</span
        >
      </div>
      <div class="element-filter__panel" v-show="isFilter">
        <el-dropdown trigger="click" @command="dataSort">
          <span class="el-dropdown-link">
            按时间排序<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <!-- <el-dropdown-menu slotslot="dropdown"
                        :append-to-body="false">
                        <el-dropdown-item v-for="(item, index) in orderList"
                            :key="index"
                            :command="item.value"
                            :class="{ 'is-active': item.value == timeSort }">
                            {{ item.label }}</el-dropdown-item>
                    </el-dropdown-menu> -->
        </el-dropdown>

        <el-popover
          placement="bottom"
          width="680"
          :offset="260"
          trigger="click"
          v-model="isComplex"
          ref="menuPopover"
        >
          <div class="search-complex" v-if="isComplex">
            <!-- <conditionComplex
              ref="conditionComplex"
              v-model:conditions="complexConditions"
              :options="complexOptions"
            /> -->
          </div>
          <p style="text-align: right">
            <el-button type="info" size="small" @click="deReset"
              >重置
            </el-button>
            <el-button type="primary" size="small" @click="doSearch"
              >查询
            </el-button>
          </p>

          <!-- <el-button
            slotslot="reference"
            size="mini"
            type="text"
            :primary="complexConditions.length ? true : false"
          >
            <span>数据过滤</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button> -->
        </el-popover>
      </div>
    </div>
    <div class="element-filter__right">
      <el-button
        type="text"
        size="mini"
        v-show="!isFilter"
        @click.stop="switchFilter"
      >
        <i class="el-icon-filter"></i>
        <span>搜索工具</span>
      </el-button>

      <el-button
        type="text"
        size="mini"
        v-show="isFilter"
        @click.stop="switchFilter"
      >
        <i class="el-icon-arrow-up"></i>
        <span>收起工具</span>
      </el-button>

      <el-button
        type="text"
        size="mini"
        v-if="curPageUrl"
        @click.stop="jumpDetail"
      >
        <i class="el-icon-view-grid"></i>
        <span>查看更多</span>
      </el-button>
    </div>
  </div>
</template>

<script>
import jumpDetail from "../../mixins/jump-detail-mixin.js";
import { mapState } from "vuex";
import { getSearchBarOpt } from "@/api/TZ/index";
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js";

export default {
  name: "dateFilter",
  mixins: [jumpDetail],
  props: {
    filter: {
      type: Object,
      //   default: {
      //     reponseTime: "",
      //     total: 0,
      //   },
    },
    // 高级模式条件
    complexConditions: {
      type: Array,
    },
  },
  watch: {
    filter: {
      handler(newVal) {
        this.buildSwitchModules(newVal);
      },
      deep: true,
      immediate: false,
    },
  },
  data() {
    return {
      // 数据排序
      isFilter: false,
      orderList: [
        {
          value: "desc",
          label: "按时间降序",
        },
        {
          value: "acs",
          label: "按时间升序",
        },
      ],
      // 数据过滤
      isComplex: false,
      // 高级模式配置参数
      complexOptions: {
        custom: false,
        columns: [],
        max: 5,
        min: 1,
      },
    };
  },
  computed: {
    ...mapState({
      pageId: (state) => state.user.pageinfo.pageId,
    }),
  },
  created() {
    this.getSearchColumns();
  },
  methods: {
    // 获取查询列下拉选项
    getSearchColumns() {
      getSearchBarOpt({ pageId: this.pageId }).then((res) => {
        if (res.status == 200) {
          this.complexOptions.columns = this.formatSearchColumns(
            res.data || []
          );
        }
      });
    },
    // 构建查询列
    formatSearchColumns(columns) {
      let list = [];
      const filterColumns = this.filterSearchColumns();
      columns.length &&
        columns.forEach((d) => {
          // 排除默认不作为查询条件
          if (!d.isCondition) {
            return;
          }
          if (filterColumns.includes(d.field)) {
            return;
          }
          list.push(searachBarTools.getColumnFormat(d));
        });
      return list;
    },
    // 过滤部分搜索列
    filterSearchColumns() {
      let filterColumns = ["otherField", "keywords"];
      return filterColumns;
    },
    buildSwitchModules() {},
    switchFilter() {
      this.isFilter = !this.isFilter;
    },
    dataSort(sort) {
      this.$store.commit("onekeySearch/setTimeSort", sort);
    },
    doSearch() {
      let searchConditions = [];
      const complexConditon = this.$refs["conditionComplex"].cacheConditions;
      complexConditon.forEach((condition) => {
        let isEmpty = searachBarTools.valueIsEmpty(condition.value);
        if (!isEmpty) {
          searchConditions.push(condition);
        }
      });
      if (!searchConditions.length) {
        return this.$message({ message: "请输入查询条件", type: "warning" });
      }
      const validateResult = this.validateConditions(searchConditions);
      // 条件验证不通过
      if (validateResult) return this.$message.error("条件错误，无法查询！");
      this.isComplex = false;
      // Vuex状态缓存
      this.$store.commit(
        "onekeySearch/setComplexConditions",
        JSON.stringify(searchConditions)
      );
    },
    validateConditions(conditions) {
      let validateResult = false;
      validateResult = conditions.some(
        (d) => d.bracketsError || (d.errorMsg && d.errorMsg.length > 0)
      );
      return validateResult;
    },
    deReset() {
      this.isComplex = false;
      // Vuex状态缓存
      this.$store.commit("onekeySearch/setComplexConditions", null);
    },
  },
  //   components: {
  //     conditionComplex: () =>
  //       import("@COMP/TZ/searchbar/modules/conditionComplex.vue"),
  //   },
};
</script>

<style lang="scss" scoped>
.element-result__filter {
  padding-top: 10px;
  padding-right: 20px;
  @include flexCenter($justify: space-between);
  // .element-filter__content {
  //     @include flexCenter($justify: space-between);
  // }
  .element-highlight {
    color: $dangerColor;
    font-weight: bold;
  }
  .el-dropdown-link {
    cursor: pointer;
    margin-right: 16px;
  }
  .el-dropdown-menu__item {
    white-space: nowrap;
    &.is-active {
      color: $highColor;
    }
  }
}
.search-complex {
  :deep(.condition-complex-item) {
    .match-brackets,
    .match-connector {
      display: none;
    }
  }
  :deep(.icon-help) {
    display: none;
  }
}
</style>

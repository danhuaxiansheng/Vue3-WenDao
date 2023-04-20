// 聚类统计
<template>
  <div class="element-cluster__content" v-loading="loading">
    <div class="element-card__title">模块统计</div>
    <div
      :class="['element-cluster__title', { 'is-show': clusterOptions.length }]"
      v-show="clusterOptions.length"
    >
      按
      <el-select
        v-model="clusterVal"
        @change="getClusterSearch"
        placeholder="请选择"
      >
        <el-option
          v-for="item in clusterOptions"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        >
        </el-option> </el-select
      >聚类
    </div>
    <div class="element-cluster__list">
      <ul>
        <li
          v-for="(cluster, index) in clusterSearchList"
          :key="cluster.indexName"
        >
          <span class="list-index">{{ index + 1 }}</span>
          <span class="list-name ellipsis">{{
            cluster.niceName || cluster.key
          }}</span>
          <span class="list-number ellipsis">{{ cluster.count }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { clusterFields, clusterSearch } from "@API/TZ/OneKeySearch/index.js";
import { mapState } from "vuex";
export default {
  name: "clusterStatistics",
  props: {
    modules: {
      type: Array,
    },
  },
  watch: {
    modules: {
      handler() {
        if (!this.curIndexName)
          this.clusterSearchList = JSON.parse(JSON.stringify(this.modules));
      },
      immediate: true,
    },
    curIndexName: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.getClusterFields();
        }
      },
      immediate: false,
    },
  },
  computed: {
    ...mapState({
      keyword: (state) => state.onekeySearch.keyword,
      timeRange: (state) => state.onekeySearch.timeRange,
      curIndexName: (state) => state.onekeySearch.curIndexName,
      isExpression: (state) => state.onekeySearch.isExpression,
    }),
  },
  data() {
    return {
      loading: false,
      clusterVal: "",
      clusterOptions: [],
      clusterSearchList: [],
    };
  },
  methods: {
    getClusterFields() {
      if (this.curIndexName) {
        let apiParams = {
          index: this.curIndexName,
        };
        // 请求聚类字段
        clusterFields(apiParams)
          .then((res) => {
            if (res.status == 200) {
              this.clusterOptions = res.data;
              this.clusterVal = res.data[0].value;
              // 聚类数据查询
              this.getClusterSearch();
            }
          })
          .catch(() => {});
      } else {
        this.clusterOptions = [];
      }
    },
    getClusterSearch() {
      this.loading = true;
      let conditions = [{ field: "isdelete", op: "equal", value: "0" }];
      if (this.timeRange) {
        conditions.push({
          field: "@createtime",
          op: "range",
          value: this.timeRange.join(" - "),
        });
      }
      let params = {
        keywords: "",
        expression: "",
        indexName: this.curIndexName,
        conditions: conditions,
        group: {
          field: this.clusterVal,
          values: [],
          size: 10,
          needLimit: false,
        },
        needFirst: false,
      };
      this.isExpression
        ? (params.expression = this.keyword)
        : (params.keywords = this.keyword);

      const apiParams = {
        params: JSON.stringify(params),
        page: 1,
        limit: 50,
      };
      clusterSearch(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.clusterSearchList = JSON.parse(JSON.stringify(res.data));
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.element-cluster__content {
  height: 100%;
  .element-card__title {
    @include cardTitle($height: 50px);
    border-bottom: none;
  }
  .element-cluster__title {
    @include flexCenter($justify: flex-start);
    font-weight: bold;
    .el-select {
      width: 100px;
      margin: 0 8px;
    }
    &.is-show + .element-cluster__list {
      height: calc(100% - 82px);
    }
  }
  .element-cluster__list {
    height: calc(100% - 50px);
    padding: 8px 8px 0 0;
    overflow-y: auto;
    ul li {
      @include flexCenter($justify: flex-start);
      margin-bottom: 16px;
      span {
        display: inline-block;
        text-align: center;
        &.list-index {
          line-height: 16px;
          min-width: 16px;
          background-color: $lineColor;
          color: #fff;
          letter-spacing: -0.1em;
          text-indent: -0.2em;
        }
        &.list-name {
          flex: 1;
          padding: 0 8px;
          text-align: left;
        }
      }
      &:first-child span.list-index {
        background-color: $dangerColor;
      }
      &:nth-child(2) span.list-index {
        background-color: $warnTextColor;
      }
      &:nth-child(3) span.list-index {
        background-color: $yellow;
      }
    }
  }
}
</style>

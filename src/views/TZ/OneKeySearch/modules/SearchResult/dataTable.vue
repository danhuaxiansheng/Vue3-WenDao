<template>
  <div class="element-table__body">
    <div
      class="element-table__column"
      v-for="(column, inx) in tableData"
      :key="inx"
    >
      <div class="element-table__title">
        <div class="element-table__theme">
          <div>
            <span>{{ column.niceName }}</span>
            <a class="ellipsis" @click="jumpDetail(column)">{{
              column.subject
            }}</a>
          </div>
          <ul>
            <!-- <li class="location"
                            v-if="column.firstAddress">{{column.firstAddress}}</li> -->
            <li>{{ column.createtime }}</li>
          </ul>
        </div>
        <div class="element-table__country">
          <div class="country-content">
            <span
              :title="column.niceYuan.sipcountry"
              :class="['flag-icon', getCountryName(column.niceYuan.sipcountry)]"
            ></span>
            <div class="country-address">
              <p class="ellipsis" :title="formatIPInfo(column.niceYuan, 'sip')">
                {{ formatIPInfo(column.niceYuan, "sip") }}
              </p>
              <p>{{ column.niceYuan.smac }}</p>
            </div>
          </div>
          <div class="country-center">
            <span>{{ column.niceYuan.protocol }}</span>
          </div>
          <div class="country-content">
            <span
              :title="column.niceYuan.dipcountry"
              :class="['flag-icon', getCountryName(column.niceYuan.dipcountry)]"
            ></span>
            <div class="country-address">
              <p class="ellipsis" :title="formatIPInfo(column.niceYuan, 'dip')">
                {{ formatIPInfo(column.niceYuan, "dip") }}
              </p>
              <p>{{ column.niceYuan.dmac }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="element-table__list">
        <ul class="element-table__base">
          <li
            v-for="(info, index) in getColumnInfo(column.info, 'base')"
            :key="index"
          >
            <span>{{ info.nickName }}：</span>
            <p
              class="ellipsis"
              :class="[
                'ellipsis',
                { 'el-highlight--danger': formatValue(info) == keyword },
              ]"
              :title="formatValue(info)"
            >
              {{ formatValue(info) }}
              <el-button
                type="text"
                v-if="index == 7"
                @click.prevent="switchShowMore(column)"
                class="element-expand__all"
              >
                <i
                  :class="[
                    {
                      'el-icon-double-arrow-down': !column.showMore,
                      'el-icon-double-arrow-up': column.showMore,
                    },
                  ]"
                  :title="column.showMore ? '收起' : '展开全部'"
                ></i>
              </el-button>
            </p>
          </li>
        </ul>
        <ul class="element-table__more" v-show="column.showMore">
          <li
            v-for="(info, index) in getColumnInfo(column.info, 'more')"
            :key="index"
          >
            <span>{{ info.nickName }}：</span>
            <p
              :class="[
                'ellipsis',
                { 'el-highlight--danger': formatValue(info) == keyword },
              ]"
              :title="formatValue(info)"
            >
              {{ formatValue(info) }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { isNullOrEmpty, isArray } from "@LIB/base.js";
import { formatPayload } from "@PAGE/platform.js";
import { getCountryClassName } from "@PAGE/platform.js";
import jumpDetail from "../../mixins/jump-detail-mixin.js";
export default {
  name: "dataTable",
  mixins: [jumpDetail],
  props: {
    tableData: {
      type: Array,
    },
  },
  data() {
    return {
      showMore: false,
    };
  },
  methods: {
    formatValue(item) {
      let value = item.value;
      if (isNullOrEmpty(value)) return "";
      // aptname处理
      if (item.name == "aptname") {
        if (isArray(value) && value.length) {
          let tempVal = [];
          value.forEach((item) => {
            tempVal.push(item.name);
          });
          value = tempVal.join(",");
        }
      }
      // payload处理
      if (item.name == "payload") {
        value = formatPayload(value);
      }
      // 数组
      if (isArray(value)) {
        value = value.join(",");
      }
      value = JSON.stringify(value).replace(/&nbsp;/g, " ");
      value = JSON.parse(value);
      return value;
    },
    formatIPInfo(data, type) {
      let area = data[`${type}area`];
      area = (area && area.replace(/&nbsp;/g, " ")) || "";
      area = area ? `(${area})` : "";
      if (type == "sip") {
        return `${data.sip || "未知"}:${data.sport || "未知"}${area}`;
      } else {
        return `${data.dip || "未知"}:${data.dport || "未知"}${area}`;
      }
    },
    getColumnInfo(columnInfo, type) {
      if (type == "base") {
        return columnInfo.slice(0, 8);
      } else {
        return columnInfo.slice(8, columnInfo.length);
      }
    },
    getCountryName(countryCnName) {
      return getCountryClassName(countryCnName);
    },
    switchShowMore(columnInfo) {
      if (isNullOrEmpty(columnInfo.showMore)) {
        this.$set(columnInfo, "showMore", false);
      }
      columnInfo.showMore = !columnInfo.showMore;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-table__column {
  text-align: left;
  position: relative;
  margin-bottom: 16px;

  &::after {
    position: absolute;
    display: inline-block;
    content: "";
    width: 100%;
    border-bottom: 1px dashed #bfbfbf;
    bottom: -12px;
    left: 0;
  }
  .element-table__title {
    background-color: rgba(26, 115, 232, 0.1);
    .element-table__theme {
      @include cardTitle($height: 40px);
      border-bottom: none;
      font-weight: normal;
      &::before {
        display: none;
      }
      > div {
        width: calc(100% - 300px);
        @include flexCenter($justify: flex-start);
        flex-wrap: nowrap;
        span {
          display: inline-block;
          height: 24px;
          line-height: 22px;
          text-align: center;
          margin-right: 16px;
          padding: 0 8px;
          background: rgba(52, 168, 83, 0.1);
          color: $successColor;
          border: 1px solid rgba(52, 168, 83, 0.1);
          max-width: 200px;
          min-width: 70px;
        }
        a {
          text-decoration: underline;
          font-weight: bold;
          display: inline-block;
          cursor: pointer;
          margin-right: 20px;
          max-width: calc(100% - 200px);
          color: $btnColor;
          &:hover {
            color: $highColor;
          }
        }
      }
    }
    .element-table__country {
      @include flexCenter($justify: space-between);
      .country-content {
        flex: 1;
        @include flexCenter($justify: flex-start);
        flex-wrap: wrap;
        padding: 8px 12px 16px;
        .flag-icon {
          width: 45px;
          height: 30px;
        }
        .country-address {
          margin-left: 16px;
          p {
            &:first-child {
              color: $btnColor;
              width: 250px;
            }
            &:last-child {
              color: $lightColor;
            }
          }
        }
      }
      .country-center {
        flex: 1;
        position: relative;
        @include flexCenter;
        &::after {
          content: "";
          background: url("~@AST/images/TZ/OneKeySearch/search-arrow.png")
            no-repeat center center;
          width: 100%;
          height: 11px;
          position: absolute;
          left: 0;
          top: -8px;
        }
        span {
          color: $highColor;
          position: absolute;
          left: calc(50% - 20px);
          top: -20px;
        }
      }
    }
  }

  .element-table__more {
    max-height: 256px;
    overflow-y: auto;
    margin-bottom: 10px;
  }
}
.element-table__list {
  ul {
    @include flexCenter($justify: flex-start);
    flex-wrap: wrap;
    position: relative;
    li {
      width: 25%;
      line-height: 16px;
      padding: 8px 16px;
      @include flexCenter($justify: flex-start);
      white-space: nowrap;
    }
    .element-expand__all {
      position: absolute;
      right: 0;
      top: 2px;
      i {
        color: $highColor;
        font-size: 18px;
      }
    }
  }
}
</style>

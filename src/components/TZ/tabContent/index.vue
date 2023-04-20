<template>
  <div class="tab-content">
    <el-tabs v-model="activeName" @tab-click="change" type="card">
      <template v-for="(item, name) in tabOptions">
        <el-tab-pane
          v-if="item.isEnable"
          :key="name"
          :label="item.text"
          :name="name"
        >
          <component
            v-if="activeName === name"
            :is="name"
            :checkRow="checkRow"
            :options="item.options"
          >
            <!-- 数据详情：插槽模板 -->
            <template v-slot:custom="{ row }">
              <slot name="custom" :row="row"></slot>
            </template>
          </component>
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
import riskDetails from "./modules/riskDetails";
export default {
  name: "tabContent",
  components: {
    riskDetails,
    emlDetails: () => import("./modules/emlDetails"),
    fileDetails: () => import("./modules/fileDetails"),
    dataFlow: () => import("./modules/dataFlow"),
  },
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
        return {};
      },
    },
  },
  data() {
    return {
      activeName: "",
      defaultConfig: {
        riskDetails: {
          isEnable: true, // 是否启用
          isCheck: true, // 是否选中当前
          text: "威胁详情",
          options: {},
        },
        dataFlow: {
          isEnable: false,
          isCheck: false, // 是否选中当前
          text: "会话分析",
          options: {},
        },
      },
    };
  },
  computed: {
    ...mapState({
      basicEdition: (state) => state.user.baseLine == 1,
    }),
    tabOptions() {
      let mergeOptions = _.merge({}, this.defaultConfig, this.options);
      // 需求：基础版-无会话分析功能
      if (this.basicEdition) {
        mergeOptions.dataFlow.isEnable = false;
      }
      return mergeOptions;
    },
  },
  mounted() {
    this.setActiveKey();
    // 将当前组件 存入vuex
    this.$store.commit("plug/setTabContent", this);
  },

  methods: {
    // 切换标签
    change(val) {
      this.$emit("change", val);
    },
    // 设置默认选中
    setActiveKey() {
      let keys = Object.keys(this.tabOptions);
      let fkeys = keys.filter((d) => this.tabOptions[d].isEnable);
      if (fkeys) {
        let tkeys = fkeys.filter((d) => this.tabOptions[d].isCheck)[0];
        this.activeName = tkeys || fkeys[0];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-content {
  height: 100%;
  background: #fff;
  :deep(.el-tabs) {
    height: 100%;
    width: 100%;
    .el-tabs__header {
      height: 44px;
      margin-bottom: 0;
      .el-tabs__nav {
        width: 100%;
        display: flex;
        border-color: transparent;
        > div.el-tabs__item {
          height: 44px;
          line-height: 42px;
          flex: 1;
          text-align: center;
          border-color: transparent;
          padding: 0 8px;
          font-weight: bold;
          &:first-child {
            order: 1;
          }
          &:nth-child(2) {
            order: 10;
          }
          &:nth-last-child(2):not(:nth-child(2)) {
            order: 4;
          }
          &:last-child {
            order: 8;
          }
          &.is-active {
            color: $highColor;
            &:after {
              height: 1px;
              top: auto;
              bottom: 0px;
            }
          }
        }
      }
    }
    .el-tabs__content {
      height: calc(100% - 44px);
    }
    .el-tab-pane {
      height: 100%;
      padding: 8px 0;
      > div:first-child {
        height: 100%;
        padding: 0 8px;
        overflow-y: auto;
      }
      *::-webkit-scrollbar {
        width: 4px;
      }
    }
  }
}
</style>

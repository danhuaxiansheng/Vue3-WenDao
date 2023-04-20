<template>
  <div class="element-searchbox__setting">
    <div class="element-setting__wrap" v-show="isSearchSetting">
      <ul class="element-search__contions">
        <li>
          <div class="element-date__wrap">
            <el-button type="text" @click.stop="changeDateVisible">
              <span>{{ dateConfig.dateButtonText }}</span>
              <i class="el-icon-arrow-down"></i>
            </el-button>
            <el-date-picker
              ref="dateRange"
              v-show="dateConfig.dateVisible"
              v-model="dateConfig.dateValue"
              :picker-options="dateConfig.dateOption"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </div>
        </li>
        <li>
          <el-popover
            placement="bottom"
            width="474"
            ref="menuPopover"
            v-model="menuConfig.menuConfig"
          >
            <div class="element-modules__body">
              <div
                class="element-modules__list"
                v-for="module in menuConfig.modules"
                :key="module.name"
              >
                <el-checkbox
                  v-model="module.checkAll"
                  @change="checkedAllMenu($event, module)"
                >
                  {{ module.name }}
                </el-checkbox>
                <el-checkbox-group
                  v-model="module.moduleChecked"
                  @change="checkedSingleMenu($event, module)"
                >
                  <el-checkbox
                    v-for="list in module.module"
                    :key="list"
                    :label="list"
                  ></el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="element-modules__footer">
              <el-checkbox
                v-model="menuConfig.checkAll"
                @change="switchdAllMenu"
                >全选/全不选</el-checkbox
              >
            </div>
            <!-- <el-button slotslot="reference"
                            type="text">
                            <span>{{menuConfig.menuButtonText}}</span>
                            <i class="el-icon-arrow-down"></i>
                        </el-button> -->
          </el-popover>
        </li>
      </ul>
      <el-button type="text" @click.stop="resetCondition">
        <i class="iconfont icon-refresh"></i>
        <span>恢复默认</span>
      </el-button>
    </div>
  </div>
</template>

<script>
// import { isNullOrEmpty } from "@LIB/base.js";
export default {
  name: "SearchSetting",
  props: {
    modules: {
      type: Array,
    },
    isSearchSetting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dateConfig: {
        isReserve: false,
        dateVisible: false,
        dateButtonText: "最近30天",
        dateValue: null,
        dateOption: {
          onPick: ({ maxDate, minDate }) => {
            this.pickMinDate = minDate;
            this.pickMaxDate = maxDate;
          },
          disabledDate: (time) => {
            // 未选择结束时间 计算时间范围
            if (this.pickMinDate && !this.pickMaxDate) {
              const one = 30 * 24 * 3600 * 1000;
              const minTime = this.pickMinDate.getTime() - one;
              const maxTime = this.pickMinDate.getTime() + one;
              return time.getTime() < minTime || time.getTime() > maxTime;
            } else {
              return false;
            }
          },
        },
      },
      menuConfig: {
        checkAll: true,
        modules: [],
        menuButtonText: "",
        menuVisible: true,
      },
    };
  },
  watch: {
    "dateConfig.dateValue": {
      handler(newVal) {
        this.$store.commit("onekeySearch/setTimeRange", newVal);
        this.changeButtonText();
      },
      immediate: false,
    },
    modules: {
      handler(newVal) {
        this.formatModulesData(newVal);
      },
      immediate: false,
    },
  },
  methods: {
    // 控制时间按钮文本信息
    changeButtonText() {
      this.dateConfig.dateButtonText = this.dateConfig.dateValue
        ? this.dateConfig.dateValue.join(" - ")
        : "最近30天";
    },
    // 控制时间选择框的显、隐
    changeDateVisible() {
      this.$refs["dateRange"].focus();
      this.$refs["menuPopover"].doClose();
      this.dateConfig.dateVisible = true;
    },
    // 构建菜单下拉功能
    formatModulesData(modules) {
      let menuList = [];
      modules.forEach((module) => {
        let dataItem = {
          name: module.NAME,
          checkAll: false,
          module: [],
          moduleChecked: [],
          moduleMapping: {},
          moduleSetting: {},
        };
        module.NODE_DIR.length &&
          module.NODE_DIR.forEach((menu) => {
            dataItem.module.push(menu.NAME);
            dataItem.moduleChecked.push(menu.NAME);
            dataItem.moduleMapping[menu.NAME] = menu.INDEX_NAME;
            dataItem.moduleSetting[menu.INDEX_NAME] = menu.NAME;
          });
        dataItem.checkAll =
          dataItem.module.length === dataItem.moduleChecked.length;
        menuList.push(dataItem);
      });
      this.menuConfig.modules = menuList;
      this.calcMenuButtonText();
    },
    // 模块全选事件
    checkedAllMenu(val, module) {
      module["moduleChecked"] = val ? module.module : [];
      this.calcMenuButtonText();
    },
    // 模块单选事件
    checkedSingleMenu(value, module) {
      let checkedCount = value.length;
      let listCount = module.module.length;
      module.checkAll = checkedCount === listCount;
      this.calcMenuButtonText();
    },
    // 计算选中模块数量
    calcMenuButtonText() {
      let moduleLength = 0,
        moduleCheckedLength = 0;
      this.menuConfig.modules.forEach((module) => {
        moduleLength += module.module.length;
        moduleCheckedLength += module.moduleChecked.length;
      });
      this.menuConfig.checkAll = moduleLength == moduleCheckedLength;
      this.menuConfig.menuButtonText = `${moduleCheckedLength}个已选`;
    },
    // 全选/全不选
    switchdAllMenu(value) {
      this.menuConfig.modules.forEach((module) => {
        module["moduleChecked"] = value ? module.module : [];
        module.checkAll = value ? true : false;
      });
      this.calcMenuButtonText();
    },
    // 手动设置模块选中
    setModulesChecked(checkedModules) {
      // 默认先全选
      this.switchdAllMenu(true);
      const modules = JSON.parse(JSON.stringify(this.menuConfig.modules));
      // 设置单独选中
      modules.forEach((moduleItem) => {
        const moduleIndex = Object.keys(moduleItem.moduleSetting);
        moduleIndex.forEach((item) => {
          if (!checkedModules.includes(item)) {
            const moduleCnName = moduleItem.moduleSetting[item];
            const spliceIndex = moduleItem.moduleChecked.indexOf(moduleCnName);
            moduleItem.moduleChecked.splice(spliceIndex, 1);
            moduleItem.module;
          }
        });
        moduleItem.checkAll =
          moduleItem.module.length === moduleItem.moduleChecked.length;
      });

      this.menuConfig.modules = modules;
      this.calcMenuButtonText();
    },
    // 手动设置时间选中
    setTimeRangeChecked(dateValue) {
      this.dateConfig.dateValue = dateValue;
    },
    // 获取设置条件
    getSearchSetting() {
      let checkedIndexname = [];
      this.menuConfig.modules.forEach((module) => {
        let moduleChecked = module["moduleChecked"] || [];
        if (moduleChecked.length) {
          moduleChecked.forEach((menu) => {
            checkedIndexname.push(module["moduleMapping"][menu]);
          });
        }
      });
      return {
        dateValue: this.dateConfig.dateValue,
        indexName: checkedIndexname,
      };
    },
    // 恢复默认
    resetCondition() {
      this.dateConfig.dateValue = null;
      this.switchdAllMenu(true);
    },
  },
};
</script>
<style lang="scss" scoped>
.element-searchbox__setting {
  height: 40px;
  width: 660px;
  margin: 0 auto;
}
.element-setting__wrap {
  height: 100%;
  @include flexCenter($justify: space-between);
  .element-search__contions {
    @include flexCenter;
    li {
      margin-right: 16px;
    }
  }
  :deep(.element-date__wrap) {
    position: relative;
    .el-date-editor {
      width: 1px;
      padding: 0;
      border: none;
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: -1;
      * {
        display: none;
      }
    }
  }
  .el-icon-arrow-down {
    margin-left: 4px;
  }
}
.element-modules__body {
  height: 305px;
  overflow-y: auto;
  margin: -16px -16px 0;
  .element-modules__list {
    &:not(:last-child) {
      border-bottom: 1px solid $lineColor;
    }
    padding: 16px 0 0 16px;
    > .el-checkbox {
      margin-bottom: 16px;
    }
  }
  .el-checkbox-group {
    .el-checkbox {
      width: 33.3%;
      margin: 0 0 16px;
    }
  }
}
.element-modules__footer {
  height: 44px;
  line-height: 44px;
  padding-left: 16px;
  margin: 0 -16px -16px;
  border-top: 1px solid $lineColor;
}
</style>

<template>
  <div class="tool-bar">
    <render-button
      :options="toolOptions"
      :freshTimer="freshTimer"
    ></render-button>
    <template v-for="item in toolOptions">
      <!-- 我的收藏 -->
      <collect-select
        v-if="item.type == 'base_myCollect'"
        :key="item.field"
        ref="base_myCollect"
        :class="item.class"
        :options="item"
        :disabled="freshTimer || item.disabled"
        v-model="item.value"
        @change="collectChange"
        @success="collectSuccess"
      ></collect-select>
      <!-- 攻击/事件类型 -->
      <tool-multiple-select
        v-else-if="item.type == 'eventType'"
        :key="item.field"
        :class="item.class"
        :options="item"
        :disabled="freshTimer || item.disabled"
        v-model="item.value"
        @change="changeSelect"
      ></tool-multiple-select>
      <!-- 自动刷新 -->
      <auto-fresh
        v-else-if="item.type == 'autoFresh'"
        :key="item.type"
        :class="item.class"
        v-model="freshTimer"
        @fresh="item.handler"
      ></auto-fresh>
    </template>
  </div>
</template>

<script>
import { arrayToMap } from "@LIB/dictionary";
import { mapGetters, mapState } from "vuex";
export default {
  name: "toolBar",
  components: {
    toolMultipleSelect: () => import("./modules/toolMultipleSelect"),
    collectSelect: () => import("./modules/collectSelect"),
    autoFresh: () => import("@COMP/TZ/autoFresh"),
    RenderButton: () => import("./modules/renderButton.vue"),
  },
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      freshTimer: false, // 是否开启自动刷新
      toolOptions: [],
    };
  },
  computed: {
    ...mapGetters(["$searchBar", "$table"]),
    ...mapState({
      // 查询栏 字段列--默认从接口请求 可以自定义配置
      searchBarColumns: (state) => state.searchBar.searchBarColumns,
    }),
    mapToolOptions() {
      const options = this.options ?? [];
      const columnConfig = arrayToMap(this.searchBarColumns, "field") ?? {};
      // 不能用JSON进行深拷贝，会丢失handler处理函数
      const mapOptions = options.map((item) => {
        let fieldConfig = item;
        const field = item.field;
        // 如果是searchBar的默认字段
        if (Object.keys(columnConfig).includes(field)) {
          let sField = columnConfig[field];
          // 默认使用select模式  下拉切换数据
          fieldConfig = {
            // 是否是searchBar快捷下拉选项
            isSearchBar: true,
            selectList: sField.dropDownList,
            name: sField.displayText,
            type: "select",
            handler: this.selectChange,
            ...item,
          };
        }

        fieldConfig.position == "right" &&
          (fieldConfig.class = (fieldConfig.class || "") + ` to_right`);

        return this.getBtnType(fieldConfig);
      });
      return mapOptions;
    },
  },
  watch: {
    mapToolOptions: {
      handler() {
        // 计算变量中的value不能直接响应，需要放入data
        this.toolOptions = this.mapToolOptions;
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.$store.commit("plug/setToolBar", this);
  },
  methods: {
    // 获取按钮文本
    getOptionText(option, tool) {
      let defaultText = "无";
      if (tool.isSearchBar) defaultText = "全部";
      return option.key ? option.value : defaultText;
    },
    // 获取按钮类型
    getBtnType(fieldObj) {
      let data = { ...fieldObj };
      switch (data.type) {
        case "select":
          // 下拉选择时可以传入{key, value}形式的对象，也可以直接传字符串
          data.selectList = (data.selectList || []).map((v) => {
            let obj =
              typeof v === "string"
                ? { key: v, value: v }
                : JSON.parse(JSON.stringify(v));

            return {
              key: obj.key === "-999" ? "" : obj.key,
              value: obj.key === "-999" ? data.name : obj.value,
            };
          });
          return data;
        // case 'button':
        // case 'dropdown':
        // 下拉菜单时可以传入{name, handler}形式的对象，也可以直接传字符串(此时需避免与字典里的键重复)
        // 如果使用 组合默认配置
        // fieldObj.dropList = (fieldObj.dropList || []).map(v => {
        //     return Object.keys(baseConfig).includes(v) ? baseConfig[v] : { name: v }
        // })
        // return data;
        default:
          return data;
      }
    },
    // 触发下拉切换事件
    selectChange(val, item) {
      // 更新条件
      this.changeCondition();
      // 触发条件更改钩子
      this.$emit("change", item);
    },
    // 统一修改条件
    changeCondition() {
      this.$emit("update:conditions", this.getConditions());
    },
    // 获取条件
    getConditions() {
      let conditions = [];
      (this.toolOptions ?? []).forEach((item) => {
        item.isSearchBar &&
          item.value &&
          conditions.push({
            field: item.field,
            value: item.value,
            op: item.op || "equal",
            connector: item.connector || "and",
          });
      });
      return conditions.length > 0 ? { conds: conditions } : [];
    },
    // 更改下拉选项
    changeSelect(params) {
      this.selectChange(params.value, params.options);
    },
    // 更改我的收藏
    collectChange(row) {
      // 查询第一页
      this.$table.pagination.currentPage = 1;
      // 清空书签信息
      row && this.loadSearchConditions(row.F_SaveData, "reloadTable");
    },
    // 我的收藏 加载完毕
    collectSuccess(data) {
      const myCollect = this.options.filter(
        (d) => d.field === "base_myCollect"
      )[0];
      if (myCollect) {
        // 如果支持默认查询
        if (myCollect.defaultSeach) {
          // 跳转条件
          const fitData = data.filter((d) => d.F_IsDefault)[0];
          if (fitData && this.$searchBar) {
            this.$searchBar.loadCondition(JSON.parse(fitData.F_SaveData));
          }
        }
      }
      // 在我的收藏数据加载完毕后 提交组件成功信息
      this.loadSuccess();
    },
    // 工具栏所有方法执行完毕之后的回调
    loadSuccess() {
      this.$emit("success");
    },
    // 修改查询栏参数
    loadSearchConditions(data, type) {
      this.$searchBar &&
        (this.$searchBar?.loadCondition(JSON.parse(data)),
        this.$store.state.plug.pageLayout &&
          this.$store.state.plug.pageLayout[type]());
    },
  },
};
</script>

<style lang="scss" scoped>
.tool-bar {
    > *:not(.element-render__button) {
        margin-right: 8px;
    }
    .el-button {
        padding: 0 8px;
        height: 30px;
        line-height: 28px;
    }
    .to_right {
        float: right;
    }
     :deep(.el-select) {
        width: 101px;
        padding-left: 2px;

        &.element-cluster_data {
            width: 126px;
        }
        .el-input__inner {
            border: $btnBorder;
        }
        .el-input__inner::-webkit-input-placeholder {
            color: $btnColor;
        }
        &:hover {
            .el-input:not(.is-disabled) {
                .el-select__caret {
                    color: $highColor;
                }
                .el-input__inner {
                    color: $highColor;
                    border-color: $highColor;
                    &::-webkit-input-placeholder {
                        color: $highColor;
                    }
                }
            }
        }
    }
     :deep(.to_right) {
        // 按钮
        .el-button,
            // 下拉
            .el-input__inner {
            height: 30px;
            line-height: 28px;
            padding: 0 8px;
            background: #fff;
            border: 1px solid $tabBorderColor;
        }
        .el-button {
            span i {
                margin-left: 6px;
            }
            max-width: 160px;
        }
        .el-input .el-select__caret,
        .el-input__inner::-webkit-input-placeholder {
            font-weight: normal;
        }
    }
}
</style>

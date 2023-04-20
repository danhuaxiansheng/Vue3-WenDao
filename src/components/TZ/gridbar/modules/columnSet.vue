<!-- 表格设置 -->
<template>
  <el-popover placement="bottom-end" trigger="click" popper-class="column_set">
    <div class="column-set-panel" v-loading="loading">
      <div class="column-set-header">
        <el-button type="text" @click.stop="resetColumns">默认</el-button>
        <el-button type="text" class="confirm_btn" @click.stop="confirm"
          >确定</el-button
        >
      </div>
      <div class="column-set-body">
        <draggable
          element="ul"
          class="column-set-list"
          v-model="newColumns"
          animation="500"
        >
          <li v-for="column in newColumns" :key="column.prop">
            <el-checkbox v-model="column.ischecked">{{
              column.label
            }}</el-checkbox>
          </li>
        </draggable>
        <el-empty v-show="!newColumns.length" style="padding: 20px"></el-empty>
      </div>
    </div>
    <el-tooltip
      class="item"
      effect="light"
      content="列设置"
      slotslot="reference"
      placement="top"
      popper-class="element-arrow_tooltip"
    >
      <el-button is-icon icon="iconfont icon-setColumns"></el-button>
    </el-tooltip>
  </el-popover>
</template>
<script>
import { setColumns } from "@/api/TZ/index.js";
import _ from "lodash";

import { mapState } from "vuex";
export default {
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      newColumns: [],
    };
  },
  computed: {
    ...mapState({
      pageId: (state) => state.user.pageinfo.pageId,
      systemId: (state) => state.user.systemId,
    }),
  },
  created() {
    this.setConfig();
  },
  methods: {
    setConfig() {
      this.newColumns = _.merge([], this.columns);
    },
    getReqColumn(data) {
      let list = [];
      data.forEach((element) => {
        list.push({
          field: element.prop,
          hidden: !element.ischecked,
        });
      });
      return list;
    },
    confirm() {
      this.loading = true;
      this.saveColumns(this.getReqColumn(this.newColumns))
        .then(() => {
          this.loading = false;
          // 修改当前的列数据
          this.updateColumn(this.newColumns);
          // 修改缓存
          this.setColumnsCache(this.newColumns);
          this.$message.success("设置成功！");
        })
        .catch(() => {
          this.loading = false;
          // this.$message.error('设置失败！');
        });
    },
    resetColumns() {
      this.loading = true;
      this.saveColumns()
        .then((res) => {
          let data = this.$parent.getColumnsFormat(res.data);
          // 修改当前的列数据
          this.updateColumn(data);
          // 修改缓存
          this.setColumnsCache(data);
          this.newColumns = data;
          this.$message.success("设置成功！");
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          // this.$message.error('设置失败！');
        });
    },
    updateColumn(data) {
      this.$emit("update:columns", JSON.parse(JSON.stringify(data)));
    },

    /**
     * 设置pageinfo下的columns缓存
     */
    setColumnsCache(data) {
      const cacheKey = "pageInfo_" + window.location.pathname + this.systemId;
      let result = JSON.parse(localStorage.getItem(cacheKey));
      if (result) {
        result.pageInfo.columns = data;
        localStorage.setItem(cacheKey, JSON.stringify(result));
      }
    },
    saveColumns(getReqData) {
      // 将设置的列 存入数据库
      return setColumns({
        pageId: this.pageId,
        fieldViews: getReqData ? JSON.stringify(getReqData) : "",
      });
    },
  },
};
</script>

<style scoped lang="scss">
.column-set-header {
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  .confirm_btn {
    color: $highColor;
  }
}
.column-set-body {
  padding: 3px 0;
}
.column-set-body li {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  list-style: none;
  display: flex;
}
.column-set-list {
  max-height: 300px;
  overflow-x: auto;
}
.column-set-list li:hover {
  cursor: move;
  background-color: rgba(26, 115, 232, 0.1);
}

.column-set-list li:hover .el-checkbox {
  cursor: move;
}

.column-set-list li .el-checkbox {
  flex: 1 1;
  display: flex;
  align-items: center;
}
</style>
<style lang="scss">
// 表格列配置的弹出框样式
.el-popover.column_set {
  padding: 0;
}
</style>

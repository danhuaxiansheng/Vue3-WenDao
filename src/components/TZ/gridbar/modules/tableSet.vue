<!-- 表格设置 -->
<template>
  <el-popover
    placement="bottom"
    width="280"
    trigger="click"
    popper-class="table-set"
  >
    <div>
      <el-row :gutter="24" class="tableset-panle">
        <el-col :span="8">
          <label class="tableset-label">表格间距</label>
        </el-col>
        <el-col :span="16" class="tableset-content">
          <el-radio-group size="mini" v-model="size" @change="changeSize">
            <el-radio-button label="">适中</el-radio-button>
            <el-radio-button label="medium">宽松</el-radio-button>
            <el-radio-button label="small">紧凑</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="tableset-panle">
        <el-col :span="8">
          <label class="tableset-label">表格边框</label>
        </el-col>
        <el-col :span="16" class="tableset-content">
          <el-switch v-model="border" @change="changeBorder"></el-switch>
        </el-col>
      </el-row>
      <el-row :gutter="24" class="tableset-panle">
        <el-col :span="8">
          <label class="tableset-label">斑马纹</label>
        </el-col>
        <el-col :span="16" class="tableset-content">
          <el-switch v-model="stripe" @change="changeStripe"></el-switch>
        </el-col>
      </el-row>
      <!-- <el-row :gutter="24" class="tableset-panle">
                <el-col :span="8"> <label class="tableset-label">宽度自动撑开</label> </el-col>
                <el-col :span="16" class="tableset-content">
                    <el-switch v-model="fit" @change="changeFit"></el-switch>
                </el-col>
            </el-row> -->
      <!-- <el-row :gutter="24" class="tableset-panle">
                <el-col :span="8"> <label class="tableset-label">单元格自动省略号</label> </el-col>
                <el-col :span="16" class="tableset-content">
                    <el-switch v-model="tooltip" @change="changeTooltip"></el-switch>
                </el-col>
            </el-row> -->
    </div>
    <el-tooltip
      class="item"
      effect="light"
      content="表格设置"
      slotslot="reference"
      placement="top"
      popper-class="element-arrow_tooltip"
    >
      <el-button is-icon icon="el-icon-setting-filled"></el-button>
    </el-tooltip>
  </el-popover>
</template>
<script>
export default {
  data() {
    let tableModules = this.$store.state.gridBar.options;
    return {
      show: false,
      size: tableModules.size,
      stripe: tableModules.stripe,
      border: tableModules.border,
      tooltip: tableModules.tooltip,
      fit: true,
    };
  },
  methods: {
    changeStripe(val) {
      this.updateTableConfig({ stripe: val });
    },
    changeBorder(val) {
      this.updateTableConfig({ border: val });
    },
    changeFit(val) {
      this.updateTableConfig({ fit: val });
    },
    changeSize(val) {
      this.updateTableConfig({ size: val });
    },
    changeTooltip(val) {
      this.updateTableConfig({ tooltip: val });
    },
    updateTableConfig() {
      this.$emit("update", {
        size: this.size,
        stripe: this.stripe,
        border: this.border,
        tooltip: this.tooltip,
      });
    },
    showPanel() {
      this.show = true;
    },
    hidePanel() {
      this.show = false;
    },
  },
};
</script>

<style scoped>
.tableset-label {
  width: 80px;
  color: #616161;
}

.el-row.tableset-panle {
  display: flex;
  align-items: center;
}

.el-row.tableset-panle:not(:last-child) {
  margin-bottom: 18px;
}

.el-popover {
  background: #fff;
  box-shadow: 1px -1px 5px rgb(0 0 0 / 12%), 0 5px 5px rgb(0 0 0 / 12%);
  border: 1px solid transparent;
  padding: 16px 16px 1;
}
.tableset-content {
  text-align: right;
}
</style>

<style>
.el-popper.table-set {
  padding: 16px;
}
</style>

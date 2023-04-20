<template>
  <div class="dialog-form">
    <el-popover trigger="click" placement="bottom" ref="pop">
      <el-input
        slotslot="reference"
        :placeholder="$attrs.placeholder"
        v-model="$attrs.value"
        @input="inputChange"
      ></el-input>
      <div class="pop-content">
        <el-tree
          :props="$attrs.props"
          :highlight-current="true"
          :data="$attrs.options"
          :default-expand-all="true"
          @current-change="nodeChange"
        >
          <!-- <span class="custom-tree-node" slot-scope="{ node }">
            <span :title="getSpanTitle(node)" :class="getSpanClass(node)">
              <i :class="getIconClass(node)"> </i>
              {{ node.label }}
            </span>
          </span> -->
        </el-tree>
      </div>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: "dialog-form",
  props: {
    dialog_config: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {};
  },
  beforeMount() {
    this;
  },
  methods: {
    inputChange() {
      // this.$listeners.input(val);
      this.$forceUpdate();
    },
    getSpanTitle(node) {
      return node.data.is_obj ? "此目录已被添加" : "";
    },
    getSpanClass(node) {
      return node.data.is_obj ? "" : "green";
    },

    getIconClass(node) {
      return node.data.is_obj ? "el-icon-circle-check" : "el-icon-folder";
    },

    nodeChange() {
      // let url = this.getUrl(node);
      // this.$listeners.input(url);
      this.$refs.pop.doClose();
    },

    getUrl(node) {
      let url = node.data.name || "";
      if (
        node.level > 1 &&
        typeof node.parent == "object" &&
        node.parent != null
      ) {
        let parUrl = this.getUrl(node.parent);
        url = parUrl != "/" ? parUrl + "/" + url : "/" + url;
      }
      return url;
    },

    cancel() {
      this.$emit("cancel");
    },
    yes() {
      let $dialogForm = this.$refs["dialogForm"];
      this.$emit("yes", this.dialog_config.formData, $dialogForm);
    },
  },
};
</script>

<style lang="scss" scoped>
.red {
  color: $dangerColor;
}
.green {
  color: $successColor;
}
.pop-content {
  width: 416px;
  max-height: 400px;
  overflow-y: auto;
}
</style>

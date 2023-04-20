<template>
  <el-dropdown class="auto_fresh" @command="handlerFresh">
    <el-button icon="iconfont icon-refresh">
      {{ autoFresh.text }}<i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <el-dropdown-menu slotslot="dropdown">
      <el-dropdown-item
        v-for="item in autoFresh.dropDown"
        :key="item.label"
        :command="item.value"
      >
        {{ item.label }}</el-dropdown-item
      >
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: "autoFresh",
  data() {
    return {
      timer: null,
      autoFresh: {
        text: "自动刷新",
        dropDown: [
          { label: "关闭", value: 0 },
          { label: "30秒", value: 30 },
          { label: "1分钟", value: 60 },
          { label: "5分钟", value: 300 },
        ],
      },
    };
  },
  methods: {
    handlerFresh(during) {
      let time = (this.value = during);
      this.$emit("input", !!this.value);
      this.timer && window.clearInterval(this.timer);
      if (!time) {
        this.autoFresh.text = "自动刷新";
      } else {
        this.autoFresh.text = `${time}秒后刷新`;
        this.timer = setInterval(() => {
          time--;
          this.autoFresh.text = `${time}秒后刷新`;
          if (time <= 0) {
            time = during + 1;
            this.$emit("fresh");
          }
        }, 1000);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.auto_fresh {
  .el-button {
    padding: 0 8px;
    height: 30px;
    line-height: 28px;
  }
}
</style>

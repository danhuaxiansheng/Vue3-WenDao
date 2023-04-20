<template>
  <el-result
    :is-icon="false"
    status="500"
    title="500"
    sub-title="服务器内部错误，请稍后访问！"
  >
    <template v-slot:extra>
      <router-link to="/">
        <el-button type="primary">{{ count }}秒后返回首页</el-button>
      </router-link>
    </template>
  </el-result>
</template>

<script>
export default {
  name: "Page500Index",
  data() {
    return {
      count: 3,
    };
  },
  mounted() {
    let timer = setInterval(() => {
      this.count -= 1;
      if (!this.count) {
        this.$router.push("/");
        clearInterval(timer);
      }
    }, 1000);
  },
};
</script>

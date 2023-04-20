<template>
  <el-result
    :is-icon="false"
    status="403"
    title="403"
    sub-title="很抱歉，您暂时无权限访问此页面！"
  >
    <template v-slot:extra>
      <router-link to="/">
        <el-button type="primary"
          >{{ count ? count : "1" }}秒后返回首页</el-button
        >
      </router-link>
    </template>
  </el-result>
</template>

<script>
export default {
  name: "page403Index",
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

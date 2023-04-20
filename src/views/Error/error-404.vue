<template>
  <el-result :is-icon="false" status="404" title="404" :sub-title="title">
    <template v-slot:extra>
      <!-- <router-link @click="back"> -->
      <el-button type="primary" @click="back"
        >{{ count ? count : "1" }}秒后返回首页</el-button
      >
      <!-- </router-link> -->
    </template>
  </el-result>
</template>

<script>
export default {
  name: "Page404Index",
  data() {
    return {
      count: 3,
      timer: null,
    };
  },
  computed: {
    routeQuery() {
      return this.$route.query;
    },
    title() {
      return this.routeQuery.msg ?? "很抱歉，您要访问的页面不存在！";
    },
  },
  watch: {
    $route: {
      handler() {},
      deep: true,
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.count -= 1;
      if (!this.count) {
        this.$router.push("/");
        clearInterval(this.timer);
      }
    }, 1000);
  },
  activated() {
    this;
  },
  methods: {
    /**
     * 回到首页
     */
    back() {
      this.$router.push({ path: "/" });
      this.timer && clearInterval(this.timer);
    },
  },
};
</script>

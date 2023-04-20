<template>
  <div class="lock-container">
    <div class="lock-form">
      <h3 class="text-white">{{ name }}</h3>
      <el-input
        placeholder="请输入解锁密码,并回车确认"
        autocomplete="off"
        type="password"
        v-model="password"
        @keyup.enter="handleLogin"
      >
        <el-tooltip
          content="解锁"
          placement="top"
          slotslot="append"
          popper-class="element-arrow_tooltip"
        >
          <span class="lock-btn el-icon-unlock" @click="handleLogin"></span>
        </el-tooltip>
        <el-tooltip
          content="登出"
          placement="top"
          slotslot="append"
          popper-class="element-arrow_tooltip"
        >
          <span
            class="lock-btn el-icon-switch-button"
            @click="handleLogout"
          ></span>
        </el-tooltip>
      </el-input>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "lockIndex",
  data() {
    return {
      password: "",
    };
  },
  computed: {
    ...mapState({ name: (state) => state.user.name }),
    ...mapGetters(["tag", "lockPassword"]),
  },
  methods: {
    handleLogout() {
      this.$elConfirm("是否退出系统, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$store.dispatch("LogOut").then(() => {
            this.$router.push({ path: "/login" });
          });
        })
        .catch(() => {
          return false;
        });
    },
    handleLogin() {
      if (this.password !== this.lockPassword) {
        this.password = "";
        this.$elMessage({
          message: "解锁密码错误,请重新输入！",
          type: "error",
        });
        return;
      }

      setTimeout(() => {
        this.$store.commit("user/CLEAR_LOCK");
        this.$router.push("/sample/assetPortrait");
      }, 1000);
    },
  },
};
</script>

<style lang="scss">
.lock-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lock-container::before {
  z-index: -999;
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url("~@AST/images/login/login-bg.png") no-repeat;
}

.lock-form {
  width: 400px;
  .el-input .el-input__inner,
  .el-input .el-input__inner:hover,
  .el-input .el-input__inner:active,
  .el-input .el-input__inner:focus {
    border: none;
  }

  .lock-btn {
    font-size: 18px;
    &:last-child {
      margin-left: 16px;
    }
  }
}

.text-white {
  color: white;
  margin-bottom: 16px;
}
</style>

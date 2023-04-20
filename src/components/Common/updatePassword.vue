<template>
  <el-dialog
    :title="title"
    v-model:visible="updateUser.visible"
    width="490px"
    v-loading="loading"
    :show-close="title === '修改密码'"
    :before-close="cancel"
    :close-on-click-modal="false"
  >
    <el-form
      :model="ruleForm"
      status-icon
      :rules="rules"
      ref="ruleForm"
      label-width="90px"
      @submit.prevent
      class="demo-ruleForm"
    >
      <el-form-item label="当前密码：" prop="password">
        <el-input
          placeholder="请输入当前密码"
          v-model="ruleForm.password"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码：" prop="newPassword">
        <el-input
          type="password"
          size="small"
          :clearable="false"
          v-model.trim="ruleForm.newPassword"
          :maxLength="32"
          show-password
          placeholder="长度8-32位且必须包含字母、数字或字符"
          autocomplete="off"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="确认新密码：" prop="checkPass">
        <el-input
          type="password"
          size="small"
          :clearable="false"
          v-model.trim="ruleForm.checkPass"
          :maxLength="32"
          show-password
          placeholder="长度8-32位且必须包含字母、数字或字符"
          autocomplete="off"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <span slotslot="footer" class="dialog-footer">
      <el-button type="primary" size="small" @click="updatePwd">提交</el-button>
      <el-button
        type="info"
        size="small"
        v-if="title === '修改密码'"
        @click="cancel"
        >取消</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { encrypt } from "@TOOLS/aes";
import { updatePassword } from "@API/user";

export default {
  props: {
    title: {
      type: String,
      default: "修改密码",
    },
  },
  data() {
    return {
      loading: false,
      updateUser: { visible: true },
      ruleForm: {
        password: "",
        newPassword: "",
        checkPass: "",
      },
      rules: {
        password: [{ validator: this.validatePass, trigger: "blur" }],
        newPassword: [{ validator: this.validatePassNew, trigger: "blur" }],
        checkPass: [{ validator: this.validatePassNew2, trigger: "blur" }],
      },
    };
  },
  methods: {
    validatePass(rule, value, callback) {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    },
    validatePassNew(rule, value, callback) {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        callback();
      }
    },
    validatePassNew2(rule, value, callback) {
      if (value === "") {
        callback(new Error("请再次确认新密码"));
      } else if (value !== this.ruleForm.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    },
    updatePwd() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          let params = {
            password: encrypt(this.ruleForm.password),
            newPassword: encrypt(this.ruleForm.newPassword),
            systemId: this.$store.state.user.systemId,
          };
          this.loading = true;
          updatePassword(params)
            .then((res) => {
              if (res.status == 200) {
                this.$store.dispatch("user/resetToken").then(() => {
                  // this.updateUser.visible = false;
                  this.$msgbox({
                    type: "success",
                    customClass: "wd_dailog",
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    closeOnHashChange: false,
                    dangerouslyUseHTMLString: true,
                    message:
                      '<h3 class="title">修改成功</h3><p class="txt">即将退出重新登录</p>',
                  }).then(() => {
                    this.$emit("yes");
                    this.$router.push({ name: "login" });
                  });
                });
              }
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          this.loading = false;
          return false;
        }
      });
    },
    cancel() {
      // this.updateUser.visible = false;
      this.$emit("cancel");
    },
  },
};
</script>
<style lang="scss" scoped>
.el-form {
  padding: 12px 16px 0;
  margin-bottom: -16px;
  :deep(.el-form-item) {
    margin-bottom: 18px;
    input {
      border: 1px solid #e5e5e5;
      background: transparent;
      font-size: 14px;
      &:focus {
        border-color: #e5e5e5;
      }
      .el-form-item__error {
        padding-top: 1px;
      }
    }
    &.el-form-item--feedback .el-input__validateIcon {
      display: none;
    }
  }
}
</style>

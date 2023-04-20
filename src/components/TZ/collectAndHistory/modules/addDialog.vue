<template>
  <el-dialog
    title="输入收藏名称，并确认"
    :visible="isEnable"
    width="444px"
    :close-on-click-modal="false"
    :before-close="close"
    v-loading="loading"
  >
    <el-form
      :model="form"
      status-icon
      :rules="rules"
      ref="diaForm"
      label-width="85px"
      class="demo-ruleForm"
      @submit.prevent
    >
      <el-form-item label="收藏名称：" prop="name">
        <el-input
          type="text"
          placeholder="请输入收藏名称"
          v-model.trim="form.name"
          maxlength="15"
          show-word-limit
        >
        </el-input>
      </el-form-item>
      <!-- <el-col :span="12">
                <el-form-item label="未知方向："
                    prop="fileName">
                    <el-switch v-model="form.isUnknown">
                    </el-switch>
                </el-form-item>
            </el-col> -->
      <el-col :span="12">
        <el-form-item label="同名覆盖：" prop="fileName">
          <el-switch v-model="form.isCover"> </el-switch>
        </el-form-item>
      </el-col>
    </el-form>
    <span slotslot="footer" class="dialog-footer">
      <el-button type="primary" @click="yes">确定</el-button>
      <el-button type="info" @click="close">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { addCollect } from "@/api/TZ/index.js";
import { getShowTxt } from "./tools.js";
import setting from "@/setting.js";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      form: {
        name: "",
        isCover: true,
        isUnknown: false,
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入收藏名称",
            trigger: "blur",
          },
        ],
      },
      isEnable: true,
      loading: false,
    };
  },
  props: {
    options: {
      type: Object,
      default() {
        return {
          params: {},
          form: {},
        };
      },
    },
  },
  computed: {
    ...mapGetters(["$searchBar", "pageinfo"]),
    mode() {
      return this.options.mode;
    },
  },
  methods: {
    /**
     * 确认 加入我的收藏
     */
    yes() {
      this.$refs["diaForm"].validate((valid) => {
        if (valid) {
          this.addCollect();
        } else {
          return false;
        }
      });
    },
    /**
     * 加入收藏
     */
    addCollect() {
      let conditions = this.$searchBar.buildParams();
      //去除聚类的条件
      // if (distinctData) {
      //     condition.group = null;
      //     condition.topSize = null;
      // }
      let params = {
        isUnknown: false,
        pageId: this.pageinfo.pageId,
        F_ShowData: getShowTxt(conditions),
        F_SaveData: JSON.stringify(conditions),
        F_SaveName: this.form.name,
        isCover: this.form.isCover, // 是否同名覆盖
        systemId: setting.WdSystemID,
      };
      this.loading = true;
      addCollect(params)
        .then(() => {
          // this.$message.success('新增成功！');
          this.close("success");
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /**
     * 关闭 加入我的收藏 弹出框
     */
    close(msg) {
      this.$refs["diaForm"] && this.$refs["diaForm"].resetFields();
      this.$emit("close", msg);
    },
  },
};
</script>
<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 16px;
}
.el-col > .el-form-item {
  margin-bottom: 0;
}
</style>

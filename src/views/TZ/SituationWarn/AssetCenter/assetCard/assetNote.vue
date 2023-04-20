<template>
  <div class="asset_note">
    <el-dialog
      title="添加资产备注"
      v-model:visible="visible"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        @submit.prevent
        label-width="90px"
      >
        <el-form-item label="备注对象：">
          <p>{{ targetData.ip }}</p>
        </el-form-item>
        <el-form-item label="备注信息：" prop="remark">
          <el-input
            type="textarea"
            v-model.trim="ruleForm.remark"
            maxlength="200"
            show-word-limit
            placeholder="请输入备注信息，不超过200字"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handlerOk">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { setAssetNote } from "@API/TZ/AssetCenter.js";
import { checkXss } from "@LIB/validate.js";

export default {
  name: "assetNote",
  data() {
    let remarkCheck = (rule, value, callback) => {
      if (checkXss(value)) callback(new Error(`备注中不能包含特殊字符`));
      else callback();
    };
    return {
      visible: false,
      targetData: {}, // 编辑的资产
      ruleForm: {},
      rules: {
        remark: [
          { message: "请输入备注信息", trigger: "blur" },
          { validator: remarkCheck, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 新打开弹窗初始化数据
    init(data) {
      // 是否传入data由是否可以标记资产决定
      this.targetData = JSON.parse(JSON.stringify(data));
      this.visible = true;
      this.ruleForm = {
        remark: this.targetData.remark ?? "",
      };
    },
    handlerOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (this.targetData.remark === this.ruleForm.remark) {
            this.visible = false;
            this.$message.success("备注设置成功！");
            return;
          }
          setAssetNote({
            params: JSON.stringify({
              conditions: [
                { field: "_id", value: this.targetData.indexid, op: "equal" },
              ],
              indexName: "inf-asset,inf-asset-event-log",
              doc: { remark: this.ruleForm.remark },
            }),
          })
            .then((res) => {
              if (res.status == 200) {
                this.$message.success("备注设置成功！");
                this.targetData.remark = this.ruleForm.remark;
                this.$bus.$emit("updateAssetItem", {
                  indexid: this.targetData.indexid,
                  changes: [{ key: "remark", value: this.ruleForm.remark }],
                });
                this.visible = false;
              }
            })
            .catch(() => {
              this.visible = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.asset_note {
  .el-form {
    padding: 0 30px 0 10px;
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>

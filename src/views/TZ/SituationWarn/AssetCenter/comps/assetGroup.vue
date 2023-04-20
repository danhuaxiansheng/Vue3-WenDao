<template>
  <div class="asset_group">
    <el-dialog
      title="设置分组"
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
        <el-form-item v-if="checkeIps" label="分组对象：">
          <p class="ellipsis" :title="checkeIps">{{ checkeIps }}</p>
        </el-form-item>
        <el-form-item label="组别：" prop="groupid">
          <el-select v-model="ruleForm.groupid" placeholder="请选择组别">
            <el-option
              v-for="item in groupidOpt"
              :key="item.id"
              :label="item.groupname"
              :value="item.id"
            >
              <span :style="{ paddingLeft: `${(item.deep - 1) * 16}px` }">
                {{ item.groupname }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handlerOk">确认</el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import { setAssetGroup } from "@API/TZ/AssetCenter.js";

export default {
  name: "assetGroup",
  props: {
    checkeNodes: {
      type: Array,
      required: true,
      default: () => [],
    },
    indexType: String, // 存在时为表格模式
  },
  data() {
    return {
      visible: false,
      ruleForm: {},
      rules: {
        groupid: [
          { required: true, message: "请选择资产分组", trigger: "change" },
        ],
      },
      groupidOpt: [],
    };
  },
  methods: {
    // 新打开弹窗初始化数据
    init() {
      // 是否传入data由是否可以标记资产决定
      this.visible = true;
      this.ruleForm = {
        groupid: "",
      };
      // 获取资产分组
      this.groupidOpt = this.buildDropGroup([this.$store.state.tz.treeNodes]);
    },
    buildDropGroup(list, deep = 1) {
      return list.reduce((prev, next) => {
        let newList = { ...next, deep, id: next.id.toString() };
        let deepList =
          Array.isArray(next.children) && next.children.length
            ? [newList, ...this.buildDropGroup(next.children, deep + 1)]
            : newList;
        return prev.concat(deepList);
      }, []);
    },
    handlerOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let url = "",
            param = {},
            ids = this.checkeNodes.map((item) => item.indexid);
          if (this.indexType) {
            url = "/api/asset1126/setAssetGroup";
            param = {
              groupId: this.ruleForm.groupid,
              indexType: this.indexType,
              assetList: JSON.stringify(ids),
            };
          } else {
            url = "/api/threat/asset/setAssetGroup";
            param = {
              groupId: this.ruleForm.groupid,
              ids: ids.join(","),
            };
          }
          setAssetGroup(param, url).then((res) => {
            if (res.status == 200) {
              this.$message.success("设置成功！");
              let group =
                this.groupidOpt.filter(
                  (item) => item.id == this.ruleForm.groupid
                )[0] ?? {};
              this.$bus.$emit("updateAssetItem", {
                indexid: ids.join(","),
                changes: [
                  { key: "groupid", value: group.id },
                  { key: "groupname", value: group.groupname },
                ],
              });
              this.visible = false;
            }
          });
        }
      });
    },
  },
  computed: {
    checkeIps() {
      let checkeIps = "";
      this.checkeNodes.some((item, index) => {
        if (!item.ip) return true;
        if (index > 1) return (checkeIps += "等3条资产");
        checkeIps += (!checkeIps.length ? "" : ",") + item.ip;
      });
      return checkeIps;
    },
  },
};
</script>

<style lang="scss" scoped>
.asset_group {
  .el-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>

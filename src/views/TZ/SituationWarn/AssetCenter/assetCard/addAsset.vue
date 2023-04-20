<template>
  <div class="asset_add">
    <el-dialog
      :title="title"
      v-model:visible="visible"
      width="620px"
      v-loading="loading"
      :before-close="handleCancel"
      :close-on-click-modal="false"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="90px"
        @submit.prevent
      >
        <template v-for="item in formList">
          <!-- 资产分组 -->
          <el-form-item
            :key="item.key"
            v-if="item.key == 'groupid'"
            :label="`${item.name}：`"
            :prop="item.key"
          >
            <el-select
              v-model="ruleForm.groupid"
              :placeholder="item.placeHolder"
            >
              <el-option
                v-for="item in groupidOpt"
                :key="item.id"
                :label="item.groupname"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <!-- 资产类型 -->
          <!-- <div
            class="assets_type_list"
            :key="item.key"
            v-else-if="item.key == 'assetsType'"
          >
            <p class="assets_type"><span>*</span>资产类型：</p>
            <div class="assets_port element-page__scroll">
              <el-form-item
                v-for="(v, i) in ruleForm.assetsList"
                :key="i"
                :prop="`assetsList.${i}.port`"
                :rules="rules.assetsType"
                label-width="0px"
              >
                <el-input
                  class="assets_item"
                  :class="{ unabled: i !== ruleForm.assetsList.length - 1 }"
                  onkeyup="value = value.replace(/[^\d]/g, '')"
                  v-model.trim="v.port"
                  :placeholder="item.placeHolder"
                >
                  <el-select
                    v-model="v.type"
                    slotslot="prepend"
                    placeholder="请选择类型"
                    :disabled="i !== ruleForm.assetsList.length - 1"
                  >
                    <el-option
                      v-for="type in assetsTypeList"
                      :key="type.value"
                      :label="type.lable"
                      :value="type.value"
                    ></el-option>
                  </el-select>
                </el-input>
                <span class="type_btns">
                  <i
                    class="iconfont icon-subtract"
                    v-if="ruleForm.assetsList.length !== 1"
                    title="删除"
                    @click="delAssetType(i)"
                  ></i>
                  <i
                    class="iconfont icon-add"
                    v-show="
                      i === ruleForm.assetsList.length - 1 &&
                      i !== assetsTypes.length - 1
                    "
                    title="添加"
                    @click="addAssetType"
                  >
                  </i>
                </span>
              </el-form-item>
            </div>
          </div> -->
          <!-- <el-form-item
            v-else-if="item.type == 'numStr'"
            :key="item.key"
            :label="`${item.name}：`"
            :prop="item.key"
          >
            <el-input
              type="text"
              v-model.trim="ruleForm[item.key]"
              onkeyup="value = value.replace(/[^\d\,]/g, '')"
              :maxlength="item.maxlength"
              :placeholder="item.placeHolder"
            ></el-input>
          </el-form-item> -->
          <!-- 其他类型 -->
          <!-- <el-form-item
            v-else
            :key="item.key"
            :label="`${item.name}：`"
            :prop="item.key"
          >
            <el-input
              type="text"
              v-model.trim="ruleForm[item.key]"
              :maxlength="item.maxlength"
              :placeholder="item.placeHolder"
            ></el-input>
          </el-form-item> -->
        </template>
      </el-form>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="info" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handlerOk">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAssetGroup, addAsset } from "@API/TZ/AssetCenter.js";
import { checkIP, checkIPV6, checkMACInpit, checkPort } from "@LIB/validate.js";

export default {
  name: "assetCardAdd",
  data() {
    let assetsTypeValidate = (rule, value, callback) => {
        if (value === "") callback(new Error(`端口不能为空`));
        else if (!checkPort(value)) callback(new Error(`请输入正确的端口号`));
        else callback();
      },
      checkReg = (rule, value, callback) => {
        let formItem = this.formList.filter(
          (item) => item.key === rule.field
        )[0];
        if (value === "") callback(new Error(`${formItem.name}不能为空`));
        else if (formItem.validate) {
          let validateList = !Array.isArray(formItem.validate)
            ? [formItem.validate]
            : formItem.validate;
          let validatePass = validateList.some((validate) => {
            return validate(value);
          });
          if (validatePass) {
            callback();
          } else {
            callback(
              new Error(
                formItem.key == "mac"
                  ? "请按格式输入Mac地址（例：44:47:E5:85:4C:31）"
                  : `请输入正确的${formItem.name}`
              )
            );
          }
        } else callback();
      },
      checkVLAN = (rule, value, callback) => {
        let vlanidArr = value.split(","),
          assetVlan = vlanidArr.map(Number),
          filerVlan = assetVlan.filter((vlan) => vlan >= 0 && vlan <= 4095);
        if (value && filerVlan.length != assetVlan.length) {
          callback(new Error(`VLANID取值范围为0~4095`));
        } else callback();
      },
      checkMPLS = (rule, value, callback) => {
        let vlanidArr = value.split(","),
          assetVlan = vlanidArr.map(Number),
          filerVlan = assetVlan.filter((vlan) => vlan >= 0 && vlan <= 1048575);
        if (value && filerVlan.length != assetVlan.length) {
          callback(new Error(`VLANID取值范围为0~1048575`));
        } else callback();
      };
    return {
      title: "添加资产",
      visible: false,
      loading: false,
      formList: [
        {
          name: "资产IP",
          key: "ip",
          maxlength: 46,
          validate: [checkIP, checkIPV6],
          placeHolder: "请输入资产IP如：192.168.16.1",
        },
        {
          name: "MAC",
          key: "mac",
          maxlength: 20,
          validate: [checkMACInpit],
          placeHolder: "例：44:47:E5:85:4C:31。(字母区间为A-F)",
        },
        {
          name: "VLAN",
          key: "vlanid",
          maxlength: 100,
          type: "numStr",
          placeHolder: "例：请输出VLANID，多个以逗号分隔。（范围：0-4095）",
        },
        {
          name: "MPLS",
          key: "mplslabel",
          maxlength: 100,
          type: "numStr",
          placeHolder: "例：请输入MPLS，多个以逗号分隔。（范围：0~1048575）",
        },
        { name: "资产分组", key: "groupid", placeHolder: "请选择资产分组" },
        {
          name: "资产类型",
          key: "assetsType",
          placeHolder: "请输入端口如：8080",
        },
      ],
      ruleForm: {},
      rules: {
        ip: [{ required: true, validator: checkReg, trigger: "blur" }],
        mac: [{ required: true, validator: checkReg, trigger: "blur" }],
        vlanid: [{ validator: checkVLAN, trigger: "blur" }],
        mplslabel: [{ validator: checkMPLS, trigger: "blur" }],
        groupid: [{ required: true, message: "请选择资产分组" }],
        assetsType: [
          { required: true, validator: assetsTypeValidate, trigger: "blur" },
        ],
      },
      assetsTypes: [
        { lable: "摄像头", value: 3 },
        { lable: "IOS移动终端", value: 4 },
        { lable: "ANDROID移动终端", value: 5 },
        { lable: "DHCP服务器", value: 6 },
        { lable: "WEB服务器", value: 7 },
        { lable: "DNS服务器", value: 8 },
        { lable: "SQL服务器", value: 9 },
        { lable: "MYSQL服务器", value: 10 },
        { lable: "ORACLE服务器", value: 11 },
        { lable: "邮件服务器", value: 12 },
        { lable: "文件服务器", value: 13 },
        { lable: "TELNET服务器", value: 14 },
        { lable: "网络设备", value: 15 },
        { lable: "MAC终端", value: 17 },
        { lable: "WINDOWS终端", value: 18 },
        { lable: "打印机", value: 19 },
      ],
      groupidOpt: [],
    };
  },
  methods: {
    // 新打开弹窗初始化数据
    init() {
      // 是否传入data由是否可以标记资产决定
      this.visible = true;
      this.ruleForm = {
        ip: "",
        mac: "",
        vlanid: "",
        mplslabel: "",
        groupid: "",
        assetsList: [],
      };
      // 至少存在一个资产类型
      this.addAssetType();
      // 获取资产分组
      this.getAssetGroup();
    },
    delAssetType(index) {
      this.ruleForm.assetsList.splice(index, 1);
    },
    addAssetType() {
      let newType = "",
        oldTypes = this.ruleForm.assetsList.map((item) => item.type);
      this.assetsTypes
        .map((item) => item.value)
        .some((value) => {
          if (!oldTypes.includes(value)) {
            newType = value;
            return true;
          }
        });
      newType !== "" &&
        this.ruleForm.assetsList.push({
          type: newType,
          port: "",
        });
    },
    getAssetGroup() {
      this.loading = true;
      getAssetGroup({ id: 1 })
        .then((res) => {
          this.loading = false;
          this.groupidOpt = res.data || [];
          this.ruleForm.groupid = res.data[0]?.id ?? "";
        })
        .catch(() => {
          this.loading = false;
        });
    },
    handlerOk() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let ports = [], // 资产类型端口
            types = [], // 资产类型
            { vlanid, mplslabel, assetsList, ...rest } = this.ruleForm;
          vlanid = vlanid == "" ? [] : vlanid.split(",").map(Number); // VLAN
          mplslabel = mplslabel == "" ? [] : mplslabel.split(",").map(Number); // MPLS
          assetsList.forEach((item) => {
            ports.push(Number(item.port));
            types.push(item.type);
          });
          var paramData = {
            params: JSON.stringify({
              ...rest,
              ports,
              types,
              vlanid,
              mplslabel,
            }),
          };
          this.loading = true;
          addAsset(paramData)
            .then((res) => {
              this.loading = false;
              if (res.status == 200) {
                this.$message.success("添加成功！");
                this.$bus.$emit("updateAssetTable");
                this.visible = false;
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
    handleCancel() {
      this.$refs["ruleForm"].resetFields();
      this.visible = false;
    },
  },
  computed: {
    assetsTypeList() {
      let currentType = this.ruleForm.assetsList.map((item) => item.type);
      currentType.pop(); // 最后一个可选的下拉框当前选中的选项不需要被排除
      return this.assetsTypes.filter(
        (item) => !currentType.includes(item.value)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.asset_add {
  .el-form {
    width: calc(100% - 80px);
    .el-form-item {
      margin-bottom: 20px;
    }
    .assets_type_list {
      width: calc(100% + 80px);
      height: 180px;
      display: flex;
      .assets_type {
        flex-basis: 90px;
        text-align: right;
        padding-right: 4px;
        span {
          margin-right: 4px;
          color: #ec414d;
        }
      }
      .assets_port {
        flex-grow: 1;
        .el-form-item :deep(.el-form-item__content) {
          display: flex;
          line-height: 30px;
          .el-form-item__error {
            padding-top: 1px;
          }
          .assets_item {
            width: 398px;
            flex-shrink: 0;
            > input.el-input__inner {
              margin-left: 8px;
              width: calc(100% - 8px) !important;
            }
            & ~ .el-form-item__error {
              left: 123px;
            }
            .el-select {
              width: 120px;
            }
            .el-input-group__prepend .el-input__inner {
              padding-left: 14px;
            }
          }
          .assets_item:not(.unabled) {
            .el-input-group__prepend:hover,
            .el-input-group__prepend:focus {
              border-color: $highColor;
            }
          }
          .type_btns {
            width: 80px;
            padding-left: 8px;
            i {
              margin: 0 4px;
              font-size: 18px;
              cursor: pointer;
              &:hover {
                color: $highColor;
              }
            }
          }
        }
      }
    }
  }
}
</style>

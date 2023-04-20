<template>
  <div class="add_asset">
    <el-dialog
      :title="!data.indexid ? '新增资产' : '编辑资产'"
      v-model:visible="visible"
      width="860px"
      :close-on-click-modal="false"
      :before-close="handlerClose"
    >
      <div class="fieldsArr_container">
        <ul v-if="fieldsArr.length > 1">
          <li
            v-for="item in fieldsArr"
            :key="item.label"
            @click="tabSwitch(item)"
            :class="{
              active: activeTab == item.label,
              done: fieldsDone.includes(item.label),
            }"
          >
            <p
              class="step_icon iconfont"
              :class="
                fieldsDone.includes(item.label)
                  ? 'icon-success'
                  : 'icon-waiting'
              "
            ></p>
            <p class="step_name">{{ item.name }}</p>
            <p class="step_line"></p>
          </li>
        </ul>
      </div>
      <template v-for="form in fieldsArr" :key="form.label">
        <div
          class="from_container element-page__scroll"
          v-show="form.label == activeTab"
        >
          <el-form
            :ref="form.label"
            :rules="formRules"
            v-if="formDatas[form.label]"
            :model="formDatas[form.label]"
            label-suffix="："
            label-width="150px"
            @submit.prevent
          >
            <template v-for="item in fieldsSet[form.label].fields">
              <!-- 备案号 -->
              <template v-if="item.field == 'system_icp_sn'">
                <el-form-item
                  v-if="formDatas[form.label].system_icp_status == '1'"
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 安全设备、网络设备：IP地址版本 - 联动 -->
              <template v-else-if="item.field == 'ipv4_addr'">
                <el-form-item
                  v-if="formDatas[form.label].ip_version == '1'"
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <!-- 其他设备下IP不可编辑 -->
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    :disabled="
                      tabMenu.name == 'otherEquipment' && !!data.indexid
                    "
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 其他设备下IPV6不可编辑 -->
              <template v-else-if="item.field == 'ipv6_addr'">
                <el-form-item
                  v-if="formDatas[form.label].ip_version != '1'"
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    :disabled="
                      tabMenu.name == 'otherEquipment' && !!data.indexid
                    "
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 其他设备下mac不可编辑 -->
              <template
                v-else-if="
                  tabMenu.name == 'otherEquipment' && item.field == 'mac'
                "
              >
                <el-form-item
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    :disabled="!!data.indexid"
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 其他设备下端口号不可编辑 -->
              <template
                v-else-if="
                  tabMenu.name == 'otherEquipment' && item.field == 'port'
                "
              >
                <el-form-item
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    :disabled="!!data.indexid"
                    maxlength="200"
                    oninput="value = value.replace(/[^\d\,]/g, '')"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 其他模式下IP类型单选框 -->
              <el-form-item
                v-else-if="
                  tabMenu.name == 'otherEquipment' && item.field == 'ip_version'
                "
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-radio-group v-model="formDatas[form.label][item.field]">
                  <el-radio
                    v-for="item in dropdownOpts[item.field]"
                    :disabled="!!data.indexid"
                    :key="item.id"
                    :label="item.id"
                  >
                    {{ item.groupname }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <!-- 云服务提供商 -->
              <template v-else-if="item.field == 'system_cloud_vendor'">
                <el-form-item
                  v-if="formDatas[form.label].system_cloud == '1'"
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>
              <!-- 业务系统子类型 -->
              <template v-else-if="item.field == 'system_subtype'">
                <el-form-item
                  :label="item.name"
                  :prop="item.field"
                  :key="item.field"
                >
                  <el-select
                    v-model="formDatas[form.label][item.field]"
                    :placeholder="`请选择${item.name}`"
                  >
                    <el-option
                      v-for="item in dropdownOpts[item.field + '_filter']"
                      :key="item.id"
                      :label="item.groupname"
                      :value="item.id"
                    >
                      <span
                        :style="{ paddingLeft: `${(item.deep - 1) * 16}px` }"
                        >{{ item.groupname }}</span
                      >
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
              <!-- 文字框 -->
              <template v-else-if="item.form.type == 'String'">
                <el-form-item
                  :key="item.field"
                  :label="item.name"
                  :prop="item.field"
                >
                  <el-input
                    v-model="formDatas[form.label][item.field]"
                    maxlength="200"
                    :placeholder="item.form.placeholder || `请输入${item.name}`"
                  >
                  </el-input>
                </el-form-item>
              </template>

              <!-- 切换框 -->
              <!-- <el-form-item
                v-else-if="item.form.type == 'Switch'"
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-radio-group v-model="formDatas[form.label][item.field]">
                  <el-radio
                    v-for="item in dropdownOpts[item.field]"
                    :disabled="
                      data.indexid &&
                      tabMenu.name == 'otherEquipment' &&
                      item.field == 'ip_version'
                    "
                    :key="item.id"
                    :label="item.id"
                  >
                    {{ item.groupname }}
                  </el-radio>
                </el-radio-group>
              </el-form-item> -->
              <!-- 选择器 -->
              <!-- <el-form-item
                v-else-if="item.form.type == 'Dropdown'"
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-select
                  v-model="formDatas[form.label][item.field]"
                  :placeholder="`请选择${item.name}`"
                >
                  <el-option
                    v-for="item in dropdownOpts[item.field]"
                    :key="item.id"
                    :label="item.groupname"
                    :value="item.id"
                  >
                    <span
                      :style="{ paddingLeft: `${(item.deep - 1) * 16}px` }"
                      >{{ item.groupname }}</span
                    >
                  </el-option>
                </el-select>
              </el-form-item> -->
              <!-- 文本框 -->
              <!-- <el-form-item
                v-else-if="item.form.type == 'Textarea'"
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-input
                  type="textarea"
                  v-model="formDatas[form.label][item.field]"
                  maxlength="400"
                  :placeholder="item.form.placeholder || `请输入${item.name}`"
                  :rows="2"
                >
                </el-input>
              </el-form-item> -->
              <!-- 时间选择 -->
              <!-- <el-form-item
                v-else-if="item.form.type == 'Time'"
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-date-picker
                  v-model="formDatas[form.label][item.field]"
                  type="datetime"
                  :picker-options="datePickerOpt"
                  format="yyyy-MM-dd HH:mm:ss"
                  :placeholder="`请选择${item.name}`"
                >
                </el-date-picker>
              </el-form-item> -->
              <!-- 数字输入 -->
              <!-- <el-form-item
                v-else-if="item.form.type == 'Number'"
                :label="item.name"
                :prop="item.field"
                :key="item.field"
              >
                <el-input
                  v-model="formDatas[form.label][item.field]"
                  type="number"
                  :min="0"
                  :max="999999"
                  oninput="if(value.length > 6){ value = Math.abs(value.slice(0,6))}"
                  :placeholder="item.form.placeholder || `请输入${item.name}`"
                >
                </el-input>
              </el-form-item> -->
            </template>
          </el-form>
        </div>
      </template>
      <!-- <span slotslot="footer" class="dialog-footer">
        <el-button
          type="info"
          v-show="fieldsArr.length > 0 && activeTab != fieldsArr[0].label"
          @click="setStep(-1)"
          >上一步</el-button
        >
        <el-button
          type="primary"
          v-show="
            fieldsArr.length > 0 &&
            activeTab != fieldsArr[fieldsArr.length - 1].label
          "
          @click="setStep(1)"
        >
          下一步
        </el-button>
        <el-button
          type="primary"
          v-show="activeTab == fieldsArr[fieldsArr.length - 1].label"
          @click="handlerOk"
        >
          完成
        </el-button>
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import pageSettings from "../../modules/pageSettings-asset.js";
import { updateAsset } from "@API/TZ/AssetCenter.js";
import moment from "moment";
export default {
  name: "addTableAsset",
  data() {
    return {
      visible: false,
      data: {}, // 编辑的数据对象
      activeTab: "", // 当前激活的表单
      formDatas: {}, // 表单集合
      fieldsDone: [], // 已经完成的表单
      dropdownOpts: {}, //选择器的选项
      searchMap: {}, // 下拉菜单，关闭时不需要清空
      formRules: {}, //表单规则
      datePickerOpt: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
    };
  },
  inject: ["activeMenu"],

  methods: {
    init(data = {}) {
      this.data = this.$lodash.cloneDeep(data);
      this.activeTab = this.fieldsArr.length ? this.fieldsArr[0].label : "";
      this.buildFromData();
      this.buildSpeceilField();
      this.visible = true;
    },
    // 构建表单相关数据
    buildFromData() {
      let formDatas = {},
        formRules = {};
      this.fieldsArr.forEach((item) => {
        let formData = {};
        const parentPath = this.fieldsSet[item.label]?.parentPath,
          fields = this.fieldsSet[item.label]?.fields ?? [];
        fields.forEach((v) => {
          const rowData =
              v.field != "groupid" && parentPath
                ? { ...this.data[parentPath] }
                : { ...this.data },
            fieldVal = rowData[v.field] ?? "";
          // 办公软件、数据库、中间件要特殊处理
          if (["office", "db", "middleware"].includes(v.field)) {
            let inputArr = [];
            if (Array.isArray(fieldVal) && fieldVal.length) {
              inputArr = fieldVal.map((item) => {
                let vendor = (item[v.field + "_vendor"] || "").trim(), // 厂商
                  name = (item[v.field + "_name"] || "").trim(), // 名称
                  version = (item[v.field + "_version"] || "").trim(); // 版本
                return vendor || name || version
                  ? [vendor, name, version].join("/")
                  : "";
              });
            }
            inputArr = inputArr.filter((item) => item !== "");
            formData[v.field] = inputArr.join(",");
          } else {
            formData[v.field] = fieldVal;
          }
          let rule = v.form;
          formRules[v.field] = [];
          // 构建下拉框
          if (rule.type == "Dropdown")
            this.buildDropOpts(v, parentPath, formData);
          // 构建切换框
          else if (rule.type == "Switch")
            this.buildSwitchOpts(v, parentPath, formData);
          // 构建表单验证
          if (rule.require) {
            formRules[v.field].push({
              required: rule.require,
              message: `${v.name}不能为空`,
              trigger: "blur",
            });
            if (rule.regex) {
              formRules[v.field].push({
                regex: rule.regex,
                trigger: "blur",
                validator: (rule, value, callback) => {
                  let valid = pageSettings.testValueByRegex(rule, value);
                  if (!valid) {
                    callback(
                      new Error(
                        v.field == "mac"
                          ? "请按格式输入Mac地址（例：44:47:E5:85:4C:31）"
                          : `请输入正确的${v.name}`
                      )
                    );
                  } else {
                    callback();
                  }
                },
              });
            }
          }
        });
        formDatas[item.label] = formData;
      });
      this.formDatas = formDatas;
      this.formRules = formRules;
    },
    async buildSwitchOpts(formItem, parentPath, formData) {
      this.searchMap = await this.$store.dispatch("tz/searchMap");
      let dropItem = this.searchMap[this.tabMenu.name].filter(
          (item) => item.field == `${parentPath}.${formItem.field}`
        )[0],
        list = dropItem?.dropDownList || [],
        dropdown = list
          .filter((item) => item.key != "-999")
          .map((item) => {
            if ([item.value, item.key].includes(formData[formItem.field])) {
              formData[formItem.field] = item.key;
            }
            return { groupname: item.value, id: item.key };
          });
      this.dropdownOpts[formItem.field] = dropdown;
      if (!formData[formItem.field] && dropdown.length)
        formData[formItem.field] = dropdown[0].id;
    },
    buildDropOpts(formItem, parentPath, formData) {
      if (formItem.field == "groupid") {
        let list = this.buildDropGroup(formData, formItem, [
          this.$store.state.tz.treeNodes,
        ]);
        this.dropdownOpts.groupid = list;
        if (!formData[formItem.field] && list.length)
          formData[formItem.field] = list[0].id;
      } else {
        this.buildSwitchOpts(formItem, parentPath, formData);
      }
    },
    buildDropGroup(formData, formItem, list, deep = 1) {
      return list.reduce((prev, next) => {
        let newList = { ...next, deep, id: next.id.toString() };
        if (
          formData[formItem.field] == newList.groupname ||
          formData[formItem.field] == newList.id
        ) {
          formData[formItem.field] = newList.id;
        }
        let deepList =
          Array.isArray(next.children) && next.children.length
            ? [
                newList,
                ...this.buildDropGroup(
                  formData,
                  formItem,
                  next.children,
                  deep + 1
                ),
              ]
            : newList;
        return prev.concat(deepList);
      }, []);
    },
    tabSwitch(formItem) {
      if (this.activeTab == formItem.label) return;
      this.$refs[this.activeTab][0].validate((valid) => {
        if (valid && !this.fieldsDone.includes(this.activeTab))
          this.fieldsDone.push(this.activeTab);
        else if (!valid && this.fieldsDone.includes(this.activeTab))
          this.fieldsDone = this.fieldsDone.filter((item) => !item);
      });
      this.activeTab = formItem.label;
    },
    setStep(step) {
      let curTab = this.activeTab;
      // 验证当前表单
      this.$refs[curTab][0].validate((valid) => {
        if (valid) {
          if (!this.fieldsDone.includes(curTab)) this.fieldsDone.push(curTab);
        } else
          this.fieldsDone = this.fieldsDone.filter((item) => item != curTab);
      });
      // 切换表单
      if (typeof step == "number") {
        let tabIndex = this.fieldsArr.map((item) => item.label).indexOf(curTab);
        this.activeTab = this.fieldsArr[tabIndex + step].label;
      }
    },
    validateForm() {
      let fieldsDone = [],
        fieldsNotDone = "";
      this.fieldsArr.forEach((formItem) => {
        this.$refs[formItem.label][0].validate((valid) => {
          if (valid) fieldsDone.push(formItem.label);
          else if (!fieldsNotDone) fieldsNotDone = formItem.label;
        });
      });
      this.fieldsDone = fieldsDone;
      fieldsNotDone && (this.activeTab = fieldsNotDone);
      return this.fieldsDone.length == this.fieldsArr.length;
    },
    handlerOk() {
      let isDone = this.validateForm();
      if (!isDone) return;
      let params = {};
      this.fieldsArr.forEach((item) => {
        let fieldItem = this.fieldsSet[item.label],
          parentPath = fieldItem.parentPath;
        params[parentPath] = {};
        fieldItem.fields.forEach((v) => {
          const fieldVal = this.formDatas[item.label][v.field];
          if (v.field == "groupid") {
            // 分组id
            params[v.field] = fieldVal;
          } else if (v.form.type == "Time") {
            params[parentPath][v.field] = moment(fieldVal).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          } else if (["office", "db", "middleware"].includes(v.field)) {
            // 办公软件、数据库、中间件
            let values = this.formDatas[item.label][v.field],
              inputList = values.split(","),
              fieldValList = inputList.map((item) => {
                let valArr = item.split("/");
                return {
                  [`${v.field}_vendor`]: valArr[0] ? valArr[0].trim() : "",
                  [`${v.field}_name`]: valArr[1] ? valArr[1].trim() : "",
                  [`${v.field}_version`]: valArr[2] ? valArr[2].trim() : "",
                };
              });
            params[parentPath][v.field] = fieldValList;
          } else {
            params[parentPath][v.field] = fieldVal;
          }
        });
        // params[parentPath]
        // 当前循环结束以后处理IP一些二选一的问题(不处理是否有影响？)
      });
      let url,
        param = {
          indexType: this.tabMenu.name,
          params: JSON.stringify(params),
        };
      if (this.data.indexid) {
        url = "/api/asset1126/updateAsset";
        param.id = this.data.indexid;
      } else url = "/api/asset1126/addAsset";
      updateAsset(param, url).then(() => {
        this.$message.success("保存成功");
        this.$bus.$emit("updateAssetTable");
        this.handlerClose();
      });
    },
    handlerClose() {
      this.data = {};
      this.activeTab = "";
      this.fieldsDone = [];
      this.visible = false;
      this.formDatas = {};
      this.dropdownOpts = {};
    },

    buildSpeceilField() {
      // 业务系统子类型默认选项
      if (this.formDatas?.base) {
        if (this.dropdownOpts?.system_subtype) {
          let defaultPick = "",
            system_subtype = [];
          const fieldItem =
            this.fieldsSet.base.fields.filter(
              (item) => item.field == "system_subtype"
            )[0] || {};
          const parentPath = this.fieldsSet.base.parentPath;
          this.dropdownOpts.system_subtype.forEach((item) => {
            if (
              item.id.toString().substr(0, 1) == this.formDatas.base.system_type
            ) {
              system_subtype.push(item);
              let defaultVal = this.data[parentPath]
                ? this.data[parentPath][fieldItem.field]
                : this.data[fieldItem.field];
              if (item.id == defaultVal || item.groupname == defaultVal) {
                defaultPick = item.id;
              }
            }
          });
          this.$set(this.dropdownOpts, "system_subtype_filter", system_subtype);
          this.formDatas.base.system_subtype =
            defaultPick ||
            (this.dropdownOpts.system_subtype_filter[0] || {}).id;
        }
      }
    },
  },
  watch: {
    formDatas: {
      deep: true,
      handler(form) {
        if (form?.base?.system_type) {
          this.buildSpeceilField();
        }
      },
    },
  },
  computed: {
    tabMenu() {
      // 当前菜单
      return this.activeMenu();
    },
    fieldsSet() {
      // 对应数据集
      return pageSettings.getAssetFieldsByType(this.tabMenu.name);
    },
    fieldsArr() {
      // 需要展示的列表
      return pageSettings.assetTabList.filter((item) => {
        return !!this.fieldsSet[item.label]?.show;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.add_asset {
  .el-dialog__wrapper {
    :deep(.el-dialog__body) {
      padding-top: 16px;
    }
    .fieldsArr_container {
      margin-top: 16px;
      ul {
        display: grid;
        grid-auto-flow: column;
        justify-content: center;
        grid-auto-columns: 180px;
        li {
          display: grid;
          column-gap: 4px;
          grid-auto-flow: column;
          position: relative;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          p.step_icon {
            width: 32px;
            height: 32px;
            background: $lineColor;
            text-align: center;
            line-height: 32px;
            border-radius: 50%;
            color: #fff;
            font-size: 22px;
            opacity: 0.8;
          }
          p.step_line {
            width: 72px;
            height: 1px;
            background: $lineColor;
            position: absolute;
            left: 142px;
          }
          &.done,
          &.active {
            color: $highColor;
            p.step_line,
            p.step_icon {
              background: $highColor;
            }
          }
          &.active p.step_icon {
            opacity: 1;
          }
          &:last-child p.step_line {
            display: none;
          }
        }
      }
    }
    div.from_container {
      width: 680px;
      min-height: 400px;
      max-height: 500px;
      margin: 16px auto 0;
      padding: 8px;
      .el-radio-group {
        height: 32px;
        .el-radio {
          line-height: 32px;
        }
      }
    }
  }
}
</style>

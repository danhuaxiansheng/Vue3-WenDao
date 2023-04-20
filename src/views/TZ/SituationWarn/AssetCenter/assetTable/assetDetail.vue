<template>
  <div class="asset_detail">
    <el-dialog
      :title="tabMenu.label"
      v-model:visible="visible"
      width="720px"
      :close-on-click-modal="false"
      :before-close="handlerClose"
    >
      <div class="detail_body">
        <el-radio-group
          v-model="activeTab"
          :slow="false"
          style="margin-bottom: 30px"
        >
          <el-radio-button
            v-for="item in tabList"
            :key="item.value"
            :label="item.label"
          >
            {{ item.name }}
          </el-radio-button>
        </el-radio-group>
        <ul class="form_data">
          <li v-for="item in fieldsSet[activeTab]" :key="item.tempField">
            <p class="form_label ellipsis">{{ item.tempName }}</p>
            <p class="form_value ellipsis" :title="item.tempVal">
              {{ item.tempVal }}
            </p>
          </li>
        </ul>
      </div>
      <!-- <span slotslot="footer"
                class="dialog-footer">
                <el-button type="primary"
                    @click="handlerClose">确认</el-button>
            </span> -->
    </el-dialog>
  </div>
</template>

<script>
import pageSettings from "../../modules/pageSettings-asset.js";
export default {
  name: "assetDetail",
  data() {
    return {
      visible: false,
      data: {},
      activeTab: "base",
      fieldsSet: [],
    };
  },
  inject: ["activeMenu"],
  methods: {
    init(data) {
      this.data = this.$lodash.cloneDeep(data);
      if (!this.data.indexid) return this.$message.warning("暂无资产详情！");
      this.buildFormData();
      this.visible = true;
    },
    buildFormData() {
      let fieldsSet = {},
        fieldsData = this.$lodash.cloneDeep(this.data),
        fields = pageSettings.getAssetFieldsByType(this.tabMenu.name);
      Object.keys(fields).forEach((type) => {
        let item = fields[type];
        if (!item.show) return;
        let fieldsArr = [];
        Object.values(item.fields).forEach((field) => {
          let fieldVal = "",
            parentPath = fieldsData[item.parentPath];
          //特殊处理：渲染软件信息里的"office/中间件/数据库字"段
          if (field.parentPath) {
            let subFileds =
              (parentPath && parentPath[field.parentPath]) || "无";
            subFileds.length &&
              Object.values(subFileds).forEach((item) => {
                fieldVal +=
                  (item[field.field + "_vendor"] || "无") +
                  " — " +
                  (item[field.field + "_name"] || "无") +
                  " — " +
                  (item[field.field + "_version"] || "无");
              });
          } else if (field.field == "groupid") {
            fieldVal = fieldsData["groupname"] || "无";
          } else {
            fieldVal =
              (parentPath && parentPath[field.field]) ||
              fieldsData[field.field] ||
              "无";
          }
          fieldsArr.push({
            tempField: field.field,
            tempName: field.name,
            tempVal: fieldVal || "无",
          });
        });
        fieldsSet[type] = fieldsArr;
      });
      this.fieldsSet = fieldsSet;
    },
    handlerClose() {
      this.activeTab = "base";
      this.data = {};
      this.visible = false;
    },
  },
  computed: {
    tabMenu() {
      return this.activeMenu();
    },
    tabList() {
      let AssetFields = pageSettings.getAssetFieldsByType(this.tabMenu.name),
        tabList = pageSettings.assetTabList.filter((item) => {
          return !!AssetFields[item.label]?.show;
        });
      return tabList;
    },
  },
};
</script>

<style lang="scss" scoped>
.asset_detail {
  .el-dialog__wrapper {
    :deep(.el-dialog__body) {
      padding-top: 16px;
    }
    .detail_body {
      display: grid;
      height: 404px;
      justify-items: center;
      grid-auto-rows: min-content;
      .el-radio-group {
        margin-bottom: 16px !important;
        :deep(.el-radio-button__inner) {
          padding: 9px 23px;
        }
      }
      ul.form_data {
        border: 1px solid rgba(217, 217, 217, 0.6);
        li {
          display: flex;
          width: 636px;
          grid-template-columns: 144px auto;
          border-top: none;
          &:not(:first-of-type) {
            border-top: 1px solid rgba(217, 217, 217, 0.6);
          }
          p {
            height: 36px;
            line-height: 36px;
            padding: 0 8px 0 16px;
          }
          p.form_label {
            width: 144px;
            text-align: right;
            background: #f2f6f9;
            border-right: 1px solid rgba(217, 217, 217, 0.6);
          }
          p.form_value {
            width: calc(100% - 144px);
            justify-self: start;
          }
        }
      }
    }
  }
}
</style>

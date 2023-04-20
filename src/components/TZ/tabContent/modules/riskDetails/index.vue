<template>
  <div class="element-detail__wrap" v-loading="loading">
    <div class="element-detail__content">
      <el-empty mode="hard" v-if="storeRow == null"></el-empty>
      <template v-else>
        <template v-for="(item, key) in modelOptions">
          <el-row
            v-if="item.isEnable"
            :key="key"
            :style="'order:' + item.orderSort"
          >
            <!-- 风险等级 -->
            <riskHead
              v-if="key === 'riskLevel'"
              :options="item"
              v-model:checkRow="checkRow"
            />

            <!-- 风险报告 -->
            <riskReport
              v-else-if="key === 'fileRisk' && !riskIsEmpty()"
              :options="item"
            ></riskReport>

            <!-- 交互详情 -->
            <responseInfo
              v-else-if="key === 'responseInfo'"
              :options="modelOptions.responseInfo"
            />

            <!-- 风险类型 -->
            <template v-else-if="key === 'riskType'">
              <el-panel
                shadow="never"
                theme="border-left"
                :title="item.title"
                :border="false"
              >
                <riskType :options="item"></riskType>
              </el-panel>
            </template>
            <!-- 来源模块/威胁标签/威胁组织 -->
            <template
              v-else-if="
                ['attackFrom', 'threatOrg', 'threatLabel'].includes(key) &&
                storeRow[item.field] &&
                (typeof storeRow[item.field] === 'string'
                  ? true
                  : storeRow[item.field].length > 0)
              "
            >
              <el-panel
                shadow="never"
                theme="border-left"
                :title="item.title"
                :border="false"
              >
                <tags
                  :data="
                    typeof storeRow[item.field] === 'string'
                      ? [storeRow[item.field]]
                      : storeRow[item.field]
                  "
                  :options="item"
                />
              </el-panel>
            </template>

            <!-- 漏洞介绍 -->
            <!-- 处置建议 -->
            <!-- 载荷信息 -->
            <template
              v-else-if="
                ['vulnDescript', 'vulnSolution', 'payload'].includes(key) &&
                payloadIsEmpty(item.field)
              "
            >
              <el-panel
                shadow="never"
                theme="border-left"
                :title="item.title"
                :border="false"
              >
                <payload :options="item"></payload>
              </el-panel>
            </template>

            <!-- 用户标签 -->
            <template v-else-if="key === 'userTag' && useUsertag()">
              <el-panel
                shadow="never"
                theme="border-left"
                :title="item.title"
                :border="false"
              >
                <sideTags :options="item" v-model:checkRow="checkRow" />
              </el-panel>
            </template>

            <!-- 数据详情 -->
            <el-panel
              v-else-if="key === 'dataDetails'"
              shadow="never"
              theme="border-left"
              :title="item.title"
              :border="false"
            >
              <dataDetails :options="item" v-loading.sync="loading" />
            </el-panel>
          </el-row>
        </template>
        <!-- 自定义模块插槽 -->
        <slot name="custom" :row="storeRow"></slot>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import tags from "@COMP/TZ/tags";
import riskHead from "./modules/riskHead";
import sideTags from "./modules/sideTags";
import dataDetails from "@COMP/TZ/tabContent/modules/riskDetails/modules/dataDetails/index.vue";
export default {
  name: "riskDetails",
  components: {
    // 标签
    tags,
    // 侧边栏用户标签
    sideTags,
    // 数据详情
    dataDetails,
    riskHead,
    // 会话详情
    responseInfo: () => import("./modules/responseInfo/index.vue"),
    // 风险类型
    riskType: () => import("./modules/riskType"),
    // 风险报告
    riskReport: () => import("./modules/riskReport"),
    // 载荷信息
    payload: () => import("./modules/payload"),
  },
  props: {
    // checkRow: {
    //   type: Object,
    //   default() {
    //     return null;
    //   },
    // },
    options: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      checkRow: {},
      loading: false,
      moduleOptions: {
        attackFrom: { isEnable: false, title: "来源模块", field: "attackfrom" },
        riskLevel: {
          isEnable: true,
          title: "风险等级",
          btns: [{ field: "base_exportData" }],
        },
        // riskType: {
        //     title: '风险类型',
        //     options: [
        //         { field: 'ismmfj', title: '木马附件', icon: 'icon-trojan-mail', isJump: true, isCheck: false, url: '/TZ/RiskTrojanEml/EnclosureRecord' },
        //         { field: 'isdyyj', title: '钓鱼邮件', icon: 'icon-eml-fish', isJump: true, isCheck: false, url: '/TZ/PhishingMail/RiskFishEml' },
        //         //{ field: 'iskzgj', title: '跨站邮件', icon: 'icon-cross-mail', isJump: true, url: '/TZ/PhishingMail/RiskCrossEml' },
        //         //{ field: 'iseywl', title: '恶意外链', icon: 'icon-malicious-chain', isJump: true, url: '/TZ/Eml/EmlLink' },
        //         //{ field: 'issmfj', title: '涉密附件', icon: 'icon-secret-mail', isJump: true, url: '/TZ/Eml/AttachementList' },
        //         //{ field: 'iskyfj', title: '可疑附件', icon: 'icon-suspicious-mail', isJump: true, url: '/TZ/Eml/AttachementList' },
        //         { field: 'iswzfj', title: '发件人伪造', icon: 'icon-sender-forgery', isCheck: false, isJump: false },
        //         //{ field: 'isspam', title: '垃圾邮件', icon: 'icon-junk-mail', isJump: false },
        //         { field: 'iswrongtime', title: '时间错误', icon: 'icon-wrong-time', isCheck: false, isJump: false },
        //     ]
        // },
        threatOrg: {
          isEnable: true,
          title: "威胁组织",
          field: "aptname",
          type: "danger",
        },
        threatLabel: {
          isEnable: true,
          title: "威胁标签",
          field: "risktag",
          type: "danger",
        },
        userTag: {
          useBtn: true, // 是否使用按钮
          isEnable: true, // 是否启用
          isHide: false, // 是否隐藏
          title: "用户标签",
          field: "usertag",
          round: false,
          closable: true,
        },
        fileRisk: { isEnable: false, title: "附件风险分析", field: "filerisk" },
        payload: {
          isEnable: false,
          title: "载荷信息",
          field: ["payload", "attackpayload"],
        },
        //交互详情
        responseInfo: {
          isEnable: false,
          title: "交互详情",
          switchBtn: { isHide: false }, //是否启用切换
        },
        dataDetails: {
          isEnable: true,
          title: "数据详情",
          useApi: false, // 是否使用接口返回的数据
          useAdd: true, // 是否使用 快捷添加
          // 自定义字段映射值
          fieldTemplate: [
            // {
            //     field: 'taskstate',
            //     map: {
            //         "不分析": "5",
            //         "分析完成": "2",
            //         "未分析": "0|6",
            //         "准备分析": "0|6",
            //         "正在分析": "1|10",
            //         "重置分析": "1|10",
            //         "分析失败": "3|4|7|31|32|33",
            //         "文件不存在": "3|4|7|31|32|33",
            //         "文件过大": "3|4|7|31|32|33",
            //         "获取文件错误": "3|4|7|31|32|33",
            //         "分析超时": "3|4|7|31|32|33",
            //         "内部错误": "3|4|7|31|32|33"
            //     }
            // }
          ],
        },
        vulnDescript: {
          isEnable: false,
          title: "漏洞介绍",
          field: "vuln-descript",
        },
        vulnSolution: {
          isEnable: false,
          title: "处置建议",
          field: "vuln-solution",
        },
      },
    };
  },
  computed: {
    ...mapState({ storeRow: (state) => state.tabContent.row }),
    modelOptions() {
      let ob = {};
      Object.keys(this.moduleOptions).forEach((key, index) => {
        let model = JSON.parse(JSON.stringify(this.moduleOptions[key]));
        if (this.options && this.options[key]) {
          model = { ...model, ...this.options[key] };
        }
        // 每个模块需要一个排序索引
        model.orderSort = (index + 1) * 5;
        ob[key] = model;
      });

      return ob;
    },
  },
  methods: {
    /**
     * 附件风险 数据是否为空
     */
    riskIsEmpty() {
      return !this.storeRow["staticfilerisk"] && !this.storeRow["filerisk"];
    },

    /**
     * 载荷/漏洞介绍/处置建议 是否有值
     */
    payloadIsEmpty() {
      //   const data = this.storeRow;
      // if (typeof field === 'string') {
      //     return data.hasOwnProperty(field) && data[field];
      // } else {
      //     let hasValue = field.some(d => data.hasOwnProperty(d) && data[d])
      //     return hasValue
      // }

      return true;
    },

    /**
     * 是否启用了用户标签
     */
    useUsertag() {
      let result = this.storeRow && this.storeRow["usertag"];
      if (!this.modelOptions.userTag.isEnable) {
        return false;
      }
      if (result) {
        if (!result.length && !this.modelOptions.userTag.useBtn) return false;
        return true;
      }
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.element-detail__wrap {
  .element-detail__content {
    height: 100%;
    margin: 0 -8px;
    padding: 0 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    &::-webkit-scrollbar {
      width: 4px;
    }
  }
  :deep(.el-panel) {
    .el-header-pro {
      height: 32px;
      .el-header-pro__content {
        width: 100%;
        padding: 0 12px;
        font-weight: bold;
        border: none;
        position: relative;
      }
    }
    .el-panel__body {
      padding: 0;
      .element-tags__content {
        padding-top: 8px;
        max-height: 160px;
        overflow-y: auto;
        .el-tag {
          margin-bottom: 8px;
        }
      }
    }
  }
}

.title-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  i + i {
    margin-left: 5px;
    padding-left: 5px;
  }
}

.title-group i {
  font-weight: normal;
  font-size: 16px;
  cursor: pointer;
}
</style>

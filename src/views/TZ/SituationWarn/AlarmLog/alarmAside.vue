<template>
  <div class="alarmLogAside" v-loading="loading">
    <div class="tree_head">
      <i class="iconfont icon-sql-server"></i>
      <span>{{ formatAssetIp(assetJson.ip) }}</span>
    </div>
    <!-- 资产类型 -->
    <div
      class="aside_card"
      v-if="Array.isArray(jumpData.types) && jumpData.types.length"
    >
      <div class="card_title">
        <span>资产类型</span>
      </div>
      <div class="card_body types">
        <div v-for="(item, index) in jumpData.types" :key="index">
          <span>{{ item }}</span>
        </div>
      </div>
    </div>
    <!-- 攻击类型 -->
    <div
      class="aside_card"
      v-if="Array.isArray(jumpData.attacktype) && jumpData.attacktype.length"
    >
      <div class="card_title">
        <span>攻击类型</span>
      </div>
      <div class="card_body attacktype">
        <div v-for="(item, index) in jumpData.attacktype" :key="index">
          <span>{{ item }}</span>
        </div>
      </div>
    </div>
    <!-- 资产标签 -->
    <!--<div class="asset-panel content-plane">
                <div class="card_title">
                    <span>资产标签</span>
                </div>
                <div class="asset-panel-content" data-field="assettag"></div>
            </div> -->
    <!-- 所属分组 -->
    <div class="aside_card">
      <div class="card_title">
        <span>所属分组</span>
      </div>
      <div class="card_body group_select">
        <el-select v-model="groupPick" @change="setGroup" placeholder="请选择">
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.groupname"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- 备注 -->
    <div class="aside_card">
      <div class="card_title" style="padding-right: 0">
        <span>备注</span>
        <el-button
          is-icon
          title="编辑备注"
          @click="remarkEditTrigger"
          icon="iconfont icon-remark-edit"
        ></el-button>
      </div>
      <div class="card_body remark">
        <el-input
          type="textarea"
          ref="remarkEdit"
          :readonly="!remarkEdit"
          :maxlength="200"
          show-word-limit
          placeholder="请输入不超过200字的备注，移出输入区域则保存备注"
          @change="remarkChange"
          v-model.trim="remark"
        >
        </el-input>
      </div>
    </div>
    <!-- 资产详情 -->
    <div class="aside_card asset_info_card">
      <div class="card_body asset_info">
        <ul>
          <li v-for="item in assetInfoCol" :key="item.field">
            <div class="assetDetail-name">{{ item.name }}</div>
            <!-- 开放端口、服务协议等 -->
            <div
              class="assetDetail-value"
              v-if="
                [
                  'ports',
                  'group',
                  'serverprotocol',
                  'vlanid',
                  'mplslabel',
                ].includes(item.field) && Array.isArray(jumpData[item.field])
              "
            >
              {{ jumpData[item.field].join(",") }}
            </div>
            <!-- 网段管理 -->
            <div
              class="assetDetail-value asset_list"
              v-else-if="item.field == 'assetList'"
            >
              <span
                class="ellipsis"
                v-for="item in cAssets"
                @click="assetsDetails(item)"
                :key="item.indexid"
                >{{ item.ip }}</span
              >
            </div>
            <!-- 关联账号 -->
            <div
              class="assetDetail-value account"
              v-else-if="item.field == 'account'"
            >
              <div
                class="accountIndex"
                v-for="(item, index) in jumpData.extInfo || []"
                :key="index"
              >
                <div class="accountName">
                  <p>账号协议</p>
                  <p class="ellipsis" :title="item.accounttype">
                    {{ item.accounttype }}
                  </p>
                </div>
                <div class="accountList">
                  <p>账号列表</p>
                  <p class="ellipsis" :title="(item.account || []).join('、')">
                    {{ (item.account || []).join("、") }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="assetDetail-value">
              {{
                jumpData[item.field] || jumpData[item.field] == "0"
                  ? jumpData[item.field]
                  : "-"
              }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {
  postAssetInfo,
  postAssetExInfo,
  postGroupSelect,
  setAssetGroup,
  setAssetRemark,
} from "@/api/TZ/AlarmLog.js";
import { isArray } from "@LIB/validate.js";
import { setSessionParam } from "@PAGE/platform.js";
import moment from "moment";
export default {
  name: "alarmLogAside",
  props: {
    assetJson: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      jumpData: {},
      // 所属分组
      groupPick: "",
      loading: false,
      groupList: [],
      // 备注
      remarkEdit: false,
      remark: "",
      // 资产详情
      assetInfoCol: [
        { name: "开放端口", field: "ports" },
        { name: "MAC", field: "mac" },
        { name: "VLAN", field: "vlanid" },
        { name: "MPLS", field: "mplslabel" },
        { name: "国家", field: "ipcountry" },
        { name: "IP协议类型", field: "iptype" },
        { name: "最近更新时间", field: "time" },
        { name: "最早识别时间", field: "detecttime" },
        { name: "网段管理", field: "assetList" },
        { name: "关联账号", field: "account" },
        { name: "服务协议", field: "serverprotocol" },
      ],
      cAssets: [], // 网段管理
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      const data = { assetIp: this.assetJson.ip };
      postAssetInfo(data)
        .then((res) => {
          if (JSON.stringify(res) == "{}") {
            this.$message.error("资产已被删除！");
            this.$emit("update:assetJson", null);
          } else {
            //有资产信息，再做进一步资产信息查询
            this.jumpData = this.$lodash.merge(res.data, this.assetJson);
            this.groupPick = Number(this.jumpData.groupid) || "";
            this.remark = this.jumpData.remark;
            //获取资产额外信息
            this.postAssetExInfo();
            //获取资产分组信息
            this.postGroupSelect();
          }
          localStorage.removeItem("assetJumpSession");
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    setGroup(group) {
      setAssetGroup({
        groupId: group,
        ids: [this.jumpData.indexid],
      })
        .then(() => {
          this.$message.success("分组设置成功");
          this.jumpData.groupid = group;
        })
        .catch(() => {
          this.groupPick = Number(this.jumpData.groupid);
        });
    },
    remarkEditTrigger() {
      this.remarkEdit = !this.remarkEdit;
      if (this.remarkEdit) this.$refs.remarkEdit.focus();
    },
    remarkChange() {
      setAssetRemark({
        params: JSON.stringify({
          conditions: [
            {
              field: "_id",
              value: this.jumpData.indexid,
              op: "equal",
            },
          ],
          indexName: "inf-asset,inf-asset-event-log",
          //indexName: "inf-asset-center,inf-alarm-center-event-log",
          doc: {
            remark: this.remark,
          },
        }),
      })
        .then(() => {
          this.$message.success("备注修改成功！");
          this.jumpData.remark = this.remark;
        })
        .catch(() => {
          this.remark = this.jumpData.remark;
        });
    },
    async assetsDetails({ ip }) {
      //设置跳转条件
      var assetIp = ip,
        sTime = moment()
          .subtract(30, "day")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
        eTime = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        jumptime = sTime + " - " + eTime,
        fieldArray = [
          {
            conds: [
              {
                connector: "or",
                field: "sip",
                leftText: "",
                op: "equal",
                rightText: "",
                value: assetIp,
              },
              {
                connector: "and",
                field: "dip",
                leftText: "",
                op: "equal",
                rightText: "",
                value: assetIp,
              },
            ],
          },
          {
            field: "@createtime",
            op: "range",
            value: jumptime,
            connector: "and",
          }, //告警日志只支持查最近30天数据
        ],
        conditionParam = {
          isJson: true,
          type: "_blank",
          sessionName: "paramListSession",
          url: "/TZ/SituationWarn/AlarmLog",
          data: {
            expression: "",
            conditions: fieldArray,
          },
        };
      //设置标识，确保资产告警页面展示资产详情
      localStorage.setItem("assetJumpSession", JSON.stringify({ ip: assetIp }));
      //跳转
      setSessionParam(conditionParam);
    },
    postAssetExInfo() {
      const data = this.jumpData;
      postAssetExInfo({
        assetip: data.ip,
        id: data.indexid || "",
        vlanid:
          data.vlanid && Array.isArray(data.vlanid)
            ? data.vlanid.join(",")
            : [],
        mplslabel:
          data.mplslabel && Array.isArray(data.mplslabel)
            ? data.mplslabel.join(",")
            : [],
      }).then((res) => {
        this.cAssets = res.data?.cAssets ?? [];
      });
    },
    postGroupSelect() {
      postGroupSelect({ id: 1 }).then((res) => {
        this.groupList = res.data;
      });
    },
    formatAssetIp(assetIp) {
      return isArray(assetIp) ? assetIp[0] : assetIp;
    },
  },
};
</script>

<style lang="scss" scoped>
.alarmLogAside {
  margin: 16px 0 16px 16px;
  height: calc(100% - 32px);
  @include cardStyle;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  .tree_head {
    color: #262626;
    padding-left: 14px;
    height: 40px;
    margin: 0;
    display: flex;
    align-items: center;
    background-color: #f2f6f9;
    flex-shrink: 0;
    i {
      font-size: 18px;
      margin-right: 4px;
    }
    span {
      color: #262626;
      font-size: 18px;
      font-family: "QuartzBold";
    }
  }
  .aside_card {
    margin: 8px 15px 0;
    .card_title {
      @include cardTitle($height: 32px);
      margin-bottom: 4px;
      span {
        margin-left: 5px;
      }
      i {
        font-weight: normal;
      }
    }
    .card_body {
      padding-top: 5px;
    }
    .card_body.types,
    .card_body.attacktype {
      max-height: 66px;
      padding-right: 5px;
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      > div {
        color: $yellow;
        padding: 5px 10px;
        display: inline-block;
        border: 1px solid $yellow;
        background: rgba(246, 163, 27, 0.08);
      }
    }
    .card_body.group_select {
       :deep(.el-select ){
        .el-input__inner:hover,
        .el-input__inner:focus,
        .el-input.is-focus .el-input__inner {
          border-color: transparent;
        }
      }
    }
    .card_body.remark {
       :deep(.el-textarea ){
        max-height: 300px;
        .el-textarea__inner {
          padding: 8px;
          min-height: initial !important;
        }
        .el-textarea__inner:hover,
        .el-textarea__inner:focus {
          border-color: transparent;
        }
      }
    }
    .card_body.asset_info {
      height: 100%;
      overflow-y: auto;
      padding: 8px 3px 15px 10px;
      ul {
        display: grid;
        gap: 16px 0;
        li {
          display: grid;
          gap: 0 8px;
          min-width: 0;
          grid-template-columns: 84px auto;
          .assetDetail-name {
            text-align: right;
          }
          .asset_list {
            display: grid;
            grid-template-columns: 50% 50%;
            grid-auto-rows: 20px;
            align-items: center;
            max-height: 70px;
            overflow: auto;
            span {
              cursor: pointer;
              text-decoration: underline;
            }
          }
          .account {
            display: flex;
            flex-direction: column;
            gap: 8px 0;
            min-width: 0;
            .accountIndex {
              display: flex;
              gap: 0 10px;
              > div {
                flex: 1;
                min-width: 0;
              }
              .accountName {
                max-width: 60px;
                padding-right: 10px;
                border-right: 1px solid #d9d9d9;
              }
            }
          }
        }
      }
    }
  }
  .aside_card.asset_info_card {
    flex: 1;
    overflow: hidden;
    margin-left: 0;
    margin-right: 0;
    padding-top: 5px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>

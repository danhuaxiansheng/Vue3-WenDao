<template>
  <div
    class="asset_info_card element-page__scroll"
    ref="cardContainer"
    :key="resKey"
  >
    <ul v-if="dataList.length">
      <li v-for="item in dataList" :key="item.indexid">
        <h4 class="card_title">
          <el-checkbox
            v-show="operate"
            v-model="item.checked"
            @change="setCheckedList"
          >
          </el-checkbox>
          <svg-icon
            :title="item.risklevel"
            :href="`icon-${
              { 高: 'high', 危: 'middle', 疑: 'low' }[item.risklevel]
            }-risk`"
          >
          </svg-icon>
          <p class="item_pop ellipsis">
            <el-popover placement="bottom-start" width="340" trigger="hover">
              <div class="pop_content element-page__scroll">
                <template v-for="v in popList">
                  <div class="pop-plane" v-if="item[v.field]" :key="v.field">
                    <div class="panel-title">{{ v.name }}</div>
                    <!-- 攻击类型 -->
                    <div
                      class="panel-content tag"
                      v-if="v.field == '_attacktype'"
                    >
                      <p
                        class="ellipsis"
                        v-for="(v, i) in item._attacktype"
                        :key="i"
                        :title="v"
                      >
                        {{ v }}
                      </p>
                    </div>
                    <!-- 关联邮箱 -->
                    <div
                      class="panel-content eml"
                      v-else-if="v.field == '_relationemails'"
                    >
                      <p v-for="(v, i) in item._relationemails" :key="i">
                        {{ v }}
                      </p>
                    </div>
                    <!-- 关联账号 -->
                    <div
                      class="panel-content account"
                      v-else-if="v.field == '_account'"
                    >
                      <div
                        class="account_item"
                        v-for="(p, q) in item._account"
                        :key="q"
                      >
                        <div class="accountName">
                          <p>账号协议</p>
                          <p class="ellipsis" :title="p.accounttype">
                            {{ p.accounttype }}
                          </p>
                        </div>
                        <div class="accountList">
                          <p>账号列表</p>
                          <p class="ellipsis" :title="p.account">
                            {{ p.account }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <!-- 其他 -->
                    <div class="panel-content" v-else>{{ item[v.field] }}</div>
                  </div>
                </template>
              </div>
              <!-- <span slotslot="reference"
                                @click="assetDetail(item)">{{item.ip}}</span> -->
            </el-popover>
            <span v-if="item.groupname" :title="`分组：${item.groupname}`"
              >（{{ item.groupname }}）</span
            >
          </p>
          <i
            class="iconfont icon-setting"
            :key="menuKey"
            v-menu="{ ...menuOptions, targetData: { ...item } }"
          ></i>
        </h4>
        <div class="card_content">
          <el-tooltip
            :content="(item.types || []).join('、')"
            effect="light"
            popper-class="element-arrow_tooltip"
          >
            <p class="item_types ellipsis">
              {{ (item.types || []).join("、") }}
            </p>
          </el-tooltip>
          <p>发现时间：{{ item.detecttime }}</p>
          <p>
            拓扑互联：<i
              @click="assetTuopu(item)"
              class="iconfont icon-topo"
            ></i>
          </p>
        </div>
      </li>
    </ul>
    <el-empty v-else></el-empty>
    <asset-note ref="assetNote"></asset-note>
    <asset-tuopu ref="tuopu"></asset-tuopu>
  </div>
</template>

<script>
import moment from "moment";
import { delAsset, setAssetGroup } from "@API/TZ/AssetCenter.js";
import { setSessionParam } from "@PAGE/platform.js";
export default {
  name: "assetCard",
  props: {
    resData: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    dataList: [],
    operate: false,
    popList: [
      { name: "攻击类型", field: "_attacktype", type: "arr" },
      { name: "备注", field: "_remark" },
      { name: "开放端口", field: "_ports" },
      { name: "关联邮箱域", field: "_relationemails", type: "arr" },
      { name: "关联账号", field: "_account", type: "arr" },
    ],
    menuOptions: {},
    menuKey: null, // 节点更新时重新初始化右键菜单
  }),
  created() {
    // 初始化选中卡片
    this.$store.commit("tz/set_checke_list", []);
    // 接收批量操作状态参数
    this.$bus.$on("setOperate", (operate) => {
      this.operate = operate;
    });
    // this.$once("hook:beforeDestroy", () => {
    //   this.$bus.$off("setOperate");
    //   this.$store.commit("tz/set_checke_list", []);
    // });
  },
  mounted() {
    this.buildList();
    this.getMenuOptions();
  },
  methods: {
    // 获取节点数据
    getMenuOptions() {
      let menuTree = this.buildMenuTree([this.$store.state.tz.treeNodes]);
      this.menuKey = Symbol();
      this.menuOptions = {
        asideNode: true, // true：菜单依据节点的位置定位; false： 菜单依赖事件源的位置定位。
        parentNodeCanBeChoosed: true, // 父节点是否可选
        scrollHideContainer: this.$refs.cardContainer, // 滚动容器，发生滚动时关闭菜单，默认body
        menu: [
          { name: "资产备注", action: "note" },
          {
            name: "分组",
            action: "setting",
            noSelect: true,
            children: menuTree,
          }, // noSelect: 当前菜单不可选
          { icon: "el-icon-setting", name: "删除资产", action: "del" },
        ],
        callback: this.menuSelect, // 选择菜单的回调
      };
    },
    buildMenuTree(list) {
      let menuList = JSON.parse(JSON.stringify(list));
      return menuList.map((item) => {
        let group = [];
        if (item.children?.length) {
          group = this.buildMenuTree(item.children);
        }
        return { name: item.groupname, action: item.id, group };
      });
    },
    menuSelect(target, menu, item) {
      switch (menu) {
        case "note":
          this.noteInMenu(target);
          break;
        case "del":
          this.delInMenu(target);
          break;
        default:
          this.groupInMenu(target, menu, item);
      }
    },
    // 资产备注
    noteInMenu(data) {
      this.$refs.assetNote.init(data);
    },
    // 删除资产
    delInMenu(data) {
      this.$confirm(`资产将被永久删除，是否继续？`, "警告", {
        customClass: "wd_dailog",
        closeOnClickModal: false,
        type: "warning",
      }).then(() => {
        delAsset({
          ids: data.indexid,
        }).then(() => {
          this.$message.success("删除成功！");
          this.$bus.$emit("updateAssetTable");
        });
      });
    },
    // 资产分组
    groupInMenu(data, groupId, item) {
      setAssetGroup({
        groupId: groupId,
        ids: data.indexid,
      }).then((res) => {
        if (res.status == 200) {
          this.$message.success("分组设置成功！");
          this.$bus.$emit("updateAssetItem", {
            indexid: data.indexid,
            changes: [
              { key: "groupid", value: groupId },
              { key: "groupname", value: item.name },
            ],
          });
          this.visible = false;
        }
      });
    },
    assetTuopu(targetItem) {
      this.$refs.tuopu.init(targetItem);
    },
    setCheckedList() {
      let lists = this.$lodash.unionWith(
        [],
        this.dataList.filter((item) => item.checked)
      );
      this.$store.commit("tz/set_checke_list", lists);
    },
    // 跳转到资产详情
    assetDetail(dataObj) {
      let startTime = moment()
          .subtract(30, "day")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
        endTime = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
        jumptime = startTime + " - " + endTime,
        fieldArray = [
          {
            conds: [
              {
                connector: "or",
                field: "sip",
                leftText: "",
                op: "equal",
                rightText: "",
                value: dataObj.ip,
              },
              {
                connector: "and",
                field: "dip",
                leftText: "",
                op: "equal",
                rightText: "",
                value: dataObj.ip,
              },
            ],
          },
          //告警日志只支持查最近30天数据
          {
            field: "@createtime",
            op: "range",
            value: jumptime,
            connector: "and",
          },
        ];

      let conditionParam = {
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
      localStorage.setItem("assetJumpSession", JSON.stringify(dataObj));
      //跳转
      setSessionParam(conditionParam);
    },
    buildList() {
      this.$store.commit("tz/set_checke_list", []);
      this.dataList = this.resData.map((item) => {
        let _item = {};
        this.popList.forEach((v) => {
          let key = v.field.slice(1),
            val = item[key];
          if (v.type == "arr" && val) {
            if (!Array.isArray(val)) {
              _item[v.field] = [val];
            } else if (Array.isArray(val) && !val.length) {
              _item[v.field] = null;
            } else {
              _item[v.field] = val;
            }
          } else {
            _item[v.field] = Array.isArray(val) ? val.join(",") : val;
          }
          if (key == "account" && _item._account?.length) {
            _item._account.map((item) => {
              item.account = item.account || [];
              if (item.account && Array.isArray(item.account))
                item.account = item.account.join("、");
            });
          }
        });
        return this.$lodash.merge({ checked: false }, item, _item);
      });
    },
  },
  watch: {
    resData: {
      deep: true,
      handler() {
        this.buildList();
      },
    },
    "$store.state.tz.treeNodes": {
      deep: true,
      handler() {
        this.getMenuOptions();
      },
    },
  },
  computed: {
    resKey() {
      return Symbol(JSON.stringify(this.resData));
    },
  },
  components: {
    assetNote: () => import("./assetNote.vue"),
    assetTuopu: () => import("./../comps/assetTuopu.vue"),
  },
};
</script>

<style lang="scss" scoped>
.asset_info_card {
  padding: 16px 12px 12px 14px;
  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px 12px;
    @media screen and (min-width: 1700px) {
      & {
        grid-template-columns: repeat(5, 1fr);
      }
    }
    li {
      min-width: 0;
      height: 175px;
      border: 1px solid $lineColor;
      h4 {
        padding: 8px 10px;
        border-bottom: 1px solid $lineColor;
        display: flex;
        align-items: center;
        .svg-icon {
          margin-left: 4px;
        }
        p.item_pop {
          flex: 1;
          min-width: 0;
          display: inline-block;
          vertical-align: middle;
          margin-left: 5px;
          cursor: pointer;
          span:first-child {
            color: $highColor;
            font-weight: bold;
            text-decoration: underline;
          }
        }
        .icon-setting {
          line-height: 24px;
          color: $mainColor;
        }
      }
      .card_content {
        padding: 15px;
        p {
          line-height: 26px;
          color: $mainColor;
          .icon-topo {
            cursor: pointer;
            font-size: 18px;
          }
        }
        p.item_types {
          display: inline-block;
          max-width: 100%;
        }
      }
    }
  }
}
.pop_content {
  max-height: 300px;
  padding: 16px 16px 8px;
  .pop-plane {
    margin-bottom: 8px;
    &:not(:last-of-type) {
      border-bottom: 1px solid $lineColor;
    }
    .panel-title {
      font-weight: bold;
    }
    .panel-content {
      margin: 8px 0;
      &.tag {
        display: flex;
        flex-wrap: wrap;
        max-height: 74px;
        overflow: auto;
        p {
          background: rgba(246, 163, 27, 0.08);
          border: 1px solid #f6a31b;
          padding: 4px 8px;
          margin: 0 8px 8px 0;
          color: #f6a31b;
          max-width: 120px;
        }
      }
      &.account {
        .account_item {
          display: flex;
          margin-bottom: 8px;
          .accountName {
            max-width: 100px;
            flex-shrink: 0;
            padding-right: 8px;
            border-right: 1px solid #d9d9d9;
          }
          .accountList {
            min-width: 0;
            flex-grow: 1;
            padding-left: 8px;
          }
        }
      }
    }
  }
}
</style>

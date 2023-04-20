<template>
  <div class="asset_info_table">
    <format-table
      :data="resData"
      border
      height="100%"
      stripe
      :cloumns="cloumns"
      @selection-change="setCheckedList"
    >
      <template v-slot:opreate="{ scope }">
        <div class="opreate_btns">
          <i
            class="iconfont icon-view-details"
            title="详情"
            @click="detailShow(scope.row)"
          ></i>
          <i
            class="iconfont icon-edit"
            title="编辑"
            @click="editAsset(scope.row)"
          ></i>
          <i
            class="iconfont icon-delete"
            title="删除"
            @click="delAsset(scope.row)"
          ></i>
          <i
            v-if="tabActive == 'otherEquipment'"
            class="iconfont icon-more-dot"
            v-menu="{ ...menuOptions, targetData: { ...scope.row } }"
          ></i>
        </div>
      </template>
    </format-table>
    <asset-tuopu ref="tuopu"></asset-tuopu>
    <asset-detail ref="detail"></asset-detail>
    <asset-edit ref="assetEdit"></asset-edit>
  </div>
</template>

<script>
import moment from "moment";
import pageSettings from "../../modules/pageSettings-asset.js";
import { delAsset } from "@API/TZ/AssetCenter.js";
import { setSessionParam } from "@PAGE/platform.js";

export default {
  name: "assetTable",
  props: {
    tabActive: {
      type: String,
      required: true,
    },
    resData: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    cloumns: [],
    menuOptions: {},
    detailData: {},
  }),
  created() {
    // 初始化选中卡片
    this.$store.commit("tz/set_checke_list", []);
    // this.$once('hook:beforeDestroy', () => {
    //     this.$store.commit('tz/set_checke_list', []);
    // });
    this.getColumns();
    this.menuOptions = {
      asideNode: true,
      scrollHideContainer: ".el-table__body-wrapper",
      menu: [
        { name: "告警日志", fn: this.warningDiary },
        { name: "资产拓扑", fn: this.assetTuopu },
      ],
    };
  },
  methods: {
    // 获取表格列配置
    getColumns() {
      this.cloumns = pageSettings
        .getColumns(this.tabActive)
        .filter((item) => item.ischecked);
    },
    // 设置表格选中项
    setCheckedList(list) {
      let lists = this.$lodash.unionWith([], list);
      this.$store.commit("tz/set_checke_list", lists);
    },
    assetTuopu(targetItem) {
      this.$refs.tuopu.init(targetItem);
    },
    // 资产日志
    warningDiary(dataObj) {
      //设置跳转条件
      var sTime = moment().subtract(30, "day").format("YYYY-MM-DD HH:mm:ss"),
        eTime = moment().format("YYYY-MM-DD HH:mm:ss"),
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
            ], //"192.168.18.20"
          },
          //告警日志只支持查最近30天数据
          {
            field: "@createtime",
            op: "range",
            value: jumptime,
            connector: "and",
          },
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
      localStorage.setItem("assetJumpSession", JSON.stringify(dataObj));
      //跳转
      setSessionParam(conditionParam);
    },
    // 删除资产
    delAsset(data) {
      this.$confirm(`资产将被永久删除，是否继续？`, "警告", {
        customClass: "wd_dailog",
        closeOnClickModal: false,
        type: "warning",
      }).then(() => {
        delAsset(
          {
            idList: JSON.stringify([data.indexid]),
            indexType: this.tabActive,
          },
          "/api/asset1126/assetDelete"
        ).then(() => {
          this.$message.success("删除成功！");
          this.$bus.$emit("updateAssetTable");
        });
      });
    },
    // 编辑资产
    editAsset(data) {
      this.$refs.assetEdit.init(data);
    },
    // 资产详情
    detailShow(data) {
      this.$refs.detail.init(data);
    },
  },
  watch: {
    resData: {
      deep: true,
      handler() {
        this.$store.commit("tz/set_checke_list", []);
      },
    },
  },
  components: {
    assetEdit: () => import("./addAsset.vue"),
    assetTuopu: () => import("./../comps/assetTuopu.vue"),
    assetDetail: () => import("./assetDetail.vue"),
  },
};
</script>

<style lang="scss" scoped>
.asset_info_table {
  padding: 0 16px;
  min-width: 0;
  min-height: 0;
  .opreate_btns {
    display: grid;
    grid-auto-flow: column;
    i {
      color: $highColor;
      cursor: pointer;
      font-size: 19px;
      text-align: center;
    }
  }
}
</style>

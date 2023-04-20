<template>
  <div class="layout" :class="{ has_aside: assetJson }">
    <alarm-aside
      class="alarm_aside"
      v-if="assetJson"
      v-model:assetJson="assetJson"
    />
    <page-layout
      class="page_layout"
      v-loading="loading"
      @rowClick="rowClick"
      layoutPro
      :searchbar="searchOptions"
      :toolbar="toolOptions"
      :tabConfig="tabConfig"
      :pageAsideLeft="!!assetJson"
      :gridbar="gridOptions"
      :layoutAsideLeft="!!assetJson"
    >
      <template v-slot:event_typeB="{ scope }">
        <tags
          :options="{ round: false }"
          class="table-tag"
          :data="scope.row.event_typeB ? [scope.row.event_typeB] : []"
        ></tags>
      </template>
      <template v-slot:attackfrom="{ scope }">
        <tags
          :options="{ round: false }"
          class="table-tag"
          :data="scope.row.attackfrom ? [scope.row.attackfrom] : []"
        ></tags>
      </template>
      <template v-slot:event_name="{ scope }">
        <div class="event-panle">
          <span class="ellipsis">{{ getEventName(scope.row) }}</span>
          <a @click.stop="eventDetails(scope.row)" title="更多描述">
            <i class="el-icon-pending"></i>
          </a>
        </div>
      </template>
      <template v-slot:action-column="{ scope }">
        <el-button
          class="iconfont icon-table-detail"
          @click.stop="handleClick(scope.row)"
          title="查看详情"
          is-icon
        ></el-button>
      </template>
    </page-layout>
    <el-dialog
      title="更多描述"
      v-model:visible="eventDialog"
      width="620px"
      @beforeClose="eventClose"
    >
      <div class="event_dialog_content">
        <el-panel
          v-show="risktag && risktag.length > 0"
          shadow="never"
          theme="border-left"
          title="威胁标签"
          :border="false"
        >
          <tags
            :options="{ className: 'noBorder', type: 'danger' }"
            :data="risktag"
          />
        </el-panel>
        <el-panel
          v-show="usertag && usertag.length > 0"
          shadow="never"
          theme="border-left"
          title="用户标签"
          :border="false"
        >
          <tags :options="{ className: 'usertag' }" :data="usertag" />
        </el-panel>

        <el-panel
          v-show="riskDetails && riskDetails.length > 0"
          shadow="never"
          theme="border-left"
          title="威胁摘要"
          :border="false"
        >
          <tags
            :options="{ className: 'noBorder', type: 'danger' }"
            :data="riskDetails"
          />
        </el-panel>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getTableData } from "@/api/TZ/index.js";
import { setSessionParam } from "@PAGE/platform.js";
export default {
  name: "AlarmLog",
  data() {
    return {
      // searchBar的查询条件
      searchOptions: {
        isEnable: true,
        time: {
          field: "@createtime",
          title: "入库时间",
          defualtOptions: "最近24小时",
          dateLimit: 30, // 30天范围内
          clearable: false,
          global: false, // 应用全局-功能按钮
        },
        // condition: {
        //     useExpression: false, // 禁用表达式
        // },
        tools: {
          collect: {
            isEnable: false,
          },
          history: {
            isEnable: false,
          },
        },
      },
      // toolbar参数
      toolOptions: {
        isEnable: true,
        primaryKey: "indexid",
        esDeleteUrl: "/api/search/batchDeleteSubTreasuryByUpdate", // ES 删除数据接口
        options: [
          { field: "base_addUserTag", useBtn: false },
          { field: "base_exportSelect" },
          { field: "base_more" },
          { field: "base_autoFresh", handler: this.refreshData },

          { field: "event_typeB", type: "eventType", class: "to_right" },
          { field: "risklevel", class: "to_right" },
        ],
      },
      // 表格参数
      gridOptions: {
        url: "/api/index/riskLogCommon",
        // 配置操作列
        actionColumn: {
          isEnable: true,
          fixed: "right",
          align: "center",
          label: "操作",
          width: "50",
          field: "action-column",
        },
        defaultSort: { prop: "@createtime", order: "descending" },
      },
      // 侧边栏配置
      tabConfig: {
        isEnable: true,
        options: {
          riskDetails: {
            isEnable: true,
            text: "数据详情",
            options: {
              riskLevel: { isEnable: false }, // 风险等级
              threatOrg: { isEnable: false }, // 威胁组织
              // threatLabel: { isEnable: true },// 威胁标签
              dataDetails: {
                isEnable: true,
                useApi: true, // 是否使用接口返回的数据
                useAdd: false, // 是否使用 快捷添加
              },
              attackFrom: { isEnable: true }, // 来源模块
              userTag: {
                isEnable: true, // 是否启用
                useBtn: false, // 是否使用按钮
              },
              // 载荷信息
              payload: { isEnable: true },
              vulnDescript: { isEnable: true },
              vulnSolution: { isEnable: true },
              // 附件风险
              fileRisk: { isEnable: true },
            },
          },
          dataFlow: { isEnable: true, text: "会话分析" },
        },
      },

      // 本页面变量
      loading: false,
      eventDialog: false,
      usertag: [],
      risktag: [],
      riskDetails: [],
      // 左侧边栏
      assetJson: null,
    };
  },
  created() {
    let assetStr = localStorage.getItem("assetJumpSession");
    // 从其他地方跳进来时有资产左侧边栏
    if (assetStr) {
      this.assetJson = JSON.parse(assetStr);
    }
  },
  methods: {
    refreshData() {
      // 重新加载条件 -不触发查询
      this.$store.state.plug.pageLayout.reloadTable();
    },
    /**
     * 调整详情界面
     */
    handleClick(row) {
      let params = [{ field: "time", value: "", op: "equal" }];
      row.attackurl &&
        setSessionParam({
          isJson: true,
          sessionName: "paramListSession",
          type: "_blank",
          url: row.attackurl,
          data: {
            conditions: params,
            expression: '{"query":{"term":{"_id":"' + row.sync_id + '"}}}',
          },
        });
    },
    rowClick(tableRow) {
      const rowParams = {
        params: JSON.stringify({
          conditions: [{ field: "_id", op: "equal", value: tableRow.sync_id }],
          indexName: tableRow.index, //row.index
          indexType: tableRow.index, //row.index
        }),
      };
      const cveParams = {
        cveId: tableRow.cve_id || "",
        eventTypeB: tableRow.event_typeB || "",
        eventTypeA: tableRow.event_typeA || "",
      };
      // 查询右侧数据详情
      // 查询事件库详情
      Promise.all([
        this.getSideData("/api/search/singleCommon", rowParams),
        tableRow.cve_id || tableRow.event_typeB || tableRow.event_typeA
          ? this.getSideData("/api/index/security/library", cveParams)
          : new Promise((resolve) => {
              resolve({});
            }),
      ]).then((res) => {
        let tabRow = res[0][0] || null;
        let eventRow = res[1] || null;
        if (eventRow) {
          // 设置事件库关联
          tableRow["vuln-descript"] = eventRow["descript"] ?? "";
          tableRow["vuln-solution"] = eventRow["solution"] ?? "";
        }
        const concatRow = { ...tableRow, ...tabRow };
        this.$store.commit("tabContent/setRow", concatRow);
      });
    },
    /**
     * 获取侧边栏数据
     */
    getSideData(url, params) {
      return new Promise((resolve, reject) => {
        getTableData({
          url: url,
          data: params,
          // 主要用于 防抖
          // clearCache 是否对相同请求进行覆盖（中断上一个请求）
          clearCache: true,
          // 标识 防止不同场景下的请求 被一并中断
          cacheName: "rowClick",
        })
          .then((res) => {
            let data = res.data;
            resolve(data);
          })
          .catch((res) => {
            // 手动中断上一个请求 不关闭遮罩
            if (res.name !== "abort") {
              this.loading = false;
            }
            reject(res);
          });
      });
    },
    getEventName(row) {
      var risktag = row["risktag"],
        description = row["event_name"];
      description = description ? [description.replace(/</g, "&lt;")] : [];
      let arr = description.concat(risktag);

      if (!arr.length) return "";

      // 存储威胁标签、用户标签、威胁摘要
      let text = arr.join("；").replace(/</g, "&lt;");

      return text;
    },
    eventClose() {
      this.eventDialog = false;
    },
    eventDetails(row) {
      let description = row["event_name"];
      description = description ? [description.replace(/</g, "&lt;")] : [];

      this.eventDialog = true;
      this.usertag = row.usertag;
      this.risktag = row.risktag;
      this.riskDetails = description;
    },
  },
  components: {
    pageLayout: () => import("@COMP/TZ/pageLayout"),
    alarmAside: () =>
      import("@/views/TZ/SituationWarn/AlarmLog/alarmAside.vue"),
    tags: () => import("@COMP/TZ/tags"),
  },
};
</script>

<style lang="scss" scoped>
.layout {
  height: 100%;
  width: 100%;
  &.has_aside {
    display: flex;
    .alarm_aside {
      flex-basis: 316px;
      min-width: 0;
    }
    .page_layout {
      flex: 1;
      min-width: 0;
    }
  }
}

.event-panle {
  display: flex;
  align-items: center;
}

.event-panle > span {
  padding-right: 30px;
}

.event-panle > a {
  line-height: 16px;
  margin-left: -30px;
}

.el-icon-pending {
  color: $highColor;
  cursor: pointer;
  font-size: 18px;
  margin-left: 3px;
}

.event_dialog_content {
  height: 348px;
  :deep(.el-panel) {
    .el-header-pro {
      height: 31px;
      .el-header-pro__content {
        font-weight: bold;
        padding: 0 8px;
        line-height: 1.2em;
      }
    }
    .el-panel__body {
      padding: 0;
    }
    & + .el-panel {
      margin-top: 0;
    }
    .element-tags__content {
      padding-top: 8px;
      .tag {
        margin: 0 8px 8px 0;
      }
    }
  }
}

.table-tag {
  display: flex;
  :deep(.el-tag) {
    margin: 0;
  }
}
</style>

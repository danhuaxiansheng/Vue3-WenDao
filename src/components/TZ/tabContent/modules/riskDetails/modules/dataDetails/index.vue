<template>
  <div>
    <!-- <el-skeleton :loading="columns.length===0||loading"
            :rows="6">
            <template slotslot="default"> -->
    <!-- 数据详情 -->
    <ul class="dataDetails-label">
      <li v-for="d in columns" :key="d.field">
        <span class="element-content__left" :title="d.name">{{ d.name }}</span>
        <span
          class="element-content__right"
          :title="formatValue(d.text)"
          :class="expandFields.includes(d.field) ? '' : 'ellipsis'"
        >
          {{ formatValue(d.text) }}
          <!-- 资产标记 -->
          <i
            v-if="isAssetsIps(d) && d.text != '-'"
            title="资产标记"
            class="iconfont icon-money"
            @click="assetsDetails(d)"
          ></i>
          <!-- 时区图 -->
          <el-button
            v-if="isTimeZone(d)"
            is-icon
            size="small"
            title="查看时区图"
            @click="showTimeZone(d)"
            style="color: #1a73e8"
            icon="iconfont icon-timezone"
          ></el-button>
        </span>
        <!-- 快捷功能栏 -->
        <screenMenu v-if="useScreen(d)" :data="d" />
      </li>
    </ul>
    <!-- </template>
        </el-skeleton> -->

    <!-- 时区图 -->
    <timeZone
      v-if="timeZoneVisable"
      :value="timeZoneValue"
      @close="timeZoneVisable = false"
    >
    </timeZone>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { isNullOrEmpty } from "@LIB/base.js";
import { getModuleField } from "@/api/TZ/index.js";
import { setSessionParam, linkAssets, formatPayload } from "@PAGE/platform.js";
export default {
  name: "dataDetails",
  components: {
    timeZone: () => import("./timeZone.vue"),
    screenMenu: () => import("./screenMenu"),
  },
  props: {
    options: {
      type: Object,
      required: true,
      default() {
        return {
          useAdd: true, // 是否支持快捷过滤
        };
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      //数据详情 - 字段配置
      fieldArr: [],
      // 默认配置
      defaultOptions: {
        isEnable: true, // 是否启用
        isShow: true, // 是否隐藏
        title: "数据详情", // 分组名称
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
      // 显示列
      columns: [],
      // loading: false,
      // 时区图展示
      timeZoneVisable: false,
      timeZoneValue: "",
      // 字段超长折叠
      expandFields: [
        "sha256",
        "domainmd5",
        "emlboxmd5",
        "dnsreq",
        "address",
        "dnsreqmd5",
        "h-req-data",
        "h-res-data",
        "h-req-url",
        "h-req-params",
        "attackpayload",
        "md5",
      ],
    };
  },
  computed: {
    ...mapGetters(["$searchBar", "pageinfo"]),
    ...mapState({
      storeRow: (state) => state.tabContent.row,
      // 查询栏 字段列--默认从接口请求 可以自定义配置
      searchBarColumns: (state) => state.searchBar.searchBarColumns || [],
      // 是否为动态风险
      dynamicEdition: (state) => state.user.baseLine == 3,
    }),
    // 合并之后的配置
    cancatOptions() {
      return { ...this.defaultOptions, ...this.options };
    },
  },
  watch: {
    storeRow: {
      deep: true,
      handler(oldVal, newVal) {
        // 数据更改时，加载遮罩
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          this.$emit("update:loading", true);
          this.init();
          setTimeout(() => {
            this.$emit("update:loading", false);
          }, 150);
        }
      },
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    /**
     * 初始化方法
     */
    init() {
      this.storeRow ? this.build() : this.clear();
    },

    /**
     * 构建列数据
     */
    build() {
      let pageId =
        (this.storeRow.attackpageid || this.pageinfo.pageId) + "Column";
      let storeColumns = localStorage.getItem(pageId);
      let columns = JSON.parse(storeColumns) || [];
      if (this.cancatOptions.useApi) {
        //使用显示列的字段进行展示
        if (columns && columns.length) {
          this.buildDataDetails(columns);
        } else {
          this.getColumnApi();
        }
      } else {
        // 使用searchbar的列
        this.buildDataDetails(this.searchBarColumns);
      }
    },

    /**
     * 清除列
     */
    clear() {
      this.columns = [];
    },
    /**
     * 是否使用快捷菜单栏
     */
    useScreen(d) {
      // 如果查询栏不支持查询
      if (!d.isCondition) {
        return false;
      }
      // 如果禁止展示按钮
      if (!d.showAdd) {
        return false;
      }
      return true;
    },

    /**
     * 构建数据详情
     */
    buildDataDetails(data) {
      let options = [];
      if (this.storeRow && data && data.length > 0) {
        data.forEach((item) => {
          let field = item.field;
          let value = this.storeRow[field] ?? "-";
          if (!this.filterFiled(field)) {
            let txt = this.getTxt(value);
            let showAdd = true;
            if (
              !this.options.useAdd ||
              txt == "-" ||
              (this.$searchBar.timeConfig.isEnable === true &&
                this.$searchBar.timeConfig.field === field) ||
              (typeof value === "object" && value.length > 1)
            ) {
              showAdd = false;
            }

            options.push({
              name: item.displayText || item.title,
              field: field,
              // 字段类型 用于反映射
              type: item.type,
              // 展示的映射值
              text: txt,
              // 真实值
              value: this.storeRow[field],
              // 是否展示过滤按钮
              showAdd: showAdd,
              // 是否支持查询
              isCondition: item.isCondition,
            });
          }
        });
      }
      this.columns = options;
    },

    /**
     * 获取数据详情-显示列
     */
    getColumnApi() {
      // 格式化字段
      const fieldTemplate = this.cancatOptions.fieldTemplate;
      const pageId = this.storeRow.attackpageid || this.pageinfo.pageId;
      // 获取 数据详情模块-显示列
      getModuleField({ pageId })
        .then((result) => {
          let newArr = [];
          result.data.forEach((item) => {
            if (item.hide || !item.field) return;

            let mapList = fieldTemplate.filter(function (obj) {
              return (
                obj.field.toLocaleLowerCase().trim() ==
                item.field.toLocaleLowerCase().trim()
              );
            });

            //对特殊字段进行处理 可以修改 title和map
            if (mapList.length) {
              mapList[0].title && (item.title = mapList[0].title);
              mapList[0].map && (item.map = mapList[0].map);
            }
            // 是否支持查询
            item.isCondition = this.searchBarColumns.some(
              (d) => d.field === item.field && d.isCondition
            );
            newArr.push(item);
          });
          localStorage.setItem(pageId + "Column", JSON.stringify(newArr));
          this.buildDataDetails(newArr);
        })
        .catch((res) => {
          if (res.name !== "abort") {
            // todo...
          }
        });
    },

    /**
     * 过滤字段
     */
    filterFiled(field) {
      let filterArr = [
        "indexid",
        "index", //黑样本 ELF的主键
        "groupcount",
        "topriskcount",
        "notsigntagcount", //事件页面的三个数量
        "aptname",
        "keywords",
        "risklevel",
        "risktag",
        "usertag",
        "otherField",
        "payload",
        "attackpayload",
      ];
      return filterArr.includes(field);
    },

    /**
     * 展示时区
     */
    showTimeZone(d) {
      this.timeZoneVisable = true;
      this.timeZoneValue = d.value;
    },

    /**
     * 查询资产详情
     */
    async assetsDetails({ field, value }) {
      let params = await linkAssets({ field, value, ip: value });
      setSessionParam(params);
    },

    /**
     * 是否为时区
     */
    isTimeZone(d) {
      if (d.field === "timezone" && d.text && d.text !== "-") {
        return true;
      }
      return false;
    },

    /**
     * 获取文本内容
     */
    getTxt(value) {
      let val = value;
      switch (true) {
        //数组类数据不支持查询
        case "object" === typeof val && val.length > 0:
          val = val?.join(",").replace(/</g, "&lt;");
          if ((!val && val != 0) || val == "") {
            val = "-";
          }
          break;
        case !val && (val + "").length === 0:
          val = "-";
          break;
      }
      return (val + "").replace(/&nbsp;/g, " ");
    },
    // 格式化XSS
    formatValue(value) {
      value = !isNullOrEmpty(value) ? formatPayload(value) : "";
      return (value && value.replace(/&lt;/g, "<").replace(/&gt;/g, ">")) || "";
    },
    /**
     * 资产IP类型
     */
    isAssetsIps(d) {
      //资产IP类型
      let assetsIps = ["sip", "dip", "firstip", "ip"];
      let row = this.storeRow;
      let field = d.field;
      if (
        assetsIps.includes(field) &&
        // row.hasOwnProperty(field + "assets") &&
        row[field + "assets"].length > 0
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style lang="scss">
.dataDetails-label {
  margin-top: 8px;
  li {
    line-height: 30px;
    display: flex;
    align-items: flex-start;
    border: 1px solid rgba(179, 167, 167, 0.1);
    margin-top: -1px;
    transition: 0.2s all linear;
    position: relative;
    font-size: 12px;
  }
}
.element-content__left {
  @include contentLeft;
  color: $mainColor;
  max-width: 150px;
}

.element-content__right {
  @include contentRight;
  @include flexCenter($justify: flex-start);
  color: $mainColor;
  padding: 0 10px 0 0;
  word-break: break-all;
}

.el-panel__body .icon-money {
  position: relative;
  left: 4px;
  color: $highColor;
  cursor: pointer;
}

:deep(.el-skeleton) {
  padding: 10px 0px;
  .is-first,
  .is-last {
    width: 100%;
  }
}
</style>

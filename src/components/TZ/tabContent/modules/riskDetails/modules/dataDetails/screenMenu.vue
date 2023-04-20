<template>
  <el-dropdown @command="(key) => dropdownCommand(key)">
    <span class="el-dropdown-link">
      <i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <el-dropdown-menu slotslot="dropdown">
      <el-dropdown-item
        v-if="useOnekeySearch"
        command="onekeySearch"
        icon="iconfont icon-view-details"
      >
        一键检索
      </el-dropdown-item>
      <el-dropdown-item command="equal" icon="iconfont icon-filter-plus">
        添加为过滤条件
      </el-dropdown-item>
      <el-dropdown-item command="notEqual" icon="iconfont icon-filter-plus">
        添加至排除条件
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import { setJump } from "@PAGE/platform.js";
import { isNullOrEmpty } from "@LIB/base.js";
import { isArray, isNumber } from "@LIB/validate.js";
import { mapGetters, mapState } from "vuex";
export default {
  name: "screenMenu",
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      //支持一键检索功能的字段
      onekeyFields: [
        "ip",
        "cc",
        "sip",
        "dip",
        "dns",
        "sni",
        "md5",
        "url",
        "bcc",
        "tos",
        "dsip",
        "host",
        "froms",
        "sha256",
        "foward",
        "domain",
        "dnsreq",
        "emlkey",
        "firstip",
        "replyto",
        "realurl",
        "loginip",
        "account",
        "blackurl",
        "blackeml",
        "roothost",
        "routerip",
        "dnsreqmd5",
        "domainmd5",
        "emlboxmd5",
        "receiptto",
        "networkip",
        "h-req-url",
        "h-req-host",
        "realsender",
        "blackipmd5",
        "domainname",
        "networkdns",
        "fishinghost",
        "blackurlmd5",
        "foreignlink",
        "webmailfrom",
        "riskemlboxkey",
        "foreignfullurl",
        "topleveldomain",
        "extractedforwarderonsend",
        "extractedforwarderonreceive",
      ],
      // //支持跳转查询的字段
      // targetFields: {
      //     //相同主题
      //     subjectField: ["subject"],
      //     //IP会话
      //     sessionField: ["sessionid"],
      //     //忽略告警
      //     ignoreAlarm: ["domain", "blackip", "blackurl"],
      // },
    };
  },
  computed: {
    ...mapGetters(["$searchBar"]),
    ...mapState({
      searchBarColumns: (state) => state.searchBar.searchBarColumns,
    }),
    // 是否使用 一键检索功能
    useOnekeySearch() {
      const baseLine = localStorage.getItem("baseLine");
      const field = this.data.field || null;
      // 需求：基础版不含一键检索
      return baseLine != "1" && field && this.onekeyFields.includes(field);
    },
  },
  methods: {
    /**
     * 下拉框事件
     */
    dropdownCommand(key) {
      switch (key) {
        case "onekeySearch":
          this.onkeySearch();
          break;
        default:
          this.pushCondition(key);
          break;
      }
    },
    /**
     * 跳转一键检索
     */
    onkeySearch() {
      const dataVal = this.data.value;
      const formatVal = isArray(dataVal) ? dataVal.join(",") : dataVal;
      if (!formatVal) {
        return this.$message({ message: "请输入检索关键字", type: "warning" });
      }
      // 设置跳转参数
      setJump({
        isJson: false,
        type: "_blank",
        url: "/TZ/OneKeySearch/OneKeyIndex",
        sessionName: "oneKeySession",
        data: formatVal,
      });
    },

    /**
     * 向查询栏添加条件
     */
    pushCondition(op) {
      const data = this.data;
      const dataVal = data.value;
      const searchBar = this.$searchBar;
      const searchVal = !isNullOrEmpty(dataVal)
        ? isNumber(dataVal)
          ? dataVal.toString()
          : dataVal
        : "";
      const formatVal = searchVal.replace
        ? searchVal
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
        : searchVal;
      let value = this.getSearchValue(data.field, formatVal);
      let fieldOP = op;
      if (data.type == "time") {
        fieldOP = op == "equal" ? "range" : "notRange";
        value = [value, value];
      }
      // 更改为非表达式
      searchBar.isExpression && (searchBar.isExpression = false);
      searchBar.addCondition({
        op: fieldOP,
        connector: "and",
        field: data.field,
        value: value,
      });
    },

    /**
     * 获取条件真实数据
     */
    getSearchValue(field, text) {
      let filData = this.searchBarColumns.filter((d) => d.field === field)[0];
      let value = text;
      if (filData) {
        if (!filData.dropDownList) {
          return value;
        } else {
          let drData = filData.dropDownList.filter((d) => d.value == text)[0];
          if (drData) {
            value = drData.key;
          }
        }
      }
      return value;
    },
  },
};
</script>

<style scoped></style>

<template>
  <el-collapse v-model="activeBodys">
    <el-empty v-if="!headers.length"></el-empty>
    <template v-else v-for="(header, inx) in headers">
      <el-collapse-item
        v-if="header.childs && header.childs.length > 0"
        :key="header.title + inx"
        :name="header.title"
      >
        <template v-slot:title>
          <div class="elemnt-sub_title" :title="header.title">
            {{ header.title }}
            (<em class="fieldNum">{{ header.childs.length }}</em
            >)
          </div>
        </template>
        <div
          v-for="(child, inx) in header.childs"
          :key="child.title + inx"
          class="element-sub_content"
        >
          <span :title="child.title" class="element-content__left">{{
            child.title
          }}</span
          ><span class="element-content__right">{{ child.value || "-" }}</span>
        </div>
      </el-collapse-item>
    </template>
  </el-collapse>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "responseContent",
  props: {
    // 当前内容块名称
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    row: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      // 默认展开的内容块
      activeBodys: ["General", "Response Headers", "Form Data"],
      //内容块
      defaultKeys: {
        General: {
          isEnable: true,
          title: "General",
          childs: [
            {
              title: "Url",
              template: function (d) {
                var _url = d["h-req-url"] || d["uri"],
                  _host = d["h-req-host"] || d["host"];

                if (_host && _url) {
                  return "http://" + _host + (_url[0] == "/" ? "" : "/") + _url;
                }

                // if (!_host && _url)
                //     return url;

                return "";
              },
            },
            { title: "Method", field: "h-req-method|method" },
            { title: "Status", field: "h-res-info|h-res-code|status_code" },
            //{ title: 'Url-Param', field: 'h-req-params' },
            //{ title: 'Form-Data', field: 'h-req-data' },
          ],
        },
        ResponseHeaders: {
          isEnable: true,
          title: "Response Headers",
          childs: [{ field: "h-res-*" }],
        },
        RequestHeaders: {
          isEnable: true,
          title: "Request Headers",
          childs: [{ field: "h-req-*" }],
        },
        FormData: {
          isEnable: true,
          title: "Form Data",
          childs: [
            { title: "Type", field: "h-req-params" },
            { title: "Url", field: "h-req-data" },
          ],
        },
      },
    };
  },
  computed: {
    ...mapState({ tabRow: (state) => state.tabContent.row }),
    // 表格选中行
    storeRow() {
      return this.row ?? this.tabRow;
    },
    // 头部块
    headerKeys() {
      return { ...this.defaultKeys, ...this.options };
    },
    // 拼接后的头部信息
    headers() {
      const reqHeader = this.storeRow?.requestheader ?? null;
      let formatList = [];
      Object.keys(this.headerKeys).forEach((key) => {
        let item = this.headerKeys[key];
        if (item.isEnable) {
          let childs = reqHeader
            ? this.getHeardChild(item)
            : this.getFieldChild(item);
          childs.length &&
            formatList.push({
              ...item,
              childs,
            });
        }
      });
      this.$emit("updateHeaders", formatList);
      return formatList;
    },
  },
  methods: {
    /**
     * 使用requestheader和requestheader字段的返回值  进行加载数据
     */
    getHeardChild: function (obj) {
      const { requestObj, responseObj, reqHeadArr, resHeadArr } =
        this.getBaseList(this.storeRow);
      let formatChild = [];
      switch (true) {
        case obj.title == "General":
          formatChild = obj.childs.map((item) => {
            let value = item.value;
            switch (item.title) {
              case "Url":
                var _host = requestObj.filter(function (map) {
                  return (
                    map.title.toLocaleLowerCase() == "Host".toLocaleLowerCase()
                  );
                });

                value =
                  (_host.length > 0 ? _host[0].value : "") +
                  (reqHeadArr[1] || "");
                break;
              case "Method":
                value = reqHeadArr[0] || "";
                break;
              case "Status":
                value = resHeadArr[1] || "";
                break;
              //case 'Url-Param':
              //    var tempParam = _data.requestheader && _data.requestheader.split(' '),
              //        reqParam = tempParam.length > 1 && tempParam[1].split('?')[1];

              //    item.value = reqParam || '';
              //    break;
              //case 'Form-Data':
              //    item.value = _data['requestdata'] || '';
              //    break;
            }
            return { ...item, value };
          });
          break;
        case obj.title == "Response Headers":
          formatChild = responseObj;
          break;
        case obj.title == "Request Headers":
          formatChild = requestObj;
          break;
      }
      return formatChild;
    },

    /**
     * 分析基础数据
     */
    getBaseList(data) {
      let requestArr = data.requestheader
          ? data.requestheader.trim().split("\n")
          : [],
        responseArr = data.responseheader
          ? data.responseheader.trim().split("\n")
          : [],
        requestObj = this.getStrChild(requestArr),
        responseObj = this.getStrChild(responseArr),
        reqHeadArr = requestArr.length ? requestArr[0].split(" ") : [],
        resHeadArr = responseArr.length ? responseArr[0].split(" ") : [];

      return { requestObj, responseObj, reqHeadArr, resHeadArr };
    },

    /**
     * 将分割的string数组 转化为 对象数据
     */
    getStrChild(arr) {
      var jsonArr = [];
      if (!arr) return jsonArr;

      for (let v = 0; v < arr.length; v++) {
        var item = arr[v];
        if (item) {
          //数组 第一位为 get或者HTTP 且没有冒号 且是head的值，在body部分用不上
          if (v != 0) {
            var itemArr = item.split(": "),
              _value = itemArr[1] || itemArr[1] == 0 ? itemArr[1] : "-";

            jsonArr.push({ title: itemArr[0], value: _value });
          }
        }
      }
      return jsonArr;
    },

    /**
     * 通过字段名 获取全新的对象数组
     */
    getFieldChild(obj) {
      let _data = this.storeRow;
      let formatChilds = [];
      switch (true) {
        case obj.title == "General":
          formatChilds = obj.childs.map((item) => {
            let value = "";
            if (typeof item.template == "function") {
              value = item.template(_data);
            }
            //如果当前字段是有优先级的 取或者的关系
            else if (item.field.includes("|")) {
              var _fieldArr = item.field.split("|");
              _fieldArr.forEach((field) => {
                if (_data[field]) {
                  value = _data[field];
                }
              });
            } else {
              value = _data[item.field] ?? "";
            }
            return { ...item, value };
          });
          break;
        default:
          //如果有模糊匹配 则先合并数组 在进行遍历
          if (
            obj.childs.length &&
            obj.childs[0].field &&
            obj.childs[0].field.includes("-*")
          ) {
            formatChilds = this.getFilterChild(obj.childs[0].field);
            // obj.childs.splice(0, 1);
            // obj.childs = obj.childs.concat(_filterArr);
          }
          formatChilds.forEach((item) => {
            if (item.value) return;
            item.value =
              typeof item.template == "function"
                ? item.template(_data)
                : _data[item.field];
          });
          break;
      }
      return formatChilds;
    },

    /**
     * 模糊匹配字段
     */
    getFilterChild: function (str) {
      var _data = this.storeRow,
        _objKeys = Object.keys(_data),
        _fieldArr = [],
        _rexStr = str.replace("*", "");

      _objKeys.forEach((item) => {
        if (item.includes(_rexStr)) {
          //截取匹配到的字段名
          var _field = item.replace(_rexStr, "");

          //过滤部分已经在 General展示的字段
          if (_rexStr == "h-req-") {
            if (
              _field == "data" ||
              _field == "method" ||
              _field == "url" ||
              _field == "params"
            )
              return;
          }

          //过滤部分已经在 General展示的字段
          if (_rexStr == "h-res-") {
            if (_field == "data" || _field == "body") return;
          }

          if (!_field) return;

          _fieldArr.push({ title: _field, value: _data[item] });
        }
      });

      return _fieldArr;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-collapse {
  border-top: none;
  border-bottom: none;
  .el-collapse-item__header {
    height: 36px;
    line-height: 34px;
  }
}

.elemnt-sub_title {
  color: $highColor;
  font-weight: bold;
  line-height: 36px;
}

.element-sub_content {
  line-height: 30px;
  border: 1px solid rgba(179, 167, 167, 0.1);
  @include flexCenter(flex-start, left);

  &:not(:first) {
    margin-top: -1px;
  }
  &:last-child {
    border-bottom: none;
  }
  .element-content__right {
    word-break: break-all;
  }
}
</style>

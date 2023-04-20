<template>
  <el-collapse-item name="statistics">
    <template v-slot:title>
      <div class="element-file__title">
        网络访问统计
        <el-tooltip
          popper-class="element-arrow_tooltip"
          placement="bottom"
          effect="light"
        >
          <div slotslot="content">
            <p>1、最多统计前100条数据；</p>
            <p>2、数据更新可能会花费较长时间，请耐心等待。</p>
          </div>
          <i class="iconfont icon-help"></i>
        </el-tooltip>
      </div>

      <el-button-group>
        <el-button
          is-icon
          size="mini"
          title="查看全部"
          icon="iconfont icon-table-detail"
          @click.stop="updateData"
        ></el-button>
        <el-button
          is-icon
          size="mini"
          title="刷新数据"
          icon="iconfont icon-refresh"
          v-show="networkLength"
          @click.stop="refreshData"
        ></el-button>
      </el-button-group>
    </template>

    <!-- 报告分析：内容 -->
    <el-empty v-if="!networkLength"></el-empty>
    <el-collapse
      v-else
      v-model="activeModules"
      icon-placement="left"
      class="element-collapse__child"
    >
      <el-collapse-item
        v-for="netType in tableConfig"
        :key="netType.name"
        v-show="netType.tableData.length"
        :title="
          netType.title +
          '(' +
          (netType.tableData.length > 100 ? 100 : netType.tableData.length) +
          ')'
        "
        :name="netType.name"
      >
        <el-table
          :data="getTableData(netType.tableData, 5)"
          class="element-table__network"
          lazy
          border
          size="mini"
          style="width: 100%"
          tooltip-effect="light"
        >
          <el-table-column
            v-for="column in netType.columns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :min-width="column.width"
            :show-overflow-tooltip="true"
          >
            <template v-slotslot="scope">
              <template v-if="column.prop == 'field'">
                {{ scope.row[column.prop] }}
              </template>
              <span
                v-else
                class="cell"
                :class="{
                  active: column.prop != 'attachment' && scope.row[column.prop],
                }"
                @click.stop="jumpLink(scope.row, column.prop, netType.name)"
              >
                {{
                  getTableValue(scope.row[column.prop])
                    ? "-"
                    : scope.row[column.prop]
                }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
    <!-- 查看全部弹窗 -->
    <el-dialog
      title="网络访问统计"
      class="element-preview__dialog"
      v-model:visible="network.visible"
      width="720px"
      height="480px"
      :modal="false"
      :close-on-click-modal="false"
      v-loading.fullscreen="network.loading"
      @beforeClose="network.visible = false"
    >
      <el-button icon="iconfont icon-refresh" @click.stop="btnRefreshData"
        >刷新数据</el-button
      >
      <!-- 网络访问主体结构 -->
      <el-collapse
        v-model="activeDialogModules"
        icon-placement="left"
        class="element-collapse__child element-collapse__dialog"
      >
        <el-collapse-item
          v-for="netType in tableConfig"
          :key="netType.name"
          :title="
            netType.title +
            '(' +
            (netType.tableData.length > 100 ? 100 : netType.tableData.length) +
            ')'
          "
          :name="netType.name + 'Full'"
        >
          <!-- 最多渲染100项,多了消耗接口性能,会异常 -->
          <el-table
            :data="getTableData(netType.tableData, 100)"
            lazy
            border
            size="mini"
            max-height="220"
            style="width: 100%"
            tooltip-effect="light"
          >
            <el-table-column type="index" label="序列" :index="indexMethod">
            </el-table-column>
            <el-table-column
              v-for="(column, inx) in netType.columns"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="inx ? column.width + 20 : ''"
              :show-overflow-tooltip="true"
            >
              <template v-slotslot="scope">
                <template v-if="column.prop == 'field'">
                  {{ scope.row[column.prop] }}
                </template>
                <span
                  v-else
                  class="cell"
                  :class="{
                    active:
                      column.prop != 'attachment' && scope.row[column.prop],
                  }"
                  @click.stop="jumpLink(scope.row, column.prop, netType.name)"
                >
                  {{
                    getTableValue(scope.row[column.prop])
                      ? "-"
                      : scope.row[column.prop]
                  }}
                </span>
              </template>
            </el-table-column>

            <el-table-column
              label="操作"
              width="140px"
              align="center"
              fixed="right"
            >
              <template v-slotslot="scope">
                <div class="action-btn">
                  <el-button
                    type="text"
                    size="mini"
                    icon="iconfont icon-edit"
                    @click="openEditDialog(scope.row, netType)"
                    >编辑</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    icon="iconfont icon-delete"
                    @click="deleteData(scope.row, netType)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-input
            type="textarea"
            class="element-form__add"
            v-model="netType.formAdd"
            @blur="submitNetworkData(netType)"
            placeholder="支持Enter换行输入多条数据"
          ></el-input>
        </el-collapse-item>
      </el-collapse>

      <el-dialog
        width="400px"
        :title="'编辑' + network.editType"
        v-model:visible="network.innerVisible"
        :close-on-click-modal="false"
        append-to-body
      >
        <el-form
          :model="network.editForm"
          :rules="network.editRules"
          ref="editForm"
          label-width="60px"
          @submit.prevent
        >
          <el-form-item :label="network.editType + '：'" prop="newValue">
            <el-input
              type="text"
              :placeholder="'请输入' + network.editType"
              v-model.trim="network.editForm.newValue"
              maxlength="200"
            >
            </el-input>
          </el-form-item>
        </el-form>

        <span slotslot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitUpdate">确定</el-button>
          <el-button type="info" @click="cancelUpdate">取消</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </el-collapse-item>
</template>

<script>
// import _ from "lodash";
import { mapState } from "vuex";
import { isNullOrEmpty } from "@LIB/base.js";
import { getLatestDays } from "@LIB/date";
import { checkIP, checkDNS, isURL } from "@LIB/regex.js";
import { setSessionParam } from "@PAGE/platform.js";
import {
  getNetworkData,
  updateNetworkData,
  deleteNetworkData,
  addNetworkData,
} from "@/api/TZ/tabContent/fileDetails/index.js";
export default {
  name: "statisticsIndex",
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    fileType: {
      type: String,
      default: "附件",
    },
    isRelate: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    data: {
      handler() {
        this.buildTableData();
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    ...mapState({
      indexName: (state) => state.user.pageinfo.indexName,
    }),
    networkLength() {
      let dataLength = 0;
      this.tableConfig.forEach((table) => {
        dataLength += table.tableData.length;
      });
      return dataLength;
    },
    relateIndex() {
      return this.isRelate ? "inf-attachment" : this.indexName;
    },
  },
  data() {
    return {
      network: {
        visible: false,
        loading: false,
        innerVisible: false,
        editType: "IP",
        editName: "networkip",
        editForm: {
          newValue: "",
          oldValue: "",
          tableData: [],
        },
        editRules: {
          newValue: [
            {
              required: true,
              message: "输入值不能为空",
              trigger: "blur",
            },
          ],
        },
        pageUrl: {
          // IP会话
          ip: "/TZ/ClueVerification/IpSession",
          // DNS域名
          dns: "/TZ/ClueVerification/DnsResolut",
          // HTTP通信
          http: "/TZ/ClueVerification/HttpMetadata",
          // 相同文件/附件 - 暂不支持跳转
          attachment: "/TZ/Eml/AttachementList",
        },
        pageJumpFields: {
          networkip: { attachment: "networkip", http: "sip" },
          networkdns: {
            attachment: "networkdns",
            dns: "dnsreq",
            http: "h-req-host",
          },
          networkurl: { attachment: "networkurl", http: "h-req-url" },
        },
      },
      activeModules: ["networkip", "networkdns", "networkurl"],
      activeDialogModules: [
        "networkipFull",
        "networkdnsFull",
        "networkurlFull",
      ],
      // 该数据结构不可动,下面代码用到该结构
      tableConfig: [
        {
          title: "IP统计",
          name: "networkip",
          statisticsType: "ip",
          statisticsIndex: "ip-*,inf-http-metadata",
          formAdd: "",
          columns: [
            { label: "IP", prop: "field", width: 96 },
            { label: "IP会话", prop: "ip", width: 60 },
            { label: "HTTP通信", prop: "http", width: 74 },
            { label: `相同${this.fileType}`, prop: "attachment", width: 70 },
          ],
          tableData: [],
        },
        {
          title: "域名统计",
          name: "networkdns",
          statisticsType: "dns",
          statisticsIndex: "dns-*,inf-http-metadata",
          formAdd: "",
          columns: [
            { label: "域名", prop: "field", width: 96 },
            { label: "DNS域名", prop: "dns", width: 65 },
            { label: "HTTP通信", prop: "http", width: 72 },
            { label: `相同${this.fileType}`, prop: "attachment", width: 68 },
          ],
          tableData: [],
        },
        {
          title: "URL统计",
          name: "networkurl",
          statisticsType: "url",
          statisticsIndex: "inf-http-metadata",
          formAdd: "",
          columns: [
            { label: "URL", prop: "field", width: 160 },
            { label: "HTTP通信", prop: "http", width: 70 },
            { label: `相同${this.fileType}`, prop: "attachment", width: 70 },
          ],
          tableData: [],
        },
      ],
    };
  },
  methods: {
    buildTableData() {
      this.tableConfig.map((table) => {
        let tempTableData = [],
          tempRowData = this.data[table.name] || [];

        tempRowData.length &&
          tempRowData.map((item) => {
            let columnData = {};
            columnData[`${table.columns[0].prop}`] = item;
            tempTableData.push(columnData);
          });
        table.tableData = tempTableData;
      });
    },
    // 获取表格数据（默认展示前5，查看全部展示前100条）
    getTableData(data, length) {
      let tableData = [];
      data.some((item, index) => {
        if (index < length) {
          tableData.push(item);
        } else return true;
      });
      return tableData;
    },
    getTableValue(value) {
      return isNullOrEmpty(value);
    },
    btnRefreshData() {
      this.network.loading = true;
      this.refreshData();
    },
    // 刷新网络统计数据
    refreshData() {
      let closeLoading = 0;
      this.$emit("showLoading", true);
      this.tableConfig.map((item) => {
        if (item.tableData.length) {
          let netData = [];
          item.tableData.forEach((item) => {
            netData.push(item.field);
          });
          const apiConfig = {
            type: item.statisticsType,
            data: netData.join(","),
            indexName: item.statisticsIndex,
          };
          this.getStatisticsData(apiConfig);
        } else closeLoading += 1;
      });
      // 网络统计下无数据
      if (closeLoading == 3) {
        this.$emit("showLoading", false);
        this.network.loading = false;
      }
    },
    // 获取表格聚类数据
    async getStatisticsData(config) {
      const attkey = this.data.atkey ? this.data.atkey : this.data.indexid;
      let apiParams = {
        isAddition: true,
        statisticsType: config.type,
        indexName: config.indexName,
        metadata: config.data,
        additionIndex: this.relateIndex,
        indexId: attkey,
      };
      let result = await getNetworkData(apiParams);
      if (result.status == 200) {
        switch (config.type) {
          case "ip":
            this.tableConfig[0].tableData = result.data;
            break;
          case "dns":
            this.tableConfig[1].tableData = result.data;
            break;
          case "url":
            this.tableConfig[2].tableData = result.data;
            break;
        }
      }
      this.$emit("showLoading", false);
      this.network.loading = false;
    },
    updateData() {
      this.network.visible = true;
    },
    jumpLink(row, field, type) {
      if (field == "attachment" || !row[field]) return;
      // 构建跳转时间
      let baseD = getLatestDays(30),
        sTime = baseD.t2 + " 00:00:00",
        eTime = baseD.t1 + " 23:59:59";

      let jumpParams = {
        expression: [],
        conditions: [
          { field: "@createtime", op: "equal", value: sTime + " - " + eTime },
        ],
      };
      // 构建跳转url地址
      const jumpUrl = this.network.pageUrl[field] || window.location.pathname;
      // 构建跳转参数
      if (type == "networkip" && jumpUrl) {
        jumpParams.expression =
          '{"query":{"bool":{"should":[{ "bool": {"must": [{"term": { "sip": "' +
          row.field +
          '"}}]}},{ "bool": {"must": [{"term": { "dip": "' +
          row.field +
          '"}}]}}]}}}';
      } else {
        jumpParams.expression =
          '{"query": {"bool": { "must": [ { "term": {"' +
          this.network.pageJumpFields[type][field] +
          '": "' +
          row.field +
          '" }}],' +
          '"must_not": [{ "term": {   "_id": "' +
          this.data.attKey +
          '" }} ] }}}';
      }
      setSessionParam({
        isJson: true,
        type: "_blank",
        url: jumpUrl,
        sessionName: "paramListSession",
        data: jumpParams,
      });
    },
    indexMethod(index) {
      return index + 1;
    },
    // 打开编辑弹窗
    openEditDialog(row, table) {
      this.network.editType = table.columns[0].label;
      this.network.editTableData = table.tableData;
      this.network.editForm.newValue = row.field;
      this.network.editForm.oldValue = row.field;
      this.network.innerVisible = true;
    },
    // 提交编辑结果
    submitUpdate() {
      this.$refs["editForm"].validate((valid) => {
        if (valid) {
          const editForm = this.network.editForm;
          if (editForm.newValue != editForm.oldValue) {
            this.updateTableData(editForm.newValue);
          }
        }
      });
    },
    cancelUpdate() {
      this.$refs["editForm"].resetFields();
      this.network.innerVisible = false;
    },
    updateTableData(value) {
      const result = this.validateFormValue(value, this.network.editType);
      // 输入值不符合规范
      if (!result.flag) {
        this.$message({
          message: result.tipMsg,
          type: "error",
        });
      }
      // 输入值符合规范
      else {
        let apiParams = {
          id: this.data.indexid,
          indexName: this.relateIndex,
          indexType: this.data.indextype,
          field: result.networkType,
          content: this.network.editForm.newValue, //新值
          original: this.network.editForm.oldValue, //旧值
          unique: true, //验证数据唯一性
        };
        // 调用数据更新接口
        updateNetworkData(apiParams)
          .then((res) => {
            if (res.status == 200) {
              this.$message({
                message: "数据更新成功！",
                type: "success",
              });
              // 回写更新数据
              this.network.editName = result.networkType;
              // 回写更新数据 - 更新当前数据
              this.refreshTableData(
                this.network.editTableData,
                this.network.editForm.oldValue,
                { field: this.network.editForm.newValue }
              );
            }
            this.network.innerVisible = false;
          })
          .catch(() => {
            this.network.innerVisible = false;
          });
      }
    },
    refreshTableData(tableData, oldValue, newValue) {
      // 值替新换
      let replaceIndex = 0;
      tableData.some((item, inx) => {
        let result = item.field == oldValue;
        result && (replaceIndex = inx);
        return result;
      });
      // 更新数据
      isNullOrEmpty(newValue)
        ? tableData.splice(replaceIndex, 1)
        : tableData.splice(replaceIndex, 1, newValue);
    },
    // 删除数据
    deleteData(row, table) {
      this.$confirm(`确定删除该${this.network.editType}？`, "警告", {
        customClass: "wd_dailog",
        closeOnClickModal: false,
        type: "warning",
      }).then(() => {
        let apiParams = {
          id: this.data.indexid,
          indexName: this.relateIndex,
          indexType: this.data.indextype,
          field: table.name,
          content: row.field,
          unique: true,
        };
        this.network.loading = true;
        // 调用数据删除接口
        deleteNetworkData(apiParams)
          .then((res) => {
            if (res.status == 200) {
              this.$message({
                message: "数据删除成功！",
                type: "success",
              });
              this.refreshTableData(table.tableData, row.field);
            }
            this.network.loading = false;
          })
          .catch(() => {
            this.network.loading = false;
          });
      });
    },
    // 新增数据
    submitNetworkData(table) {
      const inputVal = table.formAdd;
      if (!inputVal) return;
      let resultFlag = true,
        formValue = inputVal.split(/[\s\n]/) || [];
      // 过滤空字符串
      formValue = formValue.filter((item) => {
        return item.length > 0;
      });
      //数组去重
      formValue = [...new Set(formValue)];
      formValue.length &&
        formValue.some((item) => {
          let result = this.validateFormValue(item, table.statisticsType);
          if (!result.flag) {
            this.$message({
              message: result.tipMsg,
              type: "error",
            });
            resultFlag = result.flag;
          }
          return !result.flag;
        });

      if (resultFlag) {
        this.network.loading = true;
        let apiParams = {
          id: this.data.indexid,
          indexName: this.relateIndex,
          indexType: this.data.indextype,
          field: table.name,
          content: formValue.join(","),
          unique: true, //验证数据唯一性
        };
        addNetworkData(apiParams)
          .then((res) => {
            if (res.status == 200) {
              this.$message({
                message: "数据新增成功！",
                type: "success",
              });
            }
            // 清空输入
            table.formAdd = "";
            // 合并数据
            formValue.length &&
              formValue.forEach((item) => {
                table.tableData.push({ field: item });
              });
            this.network.loading = false;
          })
          .catch(() => {
            this.network.loading = false;
          });
      }
    },
    validateFormValue(value, type) {
      let flag = true,
        tipMsg = "",
        networkType = "";
      switch (type.toUpperCase()) {
        case "IP":
          flag = checkIP(value);
          tipMsg = "请输入正确的IP！";
          networkType = "networkip";
          break;
        case "域名":
          flag = checkDNS(value);
          tipMsg = "请输入正确的DNS！";
          networkType = "networkdns";
          break;
        case "URL":
          flag = isURL(value);
          tipMsg = "请输入正确的URL！";
          networkType = "networkurl";
          break;
      }
      return {
        flag,
        tipMsg,
        networkType,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
span.cell.active {
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: $highColor;
  }
}
 :deep(.element-collapse__dialog) {
  margin-top: 8px;
  .el-collapse-item__header {
    color: $highColor;
    font-size: 14px;
    > .el-collapse-item__arrow {
      color: $highColor;
    }
  }
  .action-btn {
    .iconfont {
      font-size: 18px;
    }
  }
  .element-form__add {
    margin-top: 4px;
  }
  .el-table__fixed,
  .el-table__fixed-right {
    border-bottom: none;
  }
}
</style>

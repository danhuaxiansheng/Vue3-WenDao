import { mapGetters, mapState } from "vuex";
import { exporter } from "@TOOLS/export.js";
import { isIntegerNum } from "@LIB/regex.js";
import { downloadFileData } from "@/api/TZ/tabContent/fileDetails/index.js";
export default {
  computed: {
    ...mapGetters(["$table"]),
    ...mapState({
      pageInfo: (state) => state.user.pageinfo,
      indexName: (state) => state.user.pageinfo.indexName,
    }),
  },
  data() {
    return {
      downloadType: "chose", // chose-下载选择文件, select-下载搜索文件, single- 单条导出
      downloadId: "indexid", //导出主键
      downloadIndex: "", //索引,默认不传
      downloadEmlIndex: "", //邮件索引,默认不传
      downloadUrl: "",
      downloadIndexName: "", // 导出的索引
      downloadParams: {
        tableName: "inf-file",
        column: "filecontent",
        rowKeyField: "sha256",
        fileName: "filename",
        fileType: "filetype",
        defaultType: "",
      },
      selectDialog: {
        visible: false,
        fileName: "",
        form: {
          fileName: "",
          fileNumber: "",
        },
        rules: {
          fileName: [
            {
              required: true,
              message: "文件名称不能为空",
              trigger: "blur",
            },
          ],
          fileNumber: [
            { required: true, message: "导出数量不能为空", trigger: "blur" },
            { type: "number", message: "导出数量必须为数值" },
            { validator: this.changeFileNumber, trigger: "blur" },
          ],
        },
      },
    };
  },
  methods: {
    downloadFiles() {
      const rowIds = [];
      let selectRows = this.selectRows;
      const dataTable = this.$table?.tableData || [];

      // 批量导出：导出时无数据提示
      if (
        (this.downloadType == "chose" && !selectRows.length) ||
        (this.downloadType == "select" && !dataTable.length)
      ) {
        const tips =
          this.downloadType == "chose"
            ? "请至少选择一条数据进行导出！"
            : "没有可供下载的文件！";
        this.$message({
          message: tips,
          type: "error",
        });
        return;
      }
      // 单条导出
      if (this.downloadType == "single") {
        selectRows = [this.checkRow];
        this.downloadType = "chose";
      }
      // 下载选择文件
      if (this.downloadType == "chose") {
        selectRows.forEach((item) => {
          rowIds.push(item[this.downloadId]);
        });
      }
      // 构建导出参数
      const searchParams = this.searchParams.conditions;
      const timeField = this.searchOptions.time.field || "time";
      const apiParams = {
        indexName: this.downloadIndexName || this.indexName,
        conditions: [
          { field: "isdelete", value: 0, op: "equal", connector: "and" },
        ],
      };
      if (searchParams.length) {
        searchParams.some((item) => {
          if (item.field == timeField) {
            apiParams.conditions.push(item);
          }
          return item.field == timeField;
        });
      } else
        apiParams.conditions.push({ field: timeField, value: "", op: "range" });

      this.downloadId == "emlkey"
        ? apiParams.conditions.push({
            field: this.downloadId,
            value: rowIds.join("|"),
            op: "equal",
          })
        : (apiParams.ids = rowIds.join(","));

      // .net接口传了module参数，和接口确认说这个参数暂时无用。
      // this.downloadParams.module = system + pageName
      // 勾选下载/单条下载
      if (this.downloadType == "chose") {
        this.downloadParams.params = JSON.stringify(apiParams);
        this.downloadParams.defaultFileName = "";
        this.postFileData({
          params: this.downloadParams,
        });
      }
      // 导出搜索结果
      if (this.downloadType == "select") {
        this.selectDialog.form.fileName = new Date().format("yyyyMMddhhmmss");
        this.selectDialog.visible = true;
      }
    },
    // 下载文件
    postFileData(apiParams) {
      // 构建导出Url
      const downloadUrl = this.downloadUrl || "/api/file/download";
      downloadFileData(apiParams.params, downloadUrl)
        .then((res) => {
          if (res.status == 200) {
            exporter({
              action: downloadUrl,
              key: res.data,
            });
          }
          this.selectDialog.visible = false;
        })
        .catch(() => {
          this.selectDialog.visible = false;
        });
    },
    // 确定
    submitUpdate() {
      this.$refs["fileForm"].validate((valid) => {
        if (valid) {
          const tableParams = JSON.parse(this.$table?.getWhere() || {});
          this.downloadParams.defaultFileName = this.selectDialog.form.fileName;
          if (this.downloadIndex) {
            tableParams.indexName = this.downloadIndex;
            tableParams.indexType = this.downloadIndex;
            // 木马邮件/邮件列表 -导出附件专用参数
            if (this.downloadEmlIndex) {
              tableParams.emlIndex = this.downloadEmlIndex;
              tableParams.attachmentIndex = this.downloadIndex;
            }
          }
          // 设置导出数量
          tableParams.size = this.selectDialog.form.fileNumber;
          this.downloadParams.params = JSON.stringify(tableParams);
          // 导出搜索结果
          this.postFileData({
            params: this.downloadParams,
          });
        }
      });
    },
    // 取消
    cancelUpdate() {
      this.$refs["fileForm"].resetFields();
      this.selectDialog.visible = false;
    },
    /**
     * 验证导出搜索输入值
     */
    changeFileNumber(rule, value, callback) {
      if (!isIntegerNum(value)) {
        callback(new Error("导出数量必需为正整数"));
      } else if (value < 1) {
        callback(new Error("导出数量不小于1"));
      } else if (value > 200) {
        callback(new Error("导出数量不大于200"));
      } else {
        callback();
      }
    },
  },
};

class searchBarConfig {
  constructor() {}
  getPageApi(type) {
    let pageUrlConfig = {
      ruleApplicationUrl: "/api/external/triggerIoc",
      importFailedUrl: "/api/tactics/downImportResult",
    };
    switch (type) {
      case "blackList":
        pageUrlConfig.gridUrl = "/api/tactics/black/search";
        pageUrlConfig.singleAddUrl = "/api/tactics/black/add";
        pageUrlConfig.excelTempUrl = "/api/tactics/black/downTemplate";
        pageUrlConfig.importUrl = "/api/tactics/black/importBatch";
        pageUrlConfig.exportUrl = "/api/tactics/black/exportBatch";
        pageUrlConfig.deleteBatchUrl = "/api/tactics/black/removeBatch";
        pageUrlConfig.aggUrlConfig = "/api/tactics/black/agg";
        pageUrlConfig.updateUrl = "/api/tactics/black/update";
        pageUrlConfig.getFailDataOfImport = "/api/tactics/downImportResult";
        break;
      case "whiteList":
        pageUrlConfig.gridUrl = "/api/tactics/white/search";
        pageUrlConfig.singleAddUrl = "/api/tactics/white/add";
        pageUrlConfig.excelTempUrl = "/api/tactics/white/downTemplate";
        pageUrlConfig.importUrl = "/api/tactics/white/importBatch";
        pageUrlConfig.exportUrl = "/api/tactics/white/exportBatch";
        pageUrlConfig.deleteBatchUrl = "/api/tactics/white/removeBatch";
        pageUrlConfig.aggUrlConfig = "/api/tactics/white/agg";
        pageUrlConfig.updateUrl = "/api/tactics/white/update";
        pageUrlConfig.getFailDataOfImport = "/api/tactics/downImportResult";
        break;
    }
    return pageUrlConfig;
  }
  // 获取表格哪些列需要被格式化展示
  getFormatColumns() {
    return ["value", "threatLevel", "expiryTime", "useEnable", "isAvailable"];
  }
  getToolBtn() {
    return [
      {
        name: "新增规则",
        field: "add_rule",
        type: "button",
        icon: "iconfont icon-add",
        handler: "addFeatureRules",
      },
      {
        name: "导出数据",
        field: "export_rule",
        type: "button",
        icon: "iconfont icon-export",
        handler: "exportFeatureRules",
      },
      {
        name: "删除数据",
        field: "delete_rule",
        type: "button",
        icon: "iconfont icon-delete",
        handler: "deleteFeatureRules",
      },
      {
        name: "系统内置",
        field: "systemCount",
        type: "button",
        class: "element-button__default",
        disabled: true,
        position: "right",
      },
      {
        name: "用户添加",
        field: "userCount",
        type: "button",
        class: "element-button__default active",
        disabled: true,
        position: "right",
      },
    ];
  }
  getSearchColumns(type) {
    let searchColunms = [];
    switch (type) {
      case "blackList": //业务系统
        searchColunms = [
          {
            displayText: "情报对象",
            field: "value",
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 0,
            min: 0,
            type: "string",
          },
          {
            displayText: "信誉等级",
            field: "threatLevel",
            dropDownList: [
              { key: "-999", value: "全部" },
              { key: "3", value: "高" },
              { key: "2", value: "危" },
              { key: "1", value: "疑" },
            ],
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 100,
            min: 0,
            type: "number",
          },
          {
            displayText: "组织名称",
            field: "groupId",
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 0,
            min: 0,
            type: "string",
          },
          {
            displayText: "特征备注",
            field: "dataTag",
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 0,
            min: 0,
            type: "string",
          },
          {
            displayText: "有效期",
            field: "expiryTime",
            isCondition: true,
            machTypes: ["range", "notRange"],
            max: 0,
            min: 0,
            type: "time",
          },
        ];
        break;
      case "whiteList":
        searchColunms = [
          {
            displayText: "情报对象",
            field: "value",
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 0,
            min: 0,
            type: "string",
          },
          {
            displayText: "备注",
            field: "remark",
            isCondition: true,
            machTypes: ["equal", "notEqual"],
            max: 0,
            min: 0,
            type: "string",
          },
        ];
    }
    return searchColunms;
  }
  getGridColunms(type) {
    let gridColunms = [];
    switch (type) {
      case "blackList": //业务系统
        gridColunms = [
          {
            id: 1,
            label: "主键",
            prop: "indexid",
            field: "indexid",
            width: 1,
            sortable: false,
            ischecked: false,
            hide: true,
          },
          {
            id: 2,
            label: "创建时间",
            prop: "createTime",
            field: "createTime",
            sortable: true,
            ischecked: true,
            width: 168,
          },
          {
            id: 3,
            label: "情报对象",
            prop: "value",
            field: "value",
            sortable: false,
            ischecked: true,
            width: 294,
          },
          {
            id: 4,
            label: "类型",
            prop: "type",
            field: "type",
            sortable: false,
            ischecked: true,
            width: 94,
          },
          {
            id: 5,
            label: "信誉等级",
            prop: "threatLevel",
            field: "threatLevel",
            sortable: false,
            ischecked: true,
            width: 78,
          },
          {
            id: 6,
            label: "组织名称",
            prop: "groupId",
            field: "groupId",
            sortable: true,
            ischecked: true,
            width: 120,
          },
          {
            id: 7,
            label: "是否启用",
            prop: "useEnable",
            field: "useEnable",
            sortable: true,
            ischecked: true,
            width: 119,
          },
          {
            id: 8,
            label: "特征备注",
            prop: "dataTag",
            field: "dataTag",
            sortable: false,
            ischecked: true,
            width: 230,
          },
          {
            id: 9,
            label: "情报来源",
            prop: "source",
            field: "source",
            sortable: false,
            ischecked: true,
            width: 120,
          },
          {
            id: 10,
            label: "有效期",
            prop: "expiryTime",
            field: "expiryTime",
            sortable: false,
            ischecked: true,
            width: 168,
          },
          {
            id: 11,
            label: "修改时间",
            prop: "updateTime",
            field: "updateTime",
            sortable: false,
            ischecked: true,
            width: 168,
          },
          {
            id: 12,
            label: "发现时间",
            prop: "foundTime",
            field: "foundTime",
            sortable: false,
            ischecked: true,
            width: 168,
          },
        ];
        break;
      case "whiteList": //安全设备
        gridColunms = [
          {
            id: 1,
            label: "主键",
            prop: "indexid",
            field: "indexid",
            width: 1,
            sortable: false,
            ischecked: false,
            hide: true,
          },
          {
            id: 2,
            label: "创建时间",
            prop: "createTime",
            field: "createTime",
            sortable: true,
            ischecked: true,
            width: 168,
          },
          {
            id: 3,
            label: "情报对象",
            prop: "value",
            field: "value",
            sortable: false,
            ischecked: true,
            width: 294,
          },
          {
            id: 4,
            label: "类型",
            prop: "type",
            field: "type",
            sortable: false,
            ischecked: true,
            width: 94,
          },
          {
            id: 5,
            label: "是否启用",
            prop: "isAvailable",
            field: "isAvailable",
            sortable: true,
            ischecked: true,
            width: 119,
          },
          {
            id: 6,
            label: "备注",
            prop: "remark",
            field: "remark",
            sortable: false,
            ischecked: true,
            width: 230,
          },
          {
            id: 7,
            label: "情报来源",
            prop: "source",
            field: "source",
            sortable: false,
            ischecked: true,
            width: 120,
          },
          {
            id: 8,
            label: "修改时间",
            prop: "updateTime",
            field: "updateTime",
            sortable: false,
            ischecked: true,
            width: 168,
          },
          {
            id: 9,
            label: "发现时间",
            prop: "foundTime",
            field: "foundTime",
            sortable: false,
            ischecked: true,
            width: 168,
          },
        ];
        break;
    }
    return gridColunms;
  }
}

export default new searchBarConfig();

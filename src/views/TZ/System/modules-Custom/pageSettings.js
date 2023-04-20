class pageSettings {
  constructor() {}
  getFieldsByType(type) {
    let fieldsList = [];
    switch (type) {
      // 木马通信特征
      case "TrojanHorseFeature":
        fieldsList = [
          {
            label: "规则内容",
            field: "PRO_RULES",
            value: "",
            form: { type: "textarea", require: true, template: true },
            temp: {
              fileName: "XML规则模板",
              url: "/fileTemplate/ScanVirusUserAdd.xml",
            },
          },
          {
            label: "规则名称",
            field: "PRO_NAME",
            value: "",
            form: { type: "input", require: true },
          },
          {
            label: "匹配协议",
            field: "PORT",
            value: "",
            form: {
              type: "select",
              require: false,
              options: this.getOptionsByField("PORT"),
            },
          },
          {
            label: "有效时间",
            field: "VALID_END_TIME",
            value: "2099-12-31 23:59:59",
            form: {
              type: "time",
              require: true,
              defaultDate: "2099-12-31",
              defaultTime: "23:59:59",
            },
          },
          {
            label: "特征备注",
            field: "REMARK",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "组织名称",
            field: "APT_NAME",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "信誉等级",
            field: "ALARM_LEVEL",
            value: 1,
            form: {
              type: "radio",
              require: false,
              radios: [
                { key: "可疑", value: 1 },
                { key: "危险", value: 2 },
                { key: "高危", value: 3 },
              ],
            },
          },
          {
            label: "来源",
            field: "RESOURCE",
            value: "",
            form: { type: "input", require: false },
          },
          // 弹窗不展示，接口请求需要的参数
          {
            label: "",
            field: "AUTHOR",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "",
            field: "IS_INVALID",
            value: 0,
            form: { type: "input", require: false },
          },
          {
            label: "",
            field: "IS_DELETE",
            value: 0,
            form: { type: "input", require: false },
          },
        ];
        break;
      // WAF规则管理
      case "WAFRule":
        fieldsList = [
          {
            label: "规则名称",
            field: "name",
            value: "",
            form: { type: "input", require: true },
          },
          {
            label: "规则类型",
            field: "ruleType",
            value: "Ognl注入",
            form: {
              type: "select",
              require: false,
              options: this.getOptionsByField("ruleType"),
            },
          },
          {
            label: "规则使用优先级",
            field: "usageLevel",
            value: "1",
            form: {
              type: "select",
              require: false,
              options: this.getOptionsByField("usageLevel"),
            },
          },
          {
            label: "是否启用",
            field: "enable",
            value: false,
            form: { type: "switch", require: false },
          },
          {
            label: "风险类型",
            field: "risk",
            value: "0",
            form: {
              type: "select",
              require: false,
              options: [], //获取children
            },
          },
          {
            label: "条件集合",
            field: "conditionRule",
            value: "",
            form: { type: "textarea", require: true, template: true },
            temp: {
              fileName: "规则模板",
              url: "/fileTemplate/WafConditionRule.txt",
            },
          },
          {
            label: "条件决策",
            field: "decideRule",
            value: "",
            form: { type: "textarea", require: true, template: true },
            temp: {
              fileName: "规则模板",
              url: "/fileTemplate/WafDecideRule.txt",
            },
          },
          {
            label: "APT组织名称",
            field: "apt",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "漏洞库编号",
            field: "cnnvdId",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "CVE编号",
            field: "cve",
            value: "",
            form: { type: "input", require: false },
          },
          {
            label: "规则描述",
            field: "description",
            value: "",
            form: { type: "textarea", require: false, template: false },
          },
        ];
        break;
      // Snort规则管理
      case "SnortRule":
        fieldsList = [
          {
            label: "规则内容",
            field: "ruleContent",
            value: "",
            form: { type: "textarea", require: true, template: true },
            temp: {
              fileName: "规则模板",
              url: "/fileTemplate/SnortConditionRule.txt",
            },
          },
          {
            label: "风险类型",
            field: "risk",
            value: "0",
            form: {
              type: "select",
              require: false,
              options: [], //获取children
            },
          },
          {
            label: "威胁等级",
            field: "risklevel",
            value: 11,
            form: {
              type: "select",
              require: false,
              options: this.getOptionsByField("risklevel"),
            },
          },
          {
            label: "是否启用",
            field: "enable",
            value: false,
            form: { type: "switch", require: false },
          },
          {
            label: "启用模式",
            field: "modeSwitch",
            value: 1,
            form: {
              type: "select",
              require: false,
              options: this.getOptionsByField("modeSwitch"),
            },
          },
          // {
          //     label: "规则信息", field: "msg", value: "",
          //     form: { type: "textarea", require: false, template: false },
          // },
          // {
          //     label: "参考信息", field: "reference", value: "",
          //     form: { type: "textarea", require: false, template: false },
          // },
          {
            label: "CVE编号",
            field: "cve",
            value: "",
            form: { type: "input", require: false, template: false },
          },
        ];
        break;
    }
    return fieldsList;
  }
  getOptionsByField(field) {
    let optionList = [];
    switch (field) {
      case "PORT":
        optionList = [
          { key: "", value: "全部" },
          { key: "137,138,189", value: "NETBIOS" },
          { key: 7, value: "ECHO" },
          { key: 21, value: "FTP" },
          { key: 22, value: "SSH" },
          { key: 23, value: "TELNET" },
          { key: 25, value: "SMTP" },
          { key: 42, value: "WINS" },
          { key: 43, value: "WHOIS" },
          { key: 53, value: "DNS" },
          { key: 69, value: "TFTP" },
          { key: 79, value: "FINGER" },
          { key: 109, value: "POP" },
          { key: 110, value: "POP3" },
          { key: 111, value: "SUN" },
          { key: 123, value: "NTP" },
          { key: 143, value: "IMAP" },
          { key: 161, value: "SNMP" },
          { key: 179, value: "BGP" },
          { key: 213, value: "IPX" },
          { key: 444, value: "SNPP" },
          { key: 445, value: "SMB" },
          { key: 500, value: "L2TP" },
          { key: 514, value: "SYSLOG" },
          { key: 520, value: "RIP" },
          { key: 530, value: "RPC" },
          { key: 540, value: "UUCP" },
          { key: 554, value: "RTSP" },
          { key: 563, value: "NNTP" },
          { key: 1723, value: "PPTP" },
          { key: 2049, value: "NFS" },
          { key: 3306, value: "MYSQL" },
          { key: 5060, value: "SIP" },
          { key: 6379, value: "REDIS" },
        ];
        break;
      case "ruleType":
        optionList = [
          { key: "Ognl注入", value: "Ognl注入" },
          { key: "WebShell", value: "WebShell" },
          { key: "服务器漏洞", value: "服务器漏洞" },
          { key: "反序列化", value: "反序列化" },
          { key: "SQL注入", value: "SQL注入" },
          { key: "XXE", value: "XXE" },
          { key: "数据泄露", value: "数据泄露" },
          { key: "CommandEchoing", value: "CommandEchoing" },
          { key: "AppointFeature", value: "AppointFeature" },
          { key: "ExecuteScript", value: "ExecuteScript" },
          { key: "SensitiveFileContent", value: "SensitiveFileContent" },
          { key: "DangerousSuffix", value: "DangerousSuffix" },
          { key: "RiskFile", value: "RiskFile" },
          { key: "CobaltStrike", value: "CobaltStrike" },
          { key: "RiskReslocation", value: "RiskReslocation" },
          { key: "RiskUrl", value: "RiskUrl" },
          { key: "HTTP上线", value: "HTTP上线" },
        ];
        break;
      case "usageLevel":
        optionList = [
          { key: "1", value: "超高" },
          { key: "5", value: "高" },
          { key: "9", value: "中" },
          { key: "13", value: "低" },
        ];
        break;
      case "risklevel":
        optionList = [
          { key: 11, value: "疑" },
          { key: 16, value: "危" },
          { key: 21, value: "高" },
        ];
        break;
      case "modeSwitch":
        optionList = [
          { key: 1, value: "标准" },
          { key: 5, value: "平衡" },
          { key: 9, value: "POC" },
        ];
        break;
    }
    return optionList;
  }
  getMapValue(mode, field) {
    let modeList = [];
    let options = this.getOptionsByField(field);

    options.some((item) => {
      if (item.value == mode) modeList.push(item);
      return item.value == mode;
    });
    return modeList[0].key;
  }
}

export default new pageSettings();

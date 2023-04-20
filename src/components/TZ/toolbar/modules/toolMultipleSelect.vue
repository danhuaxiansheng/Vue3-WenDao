<template>
  <div class="eventType">
    <el-popover
      placement="bottom-end"
      width="586"
      popper-class="event_type"
      :disabled="$attrs.disabled"
      trigger="click"
      v-model="isShowGroup"
    >
      <el-button slotslot="reference">
        {{
          !options.value
            ? "攻击类型"
            : "已选" + options.value.split("|").length + "项"
        }}
        <i :class="isShowGroup ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </el-button>
      <div class="eventType-group">
        <ul class="eventType-group-panle">
          <li v-for="item in typeList" :key="item.key">
            <span class="checkbox-group-title">{{ item.name }}</span>
            <ul class="checkbox-group-list">
              <li v-if="item.group && item.group.length !== 1">
                <a
                  class="select_all"
                  :class="item.isCheck ? 'active' : ''"
                  @click="checkAll(item)"
                  >全部</a
                >
              </li>
              <li
                v-for="group in item.group"
                :key="group.field"
                :title="group.value"
                @click="checkSelf(item, group)"
              >
                <a class="ellipsis" :class="group.isCheck ? 'active' : ''">{{
                  group.value
                }}</a>
              </li>
            </ul>
          </li>
        </ul>
        <div class="bottom-panle">
          <el-checkbox v-model="checkAllData" @change="change"
            >全选/全不选</el-checkbox
          >
          <el-button type="primary" @click="yes">确认</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: "toolMultipleSelect",
  props: {
    options: {
      type: Object,
      default() {
        return {
          value: "",
          name: "",
          class: "",
          option: [
            {
              label: "",
              value: "",
            },
          ],
        };
      },
    },
  },
  data() {
    return {
      typeList: [],
      isShowGroup: false,
      checkAllData: false, // 选择全部
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getList();
      this.setInitCheck();
    },
    getList() {
      this.typeList = [
        {
          name: "身份认证",
          key: "Authentication",
          isCheck: false,
          group: [
            {
              field: "AuthenticationUnclassified",
              value: "其他身份管理",
              isCheck: false,
            },
            {
              field: "AccountLoginAttempt",
              value: "账户暴力破解 ",
              isCheck: false,
            },
            {
              field: "AccountLoginFailed",
              value: "账户登录失败",
              isCheck: false,
            },
            {
              field: "AccountLoginSucceeded",
              value: "账户登录成功",
              isCheck: false,
            },
            {
              field: "SMTPLoginAttempt",
              value: "SMTP暴力破解",
              isCheck: false,
            },
            {
              field: "SMTPPLoginFailed",
              value: "SMTP登录失败",
              isCheck: false,
            },
            {
              field: "SMTPLoginSucceeded",
              value: "SMTP登录成功",
              isCheck: false,
            },
            {
              field: "POP3LoginAttempt",
              value: "POP3暴力破解",
              isCheck: false,
            },
            { field: "POP3LoginFailed", value: "POP3登录失败", isCheck: false },
            {
              field: "POP3LoginSucceeded",
              value: "POP3登录成功",
              isCheck: false,
            },
            { field: "FTPLoginAttempt", value: "FTP暴力破解", isCheck: false },
            { field: "FTPLoginFailed", value: "FTP登录失败", isCheck: false },
            {
              field: "FTPLoginSucceeded",
              value: "FTP登录成功",
              isCheck: false,
            },
            {
              field: "SambaLoginFailed",
              value: "Samba登录失败",
              isCheck: false,
            },
            {
              field: "SambaLoginSucceeded",
              value: "Samba登录成功",
              isCheck: false,
            },
            {
              field: "TelnetLoginAttempt",
              value: "Telnet暴力破解",
              isCheck: false,
            },
            {
              field: "WeakCredentialLoginFailed",
              value: "使用弱凭证登录失败",
              isCheck: false,
            },
            {
              field: "WeakCredentialLoginSucceeded",
              value: "使用弱凭证登录成功",
              isCheck: false,
            },
          ],
        },
        {
          name: "侦查",
          key: "Reconnaissance",
          isCheck: false,
          group: [
            {
              field: "ReconnaissanceUnclassified",
              value: "其他侦查",
              isCheck: false,
            },
            { field: "DirectoryScan", value: "目录文件扫描 ", isCheck: false },
            { field: "HostScan", value: "主机扫描", isCheck: false },
            { field: "PortScan", value: "端口扫描", isCheck: false },
            { field: "Crawling", value: "网络爬虫", isCheck: false },
            { field: "VulnerabilityScan", value: "漏洞扫描", isCheck: false },
            {
              field: "WebVulnerabilityScan",
              value: "网站漏洞扫描",
              isCheck: false,
            },
            {
              field: "ApplicationProbe",
              value: "应用程序探测",
              isCheck: false,
            },
            { field: "DBprobe", value: "数据库探测", isCheck: false },
          ],
        },
        {
          name: "拒绝服务攻击",
          key: "DenialOfService",
          isCheck: false,
          group: [
            {
              field: "DenialOfServiceUnclassified",
              value: "其他拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "ApplicationDoS",
              value: "应用层拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "DistributedDoS",
              value: "分布式拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "IntranetDoS",
              value: "内网型拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "FloodDoS",
              value: "洪水攻击型拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "SynFloodDoS",
              value: "SYN Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "AckFloodDoS",
              value: "ACK Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "UDPFloodDoS",
              value: "UDP Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "ICMPFloodDoS",
              value: "ICMP Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "DNSResponseFloodDoS",
              value: "DNS Response Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "DNSRequestFloodDoS",
              value: "DNS Request Flood 拒绝服务攻击",
              isCheck: false,
            },
            {
              field: "HttpFloodDos",
              value: "HTTP Flood 拒绝服务攻击",
              isCheck: false,
            },
          ],
        },
        {
          name: "恶意代码",
          key: "Malware",
          isCheck: false,
          group: [
            {
              field: "MalwareUnclassified",
              value: "其他恶意代码",
              isCheck: false,
            },
            { field: "Adware", value: "广告软件", isCheck: false },
            { field: "Badware", value: "恶意软件", isCheck: false },
            { field: "Backdoor", value: "后门程序", isCheck: false },
            { field: "Botnet", value: "僵尸网络", isCheck: false },
            { field: "Keylogger", value: "键盘记录器", isCheck: false },
            { field: "Pornware", value: "色情软件", isCheck: false },
            { field: "Ransomware", value: "勒索软件", isCheck: false },
            { field: "Miningware", value: "挖矿软件", isCheck: false },
            { field: "Rootkits", value: "Rootkits", isCheck: false },
            { field: "Spyware", value: "间谍软件", isCheck: false },
            { field: "Trojan", value: "木马程序", isCheck: false },
            { field: "Virus", value: "病毒程序", isCheck: false },
            { field: "Worm", value: "蠕虫病毒", isCheck: false },
            { field: "WebShell", value: "WebShell", isCheck: false },
            { field: "HackTool", value: "黑客工具", isCheck: false },
          ],
        },
        {
          name: "恶意邮件",
          key: "MaliciousEmail",
          isCheck: false,
          group: [
            {
              field: "MaliciousEmailUnclassified",
              value: "其他恶意邮件",
              isCheck: false,
            },
            { field: "PhishingMail", value: "钓鱼邮件", isCheck: false },
            { field: "Blackmail", value: "勒索邮件", isCheck: false },
            { field: "Spam", value: "垃圾邮件", isCheck: false },
            { field: "VirusMail", value: "病毒邮件", isCheck: false },
            { field: "AbnormalMail", value: "异常邮件", isCheck: false },
            { field: "SensitiveMail", value: "敏感邮件", isCheck: false },
          ],
        },
        {
          name: "可疑行为",
          key: "SuspiciousActivity",
          isCheck: false,
          group: [
            {
              field: "SuspiciousActivityUnclassified",
              value: "其他可疑行为",
              isCheck: false,
            },
            {
              field: "InfoLeakGathering",
              value: "信息泄露攻击",
              isCheck: false,
            },
            { field: "MaliciousURL", value: "恶意网址", isCheck: false },
            { field: "NonStandardPort", value: "非标端口", isCheck: false },
            { field: "MiningCnC", value: "挖矿C2通道", isCheck: false },
            { field: "RansomwareCnC", value: "勒索C2通道", isCheck: false },
            { field: "SuspiciousHost", value: "可疑主机", isCheck: false },
            { field: "SuspiciousCode", value: "可疑程序", isCheck: false },
            { field: "SuspiciousURL", value: "可疑网址", isCheck: false },
            { field: "SuspiciousCommand", value: "可疑命令", isCheck: false },
            { field: "SuspiciousTraffic", value: "可疑流量", isCheck: false },
            {
              field: "InvalidHttpRequest",
              value: "异常HTTP请求",
              isCheck: false,
            },
            {
              field: "UnusualHttpMethod",
              value: "异常HTTP方法访问",
              isCheck: false,
            },
            {
              field: "SensitivePathAccess",
              value: "敏感路径访问",
              isCheck: false,
            },
            {
              field: "NonStandardProtocol",
              value: "非标准协议",
              isCheck: false,
            },
            {
              field: "SensitiveFileAccess",
              value: "访问敏感文件",
              isCheck: false,
            },
            { field: "DataStealing", value: "数据窃取", isCheck: false },
            { field: "Digiccy", value: "数字货币", isCheck: false },
            {
              field: "DirectoryInfoLeak",
              value: "目录信息泄露",
              isCheck: false,
            },
            {
              field: "ServerInfoLeak",
              value: "服务器信息泄露",
              isCheck: false,
            },
            { field: "WeakCredential", value: "弱口令", isCheck: false },
            { field: "MonitoredBehavior", value: "行为监控", isCheck: false },
          ],
        },
        {
          name: "漏洞攻击",
          key: "Exploit",
          isCheck: false,
          group: [
            {
              field: "ExploitUnclassified",
              value: "其他漏洞攻击",
              isCheck: false,
            },
            { field: "StatckOverflow", value: "栈溢出", isCheck: false },
            { field: "HeapOverflow", value: "堆溢出", isCheck: false },
            {
              field: "DirectoryTraversalExploit",
              value: "路径穿越攻击/目录遍历攻击",
              isCheck: false,
            },
            { field: "EmailExploit", value: "Email漏洞利用", isCheck: false },
            { field: "FTPExploit", value: "FTP漏洞利用", isCheck: false },
            {
              field: "FileIncludedExploit",
              value: "远程文件包含/文件包含攻击",
              isCheck: false,
            },
            {
              field: "FileUploadExploit",
              value: "文件上传漏洞利用",
              isCheck: false,
            },
            {
              field: "FileDownloadExploit",
              value: "文件读取|下载漏洞利用",
              isCheck: false,
            },
            { field: "SQLInjection", value: "SQL注入攻击", isCheck: false },
            { field: "LDAPInjection", value: "LDAP注入攻击", isCheck: false },
            { field: "XpathInjection", value: "Xpath注入攻击", isCheck: false },
            { field: "PHPInjection", value: "PHP注入攻击", isCheck: false },
            { field: "XXEInjection", value: "XXE注入攻击", isCheck: false },
            { field: "XMLInjection", value: "XML注入攻击", isCheck: false },
            {
              field: "CommandInjection",
              value: "命令注入攻击",
              isCheck: false,
            },
            { field: "SessionHijack", value: "会话劫持攻击", isCheck: false },
            { field: "ShellCode", value: "ShellCode", isCheck: false },
            {
              field: "WebServerExploit",
              value: "Web服务器漏洞利用",
              isCheck: false,
            },
            { field: "Vulnerability", value: "漏洞利用", isCheck: false },
            { field: "UploadWebShell", value: "上传WebShell", isCheck: false },
            { field: "CSRF", value: "跨站请求伪造攻击", isCheck: false },
            { field: "XSS", value: "跨站脚本攻击", isCheck: false },
            { field: "SourceCodeInjection", value: "代码注入", isCheck: false },
            { field: "XqueryInjection", value: "Xquery注入", isCheck: false },
            {
              field: "RemoteCodeExecutionExploit",
              value: "远程任意代码执行漏洞",
              isCheck: false,
            },
            {
              field: "JavaDeserializingExploit",
              value: "JAVA反序列化漏洞",
              isCheck: false,
            },
          ],
        },
        {
          name: "入侵攻击",
          key: "Intrusion",
          isCheck: false,
          group: [
            {
              field: "IntrusionUnclassified",
              value: "其他入侵攻击",
              isCheck: false,
            },
            { field: "Penetration", value: "渗透攻击", isCheck: false },
            { field: "APT", value: "APT攻击", isCheck: false },
          ],
        },
        {
          name: "其他",
          key: "Others",
          isCheck: false,
          group: [{ field: "Other", value: "其他", isCheck: false }],
        },
      ];
    },
    setInitCheck() {
      let valueList = this.options.value?.split("|");
      if (valueList && valueList.length > 0) {
        this.typeList.forEach((d) => {
          let isAll = true;
          if (d.group && d.group.length > 0) {
            d.group.forEach((v) => {
              v.isCheck = valueList.includes(v.field);
              if (!v.isCheck) {
                isAll = false;
              }
            });
          }
          d.isCheck = isAll;
        });
      }
    },
    /**
     * 获取攻击类型 数据
     */
    yes() {
      let valueStr = this.getValue();
      this.$emit("input", valueStr);
      this.$emit("change", { value: valueStr, options: this.options });
      this.isShowGroup = false;
    },
    getValue() {
      let valueList = [];
      this.typeList.forEach((d) => {
        if (d.group && d.group.length > 0) {
          d.group.forEach((v) => {
            if (v.isCheck) {
              valueList.push(v.field);
            }
          });
        }
      });
      return valueList.join("|");
    },
    checkAll(item) {
      item.isCheck = !item.isCheck;
      item.group.forEach((element) => {
        element.isCheck = item.isCheck;
      });
      this.checkAllData = this.isAllCheck();
    },
    checkSelf(item, group) {
      let isAll = true;
      group.isCheck = !group.isCheck;
      item.group.forEach((element) => {
        if (!element.isCheck) {
          isAll = false;
          return false;
        }
      });
      item.isCheck = isAll;
      this.checkAllData = this.isAllCheck();
    },
    /**
     * 是否全选
     */
    isAllCheck() {
      let isAll = true;
      this.typeList.forEach((d) => {
        if (!d.isCheck) {
          isAll = false;
          return false;
        }
        if (d.group && d.group.length > 0) {
          d.group.forEach((v) => {
            if (!v.isCheck) {
              isAll = false;
              return false;
            }
          });
        }
      });
      return isAll;
    },
    change(isCheck) {
      this.typeList.forEach((d) => {
        d.isCheck = isCheck;
        if (d.group && d.group.length > 0) {
          d.group.forEach((v) => {
            v.isCheck = isCheck;
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.eventType {
  margin-right: 9px;
  display: inline-block;
  position: relative;
}

.eventType:not([disabled="disabled"]) .el-button:first-child:hover {
  color: $highColor;
  border-color: $highColor;
}
.eventType[disabled="disabled"] .el-button {
  cursor: not-allowed;
  opacity: 0.38;
  &:hover {
    border-color: $tabBorderColor;
  }
}
// .eventType-group {
//     position: absolute;
//     z-index: 2;
//     width: 506px;
//     background: #fff;
//     top: 40px;
//     box-shadow: 0 0px 6px #0000001f;
//     padding: 6px 0px;
// }
.eventType-group-panle {
  height: 228px;
  overflow-y: auto;
}

.eventType-group-panle > li {
  display: flex;
  line-height: 36px;
  padding-top: 6px;
}

.checkbox-group-list li {
  display: inline-grid;
  padding: 4px;
  width: 32.66%;
}

.checkbox-group-title {
  font-weight: bold;
  color: $highColor;
  font-size: 14px;
  text-align: right;
  width: 87px;
}
.checkbox-group-list {
  border-bottom: 1px dashed #d2d2d2;
  flex-wrap: wrap;
  width: calc(100% - 110px);
  margin-left: 10px;
}
.checkbox-group-list li a {
  position: relative;
  text-align: left;
  height: 28px;
  line-height: 28px;
  background: #f3f3f3;
  display: block;
  cursor: pointer;
  padding: 0px 9px;
  border: 1px dashed #f3f3f3;
  &.select_all {
    color: $highColor;
  }
}

.checkbox-group-list li a.active {
  border: 1px dashed $highColor;
}

.checkbox-group-list li a:hover:before {
  content: "";
  display: inline-block;
  background-color: $dropdownMenuActive;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  box-sizing: border-box;
}

.checkbox-group-list li a:hover {
  background-color: transparent;
  color: $highColor;
  cursor: pointer;
  border: 1px dashed $highColor;
}

.bottom-panle {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 2px 5px 8px;
  background-color: #fff;
}

.bottom-panle .el-button:hover {
  background-color: $highColor;
  border-color: $highColor;
}
</style>

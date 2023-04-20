import { isNullOrEmpty, isNumber } from "@LIB/base.js";
import HashTable from "@LIB/hashTable.js";
function _utf8_decode(utftext) {
  var string = "";
  var i = 0;
  var c = 0;
  var c2 = 0;
  var c3 = 0;

  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(
        ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
      );
      i += 3;
    }
  }
  return string;
}

export function decodeBase64(input) {
  var keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;

  // if (input != null && input != undefined) {
  //     input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  // }
  // else {
  //     input = "";
  // }
  while (i < input.length) {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  output = _utf8_decode(output);
  return output;
}

/**
 * 格式化载荷信息
 *
 * @method formatPayload
 * @memberOf platform.js
 *
 * @param  {String} value 文字[数组]
 * @return {String} 格式化后文本
 */
export function formatPayload(value) {
  if (!value) return "";

  if (value.indexOf("=?UTF-8?b?") > -1) {
    value = decodeBase64(value.replace("=?UTF-8?b?", ""));
  }
  value = value.replace(/</g, "&lt;").replace(/"/, "‘");
  return value;
}

/**
* 格式文本长度
*
* @method formatTitle
* @memberOf platform.js
*
* @param  {String} text 文本内容
* @param  {Number} length 显示长度，默认18个字符

* @return {String} 格式化后文本
*/
export function formatTitle(text, length) {
  if (!text) return "unknown";
  let maxlength = length || 18;
  if (text.length > maxlength) {
    text = text.substr(0, 8) + "..." + text.substr(text.length - 8, 8);
  }
  return text;
}

/**
 * 格式HTML文本
 *
 * @method formatHtmlXss
 * @memberOf platform.js
 *
 * @param  {String} html html内容
 * @return {String} 格式化后html文本
 */
export function formatHtmlXss(html) {
  html = html
    .replace(/{br}/g, "<br/>")
    .replace(/<a/g, "<span")
    .replace(/a>/g, "/span>")
    .replace(/<A/g, "<span")
    .replace(/A>/g, "/span>")
    .replace(/src/g, "data-src");
  // .replace(/\u000B/g, '').replace(/\u0003/g, '').replace(/\u0014/g, '').replace(/\u001D/g, '').replace('�', '');
  return html;
}

// 设置跳转格式
export function setSessionParam(obj) {
  if (!obj.isData) {
    let datas = obj.isJson ? JSON.stringify(obj.data) : obj.data;
    let typeStorage = obj.type == "_self" ? sessionStorage : localStorage;
    // 设置session key
    typeStorage.setItem("commonSession", obj.sessionName);
    // 填充数据
    typeStorage.setItem(obj.sessionName, datas);
  }
  obj.notOpen ? (window.location = obj.url) : window.open(obj.url, obj.type);
}

// .Net版本中的跳转方法
export function setJump(obj) {
  var datas = obj.isJson ? JSON.stringify(obj.data) : obj.data;
  sessionStorage.setItem(obj.sessionName, datas);
  !obj.isNoOpen && window.open(obj.url, obj.type);
  sessionStorage.removeItem(obj.sessionName);
}

// 获取跳转格式
export function getSessionParam() {
  const key = "commonSession";
  const sessionKey = sessionStorage.getItem(key);
  const localKey = localStorage.getItem(key);

  // 取值
  const jumpParams =
    (sessionKey && sessionStorage.getItem(sessionKey)) ||
    (localKey && localStorage.getItem(localKey)) ||
    null;

  //清除对应的session
  if (sessionKey) {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(sessionKey);
  } else {
    localStorage.removeItem(key);
    localStorage.removeItem(localKey);
  }
  // 如果采用的localstorage 则更改为sessionstorage
  // if (localKey) {
  //     // 设置key
  //     sessionStorage.setItem(key, localKey);
  //     // 填充数据
  //     sessionStorage.setItem(localKey, jumpParams);
  //     // 移除原有的 localstorage
  //     localStorage.removeItem(key);
  //     localStorage.removeItem(localKey);
  // }
  return jumpParams ? JSON.parse(jumpParams) : null;
}

//资产标记跳转
export async function linkAssets(obj) {
  const dataUtils = await import("@LIB/date");
  let baseD = dataUtils.getLatestDays(30),
    sTime = baseD.t2 + " 00:00:00",
    eTime = baseD.t1 + " 23:59:59",
    jumptime = sTime + " - " + eTime;

  if (obj.field == "sip" || obj.field == "dip" || obj.field == "ip") {
    let jumpCondition = {
      connector: "and",
      field: obj.field,
      op: "equal",
      value: obj.value,
    };
    //设置标识，确保资产告警页面展示资产详情
    localStorage.setItem("assetJumpSession", JSON.stringify(obj));

    if (obj.field === "ip") {
      jumpCondition = {
        conds: [
          {
            connector: "or",
            field: "sip",
            leftText: "",
            op: "equal",
            rightText: "",
            value: obj.ip,
          },
          {
            connector: "and",
            field: "dip",
            leftText: "",
            op: "equal",
            rightText: "",
            value: obj.ip,
          },
        ],
      };
    }
    //告警日志:设置跳转条件
    return {
      isJson: true,
      type: "_blank",
      sessionName: "paramListSession",
      url: "/TZ/SituationWarn/AlarmLog",
      data: {
        conditions: [
          jumpCondition,
          //告警日志只支持查最近30天数据
          {
            field: "@createtime",
            op: "range",
            value: jumptime,
            connector: "and",
          },
        ],
      },
    };
  } else {
    //资产管理
    return {
      isJson: true,
      sessionName: "AssetCenter",
      type: "_blank",
      url: "/TZ/SituationWarn/AssetCenter",
      data: {
        conditions: [
          { field: "detecttime", op: "range", value: jumptime },
          {
            conds: [
              { field: "detecttime", op: "range", value: "" },
              { field: "ip", op: "equal", value: obj.value },
            ],
          },
        ],
      },
    };
  }
}
/**
 * 获取国家名字
 *
 * @method getCountryName
 *
 * @param {string} key 中文国家名称
 * @return {string} 英文国家名称
 */
export function getCountryName(key) {
  var hashTable = HashTable.hashTable();
  hashTable.add("中国", "CN");
  hashTable.add("古巴", "CU");
  hashTable.add("捷克", "CZ");
  hashTable.add("德国", "DE");
  hashTable.add("埃及", "EG");
  hashTable.add("芬兰", "FI");
  hashTable.add("斐济", "FJ");
  hashTable.add("法国", "FR");
  hashTable.add("加蓬", "GA");
  hashTable.add("英国", "GB");
  hashTable.add("加纳", "GH");
  hashTable.add("丹麦", "DK");
  hashTable.add("智利", "CL");
  hashTable.add("瑞士", "CH");
  hashTable.add("中非", "CF");
  hashTable.add("巴西", "BR");
  hashTable.add("巴林", "BH");
  hashTable.add("贝宁", "BJ");
  hashTable.add("文莱", "BN");
  hashTable.add("希腊", "GR");
  hashTable.add("关岛", "GU");
  hashTable.add("海地", "HT");
  hashTable.add("印度", "IN");
  hashTable.add("伊朗", "IR");
  hashTable.add("冰岛", "IS");
  hashTable.add("约旦", "JO");
  hashTable.add("日本", "JP");
  hashTable.add("朝鲜", "KP");
  hashTable.add("韩国", "KR");
  hashTable.add("老挝", "LA");
  hashTable.add("马里", "ML");
  hashTable.add("缅甸", "MM");
  hashTable.add("蒙古", "MN");
  hashTable.add("澳门", "MO");
  hashTable.add("荷兰", "NL");
  hashTable.add("挪威", "NO");
  hashTable.add("瑙鲁", "NR");
  hashTable.add("阿曼", "OM");
  hashTable.add("秘鲁", "PE");
  hashTable.add("波兰", "PL");
  hashTable.add("苏丹", "SD");
  hashTable.add("瑞典", "SE");
  hashTable.add("乍得", "TD");
  hashTable.add("多哥", "TG");
  hashTable.add("泰国", "TH");
  hashTable.add("汤加", "TO");
  hashTable.add("台湾", "CN");
  hashTable.add("美国", "US");
  hashTable.add("越南", "VN");
  hashTable.add("也门", "YE");
  hashTable.add("帕劳", "PW");
  hashTable.add("南非", "ZA");
  hashTable.add("黑山", "ME");
  hashTable.add("不丹", "BT");
  hashTable.add("冈比亚", "GM");
  hashTable.add("西班牙", "ES");
  hashTable.add("吉布提", "DJ");
  hashTable.add("喀麦隆", "CM");
  hashTable.add("伯利兹", "BZ");
  hashTable.add("巴哈马", "BS");
  hashTable.add("布隆迪", "BI");
  hashTable.add("比利时", "BE");
  hashTable.add("安道尔", "AD");
  hashTable.add("阿富汗", "AF");
  hashTable.add("安哥拉", "AO");
  hashTable.add("阿根廷", "AR");
  hashTable.add("奥地利", "AT");
  hashTable.add("加拿大", "CA");
  hashTable.add("几内亚", "GN");
  hashTable.add("圭亚那", "GY");
  hashTable.add("黎巴嫩", "LB");
  hashTable.add("科威特", "KW");
  hashTable.add("匈牙利", "HU");
  hashTable.add("爱尔兰", "IE");
  hashTable.add("以色列", "IL");
  hashTable.add("伊拉克", "IQ");
  hashTable.add("意大利", "IT");
  hashTable.add("牙买加", "JM");
  hashTable.add("肯尼亚", "KE");
  hashTable.add("柬埔寨", "KH");
  hashTable.add("莱索托", "LS");
  hashTable.add("立陶宛", "LT");
  hashTable.add("卢森堡", "LU");
  hashTable.add("利比亚", "LY");
  hashTable.add("摩洛哥", "MA");
  hashTable.add("摩纳哥", "MC");
  hashTable.add("马耳他", "MT");
  hashTable.add("马拉维", "MW");
  hashTable.add("墨西哥", "MX");
  hashTable.add("尼日尔", "NE");
  hashTable.add("乌克兰", "UA");
  hashTable.add("乌干达", "UG");
  hashTable.add("乌拉圭", "UY");
  hashTable.add("索马里", "SO");
  hashTable.add("苏里南", "SR");
  hashTable.add("叙利亚", "SY");
  hashTable.add("新加坡", "SG");
  hashTable.add("突尼斯", "TN");
  hashTable.add("土耳其", "TR");
  hashTable.add("佛得角", "CV");
  hashTable.add("马其顿", "MK");
  hashTable.add("梵蒂冈", "VA");
  hashTable.add("赞比亚", "ZM");
  hashTable.add("扎伊尔", "ZR");
  hashTable.add("东帝汶", "TL");
  hashTable.add("卢旺达", "RW");
  hashTable.add("科摩罗", "KM");
  hashTable.add("图瓦卢", "TV");
  hashTable.add("萨摩亚", "WS");
  hashTable.add("尼泊尔", "NP");
  hashTable.add("新西兰", "NZ");
  hashTable.add("巴拿马", "PA");
  hashTable.add("菲律宾", "PH");
  hashTable.add("葡萄牙", "PT");
  hashTable.add("巴拉圭", "PY");
  hashTable.add("卡塔尔", "QA");
  hashTable.add("俄罗斯", "RU");
  hashTable.add("塞舌尔", "SC");
  hashTable.add("刚果（金）", "CD");
  hashTable.add("刚果（布）", "CG");
  hashTable.add("安圭拉岛", "AI");
  hashTable.add("亚美尼亚", "AM");
  hashTable.add("澳大利亚", "AU");
  hashTable.add("阿塞拜疆", "AZ");
  hashTable.add("巴巴多斯", "BB");
  hashTable.add("孟加拉国", "BD");
  hashTable.add("保加利亚", "BG");
  hashTable.add("巴勒斯坦", "BL");
  hashTable.add("玻利维亚", "BO");
  hashTable.add("博茨瓦纳", "BW");
  hashTable.add("白俄罗斯", "BY");
  hashTable.add("库克群岛", "CK");
  hashTable.add("哥伦比亚", "CO");
  hashTable.add("塞浦路斯", "CY");
  hashTable.add("多米尼加", "DO");
  hashTable.add("厄瓜多尔", "EC");
  hashTable.add("爱沙尼亚", "EE");
  hashTable.add("格林纳达", "GD");
  hashTable.add("格鲁吉亚", "GE");
  hashTable.add("直布罗陀", "GI");
  hashTable.add("危地马拉", "GT");
  hashTable.add("圣卢西亚", "LC");
  hashTable.add("斯里兰卡", "LK");
  hashTable.add("利比里亚", "LR");
  hashTable.add("拉脱维亚", "LV");
  hashTable.add("科特迪瓦", "KT");
  hashTable.add("摩尔多瓦", "MD");
  hashTable.add("洪都拉斯", "HN");
  hashTable.add("毛里求斯", "MU");
  hashTable.add("马尔代夫", "MV");
  hashTable.add("马来西亚", "MY");
  hashTable.add("莫桑比克", "MZ");
  hashTable.add("纳米比亚", "NA");
  hashTable.add("尼日利亚", "NG");
  hashTable.add("尼加拉瓜", "NI");
  hashTable.add("巴基斯坦", "PK");
  hashTable.add("罗马尼亚", "RO");
  hashTable.add("波多黎各", "PR");
  hashTable.add("坦桑尼亚", "TZ");
  hashTable.add("委内瑞拉", "VE");
  hashTable.add("瓦努阿图", "VU");
  hashTable.add("基里巴斯", "KI");
  hashTable.add("多米尼克", "DM");
  hashTable.add("波斯尼亚", "BA");
  hashTable.add("塞尔维亚", "RS");
  hashTable.add("津巴布韦", "ZW");
  hashTable.add("南斯拉夫", "YU");
  hashTable.add("克罗地亚", "HR");
  hashTable.add("斯洛伐克", "SK");
  hashTable.add("塞拉利昂", "SL");
  hashTable.add("圣马力诺", "SM");
  hashTable.add("塞内加尔", "SN");
  hashTable.add("萨尔瓦多", "SV");
  hashTable.add("斯威士兰", "SZ");
  hashTable.add("阿尔巴尼亚", "AL");
  hashTable.add("百慕大群岛", "BM");
  hashTable.add("布基纳法索", "BF");
  hashTable.add("埃塞俄比亚", "ET");
  hashTable.add("阿尔及利亚", "DZ");
  hashTable.add("哥斯达黎加", "CR");
  hashTable.add("法属圭亚那", "GF");
  hashTable.add("列支敦士登", "LI");
  hashTable.add("印度尼西亚", "ID");
  hashTable.add("马达加斯加", "MG");
  hashTable.add("哈萨克斯坦", "KZ");
  hashTable.add("吉尔吉斯斯坦", "KG");
  hashTable.add("塔吉克斯坦", "TJ");
  hashTable.add("土库曼斯坦", "TM");
  hashTable.add("毛里塔尼亚", "MR");
  hashTable.add("几内亚比绍", "GW");
  hashTable.add("赤道几内亚", "GQ");
  hashTable.add("厄立特里亚", "ER");
  hashTable.add("马绍尔群岛", "MH");
  hashTable.add("斯洛文尼亚", "SI");
  hashTable.add("沙特阿拉伯", "SA");
  hashTable.add("所罗门群岛", "SB");
  hashTable.add("乌兹别克斯坦", "UZ");
  hashTable.add("蒙特塞拉特岛", "MS");
  hashTable.add("安提瓜和巴布达", "AG");
  hashTable.add("香港特别行政区", "HK");
  hashTable.add("法属玻利尼西亚", "PF");
  hashTable.add("巴布亚新几内亚", "PG");
  hashTable.add("圣基茨和尼维斯", "KN");
  hashTable.add("阿联酋", "AE");
  hashTable.add("阿拉伯联合酋长国", "AE");
  hashTable.add("密克罗尼西亚联邦", "FM");
  hashTable.add("特立尼达和多巴哥", "TT");
  hashTable.add("圣多美和普林西比", "ST");
  hashTable.add("圣文森特和格林纳丁斯", "VC");
  hashTable.add("其他", "Unknown");
  return hashTable.items(key);
}

/**
 * 获取国家class名字
 *
 * @method getCountryClassName
 *
 * @param {string} cnName国家中文名字
 * @return {string} 国家图片链接
 */
export function getCountryClassName(cnName) {
  if (isNullOrEmpty(cnName) || "") return "flag-icon-unknown";
  const enName = getCountryName(cnName);
  if (isNullOrEmpty(enName)) return "flag-icon-unknown";
  return `flag-icon-${enName.toLocaleLowerCase()}`;
}

/**
 * 获取动态分析相关字段
 *
 * @method getDynamicFields
 *
 * @return {Array} 动态分析字段
 */
export function getDynamicFields() {
  let dynamicFields = [];
  const edition = localStorage.getItem("baseLine");
  if (edition != "3") {
    dynamicFields = [
      "basicaction",
      "releasefile",
      "autostart",
      "networkaction",
      "networkurl",
      "dynamicfailedtimes",
      "networkdns",
      "networkip",
      "reportfilesize",
      "releasefilesize",
      "filerisk",
      "dnsip",
      "dnsipcount",
      "taskstate",
      "starttime",
      "endtime",
    ];
  }
  return dynamicFields;
}

/**
 * 获取动静态分析等级标识
 *
 * @method getAnalysisScore
 *
 * @return {Object} 风险等级信息
 */
export function getAnalysisScore(range, score) {
  if (!isNumber(score) || (!score && score != 0)) {
    return {
      fileriskClass: "riskCircle",
      title: "",
      value: "-",
      fileriskfont: "",
    };
  }
  let riskRange = {};
  switch (true) {
    case score >= range[1]:
      riskRange = {
        value: "高 [" + score + "]",
        title: "风险等级：高",
        fileriskClass: "riskHigh",
      };
      break;
    case score > range[0] && score < range[1]:
      riskRange = {
        value: "中 [" + score + "]",
        title: "风险等级：中",
        fileriskClass: "riskMiddle",
      };
      break;
    case score <= range[0]:
      riskRange = {
        value: "低 [" + score + "]",
        title: "风险等级：低",
        fileriskClass: "riskLow",
      };
      break;
  }
  return riskRange;
}

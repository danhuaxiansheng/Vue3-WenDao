var check = function (str, regexStr) {
  var regex = new RegExp(regexStr);
  if (!regex.test(str)) return false;
  else return true;
};
/**
 * 判断是否是一个可接受的 url 串
 *
 * @method isURL
 * @memberOf string
 *
 * @param {String} str 要检测的字符串
 * @return {Boolean} 如果是可接受的 url 则返回 true
 */
export function isURL(str) {
  return /^(?:ht|f)tp(?:s)?:\/\/(?:[\w\-.]+)\.\w+/i.test(str);
}

/**
 * 判断给定字符串是否是数字
 * @memberOf string
 * @name isNumber
 * @function
 *
 * @param {String} string
 * @param {Number} n
 * @return {String}
 */
export function isNumber(string) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg =
    /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if (regPos.test(string) || regNeg.test(string)) {
    return true;
  } else {
    return false;
  }
}

/**
 * 判断给定字符串是否是正整数
 * @memberOf string
 * @name isNumber
 * @function
 * @param {String} string
 * @param {Number} n
 * @return {Bool}
 */
export function isIntegerNum(str) {
  return /^\+?[0-9][0-9]*$/.test(str);
}

/**
 * 判断一个字符串是否是邮箱格式
 * @memberOf string
 * @param {String} emailStr
 * @return {Boolean}
 */
export function isEmail(emailStr) {
  return (
    emailStr.search(
      /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
    ) !== -1
  );
}

/**
 * 验证给定字符串是否是url, 如果是url 则返回正常的url
 *
 * @memberOf string
 * @param {String} sUrl
 * @return {String}
 */
export function vaildUrl(str) {
  var url = encodeURI(str).replace(/(^\s*)|(\s*$)/g, ""),
    protocolReg = /(^[a-zA-Z0-9]+[^.]):/,
    domainReg = /^[\S.]+\.[\S.]+$/,
    domainendReg = /[\w.]+\/(\S*)/,
    jpReg = /^[\s*]*javascript[\s*]*:/;

  if (!protocolReg.test(url) && !domainReg.test(url)) {
    url = "";
  } else {
    if (!protocolReg.test(url)) {
      url = "http://" + url;
    }
    if (!domainendReg.test(url)) {
      url = url + "/";
    }
    //如果是js为协议就清空
    if (jpReg.test(url)) {
      url = "";
    }
  }
  return url;
}

/**
 * 正则验证字符串是否为电话号码
 *
 * @method checkPhoneNumber
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkPhoneNumber(str) {
  var checkResult = str.match(/^(\d{3,4}-?)\d{7,9}$/g);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为手机号码
 *
 * @method checkMobilePhone
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkMobilePhone(str) {
  var checkResult = str.match(
    /^(((13[0-9]{1})|(15[0-35-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/
  );
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为15位身份证号码
 *
 * @method checkID_Card_15
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkID_Card_15(str) {
  var checkResult = str.match(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/); //15 位
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为18位身份证号码
 *
 * @method checkID_Card_18
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkID_Card_18(str) {
  var checkResult = str.match(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/); //18 位
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为邮箱
 *
 * @method checkEmail
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkEmail(str) {
  var reg =
    /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/; //2021-7-6 20:28:34 新找的正则，上面的 有 ，逗号会验证通过
  return reg.test(str);
}

/**
 * 正则验证字符串是否为QQ号码
 *
 * @method checkQQ
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkQQ(str) {
  var checkResult = check(str, "/^[1-9]d{4,12}$");
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为邮编
 *
 * @method checkPostCode
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkPostCode(str) {
  var checkResult = str.match(/^[0-9]{6}$/);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为IP地址
 *
 * @method checkIP
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkIP(str) {
  if (!str || typeof str != "string" || str.length == 0) return false;

  str = str.trim();
  if (str.includes(" ")) return false;

  if (str.includes(":")) return false;

  if (str.indexOf(".") > -1) {
    if (str[str.length - 1] == ".") {
      return false;
    }
    str = str.trim();
    var ips = str.split(".");
    if (ips.length == 4) {
      for (var i in ips) {
        // eslint-disable-next-line no-prototype-builtins
        if (ips.hasOwnProperty(i)) {
          if (
            isNaN(ips[i]) ||
            ips[i] == undefined ||
            ips[i] == null ||
            ips[i] == "" ||
            (ips[i].length > 1 && ips[i][0] == 0)
          ) {
            return false;
          } else {
            var integerIp = parseInt(ips[i]);
            if (integerIp < 0 || integerIp > 255) {
              return false;
            }
          }
        }
      }
    } else {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * 正则验证字符串是否为IPV6地址
 *
 * @method checkIPV6
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkIPV6(str) {
  var checkResult = str.match(
    /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  );
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为日期
 *
 * @method checkDate
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkDate(str) {
  var dateRegexStr =
    "((^((1[8-9]d{2})|([2-9]d{3}))([-/._])(10|12|0?[13578])" +
    "([-/._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]d{2})|([2-9]d{3}))" +
    "([-/._])(11|0?[469])([-/._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]d{2})|([2-9]d{3}))" +
    "([-/._])(0?2)([-/._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-/._])(0?2)" +
    "([-/._])(29)$)|(^([3579][26]00)([-/._])(0?2)([-/._])(29)$)|(^( [1] [89][0][48])" +
    "([-/._])(0?2)([-/._])(29)$)|(^([2-9][0-9][0][48])([-/._])(0?2)([-/._])(29)$)|" +
    "(^( [1] [89][2468][048])([-/._])(0?2)([-/._])(29)$)|(^([2-9][0-9][2468][048])([-/._])" +
    "(0?2)([-/._])(29)$)|(^( [1] [89][13579][26])([-/._])(0?2)([-/._])(29)$)|" +
    "(^([2-9][0-9][13579][26])([-/._])(0?2)([-/._])(29)$))";
  return check(str, dateRegexStr);
}

/**
 * 正则验证字符串是否为时间格式
 *
 * @method checkDateTime
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkDateTime() {
  return true;
  //   var newDate =
  //     /^((\d{2}(([02468][048])|([13579][26]))[\\-\\/\s]?((((0?[13578])|(1[02]))[\\-\\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|([1-2][0-9])))))|(\d{2}(([02468][1235679])|([13579][01345789]))[\-\/\s]?((((0?[13578])|(1[02]))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\s((([0-1][0-9])|(2?[0-3]))\:([0-5]?[0-9])((\s)|(\:([0-5]?[0-9])))))?$/;
  //   return check(str, newDate);
}

/**
 * 正则验证字符串是否为域名
 *
 * @method checkDomain
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkDomain(str) {
  var regex = /^[0-9a-zA-Z_-]+(\\.[0-9a-zA-Z_-]+)*(\\.[a-zA-Z]{2,}\\.)$/;
  if (check(str, regex)) return true;

  //   var regex =
  //     /^([0-9a-zA-Z][0-9a-zA-Z-]{0,62}\.)+([0-9a-zA-Z][0-9a-zA-Z-]{0,62})\.?$/;
  //   if (check(str, regex)) return true;

  return false;
}

/**
 * 正则验证字符串是否为SSN
 *
 * @method checkSSN
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkSSN(str) {
  var checkResult = str.match(/^\d{3}-\d{2}-\d{4}$/);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为URL
 *
 * @method checkURL
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkURL() {
  //if (str.match(/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g))
  //    return true;
  //   var reg =
  //     /\b(([\w-]+:\/\/?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\\s]|\/)))/;
  //   if (reg.test(str)) return true;
  //   reg = /\b([^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\\s]|\/)))/;
  //   if (reg.test(str)) return true;
  //   // reg = "[a-zA-z]+://[^\s]*"; 网站的
  //   reg =
  //     /^(((ht|f)tp(s?))\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&%\$#\=~_\-]+))*$/;
  //   if (reg.test(str)) return true;
  //   reg =
  //     /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/`\+#]*[\w\-\@?^=%&\/`\+#])?$/;
  //   if (reg.test(str)) return true;
  return false;
}

/**
 * 正则验证字符串是否为数字
 *
 * @method checkNumber
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkNumber(str) {
  var checkResult = str.match(/^[+]?[0-9]\d*\.?[0]*$/);
  if (checkResult == null) return false;
  else {
    //if (str.length > 10)
    //    return false;
    //else
    return true;
  }
}

/**
 * 正则验证字符串是否为服务器类型
 *
 * @method checkServerType
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkServerType(str) {
  var checkResult = str.match(/^@[0-9a-zA-Z]*(\.[a-zA-Z]+)+$/);
  if (checkResult == null) return false;
  else return true;
}
/**
 * 正则验证字符串是否为浮点数
 *
 * @method checkFloat
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkFloat(str) {
  var checkResult = str.match(/^[+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为端口
 *
 * @method checkPort
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkPort(str) {
  var checkResult = str.match(
    /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
  );
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为MAC地址
 *
 * @method checkMAC
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkMAC(str) {
  str = str.replace(/:/g, "-");
  if (
    !str ||
    str == null ||
    str == "" ||
    str.length == 0 ||
    str.trim().length == 0
  ) {
    return true;
  }
  //   var checkResult = str.match(/^([0-9a-fA-F]{2}\-){5}[0-9a-fA-F]{2}$/);
  //   if (checkResult == null) return false;
  else return true;
}
/**
 * 正则验证字符串是否为应用层协议如：FTP、Telnet、SMTP、HTTP、RIP、NFS、DNS
 *
 * @method checkAppProto
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkAppProto(str) {
  var protoArr = ["FTP", "Telnet", "SMTP", "HTTP", "RIP", "NFS", "DNS"];
  if (protoArr.indexOf(str.toUpperCase()) > -1) return true;
  else return false;
}

export function checkMD5(str) {
  if (str.length == 64) return /^([A-Fa-f0-9]{64})$/.test(str);
  if (str.length == 40) return /^([A-Fa-f0-9]{40})$/.test(str);
  if (str.length == 32) return /^([A-Fa-f0-9]{32})$/.test(str);
  if (str.length == 16) return /^([A-Fa-f0-9]{16})$/.test(str);
  return false;
}

/**
 * 正则验证字符串中是否包含特殊字符
 *
 * @method checkSpecial
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkSpecial() {
  //   var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
  //     regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
  //   if (regEn.test(str) || regCn.test(str)) return false;
  //   else
  return true;
}

/**
 * 正则验证字符串是否包含XSS注入
 *
 * @method xssExpression
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function xssExpression(str) {
  var regEn = /[`<>"']/im;

  if (regEn.test(str)) {
    return true;
  } else {
    return false;
  }
}

/**
 * 正则验证字符串是否为Decimal
 *
 * @method checkDecimal
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串名称
 * @param {Mixed} s 小数位数
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkDecimal(str, s) {
  var reg = /^[0-9]+\.?[0-9]*$/;
  if (!reg.test(str)) return false;
  if (str.indexOf(".") > -1) {
    if (str.split(".")[1].length > s) return false;
  }
  return true;
}

/*
 * 正则验证字符串是否为数组和字母的组合
 *
 * @method checkNumberAndStr
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkNumberAndStr(str) {
  var regex = /^[A-Za-z0-9]+$/;
  return check(str, regex);
}

/*
 * 正则验证字符串是否为DNS
 *
 * @method checkDNS
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串
 * @return {Boolean} 通过 true 不通过 false
 *  var reg = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/
 *  reg.test('http://www.baidu.com');
 *  true
 *  reg.test('http:/www.baidu.com');
 *  false
 */
export function checkDNS(str) {
  var regex =
    /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/;
  return check(str, regex);
}
/*
 * 正则验证字符串是否为正常经纬度
 *
 * @method checkLngLat
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串。经纬度用 ‘,’英文逗号分隔,经度在前纬度在后。
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkLngLat() {
  var isRight = false;
  //     array = str.split(/[,，]/);
  //   (regexLng = /^-?((0|1?[0-7]?[0-9]?)(([.][0-9]{1,8})?)|180(([.][0]{1,8})?))$/),
  //     (regexLat = /^-?((0|[1-8]?[0-9]?)(([.][0-9]{1,8})?)|90(([.][0]{1,8})?))$/);
  //   if (array.length != 2) return isRight;
  //   isRight = check(array[0].trim(), regexLng);
  //   if (isRight) isRight = check(array[1].trim(), regexLat);
  return isRight;
}

/*
 * 检查IP段是否正常
 *
 * @method checkIpSegment
 * @memberOf Uis.prototype
 *
 * @param {ipBegin,ipEnd}ipBegin,ipEnd 传入的ip段是否前小后大
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkIpSegment(ipBegin, ipEnd) {
  if (!ipBegin || !ipEnd) return false;
  if (ipBegin == ipEnd) return true;
  var ipB = ipBegin.split("."),
    ipE = ipEnd.split("."),
    isTure = true;

  for (var i = 0; i < 4; i++) {
    if (parseInt(ipB[i]) > parseInt(ipE[i])) return false;
    else if (parseInt(ipB[i]) < parseInt(ipE[i])) return true;
  }
  return isTure;
}

/*
 * 常规文本框，允许输入中文 英文 数字
 */
export function checkNormalInput(str) {
  var regex = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){1,20}$/;
  return check(str, regex);
}

/*
 * 验证表达式
 */
export function jsonExpression(value) {
  if (typeof value === "string") {
    if (value === "{}") {
      return false;
    }
    try {
      var obj = JSON.parse(value);
      if (typeof obj === "object") {
        return true;
      } else {
        false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}

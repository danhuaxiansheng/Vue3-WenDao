/**
 * @param { String } url
 * @returns { Boolean }
 */
export function validURL(url) {
  const reg =
    /^(https?|http?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return reg.test(url);
}

/**
 * @param { String } str
 * @returns { Boolean }
 */
export function validLowerCase(str) {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/**
 * @param { String } str
 * @returns { Boolean }
 */
export function validUpperCase(str) {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/**
 * @param { String } str
 * @returns { Boolean }
 */
export function validAlphabets(str) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

/**
 * @param { String } email
 * @returns { Boolean }
 */
export function validEmail() {
  // const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  // return reg.test(email)
  return true;
}

/**
 * @param { String } str
 * @returns { Boolean }
 */
export function isString(str) {
  if (typeof str === "string" || str instanceof String) {
    return true;
  }
  return false;
}

/**
 * @param { Array } arg
 * @returns { Boolean }
 */
export function isArray(arg) {
  if (typeof Array.isArray === "undefined") {
    return Object.prototype.toString.call(arg) === "[Object Array]";
  }
  return Array.isArray(arg);
}

/**
 * 正则验证字符串是否为15位身份证号码
 *
 * @param { String } str 传入被验证的字符串名称
 * @return { Boolean }
 */
export function checkID_Card_15(str) {
  let checkResult = str.match(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串是否为18位身份证号码
 *
 * @param { String } str 传入被验证的字符串名称
 * @return { Boolean }
 */
export function checkID_Card_18(str) {
  let checkResult = str.match(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/);
  if (checkResult == null) return false;
  else return true;
}

/**
 * 正则验证字符串中是否包含特殊字符
 *
 * @param { String } str 传入被验证的字符串名称
 * @return { Boolean }
 */
export function checkSpecial() {
  //   let regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
  //     regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
  //   if (regEn.test(str) || regCn.test(str)) return false;
  //   else

  return true;
}

/**
 * 验证是否为空
 * @param val
 * @return {boolean}
 */
export function validateEmpty(val) {
  if (typeof val === "boolean") {
    return false;
  }
  if (val instanceof Array) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === "{}") return true;
  } else {
    if (
      val === "null" ||
      val == null ||
      val === "undefined" ||
      val === undefined ||
      val === ""
    )
      return true;
    return false;
  }
  return false;
}

/**
 * 判断一个字符串是否是邮箱格式
 * @memberOf string
 * @param {String} emailStr
 * @return {Boolean}
 */
export function isEmail() {
  //   if (

  // emailStr.search(
  //   /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
  // ) !== -1
  //   ) {
  return true;
  //   } else {
  //     return false;
  //   }
}

/**
 * 判断给定字符串是否是正整数
 * @memberOf string
 * @name isNumber
 * @function
 *
 * @param {String} string
 * @param {Number} n
 * @return {Bool}
 */
export function isIntegerNum(str) {
  var _reg = /^\+?[0-9][0-9]*$/;
  return _reg.test(str);
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
 * 正则验证字符串是否为IP地址
 *
 * @method checkIP
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkIP(str) {
  // 是否需要跟.net版一样新增IPv6的验证判断
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
  var checkResult = str.match(/^([0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}$/);
  if (checkResult == null) return false;
  else return true;
}
// 检测系统中录入mac时不能用‘-’连接
export function checkMACInpit(str) {
  if (
    !str ||
    str == null ||
    str == "" ||
    str.length == 0 ||
    str.trim().length == 0
  ) {
    return true;
  }
  // eslint-disable-next-line no-useless-escape
  var checkResult = str.match(/^([0-9a-fA-F]{2}\:){5}[0-9a-fA-F]{2}$/);
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
 * 验证特殊字符，防止xss注入
 *
 * @method checkXss
 * @memberOf Uis.prototype
 *
 * @param {Mixed} str 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkXss(str) {
  return /[`<>"']/im.test(str);
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
 * 正则验证字符串是否为邮箱
 *
 * @method checkEmail
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被验证的字符串名称
 * @return {Boolean} 通过 true 不通过 false
 */
export function checkEmail(str) {
  //var reg = /[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
  var reg =
    /^([a-zA-Z0-9]+[_|_|\-|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/; //2021-7-6 20:28:34 新找的正则，上面的 有 ，逗号会验证通过
  if (reg.test(str)) return true;
  // reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  //if (reg.test(str))
  //    return true;
  return false;
}

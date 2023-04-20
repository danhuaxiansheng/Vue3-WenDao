/**
 * 。。。。
 *
 * @memberOf string
 * @param {Object} obj 要转换成查询字符串的对象
 * @return {String} 返回转换后的查询字符串
 */
export function toQueryString(obj) {
  var result = [];
  for (var key in obj) {
    result.push(toQueryPair(key, obj[key]));
  }
  return result.join("&");
}

export function toQueryPair(key, value) {
  return (
    encodeURIComponent(String(key)) + "=" + encodeURIComponent(String(value))
  );
}

/**
 * 数据容量单位转换
 * 转换的字节 bytes
 *保留几位小数点 num
 * @memberOf string
 *
 * @return {String} 返回转换后的字符串
 */
export function bytesToSize(fileSize, num, type) {
  if (!fileSize || fileSize == 0) return 0;
  if ((fileSize < 1024 && !type) || type == "B") {
    return fileSize + "B";
  } else if ((fileSize < 1024 * 1024 && !type) || type == "KB") {
    return (fileSize / 1024).toFixed(num) + "KB";
  } else if ((fileSize < 1024 * 1024 * 1024 && !type) || type == "MB") {
    return (fileSize / 1024 / 1024).toFixed(num) + "MB";
  } else {
    return (fileSize / 1024 / 1024 / 1024).toFixed(num) + "GB";
  }
}

/**
 * 将字符串转换成整数
 *
 * @memberOf string
 *
 * @return {Number} 返回转换后的整数
 */
export function toInt(string, base) {
  return parseInt(string, base || 10);
}

/**
 * 将字符串转换成浮点数
 *
 * @memberOf string
 * @param {Sring} string 要转换的字符串
 * @return {Number} 返回转换后的浮点数
 */
export function toFloat(string) {
  return parseFloat(string);
}

/**
 * 将颜色 Hex 写法转换成 RGB 写法
 *
 * @memberOf string
 * @return {String} 返回转换后的字符串
 * @author rewrite by dmyang
 */
export function hexToRgb(string) {
  var hex = string.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
  var _convert = function (array) {
    var length = array.length;
    if (length !== 3) return null;
    for (var i = 0, value; i < length; i++) {
      value = array[i];
      if (value.length === 1) value += value;
      array[i] = parseInt(value, 16);
    }
    return "rgb(" + array + ")";
  };
  return hex ? _convert(hex.slice(1)) : null;
}

/**
 * 将颜色 RGB 写法转换成 Hex 写法
 *
 * @memberOf string
 * @return {String} 返回转换后的字符串
 * @author rewrite by dmyang
 */
export function rgbToHex(string) {
  var r = string.match(/\d{1,3}/g);
  return r
    ? "%23" +
        ((1 << 24) + ((r[0] << 0) << 16) + ((r[1] << 0) << 8) + (r[2] << 0))
          .toString(16)
          .slice(1)
    : null;
}

/**
 * 计算字符串的字节长度
 *
 * @memberOf string
 * @param {String} string
 * @param {Number} n 指定一个中文的字节数, 默认为2
 * @return {Number} 返回自己长度
 */
export function byteLength(string, n) {
  n = n || 2;
  // eslint-disable-next-line no-control-regex
  return string.replace(/[^\x00-\xff]/g, { 2: "aa", 3: "aaa" }[n]).length;
}

const _utf8_decode = function (utftext) {
  var string = "";
  var i = 0;
  var c = 0,
    c2 = 0,
    c3;
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
};
export function decodeBase64(input) {
  var keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;

  if (input != null && input != undefined) {
    input = input.replace(/[^A-Za-z0-9\\+\\/\\=]/g, "");
  } else {
    input = "";
  }
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

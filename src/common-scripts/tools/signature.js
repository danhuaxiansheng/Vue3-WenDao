import { getCookie } from "@LIB/auth";
import Cookies from "js-cookie";
import { validateEmpty } from "@LIB/validate";
import { toQueryString } from "@LIB/string";
import { md5_32 } from "@LIB/md5";
import setting from "@/setting.js";
import store from "@/store";

// 通过配置动态获取当前接口地址
export function getApiUrl() {
  let realUrl = "";
  // 是否使用动态接口
  if (setting.dynamicApiUrl && process.env.NODE_ENV !== "development") {
    realUrl = window.location.origin;
  } else {
    realUrl = setting.ApiUrl;
  }
  return realUrl;
}

export function signature(url, data) {
  const apiUrl = "/api";
  const authUrl = "/auth";
  // 获取当前真实url地址
  const realUrl = getApiUrl(url);

  let cancatUrl = (url + "").trim();
  // 动态配置接口地址
  if (/^\/api/.test(url)) {
    cancatUrl = realUrl + setting.ApiPrefix + url.replace(apiUrl, "");
  } else if (/^\/maintain/.test(url)) {
    return realUrl + url;
  } else {
    cancatUrl = realUrl + setting.AuthHost + url.replace(authUrl, "");
  }

  //获取用户token信息
  let token = getCookie("token") || "";
  let pageid = store.state.user.pageinfo?.pageId ?? "";
  let timeStamp = new Date().getTime();
  let nonce = Math.random();
  let comParams = token + pageid + timeStamp + nonce;
  //去除空格，“/”(斜杠)，"\"（反斜杠）， """（双引号），"'"（单引号），"*"（星号）, "["（左中括号）, "]"（右中括号）,"("(左括号),")"(右括号) "!"(感叹号)"+"(加号)"-"(减号)"_"(下划线)"."(小数点)"~"(破折号)
  let concatPam = getObjectData(data, comParams)
    .toLowerCase()
    .replace(/[[_.~()!+\\\]'"\s*//]/g, "")
    .replace(/-/g, "");
  let tempParams = concatPam.split("").sort().join("");
  let signature = md5_32(encodeURIComponent(tempParams).toLowerCase());
  var urlParam = toQueryString({
    token: token,
    pageid: pageid,
    timeStamp: timeStamp,
    nonce: nonce,
    signature: signature,
    koal: JSON.stringify({
      SSL_VERIFY_CERT: Cookies.get("SSL_VERIFY_CERT") || "",
      KOAL_CERT_CN: Cookies.get("KOAL_CERT_CN") || "",
      KOAL_NOT_BEFORE: decodeURI(Cookies.get("KOAL_NOT_BEFORE") || ""),
      KOAL_NOT_AFTER: decodeURI(Cookies.get("KOAL_NOT_AFTER") || ""),
    }),
  });
  return cancatUrl + (cancatUrl.indexOf("?") > -1 ? "&" : "?") + urlParam;
}

export function dataConcatParams(data, params) {
  let strObj = JSON.stringify(data);
  strObj == "{}" ? "" : strObj;
  return strObj + params;
}

export function getObjectData(data, params) {
  if (validateEmpty(data)) {
    return params;
  }

  if (typeof data === "object") {
    return dataConcatParams(data, params);
  }

  //form提交
  if (typeof data == "object" && typeof data.entries == "function") {
    const newData = new Object();
    // const entriesData = data.entries();

    // while (item = entriesData.next()) {
    // 	let _value = item.value;
    // 	if (item.done) break;
    // 	//文件不加密--接口也不加密
    // 	if (_value[0].toLowerCase().includes('file') && typeof _value[1] == 'object') {
    // 		continue;
    // 	}
    // 	newData[_value[0]] = _value[1];
    // }

    return dataConcatParams(newData, params);
  }

  //表格数据处理
  const tempData = data.split("&");
  const tempObj = new Object();
  tempData.forEach(function (item) {
    let tempArr = item.split("=");
    let tempVal = decodeURIComponent(tempArr[1]).replace(/\+/g, " ");
    tempObj[tempArr[0]] = tempVal;
  });

  return dataConcatParams(tempObj, params);
}

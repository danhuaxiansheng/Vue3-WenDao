import axios from "axios";
import store from "@/store";

import { Message } from "element-plus"; //{ UxdMessageBox, UxdMessage }
import { CacheUtils } from "@TOOLS/cacheUtils";
// axios 工具类方法
class axiosUtils {
  constructor() {
    // 返回状态的中文映射
    this.codeMessage = {
      500: "服务器发生错误，请检查服务器",
      502: "网关错误",
      503: "服务不可用，服务器暂时过载或维护",
      504: "网关超时",
    };
    // 错误信息 防抖开关
    this.errorTipsFlag = true;
  }

  // 设置请求缓存列表
  setCacheList(config) {
    let cacheKey = config.url + (config.cacheName || "");
    // 每次发送请求时 对相同请求进行中断
    CacheUtils.cache[cacheKey] && CacheUtils.clear(cacheKey);
    // 将当前请求所对应的取消函数 存入缓存
    config.cancelToken = new axios.CancelToken(function executor(p) {
      CacheUtils.cache[config.url] = p;
    });
    // 存入请求key 响应时 将清除key
    config.cacheKey = cacheKey;
  }

  // 获取错误信息提示语
  getErrorMessage(res) {
    const status = res?.status;
    const message = res?.msg || "未知错误";
    // 错误信息-前缀提示语
    let prefixMessage = "接口请求失败：";
    let msgResult = "";
    switch (status) {
      case 302:
        msgResult = message ?? "当前登录已超时，请重新登录!";
        break;
      case 303:
        msgResult = message ?? "无权访问该页面";
        break;
      case 1002:
        msgResult = prefixMessage + message;
        break;
      default:
        msgResult = message;
    }
    return msgResult;
  }

  // 设置请求参数
  setRequestQuery() {
    // if (typeof config.data === "object" &&
    //     typeof config.data.entries !== 'function') {
    //     if (typeof config.data.systemId == 'boolean') {
    //         config.data.systemId = store.state.user.systemId;
    //     }
    //     // 设置请求参数
    //     config.data = toQueryString(config.data);
    // }
  }
  // 返回内容处理
  responseHandle(response) {
    const res = response.data;
    // 响应之后 清除缓存
    response.config.clearCache &&
      delete CacheUtils.cache[response.config.cacheKey];

    if (typeof res == "object" && !(res.status == 200 || res.code == 0)) {
      // login failed or illegal token, re-login
      if (res.status === 302) {
        store.dispatch("user/resetToken");
        Message({
          message: this.getErrorMessage(res),
          type: "warning",
          duration: 2000,
        });
      }
      // 界面无权限 统一进入404界面 不再单独进行提示
      // 状态1002：登录页面获取系统名称无设置时返回1002
      // 303无权限访问将直接跳转至404，无需再提示
      else if (res.status !== 1002 && res.status != 303) {
        Message({
          message: this.getErrorMessage(res),
          type: "error",
          duration: 2000,
        });
      }
      return Promise.reject(res);
      // return Promise.reject(new Error(this.getErrorMessage(res)))
    } else {
      return res;
    }
  }
  // 返回内容错误错误
  responseError(error) {
    const errorConfig = error.config;
    //消息提示中的内容（可携带标签，如跳转链接）
    let message;
    // 错误提示（不可携带标签）
    let msg = error.message || "接口服务链接失败";

    // 响应之后 清除缓存
    if (errorConfig && errorConfig.clearCache) {
      delete CacheUtils.cache[errorConfig.cacheKey];
    }
    // 跳过清理上次请求时导致的错误
    if (error.__CANCEL__) {
      return Promise.reject({ name: "abort", message: "重复请求，已被中断！" });
    }

    if (
      error.isAxiosError &&
      error.request.status === 0 &&
      error.message === "Network Error"
    ) {
      msg = "接口未授信，请信任此链接。";
      message = `接口未授信，请信任<a href="${errorConfig.url}" style ="text-decoration: underline" target="_blank">此链接</a>。`;
    }
    if (error.message === `Cannot read property 'token' of undefined`) {
      msg = "登录已过期，请重新登录!";
    }
    if (error.code === "ECONNABORTED") {
      msg = "服务连接超时，请联系管理员！";
    }
    if (this.codeMessage[error.code]) {
      msg = this.codeMessage[error.code];
    }
    if (this.errorTipsFlag) {
      this.errorTipsFlag = false;
      Message({
        message: message || msg,
        dangerouslyUseHTMLString: true,
        type: "error",
        duration: 3000,
        onClose: () => {
          this.errorTipsFlag = true;
        },
      });
    }
    return Promise.reject(new Error(msg));
  }
}

const aUtils = new axiosUtils();

const service = axios.create({
  baseURL: "", // process.env.VUE_APP_BASE_API,
  timeout: 3000000,
});

// req interceptor
service.interceptors.request.use(
  (config) => {
    // 设置请求参数
    config.data && aUtils.setRequestQuery(config);
    // 当前接口是否可中断请求  如果可以中断则加入缓存列表
    config.clearCache && aUtils.setCacheList(config);
    // 拼接格尔网关必要参数
    // config.url = signature(config.url, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// res interceptor
service.interceptors.response.use(
  // 对返回的接口数据进行处理
  (response) => aUtils.responseHandle(response),
  // 对错误返回进行消息处理
  (error) => aUtils.responseError(error)
);

export default service;

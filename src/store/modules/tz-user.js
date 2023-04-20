import { getPageInfo } from "@API/user";
import { getCookie, setCookie, removeAllCookie } from "@LIB/auth";
import { MenuTools } from "@/router/menus.js";
import Layout from "@/views/Layout/layout.vue";

import { getDynamicFields } from "@PAGE/platform.js";
import _ from "lodash";

class UserTools {
  constructor() {}
  /**
   * 用户token未过期，并且已经有当前界面缓存，则直接使用缓存
   * @param {string} uri
   * @param {string} systemId
   * @returns {object} data
   */
  getCachePageInfo({ url, systemId }) {
    return new Promise((resolve, reject) => {
      const cacheKey = "pageInfo_" + url + systemId;
      const infoData = JSON.parse(localStorage.getItem(cacheKey));
      if (infoData) {
        resolve(infoData);
      } else {
        getPageInfo({ uri: url, systemId })
          .then((response) => {
            let { data } = response;
            if (!data || !data.modules) {
              return reject("验证失败，请重新登录。");
            }
            // if (data.modules.length == 0) {
            //   return reject("无界面权限，请重新登录。");
            // }
            // data = this.pageInfoHandle(data);
            localStorage.setItem(cacheKey, JSON.stringify(data));
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  /**
   *对用户信息进行处理
   * @param {object} data
   * @returns
   */
  pageInfoHandle(data) {
    // 表格列  --用于设置表格字段的宽度、排序等等。
    let pageInfoColumns = data.pageInfo?.columns ?? [];
    let dynamicFields = getDynamicFields(); //动态分析字段

    pageInfoColumns = pageInfoColumns.filter((d) => {
      if (state.baseLine == 3) {
        return true;
      }
      //非专业版：需过滤掉动态分析字段
      return !dynamicFields.includes(d.field);
    });
    data.pageInfo.columns = pageInfoColumns;
    // 接口目前没有返回primaryKey值，需要手动设置
    if (!data.pageInfo.primaryKey) {
      data.pageInfo.primaryKey =
        data.currentModule.dataSource === "ES" ? "indexid" : "ID";
    }
    return data;
  }
}

// 工具方法
const userTools = new UserTools();

const state = {
  token: getCookie("token"),
  projectUser: getCookie("projectUser"), // 资产管理权限标识
  baseLine: localStorage.getItem("baseLine"), //  系统标识（1 基础版，2 标准版，3 专业版）
  certStatus: localStorage.getItem("certificateStatus"), //证书状态
  userName: getCookie("userName"),
  systemId: getCookie("systemId"),
  permissionRoutes: [],
  layoutRoutes: [],
  pageinfo: {},
  moduleInfo: {},
  menuList: [], // 场景分析（和其子菜单导航栏“切换”按钮下拉数据）的菜单
};

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_PROJECTUSER: (state, projectUser) => {
    state.projectUser = projectUser;
  },
  SET_BASELINE: (state, val) => {
    state.baseLine = val;
  },
  SET_SYSTEMID: (state, systemId) => {
    //0：权限系统 1: 问道系统
    state.systemId = systemId;
  },
  SET_USERNAME: (state, userName) => {
    state.userName = userName;
  },
  SET_PAGEINFO: (state, pageInfo) => {
    state.pageinfo = pageInfo;
  },
  SET_LAYYOUTROUTES: (state, newRoutes) => {
    // 记录下增量路由，用于在导航栏数据加载
    state.layoutRoutes = newRoutes;
  },
  SET_PERMISSROUTES: (state, newRoutes) => {
    state.permissionRoutes = newRoutes;
  },
  SET_MODULEINFO: (state, moduleInfo) => {
    state.moduleInfo = moduleInfo;
  },
  SET_MENULIST: (state, menuList) => {
    state.menuList = menuList;
  },
  SET_CERTSTATUS: (state, status) => {
    localStorage.setItem("certificateStatus", status);
    state.certStatus = status;
  },
};

const actions = {
  login({ commit }, userInfo) {
    return new Promise((resolve) => {
      const data = {
        token: "ssss",
        userName: "管理员",
        mainUrl: "/TZ/SituationWarn/Home",
      };
      setCookie("token", data.token);
      setCookie("userName", data.userName);
      setCookie("systemId", userInfo.systemId);
      setCookie("needUpdatePwd", false);
      setCookie("needUpdatePwdFlag", false);

      commit("SET_TOKEN", data.token);
      commit("SET_USERNAME", data.userName);
      commit("SET_SYSTEMID", userInfo.systemId);
      resolve(data);
      // login(userInfo).then(response => {
      //     const { data } = response
      //     setCookie('token', data.token)
      //     setCookie('userName', data.userName)
      //     setCookie('systemId', userInfo.systemId)
      //     setCookie("needUpdatePwd", data.needUpdatePwd);
      //     setCookie("needUpdatePwdFlag", data.needUpdatePwdFlag);

      //     commit('SET_TOKEN', data.token)
      //     commit('SET_USERNAME', data.userName)
      //     commit('SET_SYSTEMID', userInfo.systemId)
      //     resolve(data)
      // }).catch(error => {
      //     reject(error)
      // })
    });
  },

  logout() {
    return new Promise((resolve) => {
      this.dispatch("user/resetToken");
      resolve();
      //   if (state.token) {
      //     logout(state.token)
      //       .then(() => {
      //         this.dispatch("user/resetToken");
      //         resolve();
      //       })
      //       .catch((error) => {
      //         reject(error);
      //       });
      //   } else {
      //     this.dispatch("user/resetToken");
      //     resolve();
      //   }
    });
  },

  /**
   * 获取界面信息
   */
  getPageInfo({ commit }, params) {
    return new Promise((resolve) => {
      const reqParams = { url: params.url, systemId: this.state.user.systemId };
      //获取用户信息
      userTools.getCachePageInfo(reqParams).then((data) => {
        commit("SET_MODULEINFO", data);
        commit("SET_PAGEINFO", data.pageInfo);
        //菜单列表
        resolve(data.modules);
      });
    });
  },

  /**
   * remove token
   * @param {*}
   * @returns
   */
  resetToken({ commit }) {
    return new Promise((resolve) => {
      let systemId = getCookie("systemId");

      // 清空所有Cookie
      removeAllCookie();
      // 清除所有缓存。
      sessionStorage.clear();
      localStorage.clear();

      setCookie("systemId", systemId); // 退出登录，保留systemId
      commit("SET_PERMISSROUTES", []);
      commit("SET_LAYYOUTROUTES", []);

      // 重置vuex变量值
      commit("SET_TOKEN", "");
      commit("SET_PROJECTUSER", "");
      commit("SET_USERNAME", "");
      commit("SET_SYSTEMID", "");
      commit("SET_MENULIST", []);

      // resetRouter()
      resolve();
    });
  },

  /**
   * 设置动态路由
   * @param {*} param0
   * @param {*} menus
   * @returns
   */
  generateRoutes({ commit }, menus) {
    return new Promise((resolve) => {
      const newRoutes = new MenuTools().buildRouter(menus);
      let pRouter = [
        { path: "", component: Layout, meta: {}, children: newRoutes },
      ];
      commit("SET_LAYYOUTROUTES", newRoutes);
      commit("SET_PERMISSROUTES", pRouter);
      resolve(pRouter);
    });
  },

  /**
   * 获取场景分析（和其子菜单导航栏“切换”按钮下拉数据）的菜单
   * @param {*} param0
   * @returns
   */
  getMenuList({ commit }) {
    return new Promise((rev, rej) => {
      if (state.menuList.length) rev(_.merge([], state.menuList));
      else
        getPageInfo({ systemId: state.systemId })
          .then((res) => {
            let menuClone = res.data.modules,
              menus = menuClone.filter(
                (item) => item.fullName != "威胁预警中心"
              ),
              menuList = menus.map((item) => item.childNodes).flat();
            commit("SET_MENULIST", menuList);
            rev(_.merge([], menuList));
          })
          .catch((error) => {
            rej(error);
          });
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

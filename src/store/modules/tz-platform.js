// import { qrySystemLogo, getIcon } from "@API/system.js";
import { getSearchMap } from "@API/TZ/AssetCenter.js";
// import { getApiUrl } from "@TOOLS/signature";

// import setting from "@/setting.js";
import defaultLogo from "@AST/js/logo.js";
// import { isNullOrEmpty } from "@LIB/base.js";

const state = {
  checkeLists: [], // 卡片等多选的选项，在需要使用的组件初始化时就重置，可以达到用于任意需要多选的地方
  treeNodes: {}, // 组织架构节点
  searchbarMapping: {}, // searchBar映射
  systemLogo: JSON.parse(localStorage.getItem("systemLogo")) ?? null, // （登录/主页）系统logo
  systemIcon: null, // 系统favicon
};

const mutations = {
  set_node_tree(state, treeNode) {
    state.treeNodes = treeNode;
  },
  set_checke_list(state, lists) {
    state.checkeLists = lists;
  },
  SET_SEARCHMAPPING: (state, searchbarMapping) => {
    state.searchbarMapping = searchbarMapping;
  },
  SET_SYSTEMLOGO: (state, systemLogo) => {
    state.systemLogo = systemLogo;
  },
  SET_SYSTEMICON: (state, systemIcon) => {
    state.systemIcon = systemIcon;
  },
};

const actions = {
  searchMap({ commit }) {
    return new Promise((resolve, reject) => {
      if (JSON.stringify(state.searchbarMapping) == "{}") {
        getSearchMap()
          .then((response) => {
            const { data } = response;
            //提交vuex存储
            commit("SET_SEARCHMAPPING", data);
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve(state.searchbarMapping);
      }
    });
  },
  systemLogo({ commit }) {
    return new Promise((resolve) => {
      let systemLogo = {};
      const logo = localStorage.getItem("systemLogo");
      // 后台没有设置系统logo的时候的默认值；manager管理系统，business业务系统
      if (state.systemLogo) {
        resolve(state.systemLogo);
      } else if (logo) {
        systemLogo = JSON.parse(logo);
        commit("SET_SYSTEMLOGO", systemLogo);
        resolve(systemLogo);
      } else {
        // qrySystemLogo(param).then(response => {
        // let resuleImg = response?.data?.img;
        // systemLogo = resuleImg ? { home: resuleImg, login: resuleImg } : defaultLogo;
        //提交vuex存储
        commit("SET_SYSTEMLOGO", defaultLogo);
        // 是否用的默认logo
        localStorage.setItem("isDefaultSyetemLogo", true);
        localStorage.setItem("systemLogo", JSON.stringify(defaultLogo));
        resolve(defaultLogo);
        // }).catch(error => { reject(error) })
      }
    });
  },
  systemIcon({ commit }) {
    return new Promise((resolve) => {
      if (state.systemIcon) resolve(state.systemIcon);
      else {
        // let apiUrl = `/auth/external/getIcon`;
        // getIcon(apiUrl, {
        //     systemId: 99
        // }).then(response => {
        // if (response) {
        const systemIcon = { iconUrl: "/img/favicon.ico", icoVersion: 1 };
        // const systemIcon = {
        //     iconUrl: getApiUrl() + apiUrl.replace('/auth', setting.AuthHost),
        //     icoVersion: Math.floor(Math.random() * 1000)
        // };
        // 完全升级Vue后，可删除
        localStorage.setItem("favicon", systemIcon.iconUrl);
        localStorage.setItem("icoVersion", systemIcon.icoVersion);
        //提交vuex存储
        commit("SET_SYSTEMICON", systemIcon);
        resolve(systemIcon);
        // } else {
        //     // 完全升级Vue后，可删除
        //     localStorage.removeItem('favicon');
        //     localStorage.removeItem('icoVersion');
        //     //提交vuex存储
        //     commit('SET_SYSTEMICON', null);
        //     resolve(null)
        // }
        // }).catch(error => { reject(error) })
      }
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

// import Vue from 'vue'
import Vuex from "vuex";
import getters from "./getters";

import user from "./modules/tz-user";
import fullScreen from "./modules/tz-fullScreen";
import tagsView from "./modules/tz-tagviews";
import tz from "./modules/tz-platform";
import plug from "./modules/tz-pageLayout";
import tabContent from "./modules/tz-tabContent";
import searchBar from "./modules/tz-searchBar";
import gridBar from "./modules/tz-gridbar";
import onekeySearch from "./modules/tz-onekeySearch";
// Vue.use(Vuex)
const store = new Vuex.Store({
  getters,
  modules: {
    user,
    tz,
    plug,
    gridBar,
    tagsView,
    searchBar,
    fullScreen,
    tabContent,
    onekeySearch,
  },
});

export default store;

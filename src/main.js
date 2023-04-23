import { createApp } from "vue";
import App from "./App.vue";

import router from "./router";
import store from "./store";

import ElementPlus from "element-plus";

import "./router/permission.js";

// 三方组件样式
import "element-plus/dist/index.css";
import "normalize.css";
import "@STYLES/index.scss";
import "@AST/iconfont/iconfont.js";
// import "@COMP/TZ/global/index";

createApp(App).use(ElementPlus).use(router).use(store).mount("#app");

// import lodash from 'lodash'
// import './common-scripts/tools/error-log'
// import Events from './common-scripts/lib/events'
// import ContextMenu from '@/directive/ContextMenu';
// Vue.use(ContextMenu);
// import filters from '@FLT';
// Object.keys(filters).forEach(key => {
//     Vue.filter(key, filters[key])
// })
// Vue.prototype.$lodash = lodash
// Vue.prototype.$bus = new Events()
// Vue.config.productionTip = false

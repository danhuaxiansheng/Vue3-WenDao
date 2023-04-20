import router from "@/router";
import store from "@/store";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getCookie } from "@LIB/auth";

import setting from "@/setting.js";
NProgress.configure({ showSpinner: false });

// pages that can be accessed without log in
const whiteList = ["/login", "/home/login", "/404"];

function hasRoles(path, routerList) {
  let isPath = false;
  for (var i = 0; i < routerList.length; i++) {
    let item = routerList[i];
    if (item.children && item.children.length > 0) {
      isPath = hasRoles(path, item.children);
      if (isPath) {
        break;
      }
    } else if (item.path === path && item.meta.select) {
      isPath = true;
      break;
    }
  }
  return isPath;
}

async function getRouterList(path) {
  // get user info
  // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
  const modules = await store.dispatch("user/getPageInfo", { url: path });
  // // generate accessible routes map based on roles
  const accessRoutes = await store.dispatch("user/generateRoutes", modules);
  // // dynamically add accessible routes
  router.addRoutes(accessRoutes);
}

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();
  // 最新的token
  const cookieToken = getCookie("token");
  // 当前缓存的token
  const storeToken = store.getters.token;
  // 路径小写
  const toPathLower = to.path.toLocaleLowerCase();

  if (!cookieToken) {
    whiteList.includes(toPathLower)
      ? next()
      : (next(`/login`), NProgress.done());
  } else {
    switch (!0) {
      case storeToken && cookieToken !== storeToken:
        // 如果最新的token与缓存在本地的token不相同，那么当前的token已经被退出了。
        store.dispatch("user/resetToken"), next({ path: `/login` });
        break;
      case whiteList.includes(toPathLower):
        //访问白名单界面并且有token，如不是404，则访问首页
        toPathLower === "/404" ? next() : next({ path: "/" });
        NProgress.done();
        break;
      default:
        // 进入权限验证
        // eslint-disable-next-line no-case-declarations
        const isRole =
          toPathLower !== "/"
            ? hasRoles(to.path, store.state.user.permissionRoutes)
            : true;

        if (isRole) {
          next();
        } else {
          try {
            await getRouterList(to.path);
            next({ ...to, replace: true });
          } catch (error) {
            if ("object" === typeof error) {
              // 用户超时
              if (Object.hasOwn(error, "status") && error.status === 302) {
                store.dispatch("user/resetToken");
                next({ path: `/login` });
              } else {
                // 无权限访问
                next({
                  path: "404",
                  query: {
                    msg: error.msg,
                    status: error.status,
                  },
                  //阻止当前路由信息出现在历史记录中
                  replace: true,
                });
              }
            }
            NProgress.done();
          }
        }
        break;
    }
  }
});

router.afterEach((to) => {
  let systemId = getCookie("systemId") || 1,
    //根据系统id确定系统名称
    systemType = systemId == "1" ? "manager" : "business";
  document.title = to.meta.text || setting.SystemName[systemType];
  NProgress.done();
});

// import Vue from "vue";
// import VueRouter from "vue-router";

import { createRouter, createWebHistory } from "vue-router";

// import { getCookie, removeCookie } from "@LIB/auth";
/**
 * 解决重定向报错问题
 * @type {((location: RawLocation) => Promise<Route>) | ((location: RawLocation, onComplete?: Function, onAbort?: ErrorHandler) => void)}
 */
// const originalPush = VueRouter.prototype.push;
// VueRouter.prototype.push = function push(location, onResolve, onReject) {
//   if (onResolve || onReject)
//     return originalPush.call(this, location, onResolve, onReject);
//   return originalPush.call(this, location).catch((err) => err);
// };

// Vue.use(VueRouter);

/**
 * constantRoutes
 * a base page that does not have Permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/",
    // redirect: () => {
    //     let token = getCookie('token');
    //     let login = '/login'
    //     if (!token) {
    //         return login;
    //     } else {
    //         let url = localStorage.getItem('mainPage');
    //         if (!url) {
    //             url = login;
    //             removeCookie('token')
    //         }
    //         return url;
    //     }
    // }
  },
  // {
  //   path: "*",
  //   component: () => import("@/views/Error/error-404.vue"),
  //   hidden: true,
  // },
  {
    path: "/403",
    component: () => import("@/views/Error/error-403.vue"),
    hidden: true,
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/Error/error-404.vue"),
    hidden: true,
  },
  {
    path: "/500",
    component: () => import("@/views/Error/error-500.vue"),
    hidden: true,
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login/login.vue"),
  },
];

/**
 * init Router / dynamic register router
 * initialize the route only mount constantRoutes
 * need Permission control to add through Route.addRoutes
 */
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
});

// const createRouter = () =>
//   new VueRouter({
//     // require service support
//     mode: "history",
//     scrollBehavior: () => ({ y: 0 }),
//     routes: constantRoutes,
//   });

export function resetRouter() {
  // const newRouter = createRouter();
  router.options.routes = [];
  // hack: replace router
  // router.matcher = newRouter.matcher;
}

export default router;

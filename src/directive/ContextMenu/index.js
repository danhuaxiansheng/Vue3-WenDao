import Vue from "vue";
import contextMenuVue from "./main.vue";

const ContextMenuConstructor = Vue.extend(contextMenuVue);
let instance;
const ContextMenu = function (options) {
  try {
    let e = options.event;
    e.preventDefault();
  } catch (e) {
    console.log(e);
  }
  // if (Vue.prototype.$isServer) return;

  return new Promise((resolve) => {
    let scrollContainer,
      optContainer = options.scrollHideContainer || document.body;
    scrollContainer =
      typeof optContainer == "string"
        ? document.querySelector(optContainer)
        : optContainer;
    const remove = function () {
      document.body.removeChild(instance.$el);
      document.body.removeEventListener("click", bodyClick);
      scrollContainer.removeEventListener("scroll", bodyClick);
      instance = null;
    };
    const bodyClick = function (e) {
      if (options.event.type !== "click" || e !== options.event) {
        instance.resolve("");
      }
    };
    if (instance) {
      // 如果还有上一个未关闭
      instance.resolve("");
    }
    instance = new ContextMenuConstructor({
      el: document.createElement("div"),
    });
    if (options.icon !== undefined) instance.icon = options.icon;
    if (options.menu !== undefined) instance.menu = options.menu;
    if (options.targetData !== undefined)
      instance.targetData = options.targetData;
    instance.menuDeep = getMenuDeep(instance.menu);
    if (options.parentNodeCanBeChoosed !== undefined)
      instance.parentNodeCanBeChoosed = options.parentNodeCanBeChoosed;
    if (options.event !== undefined) {
      let axis;
      if (!options.asideNode) {
        axis = { x: options.event.x, y: options.event.y };
      } else {
        let e = options.event,
          bounding = e.target.getBoundingClientRect(),
          width = e.target.offsetWidth,
          height = e.target.offsetHeight;
        axis = { x: bounding.x + width, y: bounding.y + height };
      }
      instance.axis = axis;
    }
    instance.resolve = function () {
      // 必须先判断arguments[0]是否存在，不存在则表示没选择任何菜单（为关闭菜单的事件）
      if (
        arguments[0] &&
        options.callback &&
        typeof options.callback == "function"
      )
        options.callback.apply(instance, [options.targetData, ...arguments]);
      resolve(arguments[0]);
      remove();
    };
    // instance.reject = reject;// 这里不reject了，如果不点击则会传空字符串，不跑报错，简化写法
    document.body.appendChild(instance.$el);
    document.body.addEventListener("click", bodyClick);
    scrollContainer.addEventListener("scroll", bodyClick);
  });
};

const getMenuDeep = function (menuList) {
  let deep = 1;
  for (const i in menuList) {
    if (menuList[i].children instanceof Array && menuList[i].children.length) {
      if (1 + getMenuDeep(menuList[i].children) > deep) {
        deep = deep + getMenuDeep(menuList[i].children);
      }
    }
  }
  return deep;
};

const ContextMenuDirective = {
  bind(el, binding) {
    el.addEventListener("click", function (event) {
      binding.value.event = event;
      ContextMenu(binding.value);
    });
  },
};

const ContextMenuClose = function () {
  if (instance) instance.resolve("");
};

export default {
  install: function (Vue) {
    // 版本一：全局挂载
    // Vue.prototype.$ContextMenu = ContextMenu;
    // 版本二：自定义指令
    Vue.directive("menu", ContextMenuDirective);
  },
};
export { ContextMenu, ContextMenuDirective, ContextMenuClose };

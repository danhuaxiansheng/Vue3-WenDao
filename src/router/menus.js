export class MenuTools {
  constructor() {
    //临时父组件  解决跨级子组件不能加载问题
    this.defaultRecom = {
      template: "<router-view></router-view>",
    };
  }
  buildRouter(menusList) {
    let routerList = [];
    menusList.forEach((item) => {
      //   if (item.enabledMark === true) {
      let menu = {
        path: item.childNodes && item.childNodes.length ? "" : item.urlAddress,
        component: this.getComponent(item),
        meta: {
          icon: item.icon,
          menu: item.menu,
          style: item.style,
          alarm: item.alarm,
          enCode: item.enCode,
          text: item.fullName,
          pageId: item.pageId,
          select: item.select,
          index: item.urlAddress,
          sortCode: item.sortCode,
          allowEdit: item.allowEdit,
          indexName: item.indexName,
          deleteMark: item.deleteMark,
          allowDelete: item.allowDelete,
        },
      };
      if (item.childNodes && item.childNodes.length > 0) {
        menu.children = this.buildRouter(item.childNodes);
      }
      routerList.push(menu);
      //   }
    });
    return routerList;
  }

  tryRequire(path, index = 0) {
    let list = [".vue", "/index.vue"];
    try {
      let newPath = path + list[index];
      require("@/views" + newPath);
      return newPath;
    } catch (err) {
      return index < list.length - 1
        ? this.tryRequire(path, index + 1)
        : "/TZ/Default/index.vue";
    }
  }

  // 设置组件
  getComponent(item) {
    return item.childNodes && item.childNodes.length
      ? this.defaultRecom
      : (resolve) => this.getViewPath(item.urlAddress, resolve);
  }
  // 获取路径
  getViewPath(path, resolve) {
    let htmlPath = "/TZ/Default/index.vue";
    const vuePath = path + ".vue";
    const indexVuePath = path + "/index.vue";
    const vueFile = this.tryPath(vuePath);
    if (vueFile) {
      htmlPath = vuePath;
    } else {
      const indexVueFile = this.tryPath(indexVuePath);
      if (indexVueFile) {
        htmlPath = indexVuePath;
      }
    }
    return require(["@/views" + htmlPath], resolve);
  }
  // 尝试获取文件 如果不存在 则返回null
  tryPath(path) {
    try {
      require("@/views" + path);
      return path;
    } catch (err) {
      return null;
    }
  }
}

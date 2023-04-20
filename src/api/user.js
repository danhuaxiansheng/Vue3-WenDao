import request from "@/common-scripts/request";

// 登录验证
export function login(data) {
  return request({
    url: "/auth/common/login/login",
    method: "post",
    clearCache: true,
    data,
  });
}

// 退出登录
export function logout() {
  return request({
    url: "/auth/common/login/loginOut",
    method: "post",
    clearCache: true,
  });
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: "/auth/common/login/changePassword",
    method: "post",
    clearCache: true,
    data,
  });
}

// 登录后，获取菜单信息
export function getPageInfo() {
  return new Promise((resolve) => {
    let modules = [
      {
        urlAddress: "/TZ/SituationWarn/Home",
        fullName: "告警首页",
        sortCode: 1,
        select: true,
      },
      {
        urlAddress: "/TZ/SituationWarn/ThreatEvent",
        fullName: "威胁事件",
        sortCode: 2,
        select: false,
      },
      {
        urlAddress: "/TZ/SituationWarn/BusinessAnalysis",
        fullName: "菜单模块",
        sortCode: 3,
        select: false,
      },
    ];
    resolve({
      data: {
        modules: modules,
      },
    });
  });
  // return request({ url: '/auth/common/user/moduleList', method: 'post', data })
}

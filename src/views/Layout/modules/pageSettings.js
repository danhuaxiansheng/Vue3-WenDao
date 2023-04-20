
/*
* 配置系统导航栏功能 -by -zhp
* cert   : 证书（证书详情、证书下载）
* user   : 用户信息（修改密码，退出登录）
*/
export const systemConfig = [
    {
        cert: { isEnable: false },
        user: {
            isEnable: true,
            children: [
                { text: "修改密码", icon: "el-icon-lock-filled" },
                { text: "退出登录", icon: "el-icon-menu-filled" },
            ]
        }
    },
    {
        cert: { isEnable: true },
        user: {
            isEnable: true,
            children: [
                { text: "修改密码", icon: "el-icon-lock-filled" },
                { text: "退出登录", icon: "el-icon-menu-filled" },
            ]
        }
    },
];

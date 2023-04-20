

// 接口请求地址
const ApiUrl = "https://192.168.120.101:4435";
module.exports = {
    /*
     *@type {string}
     *@desc 系统名称 主副标题空格隔开
     */
    SystemName: {
        manager: "XXXX系统",
        business: "XXXX系统 权限管理系统",
    },

    /*
     *@type {string}
     *@desc 系统版本号
     */
    Version: "V1.1.0",

    /*
    *@type {boolean}
    *@desc 是否使用动态url
    */
    dynamicApiUrl: true,

    /*
     *@type {string}
     *@desc 接口api地址，在登录页获取运维系统版本号时用到
     */
    ApiUrl,

    /*
     *@type {string}
     *@desc 问道业务接口地址  用于获取数据
     */
    ApiPrefix: `/webService`,

    /*
     *@type {string}
     *@desc 认证中心地址  用于获取数据
     */
    AuthHost: `/permissionService`,

    /*
     *@type {string}
     *@desc 问道系统ID
     */
    WdSystemID: "3d08df85-be70-4982-85f0-e94467e4cd08",

    /*
     *@type {string}
     *@desc 证书地址，后缀名为 .pfx
     */
    CertificatePath: "Deployment/tzCertmgr.pfx",

    /*
     *@type {string}
     *@desc 证书密码
     */
    CertificatePwd: "tanzhi888",

    /*
     *@type {string}
     *@desc 加密Key
     */
    AesKeyWords: "tanzhi8888888888",

    /*
     *@type {boolean}
     *@desc 是否启动回溯客户端
     */
    IsQXClient: false,

    /*
     *@type {boolean}
     *@desc 是否启用二次验证（导出/删除）
     */
    IsSafeVerify: false,

    /*
     *@type {string}
     *@desc /中转地址：接口部署的真实地址 https://10.10.66.101:8082
     */
    ProxyAddress: "",

    /*
     *@type {number}
     *@desc 登录的系统类型； 1: 问道系统  2：权限系统
     */
    LoginType: 1,

    /*
     *@type {string}
     *@desc 登录接口获取用户ip
     */
    UserIp: '127.0.0.1'
}
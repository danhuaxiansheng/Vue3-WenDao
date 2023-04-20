import { getApkCode } from "@/api/TZ/businessAnalysis.js";
import { checkIP } from "@LIB/validate.js";
import { exporter } from "@TOOLS/export.js";
export default {
    data() {
        return {
            ws: null,
            timer: null,
            loading: false,
            wsApi: 'ws://127.0.0.1:12345'
        }
    },
    methods: {
        routerJump({ urlAddress, enCode }) {
            let path = urlAddress;
            switch (enCode) {
                // 运维管理系统
                case 'icon-yunweimanage':
                    this.openMaintainWeb(path);
                    break;
                // 全流量分析系统
                case 'icon-holographic':
                    this.openQxClient();
                    break;
                default:
                    this.openDefault(path);
            }
        },
        // 打开默认系统
        openDefault(path) {
            let href = this.$router.resolve({ path }).href;
            window.open(href, '_blank');
        },
        // 打开运维系统
        openMaintainWeb(path) {
            let tempIp = path.split("//")[1].split(":")[0];
            let href = path.replace(tempIp, window.location.hostname);
            window.open(href, '_blank');
        },
        // 打开全息客户端
        async openQxClient() {
            const hostname = window.location.hostname,
                apkeyIp = checkIP(hostname) ? hostname : "127.0.0.1",
                code = await this.getApkCode(apkeyIp),
                tempParam = {
                    check_code: code.data,
                    node_ip: apkeyIp,
                    type: 500 // 0-回溯快照分析,100-威胁告警,200-资产分析模块,300-集合分析,400-基线分析,500-打开全息客户端
                },
                jumpParamStr = JSON.stringify({
                    flag: 0,
                    param: JSON.stringify(tempParam)
                });
            this.initWebsocket(jumpParamStr)
        },
        initWebsocket(jumpParam) {
            if (this.ws && this.ws.readyState == 1) {
                this.ws.send(jumpParam)
            } else {
                this.ws = new WebSocket(this.wsApi);
                this.ws.onopen = () => {
                    this.ws.send(jumpParam);
                };
                this.ws.onmessage = event => {
                    this.msgSuccess(event);
                };
                this.ws.onerror = () => {
                    this.loading = true;
                    //通过注册表打开回溯
                    window.location.href = "HoloNetClient://" + window.btoa(jumpParam);
                    var tempTime = setTimeout(() => {
                        this.ws = new WebSocket(this.wsApi);
                        this.ws.onerror = () => {// 再次唤起失败
                            this.updateQxClient();
                        };
                        this.ws.onmessage = event => {
                            this.msgSuccess(event);
                        };
                        this.ws.onclose = () => {
                            this.ws = null;
                        };
                        this.loading = false;
                        clearTimeout(tempTime);
                    }, 15000);
                };
                this.ws.onclose = function () {
                    this.ws = null;
                };
            }
        },
        getApkCode(ip) {
            return getApkCode({ ip })
        },
        msgSuccess(event) {
            var resMsg = JSON.parse(event.data);
            if (resMsg.param == "页面跳转完成") {
                this.loading = false;
            }
        },
        updateQxClient() {
            this.$msgbox({
                title: '全流量分析',
                closeOnClickModal: false,
                closeOnPressEscape: false,
                closeOnHashChange: false,
                confirmButtonText: '立即下载',
                customClass: 'wd_dailog',
                dangerouslyUseHTMLString: true,
                message: `<div style="padding: 4px 12px 6px;height: 86px;line-height: 28px;">
                    检测到回溯客户端无法正常打开，请下载最新回溯客户端压缩包并在解压后用管理员权限运行RegeditClient.bat文件完成注册。
                </div>`
            }).then(() => {
                this.loading = false;
                exporter({
                    fileType: '',
                    action: '/api/qx/downloadQxClient'
                });
            });
        },

    },
    beforeDestroy() {
        this.timer && window.clearTimeout(this.timer);
        this.ws && this.ws.close();
        this.ws = null;
    }
}

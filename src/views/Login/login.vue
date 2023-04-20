<template>
  <section class="el-login__container clear" v-loading="loading">
    <el-select v-model="loginType" class="switch_bar">
      <el-option label="普通模式" :value="1"></el-option>
      <el-option label="管理模式" :value="2"></el-option>
    </el-select>
    <div class="login-contain">
      <router-view></router-view>
      <div class="login-content">
        <div class="system-logo">
          <div v-html="loginLogo"></div>
        </div>
        <div class="system-name">
          <span v-show="version" class="version">V{{ version }}</span>
          <div class="name logo">
            <p class="name-zn">
              <span class="name-zn name-zn-main">{{
                systemName.split(" ")[0]
              }}</span>
              <span class="name-zn name-zn-sb">{{
                systemName.split(" ")[1]
              }}</span>
            </p>
          </div>
        </div>
        <div class="login-form">
          <el-form
            :model="ruleForm"
            :rules="rules"
            @submit.prevent
            ref="ruleForm"
          >
            <el-form-item prop="userName">
              <el-input
                v-model.trim="ruleForm.userName"
                size="large"
                @input="setLoadBtnType"
                placeholder="请输入用户名"
              >
                <i slotslot="prefix" class="iconfont icon-user"></i>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                type="password"
                size="large"
                v-model.trim="ruleForm.password"
                @input="setLoadBtnType"
                show-password
                placeholder="请输入密码"
              >
                <i slotslot="prefix" class="iconfont icon-password"></i>
              </el-input>
            </el-form-item>
            <el-form-item>
              <div class="login-button unverify" v-if="loadBtnType == 1">
                <img src="@AST/images/Login/unverify.png" class="common-img" />
                <span>点击按钮进行登录</span>
              </div>
              <div class="login-button failed" v-else-if="loadBtnType == 2">
                <img
                  src="@AST/images/Login/failed.png"
                  class="failed-img"
                  @click="setLoadBtnType"
                />
                <span>请点击按钮进行登录</span>
              </div>
              <div class="login-button failed" v-else-if="loadBtnType == 3">
                <img
                  src="@AST/images/Login/failed.png"
                  class="failed-img"
                  @click="setLoadBtnType"
                />
                <span>{{ btnText }}</span>
              </div>
              <div
                class="login-button canvas-img"
                ref="canvasImg"
                v-else-if="loadBtnType == 4"
              >
                <img
                  src="@AST/images/Login/left.gif"
                  ref="canvasLeft"
                  :style="{ left: canvasImgLeft + 'px' }"
                  class="layui-hide hideImg"
                  id="canvas-left"
                />
                <img
                  src="@AST/images/Login/right.gif"
                  ref="canvasRight"
                  :style="{ left: canvasImgRight + 'px' }"
                  class="layui-hide hideImg"
                  id="canvas-right"
                />
                <canvas
                  class="layui-hide user-hide"
                  style="cursor: pointer"
                  @click="canvasClick"
                  ref="canvas"
                  id="myCanvas"
                  width="270"
                  height="45"
                ></canvas>
              </div>
              <div class="layui-hide" v-show="false">
                <img src="@AST/images/Login/left.gif" id="left" ref="left" />
                <img
                  src="@AST/images/Login/verify.png"
                  id="verify"
                  ref="verify"
                />
                <img src="@AST/images/Login/right.gif" id="right" ref="right" />
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <!-- <certDetails v-if="certVisible"
            @yes="certVisible=false"
            @cancel="certVisible=false" />
        <certUpdate v-if="certUpdateVisible"
            :certTitle="certTitle"
            @yes="certUpdateVisible=false"
            @cancel="certUpdateVisible=false" /> -->
  </section>
</template>
<script>
import setting from "@/setting.js";
import { encrypt } from "@TOOLS/aes";
import { getApiUrl } from "@TOOLS/signature";
import { getCookie } from "@LIB/auth";
// import certDetails from "@COMP/TZ/certificate/certDetails.vue";
// import certUpdate from "@COMP/TZ/certificate/certUpdate.vue";
export default {
  name: "aS",
  // components: { certDetails, certUpdate },
  data() {
    return {
      loading: false,
      certTitle: "授权文件检验",
      certVisible: false, //证书详情 组件
      certUpdateVisible: false, // 证书上传
      ruleForm: {
        userName: "admin",
        password: "111111",
        // userName: "",
        // password: "",
      },
      rules: {
        userName: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      loginType: setting.LoginType, // 1: 问道系统  2：权限系统
      loadBtnType: 1, // 登录按钮状态
      btnText: "用户名或密码错误", // 密码错误或者未授权（loadBtnType状态为3）等的文字提示
      loginLogo: "", // 登录页系统logo
      systemName: "", // 系统名称
      version: "", // 系统版本号
      canvasImgLeft: 0,
      canvasImgRight: 0,
      systemNameDict: {},
    };
  },
  created() {
    let loginType = getCookie("systemId");
    if (loginType !== undefined) {
      this.loginType = loginType == 2 ? 2 : 1;
    }
    this.qrySystemLogo();
    this.qrySystemVersion();
    this.qrySystemName(1);
    this.qrySystemName(0);
    this.getIcon();
  },
  mounted() {
    this.$store.dispatch("user/resetToken");
    // 分析报告-用户登录认证缓存
    localStorage.setItem(
      "commonKeys",
      JSON.stringify({
        IsSafeVerify: setting.IsSafeVerify,
        auth: getApiUrl() + setting.AuthHost,
      })
    );
    this.loadBtnType = 4;
  },
  watch: {
    loginType() {
      this.setSystemName();
    },
    loadBtnType(val) {
      val == 4 &&
        this.$nextTick(() => {
          this.canvasImg();
        });
    },
  },
  methods: {
    login() {
      this.loading = true;
      this.$store
        .dispatch("user/login", {
          userName: this.ruleForm.userName,
          passWord: encrypt(this.ruleForm.password),
        })
        .then(async (res) => {
          this.loading = false;
          this.$router.push({ path: res.mainUrl });
        })
        .catch((err) => {
          this.loadBtnType = 3;
          this.btnText = err.msg || "服务超时，请联系管理员！";
          this.loading = false;
        });
    },
    // 获取系统logo
    qrySystemLogo() {
      // 登录页清除logo防止管理系统已修改业务系统却没生效
      this.$store.commit("tz/SET_SYSTEMLOGO", "");
      this.$store
        .dispatch("tz/systemLogo", { systemId: 1 })
        .then(({ login: loginLogo }) => {
          this.loginLogo = loginLogo;
        });
    },
    //获取系统名称
    qrySystemName(systemId) {
      let key = systemId == 1 ? "manager" : "business";
      this.systemNameDict.systemId = setting.SystemName[key];
      this.setSystemName();
    },

    // 获取系统版本号
    qrySystemVersion() {
      let version = setting.Version;
      this.version = version.replace(/[vV]/g, "");
    },
    // 获取favicon图标
    getIcon() {
      let { iconUrl, icoVersion } = {
        iconUrl: "/img/favicon.ico",
        icoVersion: 1,
      };

      var oldLinks = document.getElementsByTagName("link"),
        oldFavicon = undefined;

      for (var i = 0; i < oldLinks.length; i++) {
        if (
          oldLinks[i].getAttribute("rel") == "icon" ||
          oldLinks[i].getAttribute("rel") == "Shortcut Icon"
        ) {
          oldFavicon = oldLinks[i];
        }
      }
      var head = document.getElementsByTagName("head")[0];
      if (oldFavicon == undefined) {
        oldFavicon = document.createElement("link");
        oldFavicon.type = "img/x-icon";
        oldFavicon.rel = "Shortcut Icon";
      }
      oldFavicon.href = iconUrl;
      iconUrl && (oldFavicon.href += "?version=" + icoVersion || 1);
      head.appendChild(oldFavicon);
    },
    // 设置系统名称
    setSystemName() {
      let key = this.loginType == 1 ? "manager" : "business",
        systemId = this.loginType == 1 ? 1 : 0;
      this.systemName =
        this.systemNameDict[systemId] ?? setting.SystemName[key];
    },
    // 设置登录按钮状态
    setLoadBtnType() {
      this.loadBtnType =
        this.ruleForm.userName && this.ruleForm.password ? 4 : 1;
    },
    // canvas拼接
    canvasImg() {
      var $canvasImg = this.$refs.canvasImg,
        left = this.$refs.left,
        verify = this.$refs.verify,
        right = this.$refs.right,
        canvas = this.$refs.canvas,
        ctx = canvas.getContext("2d"),
        random = Math.floor(Math.random() * 140) + 6;

      canvas.width = $canvasImg.offsetWidth;
      canvas.height = $canvasImg.offsetHeight;

      var leftHeight = -3,
        centerHeight = 39,
        rightHeight = 83,
        height = 15,
        top = 3;
      // 加入画布
      ctx.drawImage(left, leftHeight + random, height, 38, 14);
      ctx.drawImage(verify, centerHeight + random, top, 40, 41);
      ctx.drawImage(right, rightHeight + random, height, 38, 14);

      // 动画
      this.canvasImgLeft = leftHeight + random;
      this.canvasImgRight = rightHeight + random;

      // 绘制圆形
      ctx.beginPath();
      ctx.arc(60 + random, 24, 14, 0, 2 * Math.PI);
      ctx.fillStyle = "#f8f8f8";
      ctx.globalAlpha = 0;
      ctx.fill();
      ctx.closePath();
    },
    // canvas点击事件
    canvasClick(e) {
      let canvas = this.$refs.canvas,
        ctx = canvas.getContext("2d"),
        canvasInfo = canvas.getBoundingClientRect(),
        ctxStatus = ctx.isPointInPath(
          e.clientX - canvasInfo.left,
          e.clientY - canvasInfo.top
        );
      if (ctxStatus) {
        this.login();
      } else {
        this.loadBtnType = 2;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@STYLES/Login/login.scss";
</style>

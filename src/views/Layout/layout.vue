<template>
  <section class="el-app__container" v-loading="loading">
    <div class="el-navmenu">
      <div v-if="tabMenuVisible" class="element-system">
        <p class="menu_img system_img" :class="currentModule.enCode"></p>
        <p class="element-system__name">{{ currentModule.fullName }}</p>
      </div>
      <div
        v-else
        class="system_logo"
        :class="{ is_default: isDefaultSystemLogo() }"
      >
        <div :style="{ backgroundImage: `url(${homeLogo})` }"></div>
      </div>

      <el-menu
        theme="dark"
        class="menu-ul"
        mode="horizontal"
        @select="pageTo"
        :default-active="defaultActive"
      >
        <el-menu-item
          v-for="menu in menus"
          :index="menu.index"
          :key="menu.index"
        >
          {{ menu.text }}</el-menu-item
        >
      </el-menu>

      <!-- <el-menu
        theme="dark"
        :menus="menus"
        :key="currentModule.enCode"
        :menuProps="{ defaultActive }"
        :href="indexHref"
        :collapsible="false"
        background-color="#223247"
        class="menu-ul"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="changeUrl"
      > -->
      <!-- <template>
          <div v-if="tabMenuVisible" class="element-system">
            <p class="menu_img system_img" :class="currentModule.enCode"></p>
            <p class="element-system__name">{{ currentModule.fullName }}</p>
          </div>
          <div
            v-else
            class="system_logo"
            :class="{ is_default: isDefaultSystemLogo() }"
          >
            <div :style="{ backgroundImage: `url(${homeLogo})` }"></div>
          </div>
        </template> -->
      <!-- <template slotslot="actions">
          <template v-if="tabMenuVisible">
            <el-navbar-action>
              <i
                class="icon_btn iconfont icon-homepage"
                @click="pageTo('/TZ/SituationWarn/BusinessAnalysis')"
                title="返回平台入口"
              ></i>
            </el-navbar-action>
            <el-navbar-action>
              <el-popover
                placement="bottom-end"
                :append-to-body="false"
                @show="getIconMenu"
                trigger="click"
              >
                <div class="menu-center">
                  <div class="scroll_container element-page__scroll">
                    <div class="menu-switch">
                      <p
                        v-for="item in iconMenuList"
                        :key="item.id"
                        @click="iconMenuActive = item.id"
                        :class="{ active: item.id == iconMenuActive }"
                      >
                        <span>{{ item.fullName }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="scroll_container element-page__scroll">
                    <ul class="switch-container">
                      <li
                        v-for="item in iconMenuItemList"
                        :key="item.id"
                        @click="routerJump(item)"
                        :class="{ active: item.id == iconMenuItemActive }"
                      >
                        <span class="menu_img" :class="`${item.enCode}`"></span>
                        <p>{{ item.fullName }}</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <i
                  class="icon_btn iconfont icon-system-menu"
                  slotslot="reference"
                  title="切换"
                ></i>
              </el-popover>
            </el-navbar-action>
          </template>
          <template v-else>
            <el-input
              v-if="useOnekeySearch"
              placeholder="一键检索"
              v-model.trim="keywords"
              size="small"
              @keyup.enter="handlerSearch"
              class="header_search"
            >
              <el-button
                slotslot="append"
                size="mini"
                @click.enter="handlerSearch"
                icon="iconfont icon-search"
              ></el-button>
            </el-input>
            <el-navbar-icon-action
              :class="{ expire: certExpire }"
              icon="iconfont icon-certificate"
              @click="showCertDetail"
              :tooltip="certExpire ? '证书即将过期' : '证书详情'"
            >
            </el-navbar-icon-action>
          </template>
        </template> -->
      <!-- </el-menu> -->
      <div class="user_info">
        <span class="split_line"></span>
        <el-dropdown
          class="menu-dropdown"
          @command="clickUser"
          placement="bottom"
        >
          <span class="el-dropdown-link">
            <el-avatar
              :size="20"
              style="margin-right: 12px; vertical-align: sub"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABt0lEQVQ4jY2UO0sDQRSFv0zc2NgZGY1WJoKPVhEbFVRsI6iVhWUKLXxrZyUasdNf4bsUK9NYqAjBRkgggpIErATBV4zFzMY1OxtzYOHuOXe+XZiZ6wst5DAoAET10weEgA/gEbgFjoFT7f2RzwAcA+JAxPQlh1LACnDkNIWj9gNbuuE/GLrnUK/x22aNo2EDWK4CVC57zYoTOO4FmxmV9IdVnUjD7lneC3oFHPhCC7kAkAZayrsSq5Jw8K+Xfob+TSP0CWgVwIQJNj3ohgGEgyozqBmYFKij4VJbg8n9N4sKoMeUvLpOWFVZtwAaTcnLmzewQtYkMJx2gMuMN7BSJoCsKbi5z3NnSO6yKvNQVgBJr3R0J0+x+PteLCqvgq4FcFKp4+vbXHvoRAD7qCni0vmixPL/vlt+5XnoCdi3N2XemcRGJA9xSadh/zsb4SEuiY24wHPAu3N8xYGli1VJxHBDTEo9w4C6htvoWVAaX4EasZZcl7vVwgAiQUiuy71aS6zZXgk41G4V6uuYRU2eVDU/CEzU1zEz3GEVXMC+SMAuD4EuYErXGeBTPxntTemeA4De1tJafgACPHQz2byPsgAAAABJRU5ErkJggg=="
            >
            </el-avatar>
            <span>{{ loginUser }}，欢迎您！</span>
            <i
              class="el-icon-arrow-down el-icon--right"
              style="margin-left: -4px"
            ></i>
          </span>
          <el-dropdown-menu slotslot="dropdown" :append-to-body="false">
            <el-dropdown-item command="resetPwd">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- <el-menu-pro :data="menus" :defaultActive="defaultActive" mode="horizontal"
                :slow="false"></el-menu-pro> -->
    </div>
    <tab-menu
      v-model:tabMenuVisible="tabMenuVisible"
      v-model:currentModule="currentModule"
    >
    </tab-menu>
    <div class="el-app" slotslot="main">
      <app-main></app-main>
    </div>
    <UpdatePassword
      v-if="updateVisible"
      :title="pwdTitle"
      @yes="updateVisible = false"
      @cancel="updateVisible = false"
    />

    <CertDetails
      v-if="certVisible"
      @yes="certVisible = false"
      @cancel="certVisible = false"
    />

    <certUpdate
      v-if="certUpdateVisible"
      :certTitle="certTitle"
      @yes="certUpdateVisible = false"
      @cancel="certUpdateVisible = false"
    />
  </section>
</template>

<script>
import appMain from "./app-main";
import tabMenu from "./tab-menu";
import { systemConfig } from "./modules/pageSettings.js";
import logoHide from "@AST/images/Layout/system_menu.png";
import UpdatePassword from "@COMP/Common/updatePassword.vue";
import CertDetails from "@COMP/TZ/certificate/certDetails.vue";
import certUpdate from "@COMP/TZ/certificate/certUpdate.vue";
import { setJump } from "@PAGE/platform.js";
import { mapActions, mapGetters } from "vuex";
import { getCookie } from "@LIB/auth";
// import { isNullOrEmpty } from "@LIB/base.js";
import openQxClientMixin from "@MIXINS/TZ/qx-client-mixin.js";
export default {
  name: "layoutIndex",
  components: {
    appMain,
    tabMenu,
    UpdatePassword,
    CertDetails,
    certUpdate,
  },
  mixins: [openQxClientMixin],
  data() {
    return {
      keywords: "",
      indexHref: "/", //默认为系统首页
      loading: false,
      pwdTitle: "修改密码",
      updateVisible: false, //修改密码 组件
      certVisible: false, //证书详情 组件
      certTitle: "授权文件检验",
      certUpdateVisible: false, // 证书上传
      tabMenuVisible: false, // 是否存在tabMenu组件，当处于场景分析子系统时，tabMenuVisible为true
      currentModule: {}, // 当前页面所处的模块
      loginUser: this.$store.state.user.userName,
      userConfig: systemConfig[this.$store.state.user.systemId],
      homeLogo: "",
      logoHide,
      defaultActive: "", // 当前选中的菜单
      iconMenuList: [], // 场景分析子系统里导航栏右上角切换功能的菜单列表
      iconMenuActive: "", // 当前切换菜单选中的tab
      iconMenuItemActive: "", // 当前切换菜单选中的菜单项
    };
  },
  computed: {
    menus() {
      // state.user.layoutRoutes 必须在computed里面写 才能监听到数据更改
      let newList = this.getMenuList(this.$store.state.user.layoutRoutes);
      return newList;
    },
    iconMenuItemList() {
      let iconMenuItem = this.iconMenuList.filter(
        (item) => item.id == this.iconMenuActive
      );
      return iconMenuItem.length ? [...iconMenuItem[0].childNodes] ?? [] : [];
    },
    //证书是否即将过期 1：即将过期
    certExpire() {
      let certStatus = this.$store.state.user.certStatus;
      return certStatus == "1";
    },
    // 是否使用 一键检索功能
    useOnekeySearch() {
      const baseLine = localStorage.getItem("baseLine");
      // 基础版不含一键检索
      return baseLine != "1";
    },
  },
  watch: {
    currentModule: {
      deep: true,
      handler(item) {
        this.iconMenuActive = item.parentId;
        this.iconMenuItemActive = item.id;
      },
    },
  },
  created() {
    this.updatePassword();
    this.qrySystemLogo();
    this.getIcon();
  },
  methods: {
    ...mapActions({
      getMenu: "user/getMenuList",
    }),
    ...mapGetters(["getSystemLogo"]),
    updatePassword() {
      let needUpdatePwd = getCookie("needUpdatePwd");
      if (needUpdatePwd == "true") {
        switch (getCookie("needUpdatePwdFlag")) {
          case "1":
            this.pwdTitle = "检测到您是新用户，请立即修改密码";
            break;
          case "2":
            this.pwdTitle = "检测到您长期未修改密码，请立即修改";
            break;
        }
        this.updateVisible = true;
      }
    },
    // 获取系统logo
    qrySystemLogo() {
      const systemLogo = this.getSystemLogo();
      if (systemLogo) {
        this.parseHomeLogo(systemLogo.home);
      } else {
        this.$store.dispatch("tz/systemLogo").then(({ home: homeLogo }) => {
          this.parseHomeLogo(homeLogo);
        });
      }
    },
    parseHomeLogo(homeLogo) {
      let parser = new DOMParser(),
        doc = parser.parseFromString(homeLogo, "text/xml");
      homeLogo = doc.querySelector("img").getAttribute("src");
      homeLogo = homeLogo.split(" ").join("");
      this.homeLogo = homeLogo;
    },
    // 获取favicon图标
    getIcon() {
      this.$store
        .dispatch("tz/systemIcon", { systemId: 1 })
        .then((systemIcon) => {
          let { iconUrl, icoVersion } = {
            iconUrl: "/img/favicon.ico",
            icoVersion: 1,
          };
          if (systemIcon) {
            iconUrl = systemIcon.iconUrl;
            icoVersion = systemIcon.icoVersion;
          }
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
        });
    },
    // 头部搜索
    handlerSearch() {
      if (this.keywords == "")
        return this.$message({ message: "请输入检索关键字", type: "warning" });
      // 设置跳转参数
      setJump({
        isJson: false,
        type: "_blank",
        url: "/TZ/OneKeySearch/OneKeyIndex",
        sessionName: "oneKeySession",
        data: this.keywords,
      });

      this.keywords = "";
    },
    showCertDetail() {
      if (this.certExpire) {
        let tips = localStorage.getItem("certificateDec");
        this.$confirm(tips, "提示", {
          cancelButtonText: "知道了",
          confirmButtonText: "更新",
          customClass: "wd_dailog",
          closeOnClickModal: false,
        })
          .then(() => {
            this.certTitle = "证书即将到期，请重新上传证书";
            this.certUpdateVisible = true;
          })
          .catch(() => {
            this.certVisible = true;
          });
      } else {
        this.certVisible = true;
      }
    },
    getIconMenu() {
      this.getMenu().then((list) => {
        this.iconMenuList = list;
      });
    },
    isDefaultSystemLogo() {
      let isDefault = localStorage.getItem("isDefaultSyetemLogo");
      return isDefault != "false";
    },
    /**
     * 导航栏处理
     */
    getMenuList(menus) {
      let newList = [];
      menus.forEach((item) => {
        if (item.meta.select) {
          this.defaultActive = item.meta.index;
        }

        let firstArr = {
          ...item.meta,
          children: [],
        };
        newList.push(firstArr);
      });
      return newList;
    },
    pageTo(path) {
      this.$router.push(path);
    },
    /**
     * 用户下拉框事件
     */
    clickUser(res) {
      switch (res) {
        case "resetPwd":
          this.updateVisible = true;
          break;
        case "logout":
          this.logout();
          break;
      }
    },

    /**
     * 登出函数
     */
    logout() {
      this.$confirm("确认退出系统？", "信息", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        customClass: "wd_dailog",
        type: "warning",
      }).then(() => {
        this.loading = true;
        this.$store.dispatch("user/logout").then(() => {
          this.$router.replace({
            path: "/login",
          });
          this.loading = false;
        });
      });
    },
    changeUrl(res) {
      // header中菜单切换事件
      this.$router.push(res.index);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@STYLES/Layout/layout.scss";

.menu-ul {
  background: none;
  width: 90%;
  border-right: 0px;
}
</style>

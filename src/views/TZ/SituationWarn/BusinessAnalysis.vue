<template>
  <div
    class="BusinessAnalysis element-container__full element-page__scroll"
    v-loading.fullscreen="loading"
  >
    <div
      class="menu_group"
      :class="item.enCode"
      v-for="item in menuList"
      :key="item.id"
    >
      <p class="group_name">{{ item.fullName }}</p>
      <ul class="group_container">
        <li class="menu_container" v-for="v in item.childNodes" :key="v.id">
          <div class="menu_item" @click="routerJump(v)">
            <span class="menu_icon" :class="`menu-${v.enCode}`"></span>
            <em class="menu_name">{{ v.fullName }}</em>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import openQxClientMixin from "@MIXINS/TZ/qx-client-mixin.js";
export default {
  name: "BusinessAnalysis",
  mixins: [openQxClientMixin],
  data() {
    return {
      menuList: [],
    };
  },
  created() {
    this.getMenuList().then((list) => {
      this.menuList = list;
    });
  },
  methods: {
    ...mapActions({
      getMenuList: "user/getMenuList",
    }),
  },
};
</script>

<style lang="scss" scoped>
.BusinessAnalysis {
  .menu_group {
    padding-bottom: 14px;
    &:last-child {
      padding-bottom: 0;
    }
    .group_name {
      height: 24px;
      line-height: 24px;
      font-weight: 700;
      color: #212121;
      padding-left: 12px;
      position: relative;
      display: flex;
      justify-content: space-between;
      padding-right: 24px;
      margin-bottom: 5px;

      &::before {
        content: "";
        width: 4px;
        height: 16px;
        background-color: $highColor;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        margin: auto;
      }
    }
    .group_container {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -8px;
      .menu_container {
        flex-basis: 14.28%;
        padding: 8px;
        .menu_item {
          height: 122px;
          display: flex;
          cursor: pointer;
          padding-left: 26px;
          background: #fff;
          align-items: center;
          box-shadow: rgba(145, 158, 171, 0.2) 0 2px 1px -1px,
            rgba(145, 158, 171, 0.14) 0 1px 1px 0,
            rgba(145, 158, 171, 0.12) 0 1px 3px 0;
          transition: all 0.3s;
          &:hover {
            box-shadow: 0 1px 10px rgba(145, 158, 171, 0.5);
            transform: translateY(-2px);
          }
          .menu_icon {
            background-repeat: no-repeat;
            background-image: url(~@AST/images/TZ/SituationWarn/BusinessAnalysis/system.png);
            width: 86px;
            height: 86px;
            cursor: pointer;
          }

          .menu-icon-mining {
            background-position: -2px -2px;
          }
          .menu-icon-eml {
            background-position: -88px -2px;
          }
          .menu-icon-edge {
            background-position: -174px -2px;
          }
          .menu-icon-network {
            background-position: -260px -2px;
          }
          .menu-icon-fileDeep {
            background-position: -344px -2px;
          }
          .menu-icon-webAttack {
            background-position: -2px -88px;
          }
          .menu-icon-ddos {
            background-position: -88px -88px;
          }
          .menu-icon-probe {
            background-position: -174px -88px;
          }
          .menu-icon-abnormal {
            background-position: -260px -88px;
          }
          .menu-icon-fileAnalysis {
            background-position: -344px -88px;
          }
          .menu-icon-metadata {
            background-position: -2px -174px;
          }
          .menu-icon-loginLog {
            background-position: -88px -174px;
          }
          .menu-icon-behavior {
            background-position: -174px -174px;
          }
          .menu-icon-fileTransfer {
            background-position: -260px -174px;
          }
          .menu-icon-holographic {
            background-position: -344px -174px;
          }
          .menu-icon-compreSetting {
            background-position: -2px -260px;
          }
          .menu-icon-yunweimanage {
            background-position: -88px -260px;
          }
          .menu-icon-comaudit {
            background-position: -174px -260px;
          }
          .menu-icon-oneKeySearch {
            background-position: -260px -260px;
          }
          .menu-icon-mining {
            background-position: -2px -346px;
          }
          .menu-icon-apt {
            background-position: -88px -346px;
          }
          .menu-icon-extortion {
            background-position: -174px -346px;
          }
          .menu-icon-virus {
            background-position: -260px -346px;
          }
        }
        .menu_name {
          font-size: 16px;
          line-height: 21px;
          color: #262626;
          margin-left: 20px;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      @media screen and (max-width: 1800px) {
        .menu_container {
          flex-basis: 16.66%;
        }
      }
      @media screen and (max-width: 1550px) {
        .menu_container {
          flex-basis: 20%;
        }
      }
    }
  }
}
</style>

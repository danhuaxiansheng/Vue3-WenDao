<template>
  <ul class="contextmenu" ref="el" :style="style">
    <li v-for="(item, index) in menu" class="contextmenu__item" :key="index">
      <div class="menu_item" :class="{ is_group: !!item.group }">
        <div @click.stop="fnHandler(item)" class="button">
          <i v-if="icon" :class="item.icon"></i>
          <span
            class="ellipsis"
            :title="item.name"
            :style="{ textIndent: `${groupDeep}em` }"
            >{{ item.name }}</span
          >
          <template
            v-if="Array.isArray(item.children) && item.children.length > 0"
          >
            <i class="el-icon-arrow-right-filled"></i>
            <context-menu
              :menu="item.children"
              v-bind="{ icon, resolve, menuDeep }"
              :select-group="selectGroup"
              :parentSelect="[...parentSelect, item.action]"
            >
            </context-menu>
          </template>
        </div>
        <template v-if="Array.isArray(item.group) && item.group.length > 0">
          <context-menu
            :menu="item.group"
            :cancelMaxHeight="true"
            :groupDeep="groupDeepNow"
            v-bind="{ icon, resolve, menuDeep, targetData }"
            :select-group="selectGroup"
            :parentSelect="[...parentSelect, item.action]"
          >
          </context-menu>
        </template>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "context-menu",
  props: {
    icon: {
      // 是否显示icon
      type: Boolean,
      default: true,
    },
    selectGroup: {
      // 是否父节点可点击
      type: Boolean,
      default: false,
    },
    groupDeep: {
      // 当前分组层级，用于设置缩进
      type: Number,
      default: () => 0,
    },
    targetData: {
      type: Object,
      default() {
        return {};
      },
    },
    cancelMaxHeight: {
      type: Boolean,
      default: () => false,
    },
    menuDeep: {
      // 菜单的最大深度
      type: Number,
      default: () => 0,
    },
    menu: {
      // 最重要的列表，没有的话直接不显示
      type: Array,
      default() {
        return [
          // { icon: '', name: '', action: '', fn: function() {} },
          // 模板，必须有name是国际化传过来, action是作为key和action的存在, icon如果显示但不传icon的话会留空白
          // { icon: 'el-icon-view', name: '查看', action: 'view', fn: function() {} },
          { icon: "el-icon-edit", name: "编辑", action: "edit" },
          { icon: "el-icon-setting", name: "设置", action: "setting" },
          // { icon: 'el-icon-delete', name: '删除', action: 'delete' }, // 此处传入参数时记得国际化
          // { icon: 'el-icon-printer', name: '打印', action: 'print' },
        ];
      },
    },
    parentSelect: {
      type: Array,
      default: () => [],
    },
    resolve: {
      // 点击menu按钮时执行的方法
      type: Function,
      default: function () {},
    },
  },
  computed: {
    groupDeepNow() {
      return this.groupDeep + 1;
    },
  },
  watch: {
    menuDeep() {
      this.getComputedPotion();
    },
  },
  data() {
    return {
      status: false,
      style: { opacity: 0, display: "block" }, // opacity为零表示计算宽高还没结束！
    };
  },
  methods: {
    fnHandler(item) {
      let select = [...this.parentSelect, item.action];
      if (
        item.noSelect ||
        (!this.selectGroup && item.children && item.children.length > 0)
      )
        return false;
      this.status = false;
      if (item.fn) item.fn(this.targetData, item.action, item, select);
      this.resolve(item.action, item, select);
    },
    computedMenuCount(menu) {
      let count = 0;
      menu.forEach((item) => {
        if (item.group && item.group.length) {
          count += this.computedMenuCount(item.group) + 1;
        } else {
          count += 1;
        }
      });
      return count;
    },
    getComputedPotion() {
      let target = this.$refs.el; // 当前元素
      if (!target) return {};

      let menuMaxHeight = 260,
        parent = target.parentNode, // 父元素
        bounding = parent.getBoundingClientRect(), // 父元素距离屏幕边缘的距离（都是以视窗的上和左作为测量点）
        computedStyle = window.getComputedStyle(target),
        menuWidth = parseInt(computedStyle.width), // 菜单宽度
        menuHeight = this.computedMenuCount(this.menu) * 32 + 10, // 菜单高度
        clientWidth = document.body.clientWidth, // 屏幕宽度
        clientHeight = document.body.clientHeight, // 屏幕高度
        deep = this.menuDeep,
        isMax = menuHeight > menuMaxHeight;
      let style = {
        opacity: 1,
        "overflow-y": isMax ? "auto" : "initial",
        [clientWidth - bounding.right > menuWidth * deep ? "left" : "right"]:
          "100%", // 判断水平方向是否被遮挡
        [clientHeight - bounding.bottom > menuHeight ? "top" : "bottom"]: "0",
      };
      !this.cancelMaxHeight &&
        (style.height = (isMax ? menuMaxHeight : menuHeight) + "px");
      this.style = style;
    },
  },
  beforeUnmount() {
    document.body.removeChild(this.$el);
  },
  mounted() {
    // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
    this.$nextTick(function () {
      this.status = true;
      this.getComputedPotion();
    });
  },
};
</script>

<style lang="scss" scoped>
$menu-height: 32px;
.contextmenu {
  padding: 5px 0;
  line-height: 22px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 4px 16px 0 rgba(10, 11, 42, 0.1);
  .contextmenu__item {
    line-height: $menu-height;
    position: relative;
    .menu_item {
      .button {
        cursor: pointer;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 5px;
        span {
          display: inline-block;
          min-width: 100%;
          text-align: left;
          margin-left: 5px;
          padding-right: 8px;
          color: $mainColor;
        }
        i {
          text-align: center;
        }
        .contextmenu {
          min-width: 140px;
          max-width: 220px;
          position: absolute;
          // right: -100%;
          // top: -5px;
          display: none;
        }
        &:hover {
          color: #fff;
          background: $highColor;
          .menu_item.is_group .contextmenu,
          > .contextmenu {
            display: block;
          }
          > span {
            color: #fff;
          }
        }
      }
    }
    .menu_item.is_group {
      > .contextmenu {
        position: static;
        background: none;
        width: auto;
        box-shadow: none;
        padding: 0;
      }
    }
  }
}
</style>

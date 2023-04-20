<template>
    <div class="contextmenu-wrap"
        ref="menu"
        v-show="status"
        :style="{...style, width: `${menuWidth}px`}">
        <context-menu
            v-bind="{icon, menu, resolve, targetData, menuDeep, selectGroup: parentNodeCanBeChoosed}">
        </context-menu>
    </div>
</template>

<script>
import ContextMenu from './ContextMenu';
export default {
    name: 'contextmenu-wrap',
    props: {
        icon: {// 是否显示icon
            type: Boolean,
            default: true
        },
        parentNodeCanBeChoosed: {// 是否父节点可点击
            type: Boolean,
            default: false
        },
        targetData: {
            type: Object,
            default() {
                return {};
            }
        },
        axis: {
            // 鼠标右键点击的位置
            type: Object,
            default() {
                return { x: null, y: null };
            }
        },
        menuDeep: {
            type: Number,
            default: () => 0
        },
        menu: {
            // 最重要的列表，没有的话直接不显示
            type: Array,
            default() {
                return [
                    // { icon: '', name: '', action: '', fn: function() {} },
                    // 模板，必须有name是国际化传过来, action是作为key和action的存在, icon如果显示但不传icon的话会留空白
                    // { icon: 'el-icon-view', name: '查看', action: 'view', fn: function() {} },
                    { icon: 'el-icon-edit', name: '编辑', action: 'edit' },
                    { icon: 'el-icon-setting', name: '设置', action: 'setting' }
                    // { icon: 'el-icon-delete', name: '删除', action: 'delete' }, // 此处传入参数时记得国际化
                    // { icon: 'el-icon-printer', name: '打印', action: 'print' },
                ];
            }
        },
        resolve: {
            // 点击menu按钮时执行的方法
            type: Function,
            default: function () { }
        }
    },
    computed: {
        style() {
            let x = this.axis.x;
            let y = this.axis.y;
            // 判断menu距离浏览器可视窗口底部距离,以免距离底部太近的时候，会导致menu被遮挡
            let menuHeight = this.menu.length * 32; // 不能用scrollHeight,获取到的menu是上一次的menu宽高
            let menuWidth = this.menuWidth; // 不能用scrollWidth,同理
            return {
                left:
                    (document.body.clientWidth < x + menuWidth ? x - menuWidth : x) +
                    'px',
                top:
                    (document.body.clientHeight < y + menuHeight ? y - menuHeight : y) +
                    'px'
            };
        }
    },
    data() {
        return {
            status: false,
            menuWidth: 100
        };
    },
    beforeUnmount() {
        document.body.removeChild(this.$el);
    },
    mounted() {
        // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
        // this.$nextTick(function () {
        this.status = true;
        // });
    },
    components: {
        ContextMenu
    }
};
</script>

<style lang="scss" scoped>
.contextmenu-wrap {
    position: fixed;
    z-index: 999;
}
</style>

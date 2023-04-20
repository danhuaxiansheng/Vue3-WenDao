<template>
    <div class="sliderMenu">
        <ul v-if="menuList.length">
            <li v-for="item in menuList"
                :key="item.id">
                <div class="menu_item"
                    :title="item.groupname">
                    <i :class="{show: Array.isArray(item.children) && item.children.length}"
                        class="menu_toggle el-icon-arrow-right-filled"
                        @click="menuToggle(item)"></i>
                    <el-checkbox v-model="item.checked"></el-checkbox>
                    <p class="menu_item_container"
                        :class="{isFocus: item.id == focusId}">
                        <span class="menu_name ellipsis"
                            @click="setFocusMenu(item)">{{item.groupname}}
                        </span>
                        <template v-if="item.id != 'notGroupid'">
                            <i class="menu_add el-icon-plus"
                                title="新增"></i>
                            <i class="menu_edit el-icon-edit"
                                title="编辑"></i>
                            <i v-if="!item.isRoot"
                                class="menu_del el-icon-delete"
                                title="删除"></i>
                        </template>
                    </p>
                </div>
                <slider-menu v-show="item.open"
                    @focusMenu="focusMenu"
                    :focusId="focusId"
                    :menuList="item.children"
                    v-if="Array.isArray(item.children) && item.children.length">
                </slider-menu>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "sliderMenu",
    props: {
        focusId: {
            default() {
                return ''
            }
        },
        menuList: {
            required: true,
            default() {
                return []
            }
        },
    },
    data: () => ({

    }),
    methods: {
        focusMenu(id) {
            this.$emit('focusMenu', id)
        },
        setFocusMenu(item) {
            this.$emit('focusMenu', item.id)
            this.menuToggle(item);
        },
        menuToggle(item) {
            item.open = !item.open;
        }
    },
    sliderMenu: () => import('@COMP/TZ/sliderMenu')
}
</script>

<style lang="scss" scoped>
.sliderMenu {
    padding-left: 26px;
    > ul li {
        div.menu_item {
            height: 26px;
            display: flex;
            align-items: center;
            margin: 2px 0;
            i.menu_toggle {
                width: 18px;
                height: 18px;
                cursor: pointer;
                font-size: 20px;
                color: #858585;
                opacity: 0;
                pointer-events: none;
                transform: rotateZ(90deg);
            }
            i.menu_toggle.show {
                opacity: 1;
            }
            .el-checkbox {
                margin: 0 4px 0 2px;
            }
            p.menu_item_container {
                min-width: 0;
                flex-grow: 1;
                border: 1px solid transparent;
                padding: 0 2px;
                border-radius: 2px;
                line-height: 24px;
                display: flex;
                align-items: center;
                user-select: none;
                > * {
                    cursor: pointer;
                }
                span.menu_name {
                    min-width: 0;
                    flex-shrink: 1;
                    margin-right: 4px;
                }
                i {
                    display: none;
                    color: #666;
                    margin: 0 2px;
                    font-size: 16px;
                    &:hover {
                        color: $highColor;
                    }
                }
                i.menu_add {
                    font-size: 19px;
                }
                &:hover i {
                    display: inline;
                }
                &.isFocus {
                    border-color: #96ccff;
                    background: #dff0ff;
                    i {
                        display: inline;
                    }
                }
            }
        }
    }
}
</style>
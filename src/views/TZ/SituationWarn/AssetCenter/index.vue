<template>
    <div class="asset_center element-container__full"
        :class="{is_table: $store.getters.project1126}">
        <div class="asset_center_container"
            :class="{aside_hide: asideHide}">
            <div class="main_container">
                <div class="main_content">
                    <asset-info ref="nodeInfo"
                        :nodepicked="nodepicked"
                        :notGroupid="notGroupid"
                        @onload="loaded('nodeInfo')"></asset-info>
                </div>
            </div>
            <div class="aside_bar">
                <node-tree v-model:nodepicked="nodepicked"
                    v-model:notGroupid="notGroupid"
                    @change="reloadTable"
                    @onload="loaded('nodeTree')"></node-tree>
                <aside @click="asideHide = !asideHide">
                    <svg-icon :css="{width: '44px', height: '44px'}"
                        :href="`${asideHide ? 'icon-show' : 'icon-hide'} `">
                    </svg-icon>
                </aside>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "AssetCenter",
    data() {
        return {
            asideHide: false, // 侧边栏是否隐藏
            notGroupid: false, // 是否选择了未分组
            nodepicked: [],
            asyncComps: ['nodeTree', 'nodeInfo'], // 需要等待组织架构和searchBar都加载完成了再获取数据
        }
    },
    components: {
        nodeTree: () => import('./nodeTree'),
        assetInfo: () => import('./assetInfo')
    },
    methods: {
        loaded(compName) {
            this.asyncComps = this.asyncComps.filter(item => item != compName);
            if (!this.asyncComps.length) this.reloadTable();
        },
        reloadTable() {
            this.$refs.nodeInfo.reloadTable();
        }
    }
}
</script>

<style lang="scss" scoped>
.asset_center {
    .asset_center_container {
        height: 100%;
        overflow: hidden;
        .aside_bar {
            float: left;
            height: 100%;
            width: 300px;
            margin-left: -100%;
            margin-right: 10px;
            position: relative;
            transition: all 0.3s;
            aside {
                width: 44px;
                height: 44px;
                position: absolute;
                right: -32px;
                bottom: 152px;
                cursor: pointer;
                .svg-icon {
                    width: 44px;
                    height: 44px;
                }
            }
            .node_tree {
                @include cardStyle;
                right: 0;
                width: 300px; // 不能写成100%，不然动画时侧边栏不会被推出去
                position: absolute;
            }
        }
        .main_container {
            width: 100%;
            height: 100%;
            float: left;
            .main_content {
                transition: all 0.3s;
                height: 100%;
                margin-left: 310px;
            }
        }
        &.aside_hide {
            .aside_bar {
                width: 0;
            }
            .main_container .main_content {
                margin-left: 0;
            }
        }
    }
    &.is_table {
        margin: -16px;
        height: calc(100% + 32px);
        .asset_center_container {
            .aside_bar {
                width: 266px;
                .node_tree {
                    width: 266px;
                }
            }
            .main_container .main_content {
                margin-left: 266px;
            }
            &.aside_hide {
                .aside_bar {
                    width: 0;
                }
                .main_container .main_content {
                    margin-left: 0;
                }
            }
        }
    }
}
</style>
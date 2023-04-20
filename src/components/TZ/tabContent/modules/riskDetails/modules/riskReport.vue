

<template>
    <el-panel shadow="never"
        theme="border-left"
        :border="false">
        <template v-slot:title>
            <div class="title-group">
                <span>
                    {{options.title}}
                </span>
                <!-- <div class="btn-group">
                                        <i class="iconfont icon-visit" title="查看报告"
                                            @click="openReport"></i>
                                    </div> -->
            </div>
        </template>
        <ul class="fileRisk-row">
            <li class="fileRisk-head">
                <span :class="staticRisk.fileriskClass">静态分析 <b
                        :title="staticRisk.title"></b><em>{{staticRisk.value}}</em></span>
                <span v-if="dynamicEdition"
                    :class="dynamicRisk.fileriskClass">动态分析 <b
                        :title="dynamicRisk.title"></b><em>{{dynamicRisk.value}}</em></span>

            </li>
        </ul>
    </el-panel>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import { getAnalysisScore } from "@PAGE/platform.js";
export default {
    name: "riskReport",
    props: {
        options: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    data() {
        return {

        };
    },
    computed: {
        ...mapGetters(['$searchBar', '$table', '$pageLayout', 'pageinfo']),
        ...mapState({
            storeRow: (state) => state.tabContent.row,
            // 是否为动态风险
            dynamicEdition: (state) => state.user.baseLine == 3,
        }),

        // 静态风险值
        staticRisk() { return getAnalysisScore([80, 100], this.storeRow['staticfilerisk']) },
        // 动态风险值
        dynamicRisk() { return getAnalysisScore([11, 21], this.storeRow['filerisk']) },
    },
    methods: {}
};
</script>

<style  lang="scss" scoped>
.fileRisk-row {
    .fileRisk-head {
        padding-top: 8px;
        span {
            min-width: 130px;
            color: $mainColor;
            background-color: #fff6f1;
            max-width: inherit;
            line-height: 30px;
            display: inline-block;
            text-align: center;
            max-width: 150px;
            padding: 0 8px;
            &:first-child {
                margin-right: 8px;
            }
        }
        b {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 8px;
            margin: 0 4px;
            background-color: #ff485c;
        }
        .riskHigh {
            b {
                background-color: #ff485c;
            }
            em {
                color: #ff485c;
                min-width: 43px;
                display: inline-block;
            }
        }

        .riskMiddle {
            b {
                background-color: #f97319;
            }
            em {
                color: #f97319;
                min-width: 43px;
                display: inline-block;
            }
        }
        .riskLow {
            b {
                background-color: #4283ff;
            }
        }
        em {
            color: #4283ff;
            min-width: 43px;
            display: inline-block;
        }
    }
    .riskCircle em {
        min-width: 43px;
        display: inline-block;
    }
}
</style>
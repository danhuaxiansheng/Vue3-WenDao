
<template>
    <!-- 普通模式 -查询栏 -->
    <div class="conditionSimple-wrap">
        <Condition ref="condition"
            :options="options"
            v-model="condition" />
        <el-button is-icon
            icon="iconfont icon-add-circle"
            title="添加条件"
            @click="addCondition(false)" />
    </div>
</template>

<script>
import Condition from "@COMP/TZ/condition/index.vue"
export default {
    name: "conditionSimple",
    components: { Condition },
    data() {
        return {
            condition: {}
        }
    },
    props: {
        // 过滤不展示的字段
        options: {
            type: Object,
            default() {
                return {
                    fieldDisabled: false,   // 字段禁止切换 true/false
                    custom: true,  // 是否使用自定义字段
                    columns: [],
                }
            }
        },
    },
    methods: {
        /**
        * 新增数据
        */
        addCondition(isNotMsg = false) {
            let vaModel = this.$refs['condition'].validate();
            if (vaModel.code === 1) {
                // 验证通过后 设置数据
                this.setCondition();
                // 清空数据
                this.$refs['condition'].valueChange();
                return true
            } else {
                // 空文本不提示
                if (isNotMsg && vaModel.code === 0) {
                    return true
                }
                // 是否弹出错误提示语
                this.$message.error(vaModel.message);

                // 返回false 代理是错误信息
                return false;
            }
        },
        /**
         * 设置条件
         */
        setCondition() {
            this.$emit('add', {
                field: this.condition.field,
                op: this.condition.op,
                value: this.condition.value,
                connector: "and",
                hasRight: false,
                hasLeft: false
            })
        },
    }
}
</script>

<style lang="scss" scoped>
.conditionSimple-wrap {
    position: relative;
    display: inline-flex;
    .el-button {
        background-color: #f1f3f4;
    }
}
</style>
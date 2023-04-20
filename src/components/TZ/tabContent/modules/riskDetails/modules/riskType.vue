<template>
    <ul>
        <li :class="option.isJump ? 'risk-jump' : ''"
            :title="option.title"
            v-for="option in item.options"
            :key="option.field">
            <i class="iconfont icon-risk-high"></i>
        </li>
    </ul>
</template>
<script>
export default {
    name: "riskType",
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
    },
    methods: {

    }
};
</script>

<style  lang="scss" scoped>
</style>
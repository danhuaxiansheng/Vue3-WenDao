<template>
    <em class="svg-icon"
        :title="title">
        <svg class="icon svg-icon"
            :style="css"
            aria-hidden="true">
            <use :xlink:href="`#${href}`"></use>
        </svg>
    </em>
</template>

<script>
export default {
    name: "svgIcon",
    props: {
        title: String,
        css: Object,
        href: {
            type: String,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
em {
    display: inline-block;
}
</style>
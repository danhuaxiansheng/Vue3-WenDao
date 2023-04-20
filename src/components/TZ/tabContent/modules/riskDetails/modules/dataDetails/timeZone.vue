

<template>
    <el-dialog title="世界时区"
        width="1144px"
        v-model:visible="visible"
        :before-close="close">
        <div id="timeArea-map"
            class="timeArea-map"
            :class="'worldAareActive' + value.replace('UTC', '').replace('+', '')"></div>
    </el-dialog>

</template>
<script>
export default {
    props: {
        value: {
            type: String
        }
    },
    data() {
        return {
            visible: true
        };
    },
    methods: {
        close() {
            this.$emit('close')
        }
    }
};
</script>

<style scoped>
.timeArea-map {
    background: url("~@AST/images/TZ/tabContent/timeArea/timeArea.png")
        no-repeat;
    background-size: cover;
    height: 620px;
}

/*时区图图片对应样式*/
.timeArea-map.worldAareActive0 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive0.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive1 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive1.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive2 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive2.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive3 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive3.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive4 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive4.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive5 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive5.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive6 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive6.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive7 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive7.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive8 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive8.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive9 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive9.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive10 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive10.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive11 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive11.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive12 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive12.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-11 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-11.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-10 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-10.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-9 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-9.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-8 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-8.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-7 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-7.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-6 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-6.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-5 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-5.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-4 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-4.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-3 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-3.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-2 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-2.png")
        no-repeat;
    background-position: -20px -41px;
}

.timeArea-map.worldAareActive-1 {
    background: url("~@AST/images/TZ/tabContent/timeArea/areaActive-1.png")
        no-repeat;
    background-position: -20px -41px;
}
/*时区 结束*/
</style>
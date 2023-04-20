import formatNum from '@FLT/formatNum'
class ChartOption {
    constructor() {

    }
    // 全库数据
    dataBase(data) {
        let option = null;
        if (data) {
            let xAxisdata = [],
                seriesData = [];

            data.forEach(item => {
                xAxisdata.push(item.nickName);
                seriesData.push(item.count);
            });

            option = {
                color: ["#1A73E8"],
                tooltip: {
                    trigger: "item",
                    axisPointer: { type: 'shadow' },
                    formatter(d) {
                        return d.marker.replace(/transparent/g, d.color[0]) + " " + d.name + "：" + d.value;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: seriesData.length > 6 ? '60' : '5%',
                    top: '6%',
                    containLabel: true
                },
                dataZoom: [
                    {
                        type: "slider",
                        show: seriesData.length > 6 ? true : false,
                        backgroundColor: '#EAEEF2',
                        dataBackground: {
                            lineStyle: {
                                color: 'transparent',
                                shadowColor: '#f00',
                                opacity: 0
                            },
                            areaStyle: {
                                opacity: 0
                            }
                        },
                        fillerColor: '#1A73E8',
                        borderColor: 'transparent',
                        filterMode: 'empty',
                        start: 0,
                        end: (6 / seriesData.length) * 100,
                        zoomLock: true,
                        handleSize: 8,
                        handleIcon: `image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAASCAYAAABit09LAAAAMklEQVQokWPcuOfqfwYiAAtIiZ+zFl6Vm/ZeY2AixjQQGFU4qpB8heD0CEpveAEDAwMAtfIIrsi7CQwAAAAASUVORK5CYII=`,
                        handleStyle: {
                            color: '#ffffff'
                        },
                        textStyle: {
                            color: '#424242'
                        },
                        brushSelect: false,
                        height: 8,
                    }
                ],
                xAxis: [
                    {
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "#D9D9D9",
                            }
                        },

                        axisLabel: {
                            true: true,
                            color: "#595959",
                            fontSize: 14
                        },
                        splitLine: {
                            show: false,
                        },
                        data: xAxisdata
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        minInterval: 10000,
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: "dashed"
                            }
                        },
                        axisLabel: {
                            formatter: function (value) {
                                return formatNum(value)
                            }
                        },
                    }
                ],
                series: {
                    type: 'bar',
                    barWidth: 24,
                    data: seriesData
                }
            }
        }
        return option;
    }
}

export default new ChartOption();
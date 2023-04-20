import formatNum from "@FLT/formatNum";
import * as echarts from "echarts";

class ChartOption {
  constructor() {}
  // 近7日风险数据趋势
  riskTrend(data) {
    let xAxisdata = [],
      everyTotal = {},
      series = [
        {
          name: "可疑",
          type: "bar",
          stack: "risklevel",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "中危",
          type: "bar",
          stack: "risklevel",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "高危",
          type: "bar",
          stack: "risklevel",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "类型A",
          type: "bar",
          stack: "datatype",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "类型B",
          type: "bar",
          stack: "datatype",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "类型C",
          type: "bar",
          stack: "datatype",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "类型D",
          type: "bar",
          stack: "datatype",
          barWidth: 14,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
        {
          name: "APT攻击",
          type: "line",
          stack: "APT攻击",
          yAxisIndex: 1,
          emphasis: {
            focus: "series",
          },
          data: [],
        },
      ],
      tempChartData = {};

    data.length &&
      data.forEach(function (item) {
        var key = Object.keys(item)[0],
          itemLow = 0,
          itemMiddle = 0,
          itemHigh = 0,
          attackA = 0,
          attackB = 0,
          attackC = 0,
          attackD = 0;

        xAxisdata.push(key);

        //构建威胁等级
        var riskLevel = item[key].riskLevel;
        if (riskLevel) {
          riskLevel.length &&
            riskLevel.forEach(function (item) {
              switch (item.name) {
                case "可疑":
                  itemLow = item.count;
                  break;
                case "中危":
                  itemMiddle = item.count;
                  break;
                case "高危":
                  itemHigh = item.count;
                  break;
              }
            });
        }
        series[0].data.push(itemLow);
        series[1].data.push(itemMiddle);
        series[2].data.push(itemHigh);

        //构建攻击类型
        var attackType = item[key].attackType;
        if (attackType) {
          attackA = (attackType[0] && attackType[0].count) || 0;
          attackB = (attackType[1] && attackType[1].count) || 0;
          attackC = (attackType[2] && attackType[2].count) || 0;
          attackD = (attackType[3] && attackType[3].count) || 0;
        }
        series[3].data.push(attackA);
        series[4].data.push(attackB);
        series[5].data.push(attackC);
        series[6].data.push(attackD);

        series[7].data.push((item[key] && item[key].aptCount) || 0);

        tempChartData[key] = item[key];
        everyTotal[key] = item[key].total;
      });

    var colors = [
        "#E8E565",
        "#F6A31B",
        "#EC414D",
        "#7F84AA",
        "#96C1F6",
        "#6381F5",
        "#1A73E8",
        "#EC414D",
      ],
      option = {
        color: colors,
        tooltip: {
          trigger: "axis",
          confine: true,
          axisPointer: {
            type: "shadow",
          },
          formatter(params) {
            var tooltip = {
              total: 0,
              apt: 0,
              high: 0,
              highColor: "",
              middle: 0,
              middleColor: "",
              low: 0,
              lowColor: "",
              typeData: [],
            };
            var typeHtml = "",
              levelHtml = "",
              axisValue = "",
              attackType = "";

            tooltip.total = everyTotal[params[0].name];
            params.forEach(function (item) {
              switch (item.seriesName) {
                case "高危":
                  tooltip.high = item.value;
                  tooltip.highColor = item.color;
                  break;
                case "中危":
                  tooltip.middle = item.value;
                  tooltip.middleColor = item.color;
                  break;
                case "可疑":
                  tooltip.low = item.value;
                  tooltip.lowColor = item.color;
                  break;
                case "APT攻击":
                  tooltip.apt = item.value;
                  break;
                default:
                  tooltip.typeData.push(item);
              }
            });

            tooltip.typeData.forEach(function (item, inx) {
              axisValue = item.axisValue;
              attackType = tempChartData[item.axisValue].attackType;

              if (!attackType) {
                typeHtml = "<li>暂无数据<li>";
              } else {
                var percent =
                  (item.value &&
                    ((item.value / tooltip.total) * 100).toFixed(2)) ||
                  0;
                typeHtml += `<li><b style="background-color:${
                  item.color
                }"></b><p>${
                  (attackType[inx] && attackType[inx].name) || "暂无类型"
                }：<em>${item.value}</em><em>${
                  tooltip.total ? "（" + percent + "%）" : ""
                }</em></p></li>`;
              }
            });

            var riskLevel = tempChartData[axisValue].riskLevel;
            if (!riskLevel) {
              levelHtml = "<li>暂无数据</li>";
            } else {
              levelHtml = `
                                                    <li><b style="background-color:${
                                                      tooltip.highColor
                                                    }"></b><p>高危：<em>${
                tooltip.high
              }</em><em>${
                tooltip.total
                  ? "（" +
                    ((tooltip.high / tooltip.total) * 100).toFixed(2) +
                    "%）"
                  : ""
              }</em></p></li>
                                                    <li><b style="background-color:${
                                                      tooltip.middleColor
                                                    }"></b><p>中危：<em>${
                tooltip.middle
              }</em><em>${
                tooltip.total
                  ? "（" +
                    ((tooltip.middle / tooltip.total) * 100).toFixed(2) +
                    "%）"
                  : ""
              }</em></p></li>
                                                    <li><b style="background-color:${
                                                      tooltip.lowColor
                                                    }"></b><p>可疑：<em>${
                tooltip.low
              }</em><em>${
                tooltip.total
                  ? "（" +
                    ((tooltip.low / tooltip.total) * 100).toFixed(2) +
                    "%）"
                  : ""
              }</em></p></li>`;
            }
            return `
                                        <div class="tooltip">
                                            <p class="tooltip-title">${params[0].name}日概览：</p>
                                            <p class="tooltip-title">处理数据：<em>${tooltip.total}</em>条</p>
                                            <p class="tooltip-title tooltip-title__apt">APT攻击：<em>${tooltip.apt}</em>条</p>
                                            <div>
                                                <p class="tooltip-title">威胁等级：</p>
                                                <ul>${levelHtml}</ul>
                                            </div>
                                            <div>
                                                <p class="tooltip-title">攻击类型：</p>
                                                <ul>${typeHtml}</ul>
                                        </div>
                                    </div>`;
          },
        },
        legend: [
          {
            icon: "bar",
            top: "6%",
            itemHeight: 8,
            itemWidth: 8,
            textStyle: {
              color: "#424242",
              fontSize: 14,
            },
            data: ["高危", "中危", "可疑"],
            x: "3%",
          },
          //{
          //    icon: 'bar',
          //    top: '6%',
          //    itemHeight: 8,
          //    itemWidth: 8,
          //    textStyle: {
          //        color: '#424242'
          //    },
          //    data: ['邮件类数据', 'HTTP类数据', '钓鱼邮件'],
          //    x: '25%',
          //},
          {
            icon: "circle",
            top: "6%",
            itemHeight: 8,
            itemWidth: 8,
            textStyle: {
              color: "#424242",
              fontSize: 14,
            },
            data: ["APT攻击"],
            x: "25%",
          },
        ],
        grid: {
          left: "3%",
          right: "4%",
          bottom: "8%",
          top: "26%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: "#424242",
              },
            },
            data: xAxisdata,
          },
        ],
        yAxis: [
          {
            type: "value",
            minInterval: 1,
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed",
              },
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              color: "#424242",
              formatter: function (value) {
                return formatNum(value, 1);
              },
            },
            name: "数量/条",
            nameTextStyle: {
              color: "#424242",
            },
          },
          {
            type: "value",
            minInterval: 1,
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
              },
            },
            name: "APT攻击/次",
            position: "right",
            axisTick: {
              show: false,
            },
            axisLabel: {
              color: "#424242",
              formatter: function (value) {
                return formatNum(value, 1);
              },
            },
            axisLine: {
              show: false,
            },
          },
        ],
        series: series,
      };
    return option;
  }
  // 资产类型排行
  assetRank(data) {
    var asset = [],
      total = 0,
      names = Object.keys(data);
    names.forEach((key) => {
      let value = data[key];
      total += value;
      asset.push({ name: key, value: value });
    });
    var option = {
      color: [
        "#1A73E8",
        "#8BBC40",
        "#F6A31B",
        "#EC414D",
        "#55D0F0",
        "#A975F5",
        "#E9C843",
        "#95C70A",
        "#F36946",
        "#EA2F3B",
      ],
      legend: [
        {
          show: true,
          icon: "circle",
          y: "center",
          x: "60%",
          orient: "vertical",
          itemHeight: 8,
          itemWidth: 8,
          textStyle: {
            color: "#424242",
            fontSize: 14,
          },
          data: names,
          formatter: function (name) {
            return `{a|${
              +name.length > 10 ? name.substring(0, 10) + "..." : name
            }}{b|${((data[name] / total) * 100).toFixed(2)}%}`;
          },
          // textStyle: {
          //   rich: {
          //     a: {
          //       align: "left",
          //       width: 130,
          //       fontSize: 14,
          //       color: "#424242",
          //     },
          //     b: {
          //       color: "#424242",
          //       fontSize: 14,
          //       width: 50,
          //     },
          //   },
          // },
        },
      ],
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "资产类型统计",
          type: "pie",
          radius: [30, 100],
          center: ["26%", "50%"],
          label: {
            show: false,
          },
          // itemStyle: {
          //     borderColor: 'rgba(119,140,162,0.08)',
          //     borderWidth: 15
          // },
          minAngle: 5,
          roseType: "radius",
          data: asset.sort((a, b) => {
            b.value - a.value;
          }), //对数据进行排序
        },
        {
          name: "边框",
          type: "pie",
          radius: [18, 120],
          center: ["26%", "50%"],
          showEmptyCircle: true,
          emptyCircleStyle: {
            color: "rgba(119,140,162,0.08)",
          },
        },
      ],
    };
    return option;
  }
  // 流量接收情况
  flowReceive(data) {
    var xData = [],
      yData = [];
    data.forEach(function (item) {
      xData.push(item.time.split(" ")[1]);
      yData.push(item.speed);
    });
    var option = {
      grid: {
        left: "1%",
        right: "2%",
        bottom: "8%",
        top: "16%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        formatter(params) {
          return `
                <div class="tooltip">
                    <p class="tooltip-title">接收流量：</p>
                    <div>
                        <ul>
                            <li><b style="display:none"></b><p>时间：${
                              data[params[0].dataIndex].time
                            }<br/>速率：${params[0].value} /Mbps</p></li>
                        </ul>
                    </div>
                   </div>`;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: "#424242证书详情",
          },
        },
        data: xData,
      },
      yAxis: {
        name: "单位：Mpbs",
        type: "value",
      },
      series: [
        {
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#1A73E8",
          },
          showSymbol: false,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(26,115,232,0.10)",
              },
              {
                offset: 1,
                color: "rgba(26,115,232,0.10)",
              },
            ]),
          },
          data: yData,
        },
      ],
    };
    return option;
  }
  // 模块统计
  moduleSummary(data) {
    let colors = ["#ec414d", "#f6a31b", "#1a73e8"],
      labelData = [],
      seriesData = [];
    data
      .sort((a, b) => a.count - b.count)
      .forEach((item) => {
        labelData.push(item.moduleName);
        seriesData.push(item.count);
      });
    var option = {
      grid: {
        left: "1%",
        right: "2%",
        bottom: "8%",
        top: "16%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "category",
        data: labelData,
      },
      dataZoom: [
        {
          // type: 'inside',
          orient: "vertical",
          start: 50,
          end: 100,
        },
      ],
      series: [
        {
          name: "模块统计",
          type: "bar",
          barWidth: 10,
          showBackground: true,
          backgroundStyle: {
            color: "#f5f5f5",
          },
          itemStyle: {
            color: (item) => {
              let index = labelData.length - item.dataIndex - 1;
              return colors[index] || "#1a73e8";
            },
          },
          label: {
            show: true,
            position: "right",
            color: "#424242",
          },
          data: seriesData,
        },
      ],
    };
    return option;
  }
}
export default new ChartOption();

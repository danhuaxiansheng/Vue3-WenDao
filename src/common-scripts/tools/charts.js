class ChartOpt {
  constructor() {
    this.textColor = "#98C8DE";
  }
  /**
   * 获取折线图图配置
   * @memberOf chartsConfig
   * @param.data  {Array} 图标数据,示例：[{ time: '2022-03-15', value: { '高危': 19, '普通': 151 } }]
   * @return {Object} 对应配置项
   */
  getLineOpt({
    colorList,
    labelKey = "time",
    linesKey = "value",
    linesInLine = true,
    sort = ["特别重大", "重大", "较大", "一般"],
    data = [],
  }) {
    if (!colorList)
      colorList = [
        "rgba(243,84,87",
        "rgba(242,170,50",
        "rgba(1,179,245",
        "rgba(7,185,141",
      ];
    let charData = {
        xAxisData: [],
        seriesList: [],
      },
      linesDataDict = {},
      linesData = [],
      seriesData = {};
    data.forEach((item) => {
      charData.xAxisData.push(item[labelKey]);
      for (let key in item[linesKey]) {
        // 构建折线图数据
        if (Object.hasOwnProperty.call(item[linesKey], key)) {
          const value = item[linesKey][key];
          seriesData[key]
            ? seriesData[key].push(value)
            : (seriesData[key] = [value]);
        }
        // 构建光标数据
        if (Object.hasOwnProperty.call(linesDataDict, key)) {
          linesDataDict[key].push([item[labelKey], item[linesKey][key]]);
        } else {
          linesDataDict[key] = [[item[labelKey], item[linesKey][key]]];
        }
      }
    });
    for (let key in seriesData) {
      if (Object.hasOwnProperty.call(seriesData, key)) {
        const item = seriesData[key];
        charData.seriesList.push({
          name: key,
          data: item,
        });
      }
    }
    charData.seriesList = charData.seriesList.sort((a, b) => {
      return sort.indexOf(a.name) - sort.indexOf(b.name);
    });
    for (let key in linesDataDict) {
      if (Object.hasOwnProperty.call(linesDataDict, key)) {
        const item = linesDataDict[key];
        linesData.push({ labelName: key, coords: item });
      }
    }
    linesData = linesData.sort((a, b) => {
      return sort.indexOf(a.labelName) - sort.indexOf(b.labelName);
    });
    let option = {
      color: [],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#01B3F5",
            type: "solid",
          },
          label: {
            //十字星时，label背景色
            backgroundColor: "#1f426b",
          },
          crossStyle: {
            color: "#01B3F5",
            type: "solid",
          },
        },
        formatter(seriesData) {
          let itemHtmls = "";
          seriesData.forEach((item) => {
            itemHtmls += `<div style="margin: 10px 0 0;line-height:1;">
                                    <div style="margin: 0px 0 0;line-height:1;">
                                        <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
                                        <span style="font-size:14px;color:#666;font-weight:400;margin-left:2px">${item.seriesName}</span>
                                        <span style="float:right;margin-left:20px;font-size:14px;color:#666;font-weight:900">
                                        // ${item.value}
                                        </span>
                                        <div style="clear:both"></div>
                                    </div>
                                    <div style="clear:both"></div>
                                </div>`;
          });
          return seriesData[0]?.axisValue
            ? `
                        <div style="margin: 0px 0 0;line-height:1;" >
                            <div style="margin: 0px 0 0;line-height:1;">
                                <div style="font-size:14px;color:#666;font-weight:400;line-height:1;">${seriesData[0].axisValue}</div>
                                <div style="margin: 10px 0 0;line-height:1;">
                                    ${itemHtmls}
                                </div>
                            </div>
                        </div>
                    `
            : "";
        },
      },
      legend: {
        top: "10px",
        right: "6px",
        selectedMode: !linesInLine, // 当折线图有轨迹动画时禁止lebal切换，否则线隐藏了轨迹还存在
        textStyle: {
          color: this.textColor,
        },
        data: [],
      },
      grid: {
        left: 10,
        right: 35,
        bottom: 10,
        containLabel: true,
      },
      dataZoom: [
        {
          type: "inside",
        },
      ],
      xAxis: [
        {
          type: "category",
          axisLabel: {
            //interval: 0, // 强制显示全部label名称
            color: this.textColor,
          },
          axisLine: {
            lineStyle: {
              color: "#1A4C6E",
            },
          },
          axisTick: {
            inside: true,
          },
          boundaryGap: false,
          data: charData.xAxisData,
        },
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: this.textColor,
          },
          splitLine: {
            lineStyle: {
              color: "#1A4C6E",
              type: "dashed",
            },
          },
          axisLine: {
            show: false,
          },
        },
      ],
      series: [],
    };
    charData.seriesList.forEach((item, i) => {
      let color = item.color || colorList[i] || "rgba(19, 207, 0";
      option.legend.data.push(item.name);
      option.color.push(color + ", 1)");
      option.series.push({
        name: item.name,
        type: "line",
        symbol: "circle",
        //stack: '总量',
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: color + ", .5)",
              },
              {
                offset: 0.75,
                color: color + ", 0)",
              },
            ],
          },
        },
        data: item.data,
      });
    });
    if (linesInLine)
      option.series.push({
        name: "路径",
        type: "lines",
        coordinateSystem: "cartesian2d",
        polyline: true,
        effect: {
          show: true,
          period: 10,
          symbolSize: 6,
        },
        lineStyle: {
          color: (params) => {
            return option.color[
              option.legend.data.indexOf(params.data.labelName)
            ];
          },
        },
        data: linesData,
      });
    return option;
  }
  /**
   * 获取环形图配置
   * @memberOf chartsConfig
   * @param.data  {Array} 图标数据,示例：[{ name: '高危资产', value: 10 }]
   * @return {Object} 对应配置项
   */
  getPieOpt({ data = [] }) {
    let option = {
      color: ["rgba(255,86,88,1)", "rgba(1,179,245,1)"],
      tooltip: {
        trigger: "item",
        formatter: "{b}：{c}（{d}%）",
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: "资产总数",
          type: "pie",
          radius: ["53%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: false,
              fontWeight: "bold",
            },
          },
          emptyCircleStyle: {
            color: "#1f426b",
          },
          itemStyle: {
            borderColor: "rgba(0, 186, 255, 0.06)",
            borderWidth: 10,
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    };
    return option;
  }
}
export default new ChartOpt();

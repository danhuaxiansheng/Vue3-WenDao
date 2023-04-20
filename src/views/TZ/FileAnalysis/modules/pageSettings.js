import formatNum from "@FLT/formatNum";

class ChartOption {
  constructor() {}
  getColorByState(state) {
    let color = "";
    switch (state) {
      case "正在分析":
        color = "#1a73e8";
        break;
      case "等待分析":
        color = "#F6A31B";
        break;
      case "分析完成":
        color = "#8BBC40";
        break;
      case "分析失败":
        color = "#EC414D";
        break;
      default:
        color = "#a3a3a3";
    }
    return color;
  }
  // 文件分析状态
  fileAnalysisState(data) {
    let total = 0,
      names = [],
      color = [],
      fileState = [],
      formatData = {};

    data.forEach((item) => {
      total += item.count;
      formatData[item.key] = item.count;
      fileState.push({ name: item.key, value: item.count });
    });
    // 数据排序
    fileState = fileState.sort((a, b) => {
      return b.value - a.value;
    });
    // 映射颜色
    fileState.forEach((item) => {
      names.push(item.name);
      color.push(this.getColorByState(item.name));
    });
    var option = {
      color: color,
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
            }}{b|${((formatData[name] / total) * 100).toFixed(0)}%}`;
          },
          //   textStyle: {
          //     rich: {
          //       a: {
          //         align: "left",
          //         width: 80,
          //         fontSize: 14,
          //         color: "#424242",
          //       },
          //       b: {
          //         color: "#424242",
          //         fontSize: 14,
          //         width: 50,
          //       },
          //     },
          //   },
        },
      ],
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "文件分析状态",
          type: "pie",
          radius: [30, 100],
          center: ["26%", "50%"],
          label: {
            show: false,
          },
          minAngle: 5,
          roseType: "radius",
          data: fileState, //对数据进行排序
        },
        {
          name: "边框",
          type: "pie",
          radius: [18, 112],
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

  // 文件类型分布
  fileTypeState(data) {
    let xAxisdata = [],
      seriesData = [];

    data.forEach((item) => {
      xAxisdata.push(item.group);
      seriesData.push(item.groupcount);
    });

    let option = {
      color: ["#1A73E8"],
      tooltip: {
        trigger: "item",
        axisPointer: { type: "shadow" },
        formatter(d) {
          return (
            d.marker.replace(/transparent/g, d.color[0]) +
            " " +
            d.name +
            "：" +
            d.value
          );
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: seriesData.length > 10 ? "60" : "5%",
        top: "6%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: "slider",
          show: seriesData.length > 10 ? true : false,
          backgroundColor: "#EAEEF2",
          dataBackground: {
            lineStyle: {
              color: "transparent",
              shadowColor: "#f00",
              opacity: 0,
            },
            areaStyle: {
              opacity: 0,
            },
          },
          fillerColor: "#1A73E8",
          borderColor: "transparent",
          filterMode: "empty",
          start: 0,
          end: (10 / seriesData.length) * 100,
          zoomLock: true,
          handleSize: 8,
          handleIcon: `image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAASCAYAAABit09LAAAAMklEQVQokWPcuOfqfwYiAAtIiZ+zFl6Vm/ZeY2AixjQQGFU4qpB8heD0CEpveAEDAwMAtfIIrsi7CQwAAAAASUVORK5CYII=`,
          handleStyle: {
            color: "#ffffff",
          },
          textStyle: {
            color: "#424242",
          },
          brushSelect: false,
          height: 8,
        },
      ],
      xAxis: [
        {
          axisLine: {
            show: true,
            lineStyle: {
              color: "#D9D9D9",
            },
          },

          axisLabel: {
            true: true,
            color: "#595959",
            fontSize: 14,
          },
          splitLine: {
            show: false,
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
          axisLabel: {
            formatter: function (value) {
              return formatNum(value);
            },
          },
        },
      ],
      series: {
        type: "bar",
        barWidth: 24,
        data: seriesData,
      },
    };
    return option;
  }
  // 任务解析状态
  fileTaskState(data) {
    let names = [],
      formatData = {};
    data.tag.length &&
      data.tag.forEach((item) => {
        names.push(item.name);
        formatData[item.name] = item.value;
      });

    var option = {
      color: ["#1A73E8", "#8BBC40"],
      title: [
        {
          subtext: `{a|任务总数}\n{b|${data.total}}`,
          left: "25%",
          top: "center",
          textAlign: "center",
          subtextStyle: {
            rich: {
              a: {
                color: "#595959",
                fontSize: "18",
                fontWeight: "700",
                fontFamily: "Microsoft YaHei",
              },
              b: {
                color: "#595959",
                fontSize: "18",
                lineHeight: "40",
                fontFamily: "Microsoft YaHei",
              },
            },
          },
        },
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
            }}{b|${((formatData[name] / data.total) * 100).toFixed(0)}%}`;
          },
          //   textStyle: {
          //     rich: {
          //       a: {
          //         align: "left",
          //         width: 80,
          //         fontSize: 14,
          //         color: "#424242",
          //       },
          //       b: {
          //         color: "#424242",
          //         fontSize: 14,
          //         width: 50,
          //       },
          //     },
          //   },
        },
      ],
      tooltip: {
        trigger: "item",
      },
      series: [
        {
          name: "任务数量",
          type: "pie",
          radius: [70, 100],
          center: ["26%", "50%"],
          label: {
            show: false,
          },
          data: data.tag, //对数据进行排序
        },
        {
          name: "边框",
          type: "pie",
          radius: [58, 112],
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
}
export default new ChartOption();

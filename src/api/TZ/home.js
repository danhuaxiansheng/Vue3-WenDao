//威胁统计
export function alarm() {
  return new Promise((resolve) => {
    resolve({
      data: {
        alarmCount: 521,
        alarmAssetCount: 23131,
        violationCount: 53451,
        alarmAptCount: 73456,
      },
    });
  });
  // return request({ url: '/api/index/threatenAmountStatistics', method: 'post', data })
}
//模块统计
export function module() {
  return new Promise((resolve) => {
    resolve({
      data: [
        {
          count: 24512351,
          moduleName: "木马邮件",
        },
        {
          count: 14512351,
          moduleName: "钓鱼邮件",
        },
        {
          count: 12512351,
          moduleName: "恶意码址",
        },
        {
          count: 9512351,
          moduleName: "暴力破解",
        },
        {
          count: 7452351,
          moduleName: "风险附件",
        },
        {
          count: 6652351,
          moduleName: "高危邮件",
        },
        {
          count: 3652351,
          moduleName: "高危邮件1",
        },
        {
          count: 1662351,
          moduleName: "高危邮件2",
        },
        {
          count: 672351,
          moduleName: "高危邮件3",
        },
        {
          count: 366351,
          moduleName: "高危邮件4",
        },
      ],
    });
  });
  // return request({
  //   url: "/api/index/sourceModuleStatistics",
  //   method: "post",
  //   data,
  // });
}

export function retrieveClassify() {
  return new Promise((resolve) => {
    resolve({ data: [] });
  });
  // return request({ url: "/external/user/retrieveClassify", method: "post" });
}
//7日数据风险趋势
export function trend() {
  // return request({
  //   url: "/api/index/sevenDaysRiskTrend",
  //   method: "post",
  //   data,
  // });
  return new Promise((resolve) => {
    resolve({
      data: [
        {
          高危风险: {
            riskLevel: [
              {
                name: "高危",
                count: 1222,
              },
              {
                name: "中危",
                count: 122,
              },
              {
                name: "可疑",
                count: 55,
              },
            ],
            attackType: [
              {
                count: 5231,
              },
              {
                count: 431,
              },
              {
                count: 231,
              },
              {
                count: 31,
              },
            ],
            total: 8000,
            aptCount: 6123,
          },
        },
      ],
    });
  });
}
//资产类型
export function asset() {
  return new Promise((resolve) => {
    resolve({
      data: {
        "192.168.122.122": 231345,
        "192.168.31.53": 231345,
        "192.168.222.12": 231345,
        "192.168.198.22": 231345,
        "192.168.254.64": 231345,
        "192.168.32.95": 231345,
        "192.168.77.58": 231345,
      },
    });
  });
  // return request({
  //   url: "/api/index/assetTypeStatistics",
  //   method: "post",
  //   data,
  // });
}
//实时资产统计
export function timeLog() {
  return new Promise((resolve) => {
    resolve({
      data: [
        {
          flow_time: "2023-03-14 12:33:21",
          source_endpoint_ip: "192.168.52.22",
          destination_endpoint_ip: "192.88.66.54",
          assetType: "资产类型",
          event_typeB: "攻击类型",
          attackfrom: "来源模块",
        },
        {
          flow_time: "2023-03-14 12:33:21",
          source_endpoint_ip: "192.148.55.41",
          destination_endpoint_ip: "192.188.65.5",
          assetType: "资产类型",
          event_typeB: "攻击类型",
          attackfrom: "来源模块",
        },
        {
          flow_time: "2023-03-14 12:33:21",
          source_endpoint_ip: "192.99.52.26",
          destination_endpoint_ip: "192.61.66.54",
          assetType: "资产类型",
          event_typeB: "攻击类型",
          attackfrom: "来源模块",
        },
      ],
    });
  });
  // return request({ url: "/api/index/assetRealTimeLog", method: "post", data });
}
//流量情况
export function flow() {
  return new Promise((resolve) => {
    resolve({
      data: [
        { time: "2023/03:14 01:50:59", speed: 123231 },
        { time: "2023/03:14 02:50:59", speed: 5413231 },
        { time: "2023/03:14 03:50:59", speed: 45126231 },
        { time: "2023/03:14 04:50:59", speed: 5479879231 },
        { time: "2023/03:14 05:50:59", speed: 123231 },
      ],
    });
  });
  // return request({ url: "/api/index/historySpeedInfo", method: "post", data });
}
//运行情况
export function running() {
  return new Promise((resolve) => {
    resolve({
      data: {
        sysTime: "2023/03/14 16:22:12",
        sysInfo: {
          runtime: "15天12小时7分钟",
          cpuStatus: "",
          hardwares: [
            {
              usedCpu: 80,
              usedMemory: 35,
              totalMemory: 100,
              memoryUsedPercent: 65,
              usedDisk: 13,
              totalDisk: 100,
              cpuStatus: "red",
              memoryStatus: "blue",
              diskUsedPercent: 78,
            },
          ],
        },
      },
    });
  });
  // return request({ url: "/api/index/systemRunStatus", method: "post", data });
}
//网络连接状态
export function network() {
  return new Promise((resolve) => {
    resolve({
      data: [
        {
          time: "2023/03:14 01:50:59",
          status: "DOWN",
          name: "网口1",
          ip: "192.168.55.21",
        },
        {
          time: "2023/03:14 02:50:59",
          status: "UNKNOWN",
          name: "网口2",
          ip: "192.168.55.21",
        },
        {
          time: "2023/03:14 03:50:59",
          status: "",
          name: "网口3",
          ip: "192.168.55.21",
        },
        {
          time: "2023/03:14 04:50:59",
          status: "",
          name: "网口4",
          ip: "192.168.55.21",
        },
        {
          time: "2023/03:14 05:50:59",
          status: "DOWN",
          name: "网口5",
          ip: "192.168.55.21",
        },
      ],
    });
  });
  // return request({ url: "/api/index/networkStatus", method: "post", data });
}

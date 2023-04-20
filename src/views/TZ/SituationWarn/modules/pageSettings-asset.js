import assetIcon from "@AST/images/TZ/SituationWarn/AssetCenter/asset.svg";
import assetInnerIcon from "@AST/images/TZ/SituationWarn/AssetCenter/asset_inner.svg";
import assetInterIcon from "@AST/images/TZ/SituationWarn/AssetCenter/asset_inter.svg";
import _ from "lodash";
import * as $Reg from "@LIB/validate.js";
class buildConfig {
  constructor() {
    this.assetTabList = [
      { name: "基本信息", label: "base" },
      { name: "硬件信息", label: "hardware" },
      { name: "软件信息", label: "software" },
      { name: "管理信息", label: "manage" },
    ];
  }

  buildLinks(sourceIndex, assetItem, globalIndex, sourceIP) {
    let links = [];
    switch (assetItem.flow) {
      case 1:
        links.push({
          source: sourceIndex,
          target: globalIndex,
          alarm: assetItem.alarm,
          linkTip: sourceIP + " -> " + assetItem.ip,
        });
        break;
      case 2:
        links.push({
          source: globalIndex,
          target: sourceIndex,
          alarm: assetItem.alarm,
          linkTip: assetItem.ip + " -> " + sourceIP,
          lineStyle: {
            curveness: 0.2,
            width: 2,
            opacity: 0.6,
            color: "red",
          },
        });
        break;
      case 3:
        links.push({
          source: sourceIndex,
          target: globalIndex,
          alarm: assetItem.alarm,
          linkTip: sourceIP + " -> " + assetItem.ip,
        });
        links.push({
          source: globalIndex,
          target: sourceIndex,
          alarm: assetItem.alarm,
          linkTip: assetItem.ip + " -> " + sourceIP,
        });
        break;
      default:
    }
    return links;
  }

  // 资产弹窗tuopu图
  getTuopuChart(data) {
    let nodes = [],
      links = [],
      globalIndex = 0,
      inner = data.relations.inner,
      internet = data.relations.internet;

    nodes.push({
      id: globalIndex,
      name: data.assetIp,
      value: data.assetIp,
      type: "服务器",
      label: {
        mormal: {
          show: true,
          position: "bottom",
          fontSize: 12,
        },
        color: "#666",
      },
      symbol: `image://${assetIcon}`,
      symbolSize: [60, 60],
    });
    //内网资产
    inner.asset.length &&
      inner.asset.map((item) => {
        globalIndex++;
        nodes.push({
          id: globalIndex,
          type: "内网资产",
          //name: item.ip,
          value: item.ip,
          label: {
            mormal: {
              show: true,
              position: "bottom",
              fontSize: 12,
            },
          },
          symbol: `image://${assetIcon}`,
          symbolSize: [40, 40],
        });
        links = links.concat(
          this.buildLinks(0, item, globalIndex, data.assetIp)
        );
      });
    //内网设备
    inner.other.length &&
      inner.other.map((item) => {
        globalIndex++;
        nodes.push({
          id: globalIndex,
          type: "内网设备",
          //name: item.ip,
          value: item.ip,
          label: {
            mormal: {
              show: true,
              position: "bottom",
              fontSize: 12,
            },
          },
          symbol: `image://${assetInnerIcon}`,
          symbolSize: [40, 40],
        });
        links = links.concat(
          this.buildLinks(0, item, globalIndex, data.assetIp)
        );
      });
    //外网设备（国外）
    internet.external.length &&
      internet.external.map((item) => {
        globalIndex++;
        nodes.push({
          id: globalIndex,
          type: "国外设备",
          value: item.ip,
          label: {
            mormal: {
              show: true,
              position: "bottom",
              fontSize: 12,
            },
          },
          symbol: `image://${assetInnerIcon}`,
          symbolSize: [50, 40],
        });
        links = links.concat(
          this.buildLinks(0, item, globalIndex, data.assetIp)
        );
      });
    //外网设备（国内）
    internet.internal.length &&
      internet.internal.map((item) => {
        globalIndex++;
        nodes.push({
          id: globalIndex,
          type: "国内设备",
          value: item.ip,
          label: {
            mormal: {
              show: true,
              position: "bottom",
              fontSize: 12,
            },
          },
          symbol: `image://${assetInterIcon}`,
          symbolSize: [50, 40],
        });
        links = links.concat(
          this.buildLinks(0, item, globalIndex, data.assetIp)
        );
      });
    var option = {
      tooltip: {
        show: true, //默认显示
        borderType: "solid",
        borderColor: "transparent",
        backgroundColor: "rgba(89,89,89,0.95)",
        borderWidth: 1,
        borderRadius: 0,
        textStyle: {
          color: "#fff",
        },
        formatter: function (graphdata) {
          if (graphdata.dataType == "node")
            return graphdata.data.type + "：" + graphdata.value;
          else if (graphdata.dataType == "edge") {
            return graphdata.data.linkTip;
          }
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          legendHoverLink: true,
          hoverAnimation: true,
          force: {
            repulsion: 100, //节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
            gravity: 0.03, //节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
            edgeLength: 125, //边的两个节点之间的距离，这个距离也会受 repulsion。[10, 50] 。值越小则长度越长
            layoutAnimation: true,
          },
          roam: false,
          draggable: false,
          focusNodeAdjacency: true, //移入高亮
          edgeSymbol: ["circle", "arrow"],
          edgeSymbolSize: [4, 10],
          itemStyle: {
            normal: {
              label: {
                show: false,
              },
              borderType: "solid",
              borderColor: "rgba(255,215,0,0.4)",
              borderWidth: 2,
              opacity: 1,
            },
            emphasis: {},
          },
          lineStyle: {
            normal: {
              color: "#1A73E8",
              width: "1",
              curveness: 0.02, //线条的曲线程度，从0到1
              opacity: 1,
            },
          },
          label: {
            normal: {
              show: true,
              position: "bottom",
              textStyle: {
                color: "#cde6c7",
                fontStyle: "normal",
                fontWeight: "bolder",
                fontFamily: "sans-serif",
                fontSize: 12,
              },
            },
          },
          edgeLabel: {
            normal: {
              show: false,
            },
          },
          links: links,
          data: nodes,
        },
      ],
    };
    return option;
  }
  // 获取表格列配置
  getColumns(type) {
    let gridColunms = [];
    switch (type) {
      case "businessSystem": //业务系统
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "名称",
            field: "system.system_name",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "应用系统类型",
            field: "system.system_type",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "应用系统子类型",
            field: "system.system_subtype",
            sort: false,
            ischecked: true,
            width: 166,
          },
          {
            title: "研制单位",
            field: "system.system_unit",
            sort: true,
            ischecked: true,
            width: 160,
          },
          {
            title: "用户规模",
            field: "system.system_user_scale",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "等级保护级别",
            field: "system.system_level",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "域名",
            field: "system.system_domain",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "备案状态",
            field: "system.system_icp_status",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "业务系统状态",
            field: "system_manage.system_status",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "业务系统重要性",
            field: "system_manage.system_value",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "是否关基",
            field: "system_manage.system_critical_infrastructure",
            sort: false,
            ischecked: true,
            width: 100,
          },
        ];
        break;
      case "safetyEquipment": //安全设备
      case "networkEquipment": //网络设备
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 128,
          },
          {
            title: "设备类型",
            field: "device.dev_type",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "设备厂商",
            field: "device.dev_vendor",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "设备名称",
            field: "device.dev_name",
            sort: false,
            ischecked: true,
            width: 177,
          },
          {
            title: "设备序列号",
            field: "device.dev_sn",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "设备型号",
            field: "device.dev_model",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "信息设备状态",
            field: "manage.status",
            sort: false,
            ischecked: true,
            width: 114,
          },
          {
            title: "国产化",
            field: "manage.localization",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "信息设备重要性",
            field: "manage.value",
            sort: false,
            ischecked: true,
            width: 130,
          },
          {
            title: "开放端口号",
            field: "manage.port",
            sort: false,
            ischecked: true,
            width: 99,
          },
          {
            title: "IPV4地址",
            field: "manage.ipv4_addr",
            sort: false,
            ischecked: true,
            width: 160,
          },
        ];
        break;
      case "terminalEquipment": //终端设备
      case "serverEquipment": //服务器设备
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 128,
          },
          {
            title: "设备名称",
            field: "device.dev_name",
            sort: false,
            ischecked: true,
            width: 177,
          },
          {
            title: "设备类型",
            field: "device.dev_type",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "设备序列号",
            field: "device.dev_sn",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "设备厂商",
            field: "device.dev_vendor",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "设备型号",
            field: "device.dev_model",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "信息设备状态",
            field: "manage.status",
            sort: false,
            ischecked: true,
            width: 114,
          },
          {
            title: "国产化",
            field: "manage.localization",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "信息设备重要性",
            field: "manage.value",
            sort: false,
            ischecked: true,
            width: 130,
          },
          {
            title: "开放端口号",
            field: "manage.port",
            sort: false,
            ischecked: true,
            width: 99,
          },
          {
            title: "IPV4地址",
            field: "manage.ipv4_addr",
            sort: false,
            ischecked: true,
            width: 212,
          },
          {
            title: "MAC地址",
            field: "manage.mac",
            sort: false,
            ischecked: true,
            width: 160,
          },
        ];
        break;
      case "otherEquipment": //其他设备
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "资产IP",
            field: "ip",
            sort: false,
            ischecked: true,
            width: 232,
          },
          {
            title: "资产类型",
            field: "types",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "攻击类型",
            field: "attacktype",
            sort: false,
            ischecked: true,
            width: 266,
          },
          {
            title: "来源模块",
            field: "attackfrom",
            sort: false,
            ischecked: true,
            width: 280,
          },
          {
            title: "威胁等级",
            field: "risklevel",
            sort: false,
            ischecked: true,
            width: 78,
          },
          {
            title: "设备名称",
            field: "device.dev_name",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "设备类型",
            field: "device.dev_type",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "设备序列号",
            field: "device.dev_sn",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "设备厂商",
            field: "device.dev_vendor",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "设备型号",
            field: "device.dev_model",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "信息设备状态",
            field: "manage.status",
            sort: false,
            ischecked: true,
            width: 130,
          },
          {
            title: "国产化",
            field: "manage.localization",
            sort: false,
            ischecked: true,
            width: 105,
          },
          {
            title: "信息设备重要性",
            field: "manage.value",
            sort: false,
            ischecked: true,
            width: 126,
          },
          {
            title: "开放端口号",
            field: "manage.port",
            sort: false,
            ischecked: true,
            width: 130,
          },
          {
            title: "IPV4地址",
            field: "manage.ipv4_addr",
            sort: false,
            ischecked: true,
            width: 206,
          },
          {
            title: "IPV6地址",
            field: "manage.ipv6_addr",
            sort: false,
            ischecked: true,
            width: 206,
          },
          {
            title: "MAC地址",
            field: "manage.mac",
            sort: false,
            ischecked: true,
            width: 160,
          },
        ];
        break;
      case "internetExport": //互联网出口信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "互联网出口名称",
            field: "network.network_name",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "网络服务提供商 ",
            field: "network.network_vendor",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "互联网IP",
            field: "network.internet_ip",
            sort: false,
            ischecked: true,
            width: 132,
          },
          {
            title: "网络带宽（MB）",
            field: "network.network_bandwidth",
            sort: false,
            ischecked: true,
            width: 125,
          },
          {
            title: "物理接入位置",
            field: "network.physical_access_location",
            sort: false,
            ischecked: true,
            width: 253,
          },
        ];
        break;
      case "segmentInformation": //网段信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "网段名称",
            field: "network_segment.network_segment_name",
            sort: false,
            ischecked: true,
            width: 188,
          },
          {
            title: "IP地址范围",
            field: "network_segment.ip_addr_range",
            sort: false,
            ischecked: true,
            width: 560,
          },
        ];
        break;
      case "portService": //端口服务信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "端口",
            field: "portservice.port_num",
            sort: false,
            ischecked: true,
            width: 94,
          },
          {
            title: "IP地址",
            field: "portservice.ip_addr",
            sort: false,
            ischecked: true,
            width: 130,
          },
          {
            title: "端口服务",
            field: "portservice.port_service",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "研制单位",
            field: "portservice.unit",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "是否公有端口",
            field: "portservice.public_port",
            sort: false,
            ischecked: true,
            width: 112,
          },
          {
            title: "传输层协议",
            field: "portservice.transport_protocol",
            sort: false,
            ischecked: true,
            width: 112,
          },
          {
            title: "最后检测时间",
            field: "portservice.last_time",
            sort: false,
            ischecked: true,
            width: 160,
          },
        ];
        break;
      case "cloudPlatform": //云平台信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "云平台名称",
            field: "cloud.cloud_name",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "类型",
            field: "cloud.cloud_type",
            sort: false,
            ischecked: true,
            width: 78,
          },
          {
            title: "运营单位名称",
            field: "cloud.operating_unit",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "使用主体",
            field: "cloud.use_unit",
            sort: false,
            ischecked: true,
            width: 110,
          },
          {
            title: "联系人名称",
            field: "cloud.contact_name",
            sort: false,
            ischecked: true,
            width: 118,
          },
          {
            title: "联系电话",
            field: "cloud.contact_phone",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "联系邮箱",
            field: "cloud.contact_email",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "联系地址",
            field: "cloud.contact_addr",
            sort: false,
            ischecked: true,
            width: 280,
          },
          {
            title: "是否境内",
            field: "cloud.cloud_location",
            sort: false,
            ischecked: true,
            width: 98,
          },
        ];
        break;
      case "roomInformation": //机房信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: true,
            ischecked: false,
            width: 160,
          },
          {
            title: "机房位置",
            field: "machineroom.machineroom_location",
            sort: false,
            ischecked: true,
            width: 280,
          },
          {
            title: "机房位置经度",
            field: "machineroom.machineroom_longitude",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "机房位置纬度",
            field: "machineroom.machineroom_latitude",
            sort: false,
            ischecked: true,
            width: 140,
          },
          {
            title: "使用主体",
            field: "machineroom.use_unit",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "运营单位名称",
            field: "machineroom.operatingunit_name",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "运营单位联系人 ",
            field: "machineroom.operatingunit_contact",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "运营单位电话",
            field: "machineroom.operatingunit_phone",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "运营单位邮箱",
            field: "machineroom.operatingunit_email",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "运营单位地址",
            field: "machineroom.operatingunit_addr",
            sort: false,
            ischecked: true,
            width: 280,
          },
        ];
        break;
      case "serviceData": //业务数据信息
        gridColunms = [
          {
            title: "主键",
            field: "indexid",
            width: 1,
            sort: false,
            ischecked: false,
            hide: true,
          },
          {
            title: "所属分组",
            field: "groupname",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "数据名称",
            field: "systeminfo.data_name",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "数据形态",
            field: "systeminfo.data_form",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "数据增量（B）",
            field: "systeminfo.data_incremental",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "数据总量（B）",
            field: "systeminfo.data_total",
            sort: false,
            ischecked: true,
            width: 120,
          },
          {
            title: "数据总条目",
            field: "systeminfo.data_item",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "数据类型",
            field: "systeminfo.data_type",
            sort: false,
            ischecked: true,
            width: 100,
          },
          {
            title: "数据产生时间",
            field: "systeminfo.data_time",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "数据重要性",
            field: "systeminfo.data_importance",
            sort: false,
            ischecked: true,
            width: 105,
          },
          {
            title: "负责人姓名",
            field: "systeminfo.head_name",
            sort: false,
            ischecked: true,
            width: 106,
          },
          {
            title: "负责人联系电话",
            field: "systeminfo.head_phone",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "负责人邮箱",
            field: "systeminfo.head_email",
            sort: false,
            ischecked: true,
            width: 160,
          },
          {
            title: "负责人地址",
            field: "systeminfo.head_addr",
            sort: false,
            ischecked: true,
            width: 218,
          },
        ];
        break;
    }
    return this.getFormatColumns(gridColunms, type);
  }
  /*
   * 格式化字段
   *
   * @method getFormatColumns
   * @memberOf ColumnsOfAssetGrid.js
   */
  getFormatColumns = function (columns, type) {
    let gridCols = _.cloneDeep(columns);
    gridCols.forEach(function (col) {
      switch (col.field) {
        case "groupname":
          col.templet = function (row) {
            return row[col.field] || "未分组";
          };
          break;
        case "risklevel":
          col.templet = function (row) {
            var className = "";
            switch (row[col.field]) {
              case 3:
              case "高":
                className = "risk-high";
                break;
              case 2:
              case "危":
                className = "risk-middle";
                break;
              case 1:
              case "疑":
                className = "risk-low";
                break;
            }
            return `#icon-${className}`;
          };
          break;
        case "attackfrom":
        case "attacktype":
          col.templet = function (row) {
            let attackHtml = "",
              attack = row[col.field];

            attack &&
              attack.length &&
              attack.map((item) => {
                attackHtml += `<span class="userTag" title="${item}">${item}</span>`;
              });
            return attackHtml;
          };
          break;
        default:
          // eslint-disable-next-line no-case-declarations
          let fields = col.field.split(".");
          col.templet = function (row) {
            let fieldValue = row[fields[0]] || "";
            fields.length > 1 && (fieldValue = fieldValue[fields[1]] || "");
            return fieldValue;
          };
      }
    });
    gridCols.unshift({ type: "checkbox", ischecked: true, fixed: "left" });
    let className = type === "otherEquipment" ? "" : "layui-hide";
    gridCols.push({
      field: "opreate",
      title: "操作",
      fixed: "right",
      ischecked: true,
      width: className ? 112 : 142,
      templet: function () {
        return `<a class ="layui-btn-primary layui-btn-sm" lay-event="details" title="详情"><i class ="iconfont icon-view-details"></i></a>
                        <a class ="layui-btn-primary layui-btn-sm" lay-event="edit"><i class ="iconfont icon-card-edit" title="编辑"></i></a>
                        <a class ="layui-btn-primary layui-btn-sm" lay-event="delete" title="删除"><i class ="iconfont icon-card-delete"></i></a>
                        <a class ="layui-btn-primary layui-btn-sm layui-more ${className}" lay-event="more"><i class ="iconfont icon-more-dot"></i></a>`;
      },
    });
    return gridCols;
  };
  /*
   * 根据资产类型获取资产完整字段
   *
   * @method getAssetFieldsByType
   * @param {String} type 必填 设备类型
   * @return {Array} 对应字段信息
   * @memberOf ColumnsOfAssetGrid.js
   */
  getAssetFieldsByType = function (type) {
    let assetFields = null;
    switch (type) {
      case "businessSystem": //业务系统
        assetFields = {
          base: {
            show: true,
            parentPath: "system",
            fields: [
              {
                name: "业务系统名称",
                field: "system_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "业务系统类型",
                field: "system_type",
                form: { type: "Switch", require: true },
              },
              {
                name: "业务系统子类型",
                field: "system_subtype",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "安装时间",
                field: "system_create_time",
                form: { type: "Time", require: true },
              },
              {
                name: "业务系统描述",
                field: "system_description",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder: "请输入不超过400字符的描述",
                  regex: "String",
                },
              },
              {
                name: "研制单位",
                field: "system_unit",
                form: {
                  type: "String",
                  require: false,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "用户规模",
                field: "system_user_scale",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "等级保护",
                field: "system_level",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "域名",
                field: "system_domain",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入域名，如：baidu.com",
                  regex: "Domian",
                },
              },
              {
                name: "公网IP地址及端口",
                field: "system_public_ip_port",
                form: {
                  type: "Textarea",
                  require: true,
                  placeholder:
                    "按IP:Port输入，多个输入采用英文逗号或回车换行隔开",
                  regex: "Ip:Port",
                },
              },
              {
                name: "内部IP地址及端口",
                field: "system_private_ip_port",
                form: {
                  type: "Textarea",
                  require: true,
                  placeholder:
                    "按IP:Port输入，多个输入采用英文逗号或回车换行隔开",
                  regex: "Ip:Port",
                },
              },
              {
                name: "备案状态",
                field: "system_icp_status",
                form: { type: "Switch", require: true },
              },
              {
                name: "ICP备案号",
                field: "system_icp_sn",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入ICP备案号，如：蜀ICP备13021401号",
                  regex: "Record",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: true,
            parentPath: "system_manage",
            fields: [
              {
                name: "业务系统状态",
                field: "system_status",
                form: { type: "Switch", require: true },
              },
              {
                name: "业务系统重要性",
                field: "system_value",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "是否关基",
                field: "system_critical_infrastructure",
                form: { type: "Switch", require: true },
              },
              {
                name: "是否上云",
                field: "system_cloud",
                form: { type: "Switch", require: true },
              },
              {
                name: "云服务提供商",
                field: "system_cloud_vendor",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入云服务提供商，如：阿里云",
                  regex: "String",
                },
              },
            ],
          },
        };
        break;
      case "safetyEquipment": //安全设备
      case "networkEquipment": //网络设备
        assetFields = {
          base: {
            show: true,
            parentPath: "device",
            fields: [
              {
                name: "设备名称",
                field: "dev_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "设备类型",
                field: "dev_type",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "设备序列号",
                field: "dev_sn",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入设备序列号，如：DS423G21707028",
                  regex: "String",
                },
              },
              {
                name: "设备厂商",
                field: "dev_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "设备型号",
                field: "dev_model",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入设备型号，如：DAS-NTA-A200",
                  regex: "String",
                },
              },
              {
                name: "设备描述",
                field: "dev_description",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder: "请输入不超过400字符的描述",
                  regex: "String",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: true,
            parentPath: "manage",
            fields: [
              {
                name: "设备信息状态",
                field: "status",
                form: { type: "Switch", require: true },
              },
              {
                name: "国产化",
                field: "localization",
                form: { type: "Switch", require: true },
              },
              {
                name: "部署时间",
                field: "deployment_time",
                form: { type: "Time", require: true },
              },
              {
                name: "信息设备重要性",
                field: "value",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "IP地址版本",
                field: "ip_version",
                form: { type: "Switch", require: true },
              },
              {
                name: "IPV4地址",
                field: "ipv4_addr",
                form: {
                  type: "String",
                  require: true,
                  regex: "IPV4",
                },
              },
              {
                name: "IPV6地址",
                field: "ipv6_addr",
                form: {
                  type: "String",
                  require: true,
                  regex: "IPV6",
                },
              },
              {
                name: "开放端口号",
                field: "port",
                form: {
                  type: "String",
                  require: true,
                  regex: "Port",
                },
              },
            ],
          },
        };
        break;
      case "terminalEquipment": //终端设备
      case "serverEquipment": //服务器设备
      case "otherEquipment": //其他设备
        assetFields = {
          base: {
            show: true,
            parentPath: "device",
            fields: [
              {
                name: "设备名称",
                field: "dev_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "设备类型",
                field: "dev_type",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "设备序列号",
                field: "dev_sn",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入设备序列号，如：DS423G21707028",
                  regex: "String",
                },
              },
              {
                name: "设备厂商",
                field: "dev_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "设备型号",
                field: "dev_model",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入设备型号，如：DAS-NTA-A200",
                  regex: "String",
                },
              },
              {
                name: "设备描述",
                field: "dev_description",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder: "请输入不超过400字符的描述",
                  regex: "String",
                },
              },
            ],
          },
          hardware: {
            show: true,
            parentPath: "hardware",
            fields: [
              {
                name: "处理器厂商",
                field: "processor_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "处理器型号",
                field: "processor_model",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入处理器型号，如：AMD R7 4800U",
                  regex: "String",
                },
              },
              {
                name: "处理器数量",
                field: "processor_num",
                form: {
                  type: "Number",
                  require: false,
                  regex: "Number",
                },
              },
              {
                name: "内存厂商",
                field: "memory_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "内存总容量（GB）",
                field: "memory_total",
                form: {
                  type: "Number",
                  require: true,
                  regex: "Number",
                },
              },
              {
                name: "硬盘厂商",
                field: "hard_disk_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "硬盘总容量（GB）",
                field: "hard_disk_capacity",
                form: {
                  type: "Number",
                  require: true,
                  regex: "Number",
                },
              },
            ],
          },
          software: {
            show: true,
            parentPath: "software",
            fields: [
              {
                name: "操作系统类型",
                field: "software_type",
                form: {
                  type: "Dropdown",
                  require: true,
                },
              },
              {
                name: "操作系统版本",
                field: "software_version",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "办公软件",
                parentPath: "office",
                field: "office",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder:
                    "按'厂商/名称/版本'输入（如：微软/Office/V1.2），多个输入采用英文逗号或回车换行隔开",
                  regex: "String",
                },
              },
              {
                name: "数据库",
                parentPath: "db",
                field: "db",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder:
                    "按'厂商/名称/版本'输入（如：Oracle/MySQL/5.7），多个输入采用英文逗号或回车换行隔开",
                  regex: "String",
                },
              },
              {
                name: "中间件",
                parentPath: "middleware",
                field: "middleware",
                form: {
                  type: "Textarea",
                  require: false,
                  placeholder:
                    "按'厂商/名称/版本'输入（如：Apache/Tomcat/9.0.50），多个输入采用英文逗号或回车换行隔开",
                  regex: "String",
                },
              },
            ],
          },
          manage: {
            show: true,
            parentPath: "manage",
            fields: [
              {
                name: "设备信息状态",
                field: "status",
                form: { type: "Switch", require: true },
              },
              {
                name: "国产化",
                field: "localization",
                form: { type: "Switch", require: true },
              },
              {
                name: "部署时间",
                field: "deployment_time",
                form: { type: "Time", require: true },
              },
              {
                name: "信息设备重要性",
                field: "value",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "IP地址版本",
                field: "ip_version",
                form: { type: "Switch", require: true },
              },
              {
                name: "IPV4地址",
                field: "ipv4_addr",
                form: {
                  type: "String",
                  require: true,
                  regex: "IPV4",
                },
              },
              {
                name: "IPV6地址",
                field: "ipv6_addr",
                form: {
                  type: "String",
                  require: true,
                  regex: "IPV6",
                },
              },
              {
                name: "MAC地址",
                field: "mac",
                form: {
                  type: "String",
                  require: true,
                  regex: "Mac",
                  placeholder:
                    "请输入MAC地址，例：44:47:E5:85:4C:31。(字母区间为A-F)",
                },
              },
              {
                name: "开放端口号",
                field: "port",
                form: {
                  type: "String",
                  require: true,
                  regex: "Port",
                  placeholder: "请输入开放端口号，多个端口号之间用英文逗号隔开",
                },
              },
            ],
          },
        };
        break;
      case "internetExport": //互联网出口信息
        assetFields = {
          base: {
            show: true,
            parentPath: "network",
            fields: [
              {
                name: "互联网出口名称",
                field: "network_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "网络服务提供商",
                field: "network_vendor",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "互联网IP",
                field: "internet_ip",
                form: {
                  type: "Textarea",
                  require: true,
                  placeholder:
                    "请按单个IP地址、CIDR地址划分、网段划分方式输入互联网IP，如：139.12.192.11、139.12.192.11/28、139.12.192.11-139.12.192.20，多个输入采用英文逗号或回车换行隔开",
                  regex: "IPnetwork",
                },
              },
              {
                name: "网络宽带（MB）",
                field: "network_bandwidth",
                form: {
                  type: "Number",
                  require: true,
                  regex: "Number",
                },
              },
              {
                name: "物理接入位置",
                field: "physical_access_location",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
      case "segmentInformation": //网段信息
        assetFields = {
          base: {
            show: true,
            parentPath: "network_segment",
            fields: [
              {
                name: "网段名称",
                field: "network_segment_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "IP地址范围",
                field: "ip_addr_range",
                form: {
                  type: "Textarea",
                  require: true,
                  placeholder:
                    "请按CIDR地址划分、网段划分方式输入IP地址范围，如：139.12.192.11/28、192.19.192.11-192.19.192.20，多个输入采用英文逗号或回车换行隔开",
                  regex: "IPsegment",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
      case "portService": //端口服务信息
        assetFields = {
          base: {
            show: true,
            parentPath: "portservice",
            fields: [
              {
                name: "端口",
                field: "port_num",
                form: {
                  type: "Number",
                  require: true,
                  regex: "Port",
                },
              },
              {
                name: "IP地址",
                field: "ip_addr",
                form: {
                  type: "String",
                  require: true,
                  regex: "IPV4",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "端口服务",
                field: "port_service",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "传输层协议",
                field: "transport_protocol",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },

              {
                name: "是否公有端口",
                field: "public_port",
                form: { type: "Switch", require: false },
              },
              {
                name: "研制单位",
                field: "unit",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "最后检测时间",
                field: "last_time",
                form: { type: "Time", require: false },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
      case "cloudPlatform": //云平台信息
        assetFields = {
          base: {
            show: true,
            parentPath: "cloud",
            fields: [
              {
                name: "云平台名称",
                field: "cloud_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "类型",
                field: "cloud_type",
                form: { type: "Switch", require: true },
              },
              {
                name: "运营单位名称",
                field: "operating_unit",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "使用主体",
                field: "use_unit",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "联系人名称",
                field: "contact_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "联系电话",
                field: "contact_phone",
                form: {
                  type: "String",
                  require: true,
                  regex: "Phone",
                },
              },
              {
                name: "联系邮箱",
                field: "contact_email",
                form: {
                  type: "String",
                  require: true,
                  regex: "Mail",
                },
              },
              {
                name: "联系地址",
                field: "contact_addr",
                form: {
                  type: "String",
                  require: false,
                  regex: "String",
                },
              },
              {
                name: "是否境内",
                field: "cloud_location",
                form: { type: "Switch", require: true },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
      case "roomInformation": //机房信息
        assetFields = {
          base: {
            show: true,
            parentPath: "machineroom",
            fields: [
              {
                name: "机房位置",
                field: "machineroom_location",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "机房位置经度",
                field: "machineroom_longitude",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入机房位置经度，如：92.233422",
                  regex: "Longitude",
                },
              },
              {
                name: "机房位置纬度",
                field: "machineroom_latitude",
                form: {
                  type: "String",
                  require: true,
                  placeholder: "请输入机房位置纬度，如：29.235455",
                  regex: "Latitude",
                },
              },
              {
                name: "使用主体",
                field: "use_unit",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "运营单位名称",
                field: "operatingunit_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "运营单位联系人",
                field: "operatingunit_contact",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "运营单位电话",
                field: "operatingunit_phone",
                form: {
                  type: "String",
                  require: true,
                  regex: "Phone",
                },
              },
              {
                name: "运营单位邮箱",
                field: "operatingunit_email",
                form: {
                  type: "String",
                  require: true,
                  regex: "Mail",
                },
              },
              {
                name: "运营单位地址",
                field: "operatingunit_addr",
                form: {
                  type: "String",
                  require: false,
                  regex: "String",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
      case "serviceData": //业务数据信息
        assetFields = {
          base: {
            show: true,
            parentPath: "systeminfo",
            fields: [
              {
                name: "数据名称",
                field: "data_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "所属分组",
                field: "groupid",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "数据形态",
                field: "data_form",
                form: { type: "Switch", require: true },
              },
              {
                name: "数据增量（B）",
                field: "data_incremental",
                form: {
                  type: "Number",
                  require: false,
                  regex: "Number",
                },
              },
              {
                name: "数据总量（B）",
                field: "data_total",
                form: {
                  type: "Number",
                  require: true,
                  regex: "Number",
                },
              },
              {
                name: "数据总条目",
                field: "data_item",
                form: {
                  type: "Number",
                  require: false,
                  regex: "Number",
                },
              },
              {
                name: "数据类型",
                field: "data_type",
                form: { type: "Dropdown", require: true },
              },
              {
                name: "数据产生时间",
                field: "data_time",
                form: { type: "Time", require: false },
              },
              {
                name: "数据重要性",
                field: "data_importance",
                form: { type: "Switch", require: true },
              },
              {
                name: "负责人姓名",
                field: "head_name",
                form: {
                  type: "String",
                  require: true,
                  regex: "String",
                },
              },
              {
                name: "负责人联系电话",
                field: "head_phone",
                form: {
                  type: "String",
                  require: true,
                  regex: "Phone",
                },
              },
              {
                name: "负责人邮箱",
                field: "head_email",
                form: {
                  type: "String",
                  require: true,
                  regex: "Mail",
                },
              },
              {
                name: "负责人地址",
                field: "head_addr",
                form: {
                  type: "String",
                  require: false,
                  regex: "String",
                },
              },
            ],
          },
          hardware: {
            show: false,
          },
          software: {
            show: false,
          },
          manage: {
            show: false,
          },
        };
        break;
    }
    return assetFields;
  };

  // testValueByRegex = function (value, regexType) {
  testValueByRegex = function (rule, value) {
    let regexType = rule.regex;
    let regex = /[`<>"']/im,
      regexResult = true;
    //验证非法输入
    if (regex.test(value)) {
      return false;
    }

    switch (regexType) {
      case "Domian":
        regex =
          /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
        regexResult = regex.test(value);
        break;
      case "Ip:Port":
        // let ipValues = value.replace(/\n/g, ",").split(",");
        // regex =
        //   /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
        // regexResult = !ipValues.some((item, d) => {
        //   return !regex.test(item);
        // });
        break;
      case "Record":
        regex = /[\u4e00-\u9fa5]ICP备\d{8}号/;
        regexResult = regex.test(value);
        break;
      case "Longitude": //经度
        // regex =
        //   /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
        // regexResult = regex.test(value);
        break;
      case "Latitude": //纬度
        // regex = /^(\-|\+)?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
        // regexResult = regex.test(value);
        break;
      case "IPsegment": //IP(网段)
        // let ipsegValues = value.replace(/\n/g, ",").split(","),
        //   regexA =
        //     /[\t]*(((2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)\.){3}(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)(\/(3[012]|[12]?[0-9])))[\t]*/,
        //   regexB =
        //     /^(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))-(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/;

        // regexResult = !ipsegValues.some((item, d) => {
        //   return !(regexA.test(item) || regexB.test(item));
        // });
        break;
      case "IPnetwork":
        // let ipnetValues = value.replace(/\n/g, ",").split(","),
        //   regexC =
        //     /[\t]*(((2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)\.){3}(2(5[0-5]|[0-4][0-9])|[01]?[0-9][0-9]?)(\/(3[012]|[12]?[0-9])))[\t]*/,
        //   regexD =
        //     /^(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))-(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/;
        // regexResult = !ipnetValues.some((item, d) => {
        //   return !(
        //     $Reg.checkIP(item) ||
        //     regexC.test(item) ||
        //     regexD.test(item)
        //   );
        // });
        break;
      case "IPV4":
        // let ipv4Values = value.split(",");
        // regexResult = !ipv4Values.some((item, d) => {
        //   return !$Reg.checkIP(item);
        // });
        break;
      case "Number":
        regex = /^\d+$/;
        regexResult = regex.test(value);
        break;
      case "IPV6":
        // let ipv6Values = value.split(",");
        // regexResult = !ipv6Values.some((item, d) => {
        //   return !$Reg.checkIPV6(item);
        // });
        break;
      case "Port":
        // let portValues = value.split(",");
        // regexResult = !portValues.some((item, d) => {
        //   return !$Reg.checkPort(item);
        // });
        break;
      case "Mac":
        regexResult = $Reg.checkMAC(value) && $Reg.checkMACInpit(value);
        break;
      case "Phone":
        regexResult =
          $Reg.checkPhoneNumber(value) || $Reg.checkMobilePhone(value);
        break;
      case "Mail":
        regexResult = $Reg.checkEmail(value);
        break;
    }
    return regexResult;
  };
}
export default new buildConfig();

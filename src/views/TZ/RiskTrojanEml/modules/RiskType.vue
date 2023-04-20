<template>
  <div class="element-risk__content">
    <ul>
      <li
        v-for="risk in filterType"
        :key="risk.field"
        :title="
          risk.title + '：' + (riskStatus[risk.field] ? '命中' : '未命中')
        "
        @click="riskJump(risk)"
        :class="[
          { 'is-hit': riskStatus[risk.field] },
          { pointer: risk.isJump && riskStatus[risk.field] },
        ]"
      >
        <i :class="['iconfont', risk.iconClass]"></i>
      </li>
    </ul>
  </div>
</template>

<script>
import { setSessionParam } from "@PAGE/platform.js";
import { postDetection } from "@API/TZ/RiskTrojanEml/index.js";
export default {
  name: "RiskType",
  props: {
    row: {
      type: Object,
    },
  },
  data() {
    return {
      riskType: [
        {
          field: "ismmfj",
          title: "木马附件",
          isJump: true,
          iconClass: "icon-trojan",
          url: "/TZ/RiskTrojanEml/EnclosureRecord",
        },
        {
          field: "isdyyj",
          title: "钓鱼邮件",
          isJump: true,
          iconClass: "icon-eml-fish",
          url: "/TZ/RiskTrojanEml/RiskFishEml",
        },
        {
          field: "iswzfj",
          title: "发件人伪造",
          isJump: false,
          iconClass: "icon-from",
        },
        {
          field: "iswrongtime",
          title: "时间错误",
          isJump: false,
          iconClass: "icon-time-wrong",
        },
      ],
      riskStatus: {
        ismmfj: false,
        isdyyj: false,
        iswzfj: false,
        iswrongtime: false,
      },
    };
  },
  computed: {
    filterType() {
      return this.riskType.filter((item) => {
        return !location.href.includes(item.url);
      });
    },
  },
  watch: {
    row: {
      handler(nVal, oVal) {
        if (nVal != oVal) {
          this.updateDetetion();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    updateDetetion() {
      postDetection({ indexId: this.row.indexid })
        .then((res) => {
          if (res.status == 200) {
            this.riskStatus = res.data;
          }
        })
        .catch(() => {});
    },
    riskJump(risk) {
      if (risk.isJump && this.riskStatus[risk.field]) {
        let expression = "",
          emlKey = this.row.emlkey,
          condition = [{ field: "time", value: "", op: "equal" }];

        switch (risk.field) {
          case "issmfj":
            expression =
              '{"query": { "bool": { "must": [{ "term": { "emlkey": "' +
              emlKey +
              '" } },{ "exists": { "field": "securitylevel" } } ],"must_not": [{"terms": {"securitylevel": [ 0,4]  }} ]  }}}';
            break;
          case "iskyfj":
            condition.push({ field: "emlkey", value: emlKey, op: "equal" });
            condition.push({
              field: "filerisk",
              value: "16 - 20",
              op: "range",
            });
            break;
          default:
            expression = '{ "query": {"term": { "emlkey":"' + emlKey + '" }} }';
            break;
        }
        // 跳转
        setSessionParam({
          isJson: true,
          type: "_blank",
          url: risk.url,
          sessionName: "paramListSession",
          data: {
            conditions: condition,
            expression: expression,
          },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.element-risk__content {
  ul {
    padding-top: 10px;
    @include flexCenter($justify: flex-start);
    li {
      display: inline-block;
      width: 30px;
      height: 30px;
      @include flexCenter;
      border-radius: 50%;
      background-color: #eaeef3;
      margin-right: 14px;
      &:nth-last-child(2) {
        margin-left: 14px;
        position: relative;
        &::after {
          content: "";
          width: 1px;
          height: 20px;
          position: absolute;
          background-color: #dcdcdc;
          left: -14px;
          top: 5px;
        }
      }
      &.is-hit {
        background-color: #fae5e5;
        .iconfont {
          color: $dangerColor;
          opacity: 0.6;
        }
        &.pointer {
          .iconfont {
            opacity: 1;
          }
        }
      }
    }
    .iconfont {
      font-size: 20px;
      color: #666;
    }
  }
}
</style>

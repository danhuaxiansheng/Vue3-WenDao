<template>
  <!-- 标签 -->
  <div class="flow-content" :class="$attrs.flowClass">
    <el-empty mode="hard" v-if="!ASCIIData.length"></el-empty>
    <template v-else v-for="(item, inx) in ASCIIData" :key="inx">
      <p :class="getClass(item)">
        {{ getText(item) }}
      </p>
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "flowIndex",
  props: {
    dataList: {
      type: Array,
    },
  },
  data() {
    return {
      // 默认配置
      defaultOptions: {
        isEnable: true, // 是否启用
        isShow: true, // 是否隐藏
        isFold: false,
      },
      ASCIIData: [],
    };
  },
  watch: {
    dataList: {
      handler(val) {
        this.formatData(val);
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState({ storeRow: (state) => state.tabContent.row }),
  },
  methods: {
    formatData(data) {
      let ASCIIData = [];

      data.length &&
        data.forEach((item) => {
          item.ASCIIData && ASCIIData.push(item);
        });
      this.ASCIIData = ASCIIData;
    },
    getText(item) {
      return item.ASCIIData?.replace(/</g, "&lt;") ?? "";
    },
    getClass(item) {
      var isSip = item.SrcAddr?.indexOf(this.storeRow.sip) ?? -1;
      return isSip > -1 ? "odd" : "even";
    },
  },
};
</script>

<style lang="scss" scoped>
.flow-content p {
  word-break: break-word;
  line-height: 26px;
  padding-left: 10px;
  font-size: 12px;
}

.flow-content p.odd {
  color: $warnTextColor;
}

.flow-content p.even {
  color: $highColor;
}

.flow-content {
  height: 160px;
  overflow-y: auto;
}

.flow-content.aside {
  height: 460px;
  margin: -12px -16px 10px;
  padding: 10px 15px 0;
}
</style>

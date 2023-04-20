<template>
  <div class="payload" v-html="getPayload()"></div>
</template>
<script>
import { mapState } from "vuex";
import { formatPayload } from "@PAGE/platform.js";
export default {
  name: "payloadIndex",
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({ storeRow: (state) => state.tabContent.row }),
  },
  methods: {
    /**
     * 载荷信息
     */
    getPayload() {
      let field = this.options.field;
      let val = "";
      const data = this.storeRow;
      if (typeof field === "string") {
        val = data[field];
      } else {
        // field.some(d => {
        //     if (data.hasOwnProperty(d) && data[d]) {
        //         val = data[d];
        //         return true;
        //     }
        // })
      }
      return formatPayload(val || "").replace(/\n/g, "</br>");
    },
  },
};
</script>

<style lang="scss" scoped>
.payload {
  color: $warnTextColor;
  word-break: break-word;
  max-height: 160px;
  overflow-y: auto;
  padding-left: 10px;
  line-height: 26px;
}
</style>

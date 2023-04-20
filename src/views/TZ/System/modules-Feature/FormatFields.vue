<template #slotName>
  <div>
    <!-- 信誉等级：1-疑，2-危，3-高 -->
    <template v-if="slotName == 'value'">
      {{ formatValue(scope.row) }}
    </template>
    <template v-else-if="slotName == 'threatLevel'">
      <svg-icon
        :title="scope.row['threatLevel'].toString()"
        :href="`icon-risk-${formatRisk(scope.row['threatLevel'])}`"
      >
      </svg-icon>
    </template>
    <template v-else-if="slotName == 'expiryTime'">
      <div v-html="formatExpiryTime(scope.row)"></div>
    </template>
    <template v-else-if="['useEnable', 'isAvailable'].includes(slotName)">
      <!-- <el-switch
        v-model="scope["row"][slotName]"
        active-color="#34a853"
        inactive-color="#c8c9ca"
        :active-value="1"
        :inactive-value="0"
        :title="isEnableSwitch(scope.row) ? '已过期，不可设置' : ''"
        :disabled="isEnableSwitch(scope.row)"
        @change="setRuleData(scope.row, slotName)"
      ></el-switch> -->
    </template>
  </div>
</template>
<script>
// import { isArray } from "@LIB/validate.js"

export default {
  name: "FormatFields",
  props: {
    slotName: {
      default: String,
    },
    scope: {
      default: Object,
    },
  },
  methods: {
    formatValue(row) {
      return row.value || row.md5_32 || row.md5_16;
    },
    formatRisk(value) {
      return { 3: "high", 2: "middle", 1: "low" }[value] || "none";
    },
    formatExpiryTime(row) {
      if (row.expiryEnable == 0)
        return '<span style="color:#34a853">长期</span>';
      else if (new Date(row.expiryTime) < new Date())
        return '<span style="color:red">过期</span>';
      else return row.expiryTime;
    },
    isEnableSwitch(row) {
      const expiryTime = Date.parse(row["expiryTime"]);
      const nowTime = new Date().getTime();
      return expiryTime < nowTime;
    },
    setRuleData(row, enableField) {
      // 构建编辑参数
      let apiParams = {
        id: row.id,
      };
      apiParams[enableField] = row[enableField];
      // 调用父组件的方法
      this.$emit("change", apiParams);
    },
  },
};
</script>

<style lang="scss"></style>

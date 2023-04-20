<template>
  <el-table v-bind="$attrs" class="has_border">
    <template v-for="item in cloumns">
      <el-table-column
        v-if="item.type == 'checkbox'"
        :key="`m_${item.type}`"
        :fixed="item.fixed"
        type="selection"
        :width="item.width"
        align="center"
      >
      </el-table-column>
      <!-- 操作列：固定使用opreate -->
      <el-table-column
        v-else-if="item.field == 'opreate'"
        :key="`m_${item.title}`"
        :fixed="item.fixed"
        label="操作"
        :width="item.width"
      >
        <!-- <slot :name="item.field" :scope="scope" slot-scope="scope"> </slot> -->
      </el-table-column>
      <el-table-column
        v-else-if="item.field == 'usertag'"
        :key="item.title || item.type"
        :fixed="item.fixed"
        :prop="item.field"
        :label="item.title"
        :width="item.width"
        :sortable="item.sort"
        show-overflow-tooltip
      >
        <template v-slotslot="scope">
          <span
            v-if="scope.row.usertag && scope.row.usertag.length"
            class="risktag usertag"
          >
            {{ scope.row.usertag[0] }}
            <em v-if="scope.row.usertag.length > 1">{{
              scope.row.usertag.length
            }}</em>
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column
        v-else-if="['attackfrom', 'attacktype'].includes(item.field)"
        :key="item.title || item.type"
        :fixed="item.fixed"
        :prop="item.field"
        :label="item.title"
        :width="item.width"
        :sortable="item.sort"
        show-overflow-tooltip
      >
        <template v-slotslot="scope">
          <template v-for="(item, index) in scope.row.attackfrom || []">
            <i class="tag_split" v-if="index" :key="index">|</i>
            <span class="risktag usertag" :key="item">
              {{ item }}
            </span>
          </template>
        </template>
      </el-table-column> -->
      <!-- <el-table-column
        v-else-if="['risklevel', 'alarmlevel'].includes(item.field)"
        :key="item.title || item.type"
        :fixed="item.fixed"
        :prop="item.field"
        :label="item.title"
        :width="item.width"
        :sortable="item.sort"
        show-overflow-tooltip
      >
        <template v-slotslot="scope">
          <svg-icon
            :title="scope.row[item.field]"
            :href="`icon-${
              { 高: 'high', 危: 'middle', 疑: 'low' }[scope.row[item.field]]
            }-risk`"
          >
          </svg-icon>
        </template>
      </el-table-column> -->
      <!-- <el-table-column
        v-else
        :key="item.title || item.type"
        :fixed="item.fixed"
        :prop="item.field"
        :label="item.title"
        :width="item.width"
        :sortable="item.sort"
        show-overflow-tooltip
      >
      </el-table-column> -->
    </template>
  </el-table>
</template>

<script>
export default {
  name: "formatTable",
  props: {
    cloumns: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.el-table {
  :deep(.el-checkbox) {
    top: -1px;
  }

  :deep(td) {
    padding: 0;
  }

  :deep(th) {
    color: #262626;
    padding: 4px 0;
  }

  /* 表格间距适中 */
  :deep(td) {
    height: 35px;
  }

  /* 表格间距宽松 */
  &.el-table--medium :deep(td) {
    height: 38px;
  }

  /* 表格间距紧凑 */
  &.el-table--small :deep(td) {
    height: 32px;
  }

  :deep(.cell) {
    line-height: 26px;

    .el-button {
      height: 28px;
    }
  }
}
</style>

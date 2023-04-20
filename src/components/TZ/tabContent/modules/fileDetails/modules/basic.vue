<template>
  <el-collapse-item title="基本信息" name="basic">
    <ul class="dataDetails-label element-title__content">
      <li>
        <span class="element-content__left">{{ fileType }}名称</span>
        <span class="element-content__right">{{ data.filename }}</span>
      </li>
      <el-collapse icon-placement="left" class="element-md5__content">
        <el-collapse-item name="1">
          <template v-slot:title>
            <ul class="dataDetails-label element-title__md5">
              <li>
                <span class="element-content__left">MD5</span>
                <span class="element-content__right">{{ data.md5 }}</span>
              </li>
            </ul>
          </template>
          <ul class="dataDetails-label">
            <li>
              <span class="element-content__left">SHA256</span>
              <span class="element-content__right">{{ data.sha256 }}</span>
            </li>
            <li>
              <span class="element-content__left">{{ fileType }}类型</span>
              <span class="element-content__right ellipsis">{{
                data.filetype
              }}</span>
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
      <li>
        <span class="element-content__left">{{ fileType }}大小</span>
        <span class="element-content__right ellipsis">{{ data.filesize }}</span>
      </li>
    </ul>
  </el-collapse-item>
</template>

<script>
export default {
  name: "basicIndex",
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    fileType: {
      type: String,
      default: "附件",
    },
  },
};
</script>

<style lang="scss" scoped>
.dataDetails-label {
  margin-top: 0;
  li {
    .element-content__left {
      padding-left: 14px;
    }
    .element-content__right {
      width: 75%;
    }
  }
}
:deep(.element-title__content) {
  margin-top: 1px;
  .el-collapse {
    border: none;
  }
  .element-md5__content {
    .element-title__md5 li {
      border: none;
      color: $mainColor;
    }
    .el-collapse-item__header {
      height: inherit;
      line-height: inherit;
      font-weight: normal;
      position: relative;
      border: 1px solid rgba(179, 167, 167, 0.1);
    }
    .el-collapse-item__arrow {
      position: absolute;
      top: 6px;
      left: 0;
      color: $mainColor;
    }
  }
  .el-collapse-item__wrap {
    border-bottom: none;
  }
}
</style>

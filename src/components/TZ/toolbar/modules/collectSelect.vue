<template>
  <!-- 下拉菜单：回调函数接收三个参数：按钮名称、当前菜单的配置、当前选择的列 -->
  <el-dropdown
    :key="options.field"
    :disabled="$attrs.disabled"
    @command="changeCollect"
  >
    <el-button icon="iconfont icon-more">
      {{ name }}<i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <el-dropdown-menu slotslot="dropdown">
      <template v-if="collectData && collectData.length > 0">
        <el-dropdown-item
          v-for="v in collectData"
          :key="v.name"
          :command="v"
          :class="{ active: v.isCheck }"
        >
          <span :title="v.F_SaveName" class="wd-collect_name ellipsis">{{
            v.F_SaveName
          }}</span>
          <i
            v-show="v.F_IsDefault"
            class="iconfont icon-collect"
            @click.stop="setDefault(v)"
            :title="v.F_IsDefault ? '取消默认' : '设为默认'"
            :class="{ active: v.F_IsDefault }"
          ></i>
        </el-dropdown-item>
      </template>
      <el-dropdown-item v-else>暂无数据</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import {
  findCollect,
  setDefaultCollect,
  setCancelCollect,
} from "@/api/TZ/index.js";
import setting from "@/setting.js";
import { mapGetters } from "vuex";
export default {
  name: "collectSelect",
  props: {
    options: {
      type: Object,
      default() {
        return {
          value: "",
          name: "",
          class: "",
        };
      },
    },
  },
  data() {
    return {
      collectData: [],
      checkRow: null,
    };
  },
  computed: {
    ...mapGetters(["pageinfo"]),
    name() {
      return this.checkRow?.F_SaveName ?? this.options.name;
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.loadCollect((data) => this.$emit("success", data));
    },
    /**
     *  获取最新收藏记录
     */
    loadCollect(callback) {
      let param = {
        page: 1,
        limit: 50,
        pageId: this.pageinfo.pageId,
        systemId: setting.WdSystemID,
        params: JSON.stringify({
          sortOrder: "desc",
          sortField: "F_CreatorTime",
          time: "",
          keyword: "",
        }),
      };
      findCollect(param).then((res) => {
        this.collectData = res.data;
        callback && callback(this.collectData);
      });
    },
    //
    /**
     * 切换我的收藏
     */
    changeCollect(row) {
      this.setCheckState(row);
      this.$emit("change", row);
    },
    /**
     * 设置是否选中属性
     */
    setCheckState(row) {
      let checkRow = null;
      (this.collectData || []).forEach((element) => {
        if (row && row.F_Id === element.F_Id) {
          element.isCheck = true;
          checkRow = element;
        } else element.isCheck = false;
      });

      this.checkRow = checkRow ?? null;
    },
    /**
     * 手动设置数据 默认状态
     */
    setRowDefaultState(row) {
      this.collectData.forEach((element) => {
        element.F_IsDefault = row && row.F_Id === element.F_Id ? true : false;
      });
    },
    /**
     * 设为/取消默认
     */
    setDefault(row) {
      let param = {
        fids: row.F_Id || row.fids,
        pageId: this.pageinfo.pageId,
        systemId: setting.WdSystemID,
      };
      this.loading = true;
      let fun = row.F_IsDefault ? setCancelCollect : setDefaultCollect;
      fun(param).then(() => {
        row.F_IsDefault = !row.F_IsDefault;
        // 只有一个默认
        row.F_IsDefault && this.setRowDefaultState(row);
        this.$message.success(row.F_IsDefault ? "已设置为默认" : "已取消默认");
        this.loading = false;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .wd-collect_name {
    display: inline-block;
    width: 100%;
    max-width: 170px;
  }
  i.iconfont {
    margin: 0;
    margin-left: 4px;
    &.active,
    &:hover {
      color: #f96d19;
    }
  }
  &:hover .icon-collect {
    display: inline-block !important;
  }
}
.el-dropdown {
  :deep(.el-button) {
    span {
      @include ellipsis;
    }
  }
}
</style>

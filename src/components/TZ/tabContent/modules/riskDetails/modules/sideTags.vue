<template>
  <div>
    <tags
      :data="(storeRow && storeRow[options.field]) || []"
      :options="options"
      @delete="deleteTag"
    >
      <template v-if="options.useBtn">
        <el-button
          dashed
          icon="iconfont icon-add"
          size="small"
          @click="showUserTag"
          >添加
        </el-button>
      </template>
    </tags>
    <!-- 用户标签 -->
    <usertag
      v-if="!userTagDia.isHide && options.isEnable"
      ref="addUserTag"
      :selectRows="selectRows"
      @success="tagSuccess"
    ></usertag>
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import { addUserTag } from "@/api/TZ/index.js";
export default {
  name: "sideTags",
  components: {
    // 用户标签
    usertag: () => import("@COMP/TZ/usertag"),
    // 基础标签
    tags: () => import("@COMP/TZ/tags"),
  },
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    checkRow: {
      type: Object,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      // 用户标签弹出框
      userTagDia: {
        isHide: true,
      },
    };
  },
  computed: {
    ...mapGetters(["$searchBar", "$table", "$pageLayout", "pageinfo"]),
    ...mapState({ storeRow: (state) => state.tabContent.row }),
    selectRows() {
      return this.checkRow ? [this.checkRow] : [];
    },
  },
  methods: {
    /**
     * 用户标签弹出框
     */
    showUserTag() {
      if (!this.storeRow) {
        this.$message.warning("数据未加载，请稍后再试！");
        return;
      }
      this.userTagDia.isHide = false;
    },
    /**
     * 关闭用户标签
     */
    tagSuccess() {
      this.userTagDia.isHide = true;
      // if (tags) {
      //     this.checkRow.usertag = tags.tags || tags;
      // }
    },
    /**
     * 移除标签
     */
    deleteTag(val, key) {
      let data = this.storeRow;
      this.$confirm("是否移除【" + val + "】标签?", "提示", {
        customClass: "wd_dailog",
      })
        .then(() => {
          let indexName = this.pageinfo.indexName;
          let indexReplaceName = this.pageinfo.indexName;
          if (
            indexName == "ip-*" ||
            indexName == "dns-*" ||
            indexName == "http-*"
          ) {
            indexName = data.indexname;
            indexReplaceName = indexName.replace("-", "");
          }
          // 风险分析中心特殊处理
          if (indexName == "inf-alarm-center-log") {
            indexName = data.indexname;
            indexReplaceName = data.indextype;
          }

          data.usertag.splice(key, 1);
          var param = {
            indexName: indexName,
            indexType: indexReplaceName,
            ids: [data.indexid],
            tags: data.usertag,
          };
          addUserTag(param).then((d) => {
            if (d.status === 200) {
              this.$message("用户标签移除成功。");
            } else {
              this.$message("用户标签移除失败！");
            }
          });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.threat-label li {
  display: inline-block;
  overflow: hidden;
}

.threat-label li button {
  height: 26px;
  margin-right: 12px;
  margin-top: 10px;
}
// .slot-add-button {
//     overflow: hidden;
//     display: inline-block;
//     height: 26px;
//     margin: 10px 12px 0px 0px;
//     button {
//         height: 100%;
//     }
// }
</style>

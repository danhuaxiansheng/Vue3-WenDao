// 用户标签组件
<template>
  <div class="element-usertag__wrap">
    <el-dialog
      title="添加用户标签"
      v-model:visible="visible"
      width="600px"
      :close-on-click-modal="false"
      :before-close="cancel"
    >
      <div class="element-usertag__content" v-loading="loading">
        <!-- 已选标签 -->
        <div class="element-usertag__title">已选标签</div>
        <ul class="element-usertag__list">
          <template v-for="item in pickTags" :key="item">
            <li :class="{ 'element-tag__inset': insetTags.includes(item) }">
              <span class="ellipsis" :title="item">{{ item }}</span>
              <i
                title="移除"
                class="iconfont icon-btn icon-subtract"
                @click="removeUsertag(item)"
              ></i>
            </li>
          </template>
          <li class="element-usertag-default">
            <el-button
              dashed
              icon="iconfont icon-add"
              size="small"
              @click="custom.visible = true"
              >自定义
            </el-button>
          </li>
        </ul>

        <!-- 内置标签 -->
        <div class="element-usertag__title">
          内置标签
          <el-input
            size="small"
            maxlength="20"
            placeholder="请搜索"
            v-model.trim="keywords"
            class="element-usertag__input"
          >
            <i slotslot="suffix" class="iconfont icon-search"></i>
          </el-input>
        </div>
        <ul class="element-usertag__list element-usertag__inset">
          <template v-for="item in tagList">
            <li
              v-if="
                !pickTags.includes(item.TAG_NAME) &&
                item.TAG_NAME.includes(keywords)
              "
              v-show="!item.IS_HIDDEN"
              :class="{ 'element-tag__inset': !item.TYPE }"
              @click="selectUsertag(item)"
              :key="item.ID"
            >
              <span class="ellipsis" :title="item.TAG_NAME">{{
                item.TAG_NAME
              }}</span>
              <i
                title="删除"
                v-if="item.TYPE"
                @click.stop="deleteUsertag(item)"
                class="iconfont icon-btn icon-close"
              ></i>
            </li>
          </template>
        </ul>
      </div>
      <span slotslot="footer" class="dialog-footer">
        <div class="element-usertag__cover" v-if="selectRows.length > 1">
          覆盖添加
          <el-switch v-model="isCover" active-color="#2ecc77"></el-switch>
          <span v-show="isCover">覆盖添加将清空原标签，请谨慎操作！</span>
        </div>
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button type="info" @click="cancel">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="自定义标签"
      v-model:visible="custom.visible"
      :before-close="customCancel"
      :close-on-click-modal="false"
      width="380px"
    >
      <el-form
        ref="customForm"
        :rules="custom.formRules"
        :model="custom.customTag"
        @submit.prevent
        label-width="90px"
      >
        <el-form-item label="标签内容：" prop="TAG_NAME">
          <el-input
            class="element-label__content"
            maxlength="20"
            show-word-limit
            v-model.trim="custom.customTag.TAG_NAME"
            placeholder="请输入标签内容"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="内置标签：">
          <el-checkbox-group v-model="custom.customTag.TYPE">
            <el-checkbox :true-label="1" :false-label="0"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slotslot="footer" class="dialog-footer">
        <el-button type="primary" @click="customSubmit">确定</el-button>
        <el-button type="info" @click="customCancel">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { xssExpression } from "@LIB/regex.js";
import {
  loadTagsData,
  addUserTag,
  addCustomTag,
  deleteDb,
} from "@/api/TZ/index.js";
export default {
  name: "UserTag",
  props: {
    selectRows: {
      type: Array,
      require: true,
    },
    primaryKey: {
      type: String,
      default: "indexid",
    },
    apiUrl: {
      type: Object,
      default: () => {
        return {
          single: "/api/communal/userTag", // 单条
          batch: "/api/communal/batchUserTag", // 批量
        };
      },
    },
  },
  data() {
    return {
      visible: true,
      loading: false,
      keywords: "",
      tagList: [], // 所有用户标签
      pickTags: [], // 选中的用户标签
      isCover: false, //覆盖添加
      custom: {
        visible: false,
        customTag: {
          TAG_NAME: "",
          TYPE: 0,
        },
        formRules: {
          TAG_NAME: [
            {
              required: true,
              validator: this.validateUsertag,
              trigger: "blur",
            },
            { min: 2, max: 20, message: "长度在2到20个字符", trigger: "blur" },
          ],
        },
      },
      systemType: this.$route.path.split("/")[2],
    };
  },
  computed: {
    insetTags() {
      return this.tagList
        .filter((item) => !item.TYPE)
        .map((item) => item.TAG_NAME);
    },
    pageTags() {
      let insetTags = [...this.insetTags],
        concatList = this.pickTags.concat(insetTags);
      return [...new Set(concatList)]; //数组去重
    },
  },
  created() {
    this.loadUsertag();
  },
  methods: {
    validateUsertag(rule, value, callback) {
      value = value.toString().toLocaleLowerCase();
      if (value.trim() === "") {
        callback(new Error("标签不能为空"));
      } else if (xssExpression(value)) {
        callback(new Error("标签不能含特殊符号"));
      } else {
        callback();
      }
    },
    // 通过接口请求用户标签
    loadUsertag() {
      this.loading = true;
      if (!this.tagList.length) {
        let apiParams = {
          indexName: "inf_common_tag",
          conditions: [
            { field: "IS_DELETE", op: "equal", value: 0 },
            {
              field: "PRO_NAME",
              op: "equal",
              value: `${this.systemType}|CommonTag`,
            },
          ],
        };
        //  请求用户标签
        loadTagsData({ params: JSON.stringify(apiParams) }).then((res) => {
          this.tagList = res.data;
          this.buildUsertag();
        });
      } else this.buildUsertag();
    },
    // 构建用户标签列表
    buildUsertag() {
      let length = this.selectRows.length;
      let usertag = this.selectRows[0]?.usertag ?? [];
      // 单条数据-覆盖，多条数据-追加/覆盖
      this.pickTags = length == 1 ? usertag : [];
      this.pickTags = this.pickTags.filter((tag) => {
        return this.selectRows.every((item) => {
          return item.usertag.includes(tag);
        });
      });
      // 关闭遮罩
      this.loading = false;
      // 打开弹窗
      this.visible = true;
    },
    // 选择用户标签
    selectUsertag(item) {
      this.pickTags.push(item.TAG_NAME);
    },
    // 移除选中用户标签
    removeUsertag(item) {
      this.pickTags = this.pickTags.filter((tag) => tag != item);
    },
    // 删除用户标签
    deleteUsertag(item) {
      this.$confirm("确定删除该内置标签？", "提示", {
        type: "warning",
        customClass: "wd_dailog",
      }).then(() => {
        let apiParams = {
          params: JSON.stringify({
            indexName: "inf_common_tag",
            doc: { IS_DELETE: 1 },
            conditions: [{ field: "ID", value: item.ID, op: "equal" }],
          }),
        };
        deleteDb(apiParams).then(() => {
          this.tagList = this.tagList.filter((tag) => {
            return tag.ID != item.ID;
          });
          this.$message.success("标签删除成功！");
        });
      });
    },
    // 提交
    submit() {
      let apiParams = "",
        batchUserTagUrl = "",
        indexName = this.$route.meta.indexName;

      let ids = this.selectRows.map((item) => item[this.primaryKey]);
      // 单条数据-覆盖；多条数据-追加/覆盖
      let isCover = ids.length > 1 ? this.isCover : true;
      batchUserTagUrl =
        ids.length > 1
          ? this.apiUrl.batch //批量添加
          : this.apiUrl.single; //单个添加
      apiParams = {
        indexName,
        indexType: indexName,
        isCover,
        ids: ids.join(","),
        tags: this.pickTags.join(","),
      };
      // 告警日志/威胁详情-用户标签特殊处理
      if (
        "inf-alarm-center-log|inf-alarm-center-event-log".includes(indexName)
      ) {
        batchUserTagUrl = "/api/threat/riskAnaly/bulkAddUserTagBulk";
        const requestList = this.selectRows.map((item) => {
          let list = {
            riskIndexName: item.currentIndexName,
            riskIndexType: item.currentIndexType,
            indexid: item.indexid,
          };
          item.index && (list.index = item.index);
          item.sync_id && (list.id = item.sync_id);
          return list;
        });
        apiParams = {
          requestList: JSON.stringify(requestList),
          tags: JSON.stringify(this.pickTags),
          isCover,
        };
      }
      addUserTag(apiParams, batchUserTagUrl).then((res) => {
        // 触发完成
        this.$emit("success", {
          tags: this.pickTags,
          ids,
          isCover,
        });
        this.keywords = "";
        this.pickTags = "";
        this.isCover = false;
        this.$message.success(res.msg);
      });
    },
    // 用户标签弹窗-取消
    cancel() {
      this.$emit("success", null);
    },
    customSubmit() {
      this.$refs["customForm"].validate((valid) => {
        if (valid) {
          let customType = this.custom.customTag.TYPE,
            customName = this.custom.customTag.TAG_NAME;
          if (this.pageTags.includes(customName)) {
            this.$message({
              message: "已存在标签名称！",
              type: "warning",
            });
            return;
          }
          //添加系统内置标签，调用接口更新
          if (customType == 1) {
            let tagValue = {
              IS_DELETE: 0,
              TYPE: customType,
              TAG_NAME: customName,
              PRO_NAME: this.systemType,
            };
            let apiParams = {
              params: JSON.stringify({
                indexName: "inf_common_tag",
                sources: [tagValue],
              }),
            };
            addCustomTag(apiParams).then(() => {
              this.pickTags.push(customName);
              this.tagList.push(tagValue);
              this.$message.success("内置标签新增成功！");
              this.custom.visible = false;
            });
          } else {
            this.pickTags.push(customName);
            this.custom.visible = false;
          }
          this.custom.customTag.TAG_NAME = "";
        }
      });
    },
    // 自定义标签弹窗-取消
    customCancel() {
      this.custom.visible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
 :deep(.element-usertag__content) {
  .element-usertag__title {
    color: $highColor;
    font-weight: bold;
    border-bottom: 1px solid $barBg;
    position: relative;
    &::after {
      content: "";
      display: inline-block;
      width: 64px;
      height: 1px;
      background-color: $highColor;
      position: absolute;
      left: 0;
      bottom: -1px;
    }
    .element-usertag__input {
      position: absolute;
      right: 0;
      top: -6px;
      width: 150px;
      .el-input__suffix {
        top: 2px;
      }
    }
  }
  .element-usertag__list {
    height: 88px;
    @include flexCenter($align: flex-start, $justify: left);
    flex-wrap: wrap;
    overflow-y: auto;
    > li {
      display: inline-block;
      min-width: 84px;
      max-width: 140px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      white-space: nowrap;
      padding: 0 8px;
      margin-right: 10px;
      margin-top: 12px;
      cursor: pointer;
      position: relative;
      color: $highColor;
      background-color: $dropdownMenuActive;
      span {
        display: block;
      }
      &:hover .icon-btn {
        display: inline-block;
      }
    }
    .element-usertag-default {
      order: -1;
      padding: 0;
      background-color: transparent;
    }
    .element-tag__inset {
      background-color: $warnBgColor;
      color: $warnTextColor;
    }
    .icon-btn {
      position: absolute;
      font-size: 12px;
      height: 14px;
      width: 14px;
      line-height: 14px;
      background-color: #fff;
      box-shadow: 0 0 4px rgba(119, 119, 119, 0.42);
      border-radius: 6px;
      right: -6px;
      top: -4px;
      cursor: pointer;
      display: none;
    }
  }
}
 :deep(.element-label__content) {
  .el-input__inner {
    padding-right: 52px;
  }
}
.element-usertag__cover {
  float: left;
  line-height: 32px;
  span {
    margin-left: 5px;
    color: $warnTextColor;
  }
}
</style>

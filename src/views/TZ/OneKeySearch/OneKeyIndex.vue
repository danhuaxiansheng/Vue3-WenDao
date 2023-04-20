<template>
  <div class="element-container__full" v-loading="loading">
    <!-- 主页搜索 -->
    <div
      :class="[
        'element-page__search element-card__style',
        { 'element-container__full': !isShowResult },
      ]"
    >
      <!-- Logo区域 -->
      <div class="element-searchbox__title">
        <div :class="['logo', { pointer: isShowResult }]"></div>
      </div>
      <!-- 搜索区域 -->
      <div class="element-searchbox__panel">
        <div class="element-searchbox__input searchPanel">
          <el-input
            maxlength="500"
            :placeholder="placeholder"
            size="large"
            v-model.trim.lazy="search.keyWord"
            @focus="focusSearchInput"
            @keydown.enter="pageMainSearch"
          >
            <!-- <span
              slotslot="suffix"
              :class="['pointer', { isExpression: isExpression }]"
              title="表达式查询"
              @click.stop="handleExpression"
            >
              <i class="iconfont icon-fx"></i>
            </span>
            <span
              slotslot="suffix"
              :class="['pointer', { isExpression: isSearchSetting }]"
              title="搜索设置"
              @click.stop="handleSearchSetting"
            >
              <i class="iconfont icon-manage"></i>
            </span> -->
          </el-input>
          <el-button size="large" type="primary" @click="pageMainSearch"
            >检索</el-button
          >
          <div class="element-search__history" v-show="isHistory">
            <p class="history__title">历史记录</p>
            <ul class="history__content">
              <el-empty v-if="!historyResult.length"></el-empty>
              <li
                v-else
                v-for="(list, index) in historyResult"
                :key="list.F_Id"
                @click="historySearch(list)"
              >
                <p class="ellipsis">{{ list.F_KeyWord }}</p>
                <i
                  class="el-icon-delete"
                  @click.stop="deleteHistoryItem(list, index)"
                  title="删除"
                ></i>
              </li>
            </ul>
            <div class="history__button">
              <el-button primary size="mini" type="text" @click="moreHistory"
                >更多历史</el-button
              >
            </div>
          </div>
        </div>
      </div>
      <!-- 搜索条件设置区域 -->
      <search-setting
        ref="searchSetting"
        :modules="moduleList"
        :isSearchSetting="isSearchSetting"
      ></search-setting>
      <!-- 全库数据 -->
      <database-echart
        v-show="!isShowResult"
        :echartData="echartData"
      ></database-echart>
    </div>
    <!-- 结果展示 -->
    <div class="element-page__result element-card__style" v-show="isShowResult">
      <search-result
        :search-result="searchResult"
        :keyword="search.keyWord"
        :isRefreshModel="isRefreshModel"
        :complexConditions="complexConditions"
      ></search-result>
    </div>

    <!-- 历史记录 -->
    <el-drawer
      v-model:visible="drawer.visible"
      direction="rtl"
      :with-header="false"
      :size="'500px'"
    >
      <el-tabs v-model="drawer.activeName" class="element-history__content">
        <el-tab-pane label="历史记录" name="history">
          <history-list ref="history" @search="historySearch"></history-list>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script>
import systemSetting from "@/setting.js";
import { isNullOrEmpty } from "@LIB/base.js";
import {
  getModules,
  // getEchartData,
  mainSearch,
} from "@API/TZ/OneKeySearch/index.js";
import { addHistory, findHistory, deleteHistory } from "@/api/TZ/index";
import { mapState } from "vuex";
export default {
  name: "OneKeyIndex",
  data() {
    return {
      loading: true,
      // 展示查询结果
      isShowResult: false,
      // 刷新模块统计
      isRefreshModel: true,
      // 是否是表达式查询
      isExpression: false,
      // 查询设置显示
      isSearchSetting: false,
      // 模块列表
      moduleList: [],
      indexName: [],
      // 查询类容
      search: {
        keyWord: "",
      },
      echartData: [],
      // 查询结果
      searchResult: {
        data: [],
      },
      // 查询是否有数据
      hasSearchData: false,
      isHistory: false,
      historyResult: [],
      drawer: {
        visible: false,
        activeName: "history",
      },
      // 高级查询-条件
      complexConditions: [],
    };
  },
  computed: {
    ...mapState({
      curPageId: (state) => state.user.pageinfo?.pageId,
      timeRange: (state) => state.onekeySearch.timeRange,
      curIndexName: (state) => state.onekeySearch.curIndexName,
      timeSort: (state) => state.onekeySearch.timeSort,
      curPageSize: (state) => state.onekeySearch.curPageSize,
      curPageNum: (state) => state.onekeySearch.curPageNum,
      curComplexConditions: (state) => state.onekeySearch.curComplexConditions,
    }),
    placeholder() {
      return this.isExpression
        ? "请输入表达式"
        : `共计${this.indexName.length}个模块`;
    },
  },
  watch: {
    curIndexName: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          //不刷新模块
          this.isRefreshModel = false;
          this.handleSearchKey(true);
        }
      },
      immediate: false,
    },
    timeSort: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.handleSearchKey();
        }
      },
    },
    curPageSize: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.handleSearchKey();
        }
      },
      immediate: false,
    },
    curPageNum: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.handleSearchKey();
        }
      },
      immediate: false,
    },
    curComplexConditions: {
      handler() {
        const complex = this.curComplexConditions;
        this.complexConditions = complex ? JSON.parse(complex) : [];
        this.handleSearchKey();
      },
      immediate: false,
    },
  },
  created() {
    this.getModuleList();
  },
  methods: {
    // 请求：所有模块配置信息
    async getModuleList() {
      // 获取跳转设置的参数
      const jumpSessions = sessionStorage.getItem("oneKeySession") || "";
      const sessionValue = decodeURIComponent(jumpSessions); //对冒号 解码

      const result = await getModules();
      if (result.status == 200) {
        let pageIndex = [];
        result.data.forEach((module) => {
          let nodeDir = module.NODE_DIR;
          if (nodeDir && nodeDir.length) {
            nodeDir.forEach((page) => {
              pageIndex.push(page.INDEX_NAME);
            });
          }
        });
        this.moduleList = result.data;
        this.indexName = pageIndex;
        if (isNullOrEmpty(sessionValue)) {
          this.getDatebaseData(); // 请求：全库数据
        } else {
          // 查询数据
          const jumpSetting = {
            indexName: this.indexName,
          };
          this.search.keyWord = sessionValue;
          this.onSearch(jumpSetting);
          // 插入历史记录
          this.insertHistoryItem(jumpSetting);
          // 展示查询结果
          this.isShowResult = true;
          // 清除session
          sessionStorage.clear();
        }
      }
    },

    // 切换为表达式模式
    handleExpression() {
      this.search.keyWord = "";
      this.isExpression = !this.isExpression;
      this.blurSearchInput();
    },
    handleSearchSetting() {
      this.isSearchSetting = !this.isSearchSetting;
      this.blurSearchInput();
    },
    // 关联历史记录
    focusSearchInput() {
      const params = {
        sortOrder: "desc",
        sortField: "F_CreatorTime",
        time: "",
        keyword: "",
      };
      let apiParams = {
        page: this.curPageNum || 1,
        limit: this.curPageSize || 50,
        pageId: this.curPageId,
        systemId: systemSetting.WdSystemID,
        params: JSON.stringify(params),
      };
      findHistory(apiParams)
        .then((res) => {
          if (res.status == 200) {
            let result = res.data.length
              ? res.data.filter((item) => {
                  return item.F_KeyWord;
                })
              : [];
            // 表达式查询条件不支持查询
            this.historyResult = result;
            this.isHistory = true;
          }
        })
        .catch(() => {});
    },
    // 关闭历史记录
    blurSearchInput() {
      this.isHistory = false;
    },
    // 删除历史记录
    deleteHistoryItem(list, index) {
      let apiParams = {
        fids: JSON.stringify([list.F_Id]),
        systemId: systemSetting.WdSystemID,
      };
      deleteHistory(apiParams).then(() => {
        this.historyResult.splice(index, 1);
      });
    },
    // 插入历史记录(非表达式模式)
    insertHistoryItem(setting) {
      if (!this.isExpression) {
        // 获取搜索配置
        let apiParams = {
          pageId: "OneKeyIndex",
          F_ShowData: this.search.keyWord,
          F_QueryData: JSON.stringify({
            time: setting.dateValue ? setting.dateValue.join(" - ") : "",
            modulesValue: setting.indexName.join(","),
          }),
          keyWord: this.search.keyWord,
          systemId: systemSetting.WdSystemID,
        };
        // 插入历史记录
        addHistory(apiParams);
      }
    },
    // 历史记录点击
    historySearch(history) {
      const queryData = JSON.parse(history.F_QueryData);
      // 设置选中模块
      const queryModules = queryData.modulesValue.split(",");
      this.$refs["searchSetting"].setModulesChecked(queryModules);
      // 设置查询时间
      const queryTime = queryData.time ? queryData.time.split(" - ") : "";
      this.$refs["searchSetting"].setTimeRangeChecked(queryTime);
      // 设置查询关键字
      this.search.keyWord = history.F_KeyWord;
      // 刷新模块
      this.isRefreshModel = true;
      // 查询
      this.handleSearchKey();
    },
    moreHistory() {
      this.drawer.visible = true;
      // 重新展开后 刷新历史记录数据
      this.$refs[this.drawer.activeName]?.loadData();
      this.blurSearchInput();
    },
    pageMainSearch() {
      // 刷新模块
      this.isRefreshModel = true;
      this.handleSearchKey(true);
    },
    // 页面查询条件构建及查询接口调用
    handleSearchKey(isInsertHitory) {
      if (!this.search.keyWord) {
        return this.$message({ message: "请输入检索关键字", type: "warning" });
      }
      // 判断是否为：表达式模式
      if (this.isExpression && !this.confirmExpression()) {
        return this.$message({
          message: "表达式必须是JSON格式",
          type: "warning",
        });
      }
      // 获取搜索配置
      let searchSetting = this.$refs["searchSetting"].getSearchSetting();
      // 模块切换
      if (this.curIndexName && !this.isRefreshModel) {
        searchSetting.indexName = [this.curIndexName];
      }
      if (!searchSetting.indexName.length) {
        this.$message({ message: "请至少选择一个模块", type: "warning" });
        return;
      }
      this.onSearch(searchSetting);
      this.blurSearchInput();
      this.isShowResult = true;
      //插入历史记录
      if (isInsertHitory) this.insertHistoryItem(searchSetting);
    },
    // 查询事件
    onSearch(setting) {
      this.loading = true;
      let keyWord = this.search.keyWord;
      let params = {
        sortDesc: true,
        keywords: "",
        expression: "",
        indexName: setting.indexName.join(","),
        // order:order
        sort: [{ field: "@createtime", order: this.timeSort }],
        conditions: [
          { field: "isdelete", op: "equal", value: "0", connector: "and" },
        ],
        filterFields: [
          "responddata",
          "responsedata",
          "emlcontent",
          "h-req-params",
          "publickeydocumentid",
          "h-res-data",
        ],
      };
      // 构建查询参数
      this.isExpression
        ? (params.expression = keyWord)
        : (params.keywords = keyWord);
      // 是否设置：查询时间
      if (setting.dateValue) {
        params.conditions.push({
          field: "@createtime",
          op: "range",
          value: setting.dateValue.join(" - "),
          connector: "and",
        });
      }
      // 是否设置：高级过滤查询条件
      if (this.curComplexConditions) {
        const complexConds = JSON.parse(this.curComplexConditions);
        complexConds.length &&
          complexConds.forEach((condition) => {
            params.conditions.push({
              field: condition.field,
              op: condition.op,
              value: condition.value,
              connector: condition.connector,
            });
          });
      }

      let apiParams = {
        params: JSON.stringify(params),
        page: this.curPageNum || 1,
        limit: this.curPageSize || 50,
      };
      // Vuex状态缓存
      this.$store.commit("onekeySearch/setKeyword", keyWord);
      this.$store.commit("onekeySearch/setExpression", this.isExpression);
      // 接口查询
      mainSearch(apiParams)
        .then((res) => {
          if (res.status == 200) {
            this.searchResult = res;
            this.hasSearchData = res.data.length ? false : true;
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 验证表达式格式是否输入正确
    confirmExpression() {
      try {
        if (this.isExpression) {
          var obj = JSON.parse(this.search.keyWord);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        }
      } catch (e) {
        return false;
      }
    },
  },
  components: {
    DatabaseEchart: () => import("./modules/DatabaseEchart/index.vue"),
    SearchSetting: () => import("./modules/SearchSetting/index.vue"),
    SearchResult: () => import("./modules/SearchResult/index.vue"),
    historyList: () =>
      import("@COMP/TZ/collectAndHistory/modules/historyList.vue"),
  },
};
</script>

<style lang="scss" scoped>
@import "~@AST/flags/flag-icon.css";
@import "@STYLES/TZ/Content/OneKeySearch/index.scss";
</style>

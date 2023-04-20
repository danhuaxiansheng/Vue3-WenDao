<template>
  <div class="search-bar">
    <div class="search-head">
      <template v-if="timeConfig.isEnable">
        <el-date-picker
          v-model="timeValue"
          :title="timeConfig.title"
          :picker-options="pickerOptions"
          :clearable="timeConfig.clearable"
          :class="
            (timeConfig.clearable ? '' : 'unclearable') +
            (timeConfig.global && currGlobalTime ? ' time_pick-red' : '')
          "
          :append-to-body="false"
          :editable="false"
          :default-time="['00:00:00', '23:59:59']"
          class="time_pick"
          type="datetimerange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
          value-format="yyyy-MM-dd HH:mm:ss"
          @change="timeChange"
          @blur="timeBlur"
          @focus="timeGlobal.isShow = true"
        >
        </el-date-picker>

        <!-- 全局应用 按钮 -->
        <template v-if="timeConfig.global && timeGlobal.isShow">
          <el-button
            type="text"
            class="time-global"
            :disabled="timeGlobalDisabled"
            primary
            >全局应用</el-button
          >
        </template>
      </template>

      <div class="conditions-panle">
        <!-- 普通查询栏 -->
        <div class="simple-panle" v-show="!isExpression">
          <conditionSimple
            ref="conditionSimple"
            @add="addCondition"
            :options="conditionOptions"
          />
          <el-popover
            placement="bottom"
            width="908"
            trigger="click"
            :close-delay="0"
            v-model="isComplex"
            @hide="closeComplex"
          >
            <div class="search-complex" v-if="isComplex">
              <conditionComplex
                ref="conditionComplex"
                v-model:conditions="conditions"
                :options="conditionOptions"
              />
            </div>
            <template v-slot:reference>
              <el-button
                class="batch-add-btn"
                title="批量添加"
                icon="iconfont icon-batch-add"
              >
              </el-button>
            </template>
          </el-popover>
        </div>

        <!-- 表达式相关 -->
        <template v-if="useExpression">
          <div class="expression-panle" v-show="isExpression">
            <el-popover
              placement="bottom-start"
              width="470"
              trigger="click"
              :open-delay="0"
              :close-delay="0"
            >
              <div class="expression-popover">
                <el-input
                  type="textarea"
                  maxlength="500"
                  :class="!isErrorExpression ? 'error-expression' : ''"
                  :rows="7"
                  show-word-limit
                  placeholder='请输入表达式，如：{
                                        "query":{
                                            "query_string":{
                                                "query":"risklevel:11"
                                            }
                                        }
                                    }'
                  v-model.trim="expression"
                >
                </el-input>
              </div>
              <template v-slot:reference>
                <el-input
                  class="expression-input"
                  min-heigth="187"
                  :class="!isErrorExpression ? 'error-expression' : ''"
                  v-model.trim="expression"
                  maxlength="500"
                  placeholder="请输入表达式"
                >
                </el-input>
              </template>
            </el-popover>
          </div>
          <el-button
            class="batch-add-btn"
            title="表达式"
            @click="isExpression = !isExpression"
            :class="isExpression ? 'express-blue' : ''"
            icon="iconfont icon-fx"
          ></el-button>
        </template>

        <!-- 功能按钮区 -->
        <el-button type="primary" class="search-btn" @click="search"
          >查询</el-button
        >
        <el-button type="info" class="reset-btn" @click="reset">重置</el-button>
        <slot name="tools"></slot>
      </div>
    </div>
    <div class="search-body">
      <simpleBlock
        v-show="!isExpression && conditions && conditions.length > 0"
        :options="conditionOptions"
        v-model:conditions="conditions"
      />
    </div>
  </div>
</template>
<script>
import { getTimeByFlag } from "@TOOLS/dateTools.js";
import { jsonExpression } from "@LIB/regex.js";
import { getDynamicFields } from "@PAGE/platform.js";
import { mapState } from "vuex";

import { getSearchBarOpt, getUserTagList } from "@API/TZ/index.js";
import searachBarTools from "@COMP/TZ/condition/utils/searachBarTools.js";
export default {
  name: "searchBar",
  props: {
    options: {
      type: Object,
      default() {
        return {
          // 主查询时间
          time: {
            field: "time",
            title: "捕获时间",
            defualtOptions: "最近30天",
            isEnable: true, // 是否启用
            clearable: true, // 是否可以清空
            global: true, // 应用全局-功能按钮
            dateLimit: 0, // 日期选取-天数限制
          },
          // 右侧工具（历史记录，我的收藏）
          tools: {
            // 收藏功能
            collect: { isEnable: true },
            // 历史记录
            history: { isEnable: true },
          },
          // 查询栏配置
          condition: {
            // 查询栏 不展示的字段
            filterField: [],
            // 普通查询区是否使用自定义字段   -- 高级条件区 默认不适用自定义字段
            custom: true,
            // 是否使用表达式
            useExpression: true,
            // 获取当前页面用户标签
            usertagUrl: "/api/common/qryUserTagSelectLabel",
            // 字段列配置
            columns: [],
          },
        };
      },
    },
  },
  components: {
    simpleBlock: () => import("@COMP/TZ/conditionBlock/simpleBlock.vue"),
    conditionSimple: () =>
      import("@COMP/TZ/searchbar/modules/conditionSimple.vue"),
    conditionComplex: () =>
      import("@COMP/TZ/searchbar/modules/conditionComplex.vue"),
  },
  data() {
    return {
      // 时间栏选择的最小时间
      pickMinDate: null,
      // 时间栏选择的最大时间
      pickMaxDate: null,
      // 时间快捷栏设置
      pickerOptions: {
        shortcuts: [
          {
            text: "最近30分钟",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近1小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "当天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近24小时",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
          {
            text: "最近7天",
            onClick(picker) {
              picker.$emit("pick", getTimeByFlag(this.text));
            },
          },
        ],
        onPick: ({ maxDate, minDate }) => {
          this.pickMinDate = minDate;
          this.pickMaxDate = maxDate;
        },
        disabledDate: (time) => {
          // 判断是否存在日期限制
          if (!this.timeConfig.dateLimit) {
            return false;
          } else {
            // 未选择结束时间 计算时间范围
            if (this.pickMinDate && !this.pickMaxDate) {
              const one =
                parseInt(this.timeConfig.dateLimit) * 24 * 3600 * 1000;
              const minTime = this.pickMinDate.getTime() - one;
              const maxTime = this.pickMinDate.getTime() + one;
              return time.getTime() < minTime || time.getTime() > maxTime;
            } else {
              return false;
            }
          }
        },
      },
      // 时间内容
      timeValue: [],
      // 当前时间是否为全局时间 如果是则需要加红
      currGlobalTime: false,
      // 时间全局设置
      timeGlobal: {
        isShow: false,
      },
      // 表达式模式
      isExpression: false,
      // 表达式
      expression: "",
      // 所有条件
      conditions: [],
      // 高级模式 true:开启 false:关闭
      isComplex: false,
    };
  },
  computed: {
    ...mapState({
      pageId: (state) => state.user.pageinfo.pageId || "",
      indexName: (state) => state.user.pageinfo.indexName || "",
      searchBarColumns: (state) => state.searchBar.searchBarColumns,
    }),
    // 条件项
    moduleOptions() {
      return this.options?.condition ?? {};
    },
    // 查询栏 字段列--默认从接口请求 可以自定义配置
    columns() {
      return (this.moduleOptions?.columns ?? this.searchBarColumns) || [];
    },
    // 是否使用表达式
    useExpression() {
      return this.options?.condition?.useExpression === false ? false : true;
    },
    // 表达式验证结果
    isErrorExpression() {
      return this.expression ? jsonExpression(this.expression) : true;
    },
    // 查询栏配置
    conditionOptions() {
      const custom = this.moduleOptions?.custom ?? true;
      return {
        custom, // 是否使用自定义字段
        columns: this.filterColumns(this.columns),
        max: 16,
        min: 3,
      };
    },
    // 右侧工具（历史记录，我的收藏）
    tools() {
      return {
        collect: { isEnable: true },
        history: { isEnable: true },
        ...this.options.tools,
      };
    },
    // 时间配置项
    timeConfig() {
      let timeConfig = {
        field: "time",
        title: "捕获时间",
        defualtOptions: "最近30天",
        isEnable: true, // 是否启用
        clearable: true, // 是否可以清空
        global: true, // 应用全局-功能按钮
        dateLimit: 0, // 日期选取-天数限制
      };
      return { ...timeConfig, ...this.options.time };
    },
    // 全局应用 -是否禁用
    timeGlobalDisabled() {
      if (this.pickMinDate && this.pickMaxDate) {
        return false;
      }
      if (!this.pickMinDate && !this.pickMaxDate) {
        return false;
      }
      if (!this.pickMinDate || !this.pickMaxDate) {
        return true;
      }
      return true;
    },
  },
  created() {
    //设置列缓存
    this.setColumns();
    this.$store.commit("plug/setSearchBar", this);
    // 初始化时间
    this.initTimeValue();
  },
  mounted() {
    this.updateCondition();
    this.$emit("onload");
  },
  methods: {
    /**
     * 设置列缓存
     */
    setColumns() {
      let sessionKey = "searchBarColumns@" + this.pageId;
      let columnsData = JSON.parse(localStorage.getItem(sessionKey)) || [];
      if (columnsData && columnsData.length > 0) {
        // 先对usertag进行特殊处理
        this.setUserTag(columnsData).then((d) => this.setSearchColumns(d));
      } else {
        // 构建页面列信息
        let pageColumns = [];
        // 获取动态分析字段
        const dynamicFields = getDynamicFields();
        // 查询栏字段返回 字段类型、下拉列表、匹配方式等
        getSearchBarOpt({ pageId: this.pageId }).then((res) => {
          if (res.data && res.data.length) {
            pageColumns = dynamicFields.length
              ? // 非专业版-过滤掉动态分析相关字段
                res.data.filter(
                  (column) => !dynamicFields.includes(column.field)
                )
              : res.data;

            // 如果存在用户标签字段，则需要动态获取用户标签的下拉列表,并设置到缓存中
            this.setUserTag(pageColumns).then((d) => this.setSearchColumns(d));
          }
        });
      }
    },
    /**
     * 设置用户标签信息
     */
    setUserTag(pageColumns) {
      return new Promise((resolve) => {
        !pageColumns.some((d) => d.field === "usertag")
          ? resolve(pageColumns)
          : this.getUserTagsList().then((tagList) => {
              tagList.length > 0 &&
                pageColumns.forEach((d) => {
                  if (d.field === "usertag") {
                    d.dropDownList = tagList;
                    return false;
                  }
                });
              resolve(pageColumns);
            });
      });
    },
    /**
     * 初始化主时间
     */
    initTimeValue() {
      if (this.timeConfig.isEnable) {
        // 全局时间设置
        const globalTime = localStorage.getItem("globalTime");
        // 优先应用全局时间
        this.timeValue =
          this.timeConfig.global !== false && globalTime
            ? globalTime.split(" - ")
            : getTimeByFlag(this.timeConfig.defualtOptions);
      }
    },

    /**
     * 存储查询栏的字段列表
     */
    setSearchColumns(pageColumns) {
      let sessionKey = "searchBarColumns@" + this.pageId;
      localStorage.setItem(sessionKey, JSON.stringify(pageColumns));
      this.$store.commit("searchBar/setSearchBarColumns", pageColumns);
    },

    /**
     * 查询的点击事件
     */
    search() {
      // 如果是表达式模式
      if (this.isExpression) {
        // 表达式格式验证是否通过
        if (!this.isErrorExpression) {
          return this.$message.error("表达式必须是JSON字符串!");
        }
      } else {
        // 高级模式下 点击查询 先执行高级模式的事件
        if (this.isComplex) {
          this.closeComplex();
        }
        // 自动添加输入框内容  --不提示错误
        if (this.$refs.conditionSimple) {
          const addResult = this.$refs.conditionSimple.addCondition(true);
          // 添加条件时 有错误信息
          if (!addResult) {
            return false;
          }
        }
        if (this.vaildConditions()) {
          return this.$message.error("条件错误，无法查询！");
        }
        if (this.conditions.length > 16) {
          return this.$message.warning("最多支持16个过滤条件查询！");
        }
      }
      // 同步修改条件
      this.updateCondition();
      // 触发查询事件
      this.$emit("search");
    },
    /**
     * 重置的点击事件
     */
    reset() {
      // 初始化时间
      this.initTimeValue();
      // 清空普通条件
      this.conditions = [];
      // 清空表达式
      this.expression = null;
      // 同步修改条件
      this.updateCondition();
      this.$emit("reset");
    },
    /**
     * 验证条件中 是否存在错误
     */
    vaildConditions() {
      return this.conditions.some(
        (d) => d.bracketsError || (d.errorMsg && d.errorMsg.length > 0)
      );
    },
    /**
     * 重新加载条件
     */
    loadCondition(params) {
      let conditions = params.conditions;
      // 如果有表达式
      if (params.expression) {
        this.isExpression = true;
        this.expression = params.expression;
      } else {
        this.isExpression = false;
        this.expression = null;
      }

      let list = [];

      // 加载条件时 优先清空时间
      this.timeConfig.isEnable && (this.timeValue = []);

      // 过滤主时间 并赋值
      conditions.forEach((n) => {
        if (this.timeConfig.isEnable && n.field === this.timeConfig.field) {
          this.timeValue = n.value ? n.value?.split(" - ") : [];
        } else {
          list = list.concat(this.spliceCondition(n));
        }
      });
      this.conditions = list;
      // 同步修改条件
      this.updateCondition();
    },
    /**
     * 拼接单个条件
     */
    spliceCondition(item) {
      let list = [];
      if (item.conds && item.conds.length > 0) {
        if (item.conds.length === 1) {
          list.push(this.getValueFormat(item.conds[0]));
        } else {
          item.conds.forEach((d, i) => {
            let cond = this.getValueFormat(d);
            if (i === 0) {
              cond.hasLeft = true;
            }
            if (i === item.conds.length - 1) {
              cond.hasRight = true;
            }
            list.push(cond);
          });
        }
      } else {
        list.push(this.getValueFormat(item));
      }
      return list;
    },
    /**
     * 构建参数
     */
    buildParams() {
      let params = {
        expression: null,
        conditions: [],
      };
      let conditions = [];
      if (
        this.timeConfig.isEnable &&
        this.timeValue &&
        this.timeValue.length > 0
      ) {
        let timeObj = {
          op: "range",
          connector: "and",
          field: this.timeConfig.field,
          value: this.timeValue.join(" - "),
        };
        conditions.unshift(timeObj);
        this.currGlobalTime =
          timeObj.value === localStorage.getItem("globalTime");
      }

      // 如果是表达式模式
      if (this.isExpression) {
        params.expression = this.expression
          ? JSON.stringify(JSON.parse(this.expression))
          : null;
      } else {
        const addConditions = this.getConditions();
        // 如果只有一个条件，条件连接符为或者时 手动更改为并且
        if (
          addConditions.length === 1 &&
          // addConditions[0].hasOwnProperty("connector") &&
          addConditions[0].connector === "or"
        ) {
          addConditions[0].connector = "and";
        }
        // 普通条件
        addConditions.length > 0 &&
          (conditions = conditions.concat(addConditions));
        // addConditions.length > 0 && (conditions.push({ conds: addConditions }));
      }
      params.conditions = conditions;
      return JSON.parse(JSON.stringify(params));
    },
    getConditions() {
      let list = [];
      let cList = []; // 括号数组
      this.conditions.forEach((d) => {
        let mv = this.getValueFormat(d, true);
        // 特殊情况  自身带有左右括号
        if (d.hasLeft && d.hasRight) {
          list.push(mv);
          return;
        }
        if (d.hasLeft) {
          cList = [mv];
        } else if (d.hasRight) {
          cList.push(mv);
          list.push(JSON.parse(JSON.stringify({ conds: cList })));
          cList = [];
        } else {
          // 如果在括号内
          if (cList.length > 0) {
            cList.push(mv);
          } else list.push(mv);
        }
      });
      return list.length > 0 ? list : [];
    },
    /**
     * 获取过滤列表
     */
    getFilterList() {
      // 需要过滤的字段
      let filterList = JSON.parse(
        JSON.stringify(this.options.filterField || [])
      );

      // 普通查询区是否使用自定义字段   -- 高级条件区 默认不适用自定义字段
      let custom = this.options.custom ?? true;

      // 过滤自定义字段   默认由接口返回,如果接口没有返回 则自动附加一个与接口返回值相同的列
      !custom && filterList.push("otherField");

      // 默认过滤主时间
      this.timeConfig.isEnable &&
        !filterList.includes(this.timeConfig.field) &&
        filterList.push(this.timeConfig.field);

      return filterList;
    },
    /**
     * 设置列格式
     */
    filterColumns(columns) {
      let list = [];
      const filterList = this.getFilterList();
      columns.forEach((d) => {
        // 如果接口返回的列 配置了不允许查询
        if (!d.isCondition) {
          return;
        }
        if (filterList.includes(d.field)) {
          return;
        }
        list.push(searachBarTools.getColumnFormat(d));
      });
      return list;
    },
    /**
     * 格式化条件   对value进行转换
     */
    getValueFormat(obj, valueIsString = true) {
      let value = valueIsString
        ? "object" === typeof obj.value
          ? obj.value.join(" - ")
          : obj.value
        : "string" === typeof obj.value && obj.value.includes(" - ")
        ? obj.value.split(" - ")
        : obj.value;

      return {
        connector: obj.connector,
        field: obj.field,
        op: obj.op,
        value: value,
      };
    },
    /**
     * 条件变更后出发修改事件
     */
    updateCondition() {
      this.$emit("update:params", this.buildParams());
    },
    /**
     * 新增条件
     */
    addCondition(data) {
      // 下拉框选择全部时 不加入条件
      if (data.value === "-999") {
        return;
      }
      const isRepeat = searachBarTools.findRepeat(this.conditions, data);
      // 如果数据重复 则不允许添加
      if (isRepeat) {
        this.$message.error("条件已存在！");
      } else {
        if (this.getConditionsLength() >= this.conditionOptions.max) {
          this.$message.warning("最多支持" + this.conditionOptions.max + "条");
        } else {
          this.conditions.push(data);
        }
      }
      // 解决先开启自动刷新再添加条件且不点查询按钮，倒计时结束查询时不带添加的条件的bug
      this.updateCondition();
    },
    /**
     * 获取条件长度
     */
    getConditionsLength() {
      let length = 0;
      this.conditions.forEach((d) => {
        length++;
        if (d.conds && d.conds.length > 0) {
          d.conds.forEach(() => length++);
        }
      });
      return length;
    },
    /**
     * 关闭高级查询
     */
    closeComplex() {
      // 关闭会有延迟 可能先执行了其他事件
      const cacheCondition = this.$refs["conditionComplex"].cacheConditions;
      let list = [];
      cacheCondition.forEach((d) => {
        let isEmpty = searachBarTools.valueIsEmpty(d.value);
        if (!isEmpty) {
          list.push(d);
        }
      });

      if (JSON.stringify(this.conditions) === JSON.stringify(list)) {
        return;
      }

      this.conditions = JSON.parse(JSON.stringify(list));
    },
    /**
     * 时间输入框失去焦点
     */
    timeBlur() {
      // 直接绑定click无效，判断当前点击的按钮名称执行当前事件
      if (window.event.target.innerText === "全局应用") {
        this.setTimeGlobal();
      }
      this.pickMinDate = null;
      this.pickMaxDate = null;
      this.timeGlobal.isShow = false;
    },
    /**
     * 修改时间时
     */
    timeChange() {
      // 重置 全局时间状态
      this.pickMinDate = null;
      this.pickMaxDate = null;
      this.search();
    },
    /**
     * 设置全局时间
     */
    setTimeGlobal() {
      let rangeTime = null;

      if (this.pickMinDate && this.pickMaxDate) {
        this.timeValue = [
          this.pickMinDate.format("yyyy-MM-dd hh:mm:ss"),
          this.pickMaxDate.format("yyyy-MM-dd hh:mm:ss"),
        ];
        // 触发时间更新
        this.timeChange();
      } else if (
        (!this.pickMinDate && this.pickMaxDate) ||
        (this.pickMinDate && !this.pickMaxDate)
      ) {
        this.$message.error(`请选择${!this.pickMinDate ? "起始" : "结束"}时间`);
        return;
      }
      const now = new Date().format("yyyy-MM-dd");
      rangeTime = this.timeValue
        ? this.timeValue.join(" - ")
        : now + " 00:00:00 - " + now + " 23:59:59";

      // 是否为全局时间 -- 标红 修改条件后会自动取消标红
      this.currGlobalTime = true;
      localStorage.setItem("globalTime", rangeTime);
      this.$message.success("全局应用设置成功！");
    },
    /***
     * 获取用户标签列表
     */
    getUserTagsList() {
      return new Promise((resolve) => {
        getUserTagList(
          {
            params: JSON.stringify({
              indexName: this.indexName,
            }),
          },
          this.moduleOptions.usertagUrl
        )
          .then((d) => {
            let { data } = d;
            let tagList = [];
            data.length &&
              data.map(function (item) {
                tagList.push({ key: item.value, value: item.name });
              });
            resolve(tagList);
          })
          .catch(() => {
            resolve(null);
          });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.search-bar {
  background: #fff;
  position: relative;
  padding: 16px;
  :deep(.el-input--suffix .el-input__inner) {
    padding-right: 25px;
  }
  :deep(.el-date-editor.time_pick) {
    width: 337px;
    margin-right: 10px;
    .el-range-input {
      width: 46%;
    }
    .el-range-separator {
      padding: 0px 0px;
    }
    .el-picker-panel [slotslot="sidebar"],
    .el-picker-panel__sidebar {
      width: 95px;
      .el-picker-panel__shortcut {
        padding-left: 12px;
      }
    }
    .el-picker-panel__body {
      margin-left: 93px;
    }
    .el-picker-panel__footer {
      margin-left: 95px;
    }
    &.unclearable .el-picker-panel__footer .el-button:nth-of-type(2) {
      display: none;
    }
  }
  :deep(.time_pick-red) > input {
    color: #ff485c;
  }
  // search-bar
  :deep(.el-search-bar) {
    &.hasTime .el-col:first-child {
      padding-left: 345px;
    }
  }

  .search-head {
    align-items: center;
    display: inline-flex;

    .conditions-panle {
      display: flex;
      align-items: center;
      .reset-btn {
        padding: 0 20px;
      }
      .search-btn {
        padding: 0 20px;
        margin-left: 10px;
      }
      .expression-input {
        width: 438px;
      }
      .simple-panle {
        display: inline-flex;
      }

      .icon-batch-add {
        margin-right: 15px;
        width: 32px;
        display: inline-block;
        text-align: center;
        background-color: #f1f3f4;
        height: 32px;
        line-height: 32px;
      }

      .batch-add-btn.express-blue {
        color: $highColor;
      }
      :deep(.collectAndHistory-tools) {
        margin-left: 10px;
        .iconfont:not(:last-child) {
          margin-right: 6px;
        }
      }
    }

    .time-global {
      position: absolute;
      top: 369px;
      z-index: 9999;
      left: 114px;
      border: none;
    }

    .time-global.is-disabled {
      border: none;
    }

    .time_pick {
      :deep(.el-date-range-picker) {
        //  解决 全局应用 按钮显示不同步的问题
        transition: none;
      }
    }
  }

  .batch-add-btn {
    padding: 0 8px;
    border: none;
    margin: 0px;
    background-color: #f1f3f4;
  }
}
</style>
<style lang="scss">
.el-popper[x-placement="bottom-start"] {
  padding: 0px;
  .expression-popover {
    padding: 0px;
  }
}
.error-expression {
  .el-textarea__inner,
  .el-input__inner {
    color: red;
  }
}
</style>

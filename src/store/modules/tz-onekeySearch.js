const state = {
    keyword: null,  //查询关键字
    isExpression: null,  //是否是表达式
    curIndexName: null,  // 当前选中indexName
    curPageUrl: null,    // 当前页面Url
    timeRange: null,    //时间范围
    timeSort: "desc",  //时间排序
    curPageSize: null,  //分页数量
    curPageNum: null,  //第几页
    curComplexConditions: null, //数据过滤查询条件
}
const mutations = {
    setCurIndexName: (state, curIndexName) => {
        state.curIndexName = curIndexName
    },
    setCurPageUrl: (state, curPageUrl) => {
        state.curPageUrl = curPageUrl;
    },
    setTimeRange: (state, timeRange) => {
        state.timeRange = timeRange;
    },
    setKeyword: (state, keyword) => {
        state.keyword = keyword;
    },
    setExpression: (state, isExpression) => {
        state.isExpression = isExpression;
    },
    setTimeSort: (state, timeSort) => {
        state.timeSort = timeSort;
    },
    setCurPageSize: (state, curPageSize) => {
        state.curPageSize = curPageSize;
    },
    setCurPageNum: (state, curPageNum) => {
        state.curPageNum = curPageNum;
    },
    setComplexConditions: (state, curComplexConditions) => {
        state.curComplexConditions = curComplexConditions;
    }
}
const actions = {
    setCurIndexName({ commit }, val) {
        commit('setCurIndexName', val)
    },
    setCurPageUrl({ commit }, val) {
        commit('setCurPageUrl', val)
    },
    setTimeRange({ commit }, val) {
        commit('setTimeRange', val)
    },
    setKeyword({ commit }, val) {
        commit('setKeyword', val)
    },
    setExpression({ commit }, val) {
        commit('setExpression', val)
    },
    setTimeSort({ commit }, val) {
        commit('setTimeSort', val)
    },
    setCurPageSize({ commit }, val) {
        commit('setCurPageSize', val)
    },
    setCurPageNum({ commit }, val) {
        commit('setCurPageNum', val)
    },
    setComplexConditions({ commit }, val) {
        commit('setComplexConditions', val)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}


// 仅用于 查询栏的列配置  
// 包含 当前字段的类型、匹配方式、下拉列表等


// pageid在界面通过权限验证后才返回，此时取不到
// import user from './user'
// let pageId = user.state?.pageinfo?.pageId ?? null;

const state = {
    // searchBarColumns: pageId ? (sessionStorage.getItem("searchBarColumns@" + pageId) ?? []) : [],
    searchBarColumns: [],
    dom: null,
}
const mutations = {
    /**
     * 设置查询栏列设置
     * @param { } param 
     * @param {*} val 
     */
    setSearchBarColumns: (state, val) => {
        state.searchBarColumns = val
    },
}

const actions = {
    /**
     * 设置查询栏列设置
     * @param { } param 
     * @param {*} val 
     */
    setSearchBarColumns({ commit }, val) {
        commit('setSearchBarColumns', val)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}


// 仅用于 表格配置  
const state = {
    options: JSON.parse(localStorage.getItem('grid_configs')) ??
    {
        border: false,
        stripe: false,
        fit: false,
        size: '',
    },
    pageSize: localStorage.getItem('grid_pageSize') ?? 50,
}

const mutations = {
    setOptions: (state, val) => {
        state.options = val
        localStorage.setItem('grid_configs', JSON.stringify(val))
    },
    setPageSize: (state, val) => {
        state.pageSize = val
        localStorage.setItem('grid_pageSize', JSON.stringify(val))
    },

}

const actions = {
    setOptions({ commit }, val) {
        commit('setOptions', val)
    },

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

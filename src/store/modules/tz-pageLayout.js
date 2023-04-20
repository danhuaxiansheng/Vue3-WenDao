const state = {
    table: null,
    searchBar: null,
    toolBar: null,
    tabContent: null,
    pageLayout: null,
}

const mutations = {
    setTable: (state, table) => {
        state.table = table
    },
    setToolBar: (state, toolBar) => {
        state.toolBar = toolBar
    },
    setSearchBar: (state, searchBar) => {
        state.searchBar = searchBar
    },
    setTabContent: (state, tabContent) => {
        state.tabContent = tabContent
    },
    setPageLayout: (state, pageLayout) => {
        state.pageLayout = pageLayout
    },
}

const actions = {
    setTable({ commit }, val) {
        commit('setTable', val)
    },
    setToolBar({ commit }, val) {
        commit('setToolBar', val)
    },
    setSearchBar({ commit }, val) {
        commit('setSearchBar', val)
    },
    setTabContent({ commit }, val) {
        commit('setTabContent', val)
    },
    setPageLayout({ commit }, val) {
        commit('setPageLayout', val)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

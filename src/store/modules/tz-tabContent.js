
const state = {
    row: null,
}

const mutations = {
    setRow: (state, row) => {
        state.row = row
    },
}

const actions = {
    setRow({ commit }, val) {
        commit('setRow', val)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

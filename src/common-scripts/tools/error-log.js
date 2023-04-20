import Vue from "vue";

const ENV = process.env.NODE_ENV == "development" ? true : false;

if (ENV) {
  Vue.config.errorHandler = function (err, vm, info) {
    // Don't ask me why I use Vue.nextTick, it just a hack.
    // detail see https://forum.vuejs.org/t/dispatch-in-vue-config-errorhandler-has-some-problem/23500
    // Vue.nextTick(() => {
    //     store.dispatch('errorLog/addErrorLog', {
    //         err,
    //         vm,
    //         info,
    //         url: window.location.href
    //     })
    // })
    console.error(err, info);
  };
}

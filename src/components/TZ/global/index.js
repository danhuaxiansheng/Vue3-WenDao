import Vue from 'vue'
const req = require.context('./', true, /\.vue$/)
req.keys().forEach(el => {
    let name = el.replace(/(\.\/)|(\.vue)/ig, '');
    let componentName = `${name.split('/')[name.split('/').length - 1]}`;
    if (componentName == 'index') componentName = `${name.split('/')[name.split('/').length - 2]}`;
    Vue.component(componentName, req(el).default)
})
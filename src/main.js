import Vue from 'vue'
import App from './App.vue'
import ElSTable from 'elstable'

Vue.config.productionTip = false
Vue.use(ElSTable)

new Vue({
  render: h => h(App),
}).$mount('#app')

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';
import VueResource from 'vue-resource';

import 'element-ui/lib/theme-default/index.css';
import 'animate.css/animate.min.css';
import 'common/stylus/all.styl';

Vue.use(VueResource);
Vue.use(ElementUI, { locale });

import App from './App';
import Router from './routes';

// 支持 cross domain request
Vue.http.options.credentials = false;
Vue.http.options.emulateJSON = true;
Vue.http.options.timeout = 2000;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: Router,
  template: '<App/>',
  components: {
    'App': App
  }
});

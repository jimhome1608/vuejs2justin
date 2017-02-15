import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './components/home/Template';
// import BuyerForm from './components/buyer_form/BuyerForm';
Vue.use(VueRouter);

var router = new VueRouter({
  routes: [{
    path: '/',
    component: Home
  }]
});

export default router;

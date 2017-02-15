<template>
  <div id="app_element_root" :office-id="officeId">
    <v-header></v-header>
    <router-view :office-id="officeId" :user-id="userId" :property-id="propertyId"></router-view>
  </div>
</template>

<script>
import Home from './components/home/Template';
// Import the main nav bar
import Header from './components/header/Header';

export default {
  name: 'app',
  data() {
    return {
      officeId: null,
      userId: null,
      propertyId: null
    };
  },
  created() {
    // 非常重要, 取得整个程序所需要的最基本的三个变量, 然后注入到各个需要的模板中
    // Important: Get three variables to inject into the application
    this.officeId = document.getElementById('app').getAttribute('data-officeId');
    this.userId = document.getElementById('app').getAttribute('data-userId');
    this.propertyId = document.getElementById('app').getAttribute('data-propertyId');
  },
  components: {
    Home,
    'v-header': Header
  }
};
</script>

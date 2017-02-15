import Ps from 'perfect-scrollbar';
import BuyersFooterButtons from 'components/buyers_footer/Buttons';

export default {
  name: 'BuyersListing',
  props: ['inspections', 'officeId', 'userId', 'propertyId'],
  created() {
    // console.log('buyers listing: ' + this.choosenDate);
  },
  mounted() {
    let listContainer = document.getElementById('listContainer');
    // 滚动的显示区域为: 减去 banner,底部和其余的64像素空间
    let theHeight = window.innerHeight - 224 - 40 - 50;
    listContainer.setAttribute('style', 'height:' + theHeight + 'px');
    Ps.initialize(listContainer);
  },
  components: {
    'v-buyers-footer-buttons': BuyersFooterButtons
  },
  methods: {
    initBuyerForm: function() {
      // 什么也不用做, 触发时间给上级即可, 告诉上级, 用户点击了 New 按钮, 去显示 new 的表单并产生相应的对象
      this.$emit('initCurrentBuyerEvent');
    },
    loadLocalBuyerToEdit: function (idx) {
      let theBuyerToBeEdit = this.inspections[idx];
      theBuyerToBeEdit.isSynced = false;
      this.$emit('loadLocalBuyerToEdit', theBuyerToBeEdit);
    }
  }
};

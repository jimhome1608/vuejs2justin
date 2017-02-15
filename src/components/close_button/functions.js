// Use: import Button from 'components/close_button/ButtonTpl';
export default {
  name: 'CloseButton',
  props: {
    title: {
      type: String,
      default: 'Submit'
    },
    typeName: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    closeWindow() {
      window.close();
    }
  }
};

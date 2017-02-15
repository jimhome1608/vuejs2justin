const TYPE_NOT_INTERESTED = 'Not Interested';
const TYPE_INTERESTED = 'Interested';
const TYPE_MAYBE = 'Maybe';
const NOTHING_SELECTED = '';
const ACTIVITY_TYPE_INSPECT = 'Inspected';

const ERR_OK = 100;

export default{
  name: 'BuyerForm',
  props: ['officeId', 'userId', 'propertyId', 'currentBuyer', 'frequentTextOptions'],
  data() {
    return {
      baseUrl: 'http://www.multilink.com.au/webmultilink/index.php/',
      baseTimeout: null,
      buyerForm: {
        // 这个是表示是否同步的指示标示
        isSynced: false,
        // 以下是数据
        name: '',
        surname: '',
        phone: '',
        email: '',
        showAllFields: false,
        activity_type: ACTIVITY_TYPE_INSPECT, // By default, inspection type is 'Inspected'
        activityTypeOptions: [
          'Inspected', 'Inspected Private', 'Introduced', 'Enquiry'
        ],
        price: '',
        interest_type: NOTHING_SELECTED,
        wants_sect32: false,
        notes: '',
        frequentText: null,
        // My contact Notes Section
        myContactNotes: '',
        frequentTextTwo: null,
        potential_seller: false,
        pre_existing_notes: '',
        // My contact notes section end
        delivery: false,
        type: [],
        resource: '',
        desc: '',
        // 表示是否刚刚成功进行了同步
        newBuyerFormAction: true,  // 表示本表格在执行新用户的数据输入
        justsynchronized: false,
        ofi_idx: 0,
        checkingPhoneInProgress: false,
        // 这个 key 是 local storage 给的一个键值. 它似乎是自动根据当前的 local storage 的 item 的可以产生, 不需自行维护
        key: 0
      },
      valicationRules: {
        name: [
          { required: true, message: 'Buyer\'s first name is required!', trigger: 'blur' }
        ],
        surname: [
          { required: true, message: 'Buyer\'s surname is required!', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: 'Buyer\'s phone number is required!', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    isAttendeeExistQueryUrl: function() {
      // 这个计算属性, 是根据当前的日期以及 officeId 等信息生成特定规则的键值用来存取 localStorage 里面的数据
      return this.baseUrl + 'stock/inspection/get_attendee_data_by_mobile';
    }
  },
  methods: {
    toggleShowAllFields: function () {
      this.buyerForm.showAllFields = !this.buyerForm.showAllFields;
    },
    newBuyerFormSubmit: function () {
      let theBuyer = {};
      // 先检查是否输入了数据
      this.buyerForm.name = this.buyerForm.name.trim();
      this.buyerForm.phone = this.buyerForm.phone.trim();
      this.buyerForm.email = this.buyerForm.email.trim();
      this.buyerForm.surname = this.buyerForm.surname.trim();
      let isNotAnEmptyBuyer = false;
      isNotAnEmptyBuyer = this.buyerForm.ofi_idx ||
                          this._isEmptyString(this.buyerForm.name) ||
                          this._isEmptyString(this.buyerForm.surname) ||
                          this._isEmptyString(this.buyerForm.phone) ||
                          this._isEmptyString(this.buyerForm.email);
      if (isNotAnEmptyBuyer) {
        // 这个字段很特殊, 是服务器才能生成的 id 值
        theBuyer.ofi_idx = this.buyerForm.ofi_idx;

        theBuyer.office_id = this.officeId;
        theBuyer.user_id = this.userId;
        theBuyer.id = this.propertyId;

        theBuyer.notes = this.buyerForm.notes;
        theBuyer.my_notes = this.buyerForm.myContactNotes;

        theBuyer.not_interested = this.isNotInterested();
        theBuyer.maybe_interested = this.isMaybe();
        theBuyer.interested = this.isInterested();
        theBuyer.wants_sect32 = this.iswants_sect32();
        theBuyer.potential_seller = this.isPotentialSeller();

        theBuyer.name = this.buyerForm.name;
        theBuyer.surname = this.buyerForm.surname;
        theBuyer.phone = this.buyerForm.phone;
        theBuyer.email = this.buyerForm.email;
        theBuyer.price = this.buyerForm.price;
        theBuyer.activity_type = this.buyerForm.activity_type;
        theBuyer.result = '';
        theBuyer.isSynced = this.buyerForm.isSynced;
        theBuyer.newBuyerFormAction = this.buyerForm.newBuyerFormAction;
        // 这个 key 的值很重要, 在任何时候, 总要依靠它来更新 inspections 中的元素
        theBuyer.key = this.buyerForm.key;
        this.$emit('newOfiCreated', theBuyer);
        this.resetAllFields();
      } else {
        // 用户信息没有输入全, 就不保存和清空了
        this.$emit('newOfiCreated', null);
      }
    },
    resetAllFields: function() {
      this.buyerForm.name = '';
      this.buyerForm.surname = '';
      this.buyerForm.phone = '';
      this.buyerForm.email = '';
      this.buyerForm.price = '';
      this.buyerForm.activity_type = ACTIVITY_TYPE_INSPECT;
      this.buyerForm.notes = '';
      this.buyerForm.my_notes = '';
      this.buyerForm.interest_type = NOTHING_SELECTED;
      this.buyerForm.wants_sect32 = false;
      this.buyerForm.potential_seller = false;
      // 很重要, 必须要置为0, 否则有可能不小心变为更新的操作
      this.buyerForm.ofi_idx = 0;
      this.buyerForm.pre_existing_notes = '';
      this.buyerForm.newBuyerFormAction = true;
      // 新的 buyerForm 都是没有同步过的
      this.isSynced = false;
    },
    parseActivityType: function(val) {
      return val;
    },
    // 根据给定的 activity type 的字符串取得索引的 id
    decodeActivityType: function(activityNameString) {
      let length = this.buyerForm.activityTypeOptions.length;
      let result = 0;
      for (let i = 0; i < length; i++) {
        if (this.buyerForm.activityTypeOptions === activityNameString) {
          result = i;
          break;
        }
      }
      return result;
    },
    // 分析传入的对象的表示 interested 的几个属性, 来找出正确的值
    parseInterestState: function(obj) {
       let result = NOTHING_SELECTED;
       if (obj.maybe_interested) {
         result = TYPE_MAYBE;
       } else if (obj.interested) {
         result = TYPE_INTERESTED;
       } else if (obj.not_interested) {
         result = TYPE_NOT_INTERESTED;
       }
       return result;
    },
    isNotInterested: function() {
      return this.buyerForm.interest_type === TYPE_NOT_INTERESTED ? 1 : 0;
    },
    isInterested: function() {
      return this.buyerForm.interest_type === TYPE_INTERESTED ? 1 : 0;
    },
    isMaybe: function() {
      return this.buyerForm.interest_type === TYPE_MAYBE ? 1 : 0;
    },
    iswants_sect32: function() {
      return this.buyerForm.wants_sect32 ? 1 : 0;
    },
    isPotentialSeller: function() {
      return this.buyerForm.potential_seller ? 1 : 0;
    },
    // 使用的 UI 的空间是无法通过 watch 来监听, 必须要使用 UI 控件提供的 change 事件来完成功能
    // 监听客户是否感兴趣的值, 如果感兴趣自动选择需要文件
    changeInterestHandler: function(newVal) {
      if (newVal === TYPE_INTERESTED) {
        this.buyerForm.wants_sect32 = true;
      } else if (newVal === TYPE_NOT_INTERESTED) {
        this.buyerForm.wants_sect32 = false;
      }
    },
    _isEmptyString: function(val) {
      let result = false;
      if (val) {
        result = (val.trim().length > 0);
      }
      return result;
    }
  },
  watch: {
    'buyerForm.frequentText': function (newText) {
      // Watch freq text
      this.buyerForm.notes = this.buyerForm.frequentText + '. ' + this.buyerForm.notes;
    },
    'buyerForm.frequentTextTwo': function (newText) {
      // Watch freq text
      this.buyerForm.myContactNotes = this.buyerForm.frequentTextTwo + '. ' + this.buyerForm.myContactNotes;
    },
    'currentBuyer': function (newVal) {
      let isNotAnEmptyBuyer = false;
      if (newVal) {
        isNotAnEmptyBuyer = newVal.ofi_idx ||
                            this._isEmptyString(newVal.name) ||
                            this._isEmptyString(newVal.surname) ||
                            this._isEmptyString(newVal.phone) ||
                            this._isEmptyString(newVal.email);
      }
      if (isNotAnEmptyBuyer) {
        // 如果新的值是对象并且有 ofi_idx 属性, 其实检查任何属性都可以
        this.buyerForm.name = newVal.name;
        this.buyerForm.surname = newVal.surname;
        this.buyerForm.phone = newVal.phone;
        this.buyerForm.email = newVal.email;
        this.buyerForm.price = newVal.price;
        this.buyerForm.activity_type = newVal.activity_type;
        this.buyerForm.notes = newVal.notes;
        this.buyerForm.my_notes = newVal.my_notes;
        this.buyerForm.interest_type = this.parseInterestState(newVal);
        this.buyerForm.wants_sect32 = (newVal.wants_sect32 === '1');
        this.buyerForm.potential_seller = (newVal.potential_seller === '1');
        this.buyerForm.ofi_idx = newVal.ofi_idx;
        // 下面的赋值让 more 部分自动打开
        this.buyerForm.showAllFields = true;

        // 这个不是新用户的创建表格, 因此停止监听
        this.buyerForm.newBuyerFormAction = false;
        this.buyerForm.isSynced = newVal.isSynced;
        if (newVal.key) {
          this.buyerForm.key = newVal.key;
        }
        // console.log('准备更新 Buyer');
      } else {
        // console.log('New or init');
      }
    },
    'buyerForm.phone': function(newValue) {
      // 观察用户输入的电话号码的变化, 而且要确保表格是处于'添加新用户'
      if (newValue.trim().length === 10) {
        if (this.buyerForm.newBuyerFormAction === true) {
          this.buyerForm.checkingPhoneInProgress = true;
          let that = this;
          let data = {
            attendee_mobile: this.buyerForm.phone,
            officeId: this.officeId,
            userId: this.userId
          };
          this.$http.post(
            this.isAttendeeExistQueryUrl,
            data
          ).then((res) => {
            this.buyerForm.checkingPhoneInProgress = false;
            return res.json();
          }, (res) => {
            // error handler
            this.buyerForm.checkingPhoneInProgress = false;
          }).then((dataInJson) => {
            if (dataInJson.err_no === ERR_OK && dataInJson.result) {
              let buyer = dataInJson.result;
              let msg = 'Import Details? (' + buyer.first_name + ' ' + buyer.surname + ').';
              // 弹出一个窗口询问中介是否使用找到的数据
              that.$confirm(msg, 'Found: ' + buyer.first_name + ' ' + buyer.surname, {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'info'
              }).then(() => {
                // 用户选择使用找到的数据
                that.buyerForm.name = buyer.first_name;
                that.buyerForm.surname = buyer.surname;
                that.buyerForm.email = buyer.email;
                that.buyerForm.price = buyer.price;
                that.buyerForm.potential_seller = (buyer.potential_seller === '1');
                that.buyerForm.pre_existing_notes = buyer.notes;
                that.buyerForm.showAllFields = true;
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: 'Cancelled'
                });
              });
            }
          });
        }
      }
    }
  }
};

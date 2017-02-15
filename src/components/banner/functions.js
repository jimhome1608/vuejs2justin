export default {
  name: 'Banner',
  props: {
    stock: Object,
    userId: String,
    officeId: String,
    isDocumentReady: Boolean,
    isOfiSent: Boolean,
    preparedInspectionReportAddressees: String,
    inspections: Array,
    emailBody: String
  },
  data() {
    return {
      inspectionDate: '',
      inspectionDateValueInStringFormat: '',
      needPause: false,
      additions_to_email: '',
      additions_to_sms: '',
      isOfiSentOK: false,
        // baseUrl: 'http://www.multilink.com.au/wip/weblink/index.php/'
      baseUrl: 'http://www.multilink.com.au/webmultilink/index.php/'
    };
  },
  computed: {
    documentLink: function() {
      return this.baseUrl + 'stock/public/stock/display_doc_no_n/' + this.officeId + '/' + this.stock.id;
    },
    sendInspectionReportUrl: function() {
      return this.baseUrl + 'stock/inspection/notify_vendor_inspectors';
    }
  },
  created() {
    this.initInspectionDate();
  },
  watch: {
    'inspections': function () {
      // 改变发送邮件的内容
      this._construct_email_body();
    }
  },
  methods: {
    initInspectionDate: function () {
      // 在页面加载的时候, 取得今天的日期, 然后给属性 choosenDate 初始化值
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1;
      let yyyy = today.getFullYear();
      if (dd < 10) {
          dd = '0' + dd;
      }
      if (mm < 10) {
          mm = '0' + mm;
      }
      this.inspectionDate = mm + '-' + dd + '-' + yyyy;
    },
    transformDataString: function (dateString) {
      // mm-dd-yyyy to ddmmyyy
      let dd = dateString.substring(0, 2);
      let mm = dateString.substring(3, 5);
      let yyyy = dateString.substring(6);
      return dd + mm + yyyy;
    },
    inspectionDateChanged: function (currentChoosedDate) {
      this.inspectionDateValueInStringFormat = currentChoosedDate;
      if (this.needPause) {
        // 第一次不广播, 因为有个 bug 在这里, 导致了广播两次
        this.needPause = false;
      } else {
        // 向上层的 Home 直接传递该消息以及参数即可
        this.isOfiSentOK = false;
        this.$emit('inspectionDateChanged', currentChoosedDate);
      }
    },
    // 计算有多少人want sect32
    _countRds: function() {
      return this._getRds();
    },
    // 找出有多少人want sect32 并返回数组对象
    _getRds: function () {
      // 找到被标记为 want section 32的用户 放到 rds 中提交到后台
      let ofiDateInDdmmyyyy = this.transformDataString(this.inspectionDateValueInStringFormat);
      // console.log(ofiDateInDdmmyyyy);
      let idx = 0;
      let rds = 0;
      for (var item in this.inspections) {
        let key = 'ofi-' + this.officeId + '-' + this.stock.id + '-' + ofiDateInDdmmyyyy + '-' + idx;
        this.inspections[item]['key'] = key;
        if (this.inspections[item].wants_sect32) {
          rds++;
        }
        idx++;
      };
      return rds;
    },
    _construct_email_subject: function() {
      return '&subject=Update on OFI';
    },
    _construct_email_body: function () {
      // for email body for vendors
      if (this.inspections && this.inspections.length > 0) {
        let preparedEmailBody = this.emailBody + ', \n \nThe Open House at your property produced ';
        let altLe = this.inspections.length;
        let countWhoRequireDocs = this._countRds();
        preparedEmailBody = preparedEmailBody + altLe + ' inspections';
        if (countWhoRequireDocs > 0) {
          preparedEmailBody = preparedEmailBody + ' with ' + countWhoRequireDocs + ' contracts requested';
        }
        preparedEmailBody = preparedEmailBody + '.  Speak soon.\n \n Regards, \n \n';
        this.additions_to_email = this._construct_email_subject() + '&body=' + encodeURIComponent(preparedEmailBody);
      }
      return this.additions_to_email;
    },
    _construct_sms_body: function() {
      // for sms for vendors
      this.additions_to_sms = ' the Open House at your property produced ';
      return this.additions_to_sms;
    },
    // Oberser of Button 'sendMessageDocsToBuyers';
    sendMessageDocsToBuyers: function (event) {
      event.preventDefault();  // 防止可能出现的 Provisional headers are shown
      this.isOfiSentOK = true;
      if (this.inspections.length === 0) {
        this.$alert('You cannot send sms/emails to nobody.', 'Sorry', {
          confirmButtonText: 'OK',
          callback: action => {
            // console.log('Alert box call back.');
          }
        });
      } else {
        this.$confirm('Send sms/emails to the attendees?', 'Message', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.sendMessageDocsToBuyersAction();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Action Cancelled!'
          });
        });
      }
    },
    // 这个是发送 message 和 docs 的操作的真正方法, 由sendMessageDocsToBuyers调用
    sendMessageDocsToBuyersAction: function() {
      // 发送报告给房东
      let ofiDateInDdmmyyyy = this.transformDataString(this.inspectionDateValueInStringFormat);

      let ofi = {
        stock_address: this.stock.address,
        stock_id: this.stock.id,
        ofi_date: ofiDateInDdmmyyyy,
        is_sent: false,
        ofi_date_formatted: this.inspectionDate
      };

      let conf = {
        sms_vendor: true,
        sms_attendees: true,
        email_vendor: true,
        email_attendees: true
      };

      let ofis = {};
      let rds = {};
      var idx = 0;
      for (var item in this.inspections) {
        let key = 'ofi-' + this.officeId + '-' + this.stock.id + '-' + ofiDateInDdmmyyyy + '-' + idx;
        this.inspections[item]['key'] = key;
        ofis[key] = this.inspections[item];
        if (this.inspections[item].wants_sect32) {
          // 找到被标记为 want section 32的用户 放到 rds 中提交到后台
          rds[key] = this.inspections[item];
        }
        idx++;
      };

      let data = {
        ofi: ofi,
        conf: conf,
        ofis: ofis,
        rds: rds,
        officeId: this.officeId,
        userId: this.userId
      };

      let that = this;
      this.$http.post(
        this.sendInspectionReportUrl,
        data
      ).then((res) => {
        return res.json();
      }).then((dataInJson) => {
        let isOfiSentOk = true;
        if (dataInJson.error) {
          for (let idx in dataInJson.error) {
            if (dataInJson.error[idx].length > 0) {
              isOfiSentOk = false;
              console.log(dataInJson.error[idx]);
              break;
            }
          }
        }
        that.isOfiSentOK = true;
        // that.isOfiSentOK = isOfiSentOk;
      });
      return true;
    }
  }
};

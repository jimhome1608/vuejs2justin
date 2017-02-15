import Lockr from 'lockr';

export default {
  name: 'BuyersFooterButtons',
  props: ['officeId', 'userId', 'propertyId'],
  data() {
    return {
      unSyncBuyers: []
    };
  },
  computed: {
    getTodayStirngUrl: function() {
      return 'http://www.multilink.com.au/webmultilink/index.php/stock/inspection/get_today_string';
    },
    getAttendeeStoreUrl: function() {
      return 'http://www.multilink.com.au/webmultilink/index.php/stock/inspection/store';
    }
  },
  methods: {
    needNewBuyer: function () {
      // 触发一个事件, 通知上级模板( Buyers Listing )即可
      this.$emit('newBuyerCreated');
    },
    _closeWindow: function(title, btnText, text) {
      this.$alert(
        text,
        title,
        {
          confirmButtonText: btnText
        }
      );
      window.open(window.location.href, '_self').close();
      window.close();
    },
    saveAllAndCloseWindow: function() {
      var that = this;
      var networkOk = false;
      var counter = 0;  // 这个计数器很重要, 只有最终有变回 0 才表示同步完毕
      this.$http.get(this.getTodayStirngUrl).then((res) => {
        // check if the internet ok
        let result = res.body;

        if (result && result.length === 21) {
          let keys = Object.keys(window.localStorage);
          let allData = [];
          // 以上代码先删除不必要的任何 local storage 项目, 哪些项目都可能造成干扰
          for (let idx in keys) {
            if (keys.hasOwnProperty(idx)) {
              let keyName = keys[idx];
              if (!keyName.includes('ofi-')) {
                // Lockr.rm(keyName); avatar和 categories 都会对本程序造成干扰
              } else {
                allData.push(Lockr.get(keyName));
              }
            }
          }

          for (var dayIndex in allData) {
            let dayItems = allData[dayIndex];
            for (var idx in dayItems) {
              var buyer = dayItems[idx];
              if (buyer.ofi_idx === 0 || !buyer.isSynced) {
                that.unSyncBuyers.unshift(buyer);
                counter++;
              }
            }
          }
          networkOk = true;
        }
      }, (res) => {
        this._closeWindow(
          'Note',
          'Close Window',
          'Weblink lost connection to the server but don\'t worry your data is safe and will be saved to the server when a connection is re-established.There is nothing to worry about as long as you DO NOT clear your Browsing History.Contact Multilink support on 9827 0086 for further info.'
        );
      }).then((res) => {
        var checkCounter = window.setInterval(
          function() {
            if (counter === 0) {
              if (networkOk) {
                Lockr.flush();
              }
              that._closeWindow(
                'Thanks',
                'Done',
                'All Good, Your data have been saved.'
              );
              window.clearInterval(checkCounter);
            }
          },
          500
        );
        if (counter > 0) {
          // internet OK
          for (var idx in that.unSyncBuyers) {
            let buyer = that.unSyncBuyers[idx];
            let data = {
              attendee: buyer
            };
            this.$http.post(this.getAttendeeStoreUrl, data).then((res) => {
              return res.json();
            }, (res) => {
              // error, 那么放到依然没有同步成功的数组中
              // stillNotSyncedAtLast.unshift(buyer);
              // console.log('同步网络失败: ' + buyer.ofi_idx);
              counter++;
            }).then((dataInJson) => {
              if (dataInJson) {
                counter--;
              }
            });
          }
          // window.open(window.location.href, '_self').close();
          // window.close();
        } else {
          if (networkOk) {
            Lockr.flush();
          }
          this._closeWindow(
            'Thanks',
            'Done',
            'All Good, Your data have been saved.'
          );
        }
      });
    }
  }
};

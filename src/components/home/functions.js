import Banner from 'components/banner/Banner';
import BuyersListing from 'components/buyers/Listing';
import BuyerForm from 'components/buyer_form/BuyerForm';
// 引入 local storage的 API: lockr
import Lockr from 'lockr';

const ERR_OK = 100;
const ERR_NO_RESULT = 99;

export default {
  name: 'Home',
  props: ['officeId', 'userId', 'propertyId'],
  data() {
    return {
      inspections: [],   // 从服务器来的 ofi 数据
      choosenDate: null,
      baseUrl: 'http://www.multilink.com.au/webmultilink/index.php/',
      stock: null,
      isDocumentReady: false,
      emailBody: '',
      prepared_inspection_report_addressees: '',
      isOfiSent: false,
      frequentText: [],
      currentBuyer: null,
      // 同步次数计数器
      syncCount: 0,
      // 是否停止监听inspections 的开关
      stopWatchingInspections: false,
      syncCounterDataBecauseOfLastTimeFail: 0
    };
  },
  computed: {
    inspectionKey: function() {
      // 这个计算属性, 是根据当前的日期以及 officeId 等信息生成特定规则的键值用来存取 localStorage 里面的数据
      return this.officeId + '_' + this.userId + '_' + this.propertyId + '_' + this.choosenDate;
    },
    initHomePageUrl: function() {
      return this.baseUrl + 'stock/inspection/init_home_ajax/' + this.officeId + '/' + this.userId + '/' + this.propertyId + '/' + this.choosenDate;
    },
    isOfiSentUrl: function() {
      return this.baseUrl + 'stock/inspection/is_ofis_sent/' + this.propertyId + '/' + this.choosenDate + '/' + this.officeId + '/' + this.userId;
    },
    getFrequentTextUrl: function() {
      return this.baseUrl + 'stock/inspection/get_frequent_text/' + this.officeId + '/' + this.userId;
    },
    getPeopleWhoAttendedOfiUrl: function() {
      return this.baseUrl + 'stock/inspection/get_people_who_attended_ofi/' + this.officeId + '/' + this.userId + '/' + this.propertyId + '/' + this.choosenDate;
    },
    getAttendeeStoreUrl: function() {
      return this.baseUrl + 'stock/inspection/store';
    }
  },
  components: {
    'v-banner': Banner,
    'v-buyers-listing': BuyersListing,
    'v-buyer-form': BuyerForm
  },
  created() {
    // console.log('Office Id @ Home page: ' + this.officeId);
    // console.log('User Id @ Home page: ' + this.userId);
    // console.log('Property Id @ Home page: ' + this.propertyId);
    // console.log('Inspection Key: ' + this.inspectionKey);
    this._syncAll(); // 先保存可能在 local storage 中还未同步的数据
    // 第一步: 首先利用得到的 officeId userId propertyId 加载当天的数据
    this.initChoosenDate();

    // 1: 首先要确保创建一个当天的记录在 local storage 中以备其他的模块使用
    // if (Lockr.get(this._generateOfiKey()) === undefined) {
    //   Lockr.set(this._generateOfiKey(), []);
    // }

    // 和服务器通信要做下面几件事情
    // 1: 加载物业和所要发送的邮件的基本信息 stock/inspection/init_home_ajax/officeId/userId/stockId/ofiDate
    this.loadHomeInit();

    // 2: 获取当前日期的 OFI 是否已经发送过的指示, 调用 stock/inspection/is_ofis_sent/stockId/ofiDate/officeId/userId
     this.checkIfOfiSent();

    // 3: 获取中介的 frequent text, 调用 stock/inspection/get_frequent_text/officeId/userId
    this.loadFrequentText();

    // 4: 获取参加过这个物业当日的客户的列表, 调用 stock/inspection/get_people_who_attended_ofi/officeId/userId/stockId/ofiDate
    let that = this;
    window.setTimeout(function() {
      // console.log('开始从服务器取数据');
      that.loadPeopleWhoAttended();
    }, 700);
  },
  mounted() {

  },
  watch: {
    'inspections': function() {
      if (this.stopWatchingInspections) {
        // console.log('Inspecitons watching is stoped!!!!!');
        return;
      }
      // console.log('Inspecitons watching is in progress!!!!!');
      let lsIdxKey = this._generateOfiKey();
      if (this.inspections.length > 0) {
        Lockr.set(lsIdxKey, this.inspections);
      }
    }
  },
  methods: {
    initChoosenDate: function () {
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
      this.choosenDate = dd + '-' + mm + '-' + yyyy;
    },
    // 这个方法只用来产生用来保存 Inspections 到 Local Storage 的 key. 每一天 所有 inspections 用一个 key
    _generateOfiKey: function() {
      let ofiDateInDdmmyyyy = this.transformDataString(this.choosenDate);
      return 'ofi-' + this.officeId + '-' + this.propertyId + '-' + ofiDateInDdmmyyyy + '-' + this.userId;
    },
    // 这个方法改变日期字符串的格式
    transformDataString: function (dateString) {
      if (!dateString) {
        dateString = this.initChoosenDate();
      }
      // mm-dd-yyyy to ddmmyyy
      let mm = dateString.substring(0, 2);
      let dd = dateString.substring(3, 5);
      let yyyy = dateString.substring(6);
      return dd + mm + yyyy;
    },
    // 找到所有的没有被同步的数据. 找到了返回没有同步的 buyer 的数组, 否则返回 false
    _findAllNotSynced: function() {
      // 由于 inspections 保存了最新的数据拷贝, 因此以它为数据源来查找未同步的 buyer 项目
      let notSynced = [];
      if (this.inspections && this.inspections.length > 0) {
        // 开始循环
        for (let idx in this.inspections) {
          let buyer = this.inspections[idx];
          if (buyer.isSynced === false) {
            notSynced.unshift(buyer);
          }
        }
      }
      // console.log('未同步的数据: ' + notSynced.length + '个');
      // console.log(notSynced);
      return notSynced.length > 0 ? notSynced : false;
    },
    // 专门用来在启动的时候查找未同步的数据并保存的数据库的函数
    _syncAll: function() {
      // 有没有没同步的
      if (this.syncCounterDataBecauseOfLastTimeFail === 0) {
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

        if (allData) {
          let flushed = false;
          let findSomethingNeedToSync = false;
          for (var dayIndex in allData) {
            let dayItems = allData[dayIndex];
            for (var idx in dayItems) {
              var buyer = dayItems[idx];
              if (typeof buyer !== 'string') {
                if (buyer.ofi_idx === 0 || !buyer.isSynced) {
                  findSomethingNeedToSync = true;
                  this.syncCounterDataBecauseOfLastTimeFail++;
                  let data = {
                    attendee: buyer
                  };
                  this.$http.post(this.getAttendeeStoreUrl, data).then((res) => {
                    return res.json();
                  }, (res) => {
                    // 保存是出现 error
                    this.syncCounterDataBecauseOfLastTimeFail++;
                  }).then((dataInJson) => {
                    if (dataInJson && dataInJson.err_no === ERR_OK) {
                      this.syncCounterDataBecauseOfLastTimeFail--;
                      if (!flushed && this.syncCounterDataBecauseOfLastTimeFail === 0) {
                        flushed = true;
                        Lockr.flush();
                      }
                    } else {
                       this.syncCounterDataBecauseOfLastTimeFail++;
                    };
                  });
                }
              }
            }
          }
          if (!findSomethingNeedToSync) {
            // 如果没有发现任何需要同步的
            Lockr.flush();
          }
        }
      }
      // 同步结束
    },
    loadHomeInit: function() {
      // 首页面加载数据的方法的封装
      let that = this;
      this.$http.get(
        this.initHomePageUrl,
        {timeout: 2000}
      ).then((res) => {
        return res.json();
      }, (res) => {
        // Error 没有网络, 尝试从本地加载
        // console.log('从本地加载');
      }).then((dataInJson) => {
        // console.log(dataInJson);
        if (dataInJson) {
          that.stock = dataInJson.result.stock;
          that.isDocumentReady = dataInJson.result.isDocReady;
          that.emailBody = dataInJson.result.emailBody;
          that.prepared_inspection_report_addressees = dataInJson.result.prepared_inspection_report_addressees;
        }
      }).catch(function(res) {
        console.log('loadHomeInit catch something');
      });
    },
    checkIfOfiSent: function () {
      // 检查是否 OFI 已经发送的方法封装
      let that = this;
      this.$http.get(
        this.isOfiSentUrl,
        {timeout: 2000}
      ).then((res) => {
        return res.json();
      }, (res) => {
        // Error
      }).then((dataInJson) => {
        if (dataInJson) {
          that.isOfiSent = dataInJson.result;
        }
      }).catch(function(res) {
        console.log('checkIfOfiSent catch something');
      });
    },
    loadFrequentText: function () {
      // 加载自己的 frequent text
      let that = this;
      this.$http.get(
        this.getFrequentTextUrl,
        {timeout: 2000}
      ).then((res) => {
        return res.json();
      }, (res) => {
        // Error
      }).then((dataInJson) => {
        if (dataInJson && dataInJson.err_no === ERR_OK) {
          that.frequentText = dataInJson.result;
        };
      }).catch(function(res) {
        console.log('loadFrequentText catch something');
      });
    },
    // 当日期该表之后, 或者页面第一次打开是加载 inspections 数据的方法
    loadPeopleWhoAttended: function () {
      // 载入新数据期间停止监听, 即不会导致 inspections 写入到 local storage
      this.stopWatchingInspections = true;

      // 获取参加过这个物业当日的客户的列表
      let that = this;
      // 首先尝试从本地的 Local Storage 里面取数据
      let lsIdxKey = this._generateOfiKey();
      let ofisFromLocalStorage = Lockr.get(lsIdxKey);

      if (ofisFromLocalStorage && ofisFromLocalStorage.length > 0) {
        // 从本地取得了数据, 说明是最近加载的 ,可以直接使用
        // console.log('加载的是从本地获取的数组');
        this.inspections = [];
        that.stopWatchingInspections = false;
        // 把监听打开 500毫秒后写数据
        window.setTimeout(function() {
          that.inspections = ofisFromLocalStorage;
        }, 100);
      } else {
        // 本地没有数据, 尝试从远端加载
        // console.log('加载网络数据');
        this.$http.get(this.getPeopleWhoAttendedOfiUrl).then((res) => {
          return res.json();
        }, (res) => {
          // Error 从网络加载失败了
          this.$alert(
            'There is no internet connection!',
            'Warning',
            {
              confirmButtonText: 'OK'
            }
          );
          this.$message.error('There is no internet connection!');
        }).then((dataInJson) => {
          that.inspections = [];
          that.stopWatchingInspections = false;
          // 把监听打开, 100毫秒后开始写入数据
          window.setTimeout(function() {
            if (dataInJson.err_no === ERR_OK) {
              for (let idx in dataInJson.result) {
                dataInJson.result[idx].isSynced = true;  // 从服务器来的肯定是已经同步了的
                that.inspections.push(dataInJson.result[idx]);
              }
            } else if (dataInJson.err_no === ERR_NO_RESULT) {
              // 这个时候, 远端没有正确返回数据, 本地也没找到

            };
          }, 100);
        });
      }
    },
    // 检查是否theOne 已经在 theList 中存在
    _isThisOneExist: function(theOne, theList) {
       let found = false;
       for (var idx in theList) {
         if (theOne.ofi_idx === theList[idx].ofi_idx) {
           found = true;
           break;
         }
       }
       return found;
    },
    inspectionDateUpdated: function(currentChoosedDate) {
      // 监听日期改变的事件
      // console.log('inspectionDateChanged emitted: ' + currentChoosedDate);
      if (currentChoosedDate !== this.choosenDate) {
        this.choosenDate = currentChoosedDate;
        // 如果改变了日期, 那么就需要从新加载 People
        this.loadPeopleWhoAttended();
        // 重新检查是否 OFI report 已经发送
        this.checkIfOfiSent();
      };
    },
    // 这个是保存 OFI 的真正与服务器通信的方法. 流程很简单, 就是直接提交 buyer 对象即可. 对象的属性名称与 StoreProc 的要求名称是完全一样的
    // 除了要求的 ofi_date 字段的格式. 为了便于前台显示, 这里使用的是 dd-mm-yyyy 的格式. 而服务器要求是 ddmmyyyy, 这个转换在服务器端完成
    // 对于新的 OFI, 其 buyer 对象的 ofi_index 的值为 0, 服务器看到0会自动保存. 成功后返回生成的数据库真实 id
    // 如果是更新操作, 则 ofi_index 是非零值, 服务器会自动执行更新操作. 保存操作完成后, 将 currentBuyer设为 false, 会回到主界面
    // @param buyer Object, 如果为空, 则不与服务器通信, 仅仅回到主界面
    saveBuyer: function(buyer) {
      if (buyer !== null) {
        // 不为空的时候才真正的保存
        var that = this;
        buyer.ofi_date = this.choosenDate;
        // 记录一下传入的 ofi_idx的状态, 如果已经不是0, 就是更新操作, 那么不要unshift一个新的 item 到本地的 inspections 数组中了
        let isUpdateAction = buyer.ofi_idx || !buyer.newBuyerFormAction;
        let data = {
          attendee: buyer
        };
        this.$http.post(this.getAttendeeStoreUrl, data).then((res) => {
          return res.json();
        }, (res) => {
          buyer.isSynced = false; // 同步失败了
          // Error Happened
          if (!isUpdateAction) {
            // 不是更新操作, 这个时候 ofi_idx 还是0
            that.inspections.unshift(buyer);
          } else {
            // 替换一下当前 inpections 数组中的元素, 以便界面的元素可以更新
            that.replaceInspectionsItemWith(buyer);
          }
        }).then((dataInJson) => {
          if (dataInJson && dataInJson.err_no === ERR_OK) {
            buyer.isSynced = true; // 同步成功了已经
            if (!isUpdateAction) {
              // 保存成功的话, 会把 ofi_idx 回传回来
              buyer.ofi_idx = dataInJson.result;
              that.inspections.unshift(buyer);
            } else {
              // 替换一下当前 inpections 数组中的元素, 以便界面的元素可以更新
              that.replaceInspectionsItemWith(buyer);
            }
          } else {
             console.log('saveBuyer something wrong');
          };
        });
      }
      this.currentBuyer = false;
    },
    //  查找并替换当前的 inpections 中的元素为新的给定 newItem
    replaceInspectionsItemWith: function(newItem) {
      let length = this.inspections.length;
      if (length === 0) {
        this.inspections.unshift(newItem);
        return;
      } else {
        let toBeRemovedIdx = -1;
        for (let i = 0; i < length; i++) {
          // 先通过 key 来定位, 如果 key 是0, 再尝试通过 ofi_idx 来定位,
          if (newItem.key && this.inspections[i].key === newItem.key) {
            toBeRemovedIdx = i;
            break;
          } else if (this.inspections[i].ofi_idx && this.inspections[i].ofi_idx === newItem.ofi_idx) {
            // 但是首要条件是 ofi_idx 不能是0
            toBeRemovedIdx = i;
            break;
          }
        }
        if (toBeRemovedIdx !== -1) {
          this.inspections.splice(toBeRemovedIdx, 1);
          this.inspections.unshift(newItem);
        } else {
          // 没有找到替换的, 那么就插入
          this.inspections.unshift(newItem);
        }
        return;
      }
    },
    // 点击任何一个 buyer 的区域之后, 最终会执行到这里. 传递来的是希望被编辑的 buyer 数据. 传给 currentBuyer 即可
    loadLocalBuyerToEdit: function (theBuyerToBeEdit) {
      // console.log('Home -> functions.js -> loadLocalBuyerToEdit method.');
      this.currentBuyer = theBuyerToBeEdit;
      // console.log(this.currentBuyer.isSynced);
    },
    // 点击 New 按钮的时候会执行这个方法, 给 currentBuyer 一个非空值即可
    initCurrentBuyer: function() {
      // 通知要产生一个新的 buyer, 那么操作就是 new 一个新的 buyer 对象给 currentBuyer 即可
      this.currentBuyer = {};
      // console.log('initCurrentBuyer method.');
    }
  }
};

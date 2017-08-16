var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    resDetailData:{
      resPhone:"0755-1234564",
      resAddress:"深圳市龙华新区龙华街道尚美时代",
      resStarTime:"09:00",
      resEndTime:'23:00',
      resIntro:"测试店铺信息",
      resName:"餐厅",
      resCooking:"粤菜"
    },
    moduleActiveMe: '',
    userCellId: 0,//规格
    userCell0: 0,//做法
    userCell1: 0,
    userCell2: 0,
    userCell3: 0,
    activeFirst: "userCellActive",
    practicesCode: [],
    module: '',//弹出框
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,// tab切换 
    hallCarts: [],//堂食购物车
    hallCounts: {},//堂食数量统计
    hallAmount: 0,//堂食菜品总价
    hallCount: 0, //堂食菜品总量
    takeawayCarts: [],//外卖购物车
    takeawayCounts: {},//外卖数量统计
    takeawayAmount: 0,  //外卖菜品总价
    takeawayCount: 0,//外卖菜品总量
    deliveryAmount: 0,//起送金额
    takeaway: false,//用于判断外卖总价
    foodDatas: [], //菜品数据
    canhe: 0,
    distributionFee: 0,
    send: true,

    eat:'',    //0没有堂食;1有堂食
    takeOutFood:'', //0没有外卖;1有外卖

    all:false,
    onlyEat:false,
    onlyTakeOut:false,
    onlyDetail:false,

    allEat:false,
    allTakeOut:false

  },
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.resDetailData.resPhone,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    });
  },
  openMap: function (e) {
    //consoleconsole.log(e);
    var value = e.detail.value;
    wx.openLocation({
      latitude: 'Number(value.y)',
      longitude: 'Number(value.x)'
    })
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {//点击tab切换
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
    }
  },
  toView: function (res) {
    var that = this;
    var index = res.currentTarget.dataset.index;
    var indexs = res.currentTarget.dataset.indexs;
    that.setData({
      scrollId: index
    });
  },
  close: function (res) {//关闭购物车
    var that = this;
    if (res.currentTarget.dataset.close == res.target.dataset.close) {
      that.setData({
        shoppingCarActive: ''
      });
    }
  },
  shoppingCarClick: function (res) {//打开购物车
    var that = this;
    var active = res.currentTarget.dataset.active;
    if (active == 'active') {
      that.setData({
        shoppingCarActive: ''
      });
    } else {
      that.setData({
        shoppingCarActive: 'active'
      });
    }
  },
  onLoad: function (options) {
    var that = this;
    var data = {};
    // 店铺详情模块
      that.setData(options);
      app.globalData.resId = options.resId;
      data = { resId: options.resId };
      that.loadCon(data);
      console.log("红红火火乎乎" + that.data.currentTab);
  },
loadCon:function(data){
  var that = this;
  var url = app.globalData.serverAddress + "microcode/getResDetail";
  appUtil.httpRequest(url, data, function (rsp) {
    if (rsp.returnStatus) {
      //console.log('店铺详情模块');
      //console.log(rsp);
      var resDetailData = rsp.value;
      wx.setNavigationBarTitle({//设置本页面的标头
        title: resDetailData.resName,
      });
      var str = app.globalData.serverAddressImg;
      resDetailData.resLogo = str + resDetailData.resLogo;
      that.setData({
        resDetailData: resDetailData,
        deliveryAmount: resDetailData.takeoutBusinessRules.deliveryAmount
      });
      if ((resDetailData.takeoutBusinessRules.distributionFee == "" && resDetailData.takeoutBusinessRules.distributionFee == undefined && resDetailData.takeoutBusinessRules.distributionFee == null) || resDetailData.takeoutBusinessRules.distributionCostType == 0) {
        resDetailData.takeoutBusinessRules.distributionFee = 0;
        that.setData({
          distributionFee: 0
        });
      }
      that.setData({
        eat: resDetailData.restaurantBusinessRules.status,
        takeOutFood: resDetailData.takeoutBusinessRules.status
      });

      //that.upToAmount();//起送金额判断
      // 判断是否有外卖
      if (that.data.takeOutFood == 1 && that.data.eat == 1) {
        // console.log('全部都有');
        that.setData({
          all: true, //tab栏
          allEat: true, //堂食内容
          allTakeOut: true //外卖内容
        });
        if (resDetailData.restaurantBusinessRules.isBusiness == 1) {
          //console.log('堂食营业');
          that.setData({
            plus: true
          });
        }
        if (resDetailData.takeoutBusinessRules.isBusiness == 1) {
          //console.log('外卖营业');
          that.setData({
            plusTake: true
          });
        }
      } else if (that.data.takeOutFood != 1 && that.data.eat == 1) {
        // console.log('只有堂食');
        that.setData({
          onlyEat: true,
          allEat: true,
          allTakeOut: false
        });
        if (resDetailData.restaurantBusinessRules.isBusiness == 1) {
          //console.log('堂食营业');
          that.setData({
            plus: true
          });
        }
      } else if (that.data.takeOutFood == 1 && that.data.eat != 1) {
        // console.log('只有外卖');
        that.setData({
          onlyTakeOut: true,
          allEat: false,
          allTakeOut: true
        });
        if (resDetailData.takeoutBusinessRules.isBusiness == 1) {
          //console.log('外卖营业');
          that.setData({
            plusTake: true
          });
        }
      } else if (that.data.takeOutFood == 0 && that.data.eat == 0) {
        // console.log('两个都没有');
        that.setData({
          all: false,
          allEat: false,
          allTakeOut: false,
          onlyDetail: true
        });
      }
      that.setData({
        canhe: resDetailData.takeoutBusinessRules.packingCharge
        // canhe: 0
      });

      if (that.data.isaddDish) {//继续加菜
        // console.log('继续加菜');
        that.setData({
          consumerId: options.consumerId,
          tangshi: true
        });
      } else {//检查是不存在未结账的消费者
        var data = {
          resId: that.data.resId,
          openId: app.globalData.openId
        };
        //var init = util.initPay(data);
        var url = app.globalData.serverAddress + "microcode/checkHasWaitPayConsumer";
        appUtil.httpRequest(url, data, function (rsp) {
          // console.log('检查是否存在未结账的消费者');
          // console.log(rsp);
          if (rsp.returnStatus) {
            that.setData({
              module: 'moduleActive'
            });
            that.setData({
              consumerId: rsp.value.consumerId,
              tableCode: rsp.value.tableCode,
              tableName: rsp.value.title,
              tangshi: true
            });
          } else {
            // console.log('没有存在未结账的消费者');
            if ((that.data.tableCode == "" || that.data.tableCode == "undefined" || that.data.tableCode == undefined) && that.data.resDetailData.resOperation == 0) {//堂食
              that.setData({
                tangshi: false
              });
            } else {
              that.setData({
                tangshi: true
              });
            }
          }
        });
      };
    } else {
      console.log('店铺详情模块失败');
    }
  });

  that.setData({ serverAddressImg: app.globalData.serverAddressImg });
  wx.getSystemInfo({
    success: function (res) {
      that.setData({
        winWidth: res.windowWidth,
        winHeight: res.windowHeight
      });
    }
  });

  
  // 堂食快餐菜品
  var data = {
    resId: that.data.resId,
    isEatin: 1
  };
  //var init = util.initPay(data);
  var url = app.globalData.serverAddress + "food/getFoodList";
  appUtil.httpRequest(url, data, function (rsp) {
    // console.log('堂食');
    // console.log(rsp);
    if (rsp.returnStatus) {
      var foodList = rsp.value;
      var sidebar = [];
      foodList.forEach(function (val, key) {
        sidebar = sidebar.concat(val);
      });
      that.setData({
        foodDatas: sidebar,
      });
    } else {
      // console.log('查询菜品分类数据失败');
    }
  });

  // 外卖菜品
  var data = {
    resId: that.data.resId,
    isTakeaway: 1
  };
  //var init = util.initPay(data);
  var url = app.globalData.serverAddress + "food/getFoodList";
  appUtil.httpRequest(url, data, function (rsp) {
    // console.log(rsp);
    if (rsp.returnStatus) {
      var foodListTakeaway = rsp.value;
      var sidebarTakeaway = [];
      foodListTakeaway.forEach(function (val, key) {
        sidebarTakeaway = sidebarTakeaway.concat(val);
      });
      that.setData({
        foodDatasTakeaway: sidebarTakeaway,
      });
    } else {
      console.log('查询菜品分类数据失败');
    }
  });
},

  pay: function () {
    var that = this;
    wx.redirectTo({
      url: "/pages/order/order-pay/order-pay?resId=" + that.data.resId + "&consumerId=" + that.data.consumerId,
      success: function (res) {
        // console.log('先去支付')
      }
    })
  },


  addDish: function () {
    var that = this;
    that.setData({
      module: ''
    });
  },


  calculatorCounts: function () {//统计菜品数量，计算价格
    var that = this;
    var hallCarts = this.data.hallCarts;
    var hallCounts = {};
    var hallAmount = 0;
    var hallCount = 0
    var takeawayCarts = this.data.takeawayCarts;
    var takeawayCounts = {};
    var takeawayAmount = 0;
    var takeawayCount = 0;
    hallCarts.forEach(function (item, index) {
      hallAmount = (hallAmount*10000 + item.foodCount * item.price*10000)/10000;
      hallCount += item.foodCount;
      var foodCode = item.foodCode;
      var foodCount = hallCounts[foodCode];
      if (!foodCount) {
        foodCount = item.foodCount;
      } else {
        foodCount += item.foodCount;
      }
      hallCounts[foodCode] = foodCount;
    });
    takeawayCarts.forEach(function (item, index) {
      takeawayAmount = (takeawayAmount*10000+item.foodCount * item.price*10000)/10000;
      takeawayCount += item.foodCount;
      var foodCode = item.foodCode;
      var foodCount = takeawayCounts[foodCode];
      if (!foodCount) {
        foodCount = item.foodCount;
      } else {
        foodCount += item.foodCount;
      }
      takeawayCounts[foodCode] = foodCount;
    });
    that.setData({
      hallAmount: hallAmount,
      hallCount: hallCount,
      hallCounts: hallCounts,
      takeawayAmount: takeawayAmount,
      takeawayCounts: takeawayCounts,
      takeawayCount: takeawayCount
    });
    // 外卖
    app.globalData.takeawayCarts = takeawayCarts;
    app.globalData.takeawayAmount = takeawayAmount;
    app.globalData.takeawayCount = takeawayCount;
    //that.upToAmount();
    // 堂食
    app.globalData.hallCarts = hallCarts;
    app.globalData.hallCount = hallCount;
    app.globalData.hallAmount = hallAmount;
  },
  upToAmount:function(){//判断起送金额
    if (this.data.deliveryAmount <= this.data.takeawayAmount){
      this.setData({
        totalActive:"totalShow",
        deliveryActive: "deliveryHide"
      })
    }else{
      this.setData({
        totalActive: "totalHide",
        deliveryActive: "deliveryShow"
      })
    }
  },
  addToCarts: function (data) {//添加到购物车  菜品结构,规格ID,做法,点餐类型  0堂食1快餐2外
    var that = this;
    data = data.currentTarget.dataset;
    var food = data.food;
    var ruleCode = data.rulecode;
    var practies = data.practies;
    var pickType = data.picktype;
    var name = food.name;
    var index = this.isInCart(food, pickType);
    var takeawayCarts = this.data.takeawayCarts;
    var hallCarts = this.data.hallCarts;
    console.log(this.data.standard)
    if (index == -1) {
      var item = {};
      item.foodCode = food.foodCode;
      item.foodCount = 1;
      item.ruleCode = data.rulecode;
      item.name = food.name;
      
      if(food.foodRuleCount>1){
        if (!food.guigeName){
          item.guigeName = this.data.standard[0].name
        } else {
          item.guigeName = food.guigeName;
        }
        if (!food.foodRuleMemberPrice){
          food.foodRuleMemberPrice = this.data.standard[0].foodRuleMemberPrice;
        }
        item.foodRuleMemberPrice = food.foodRuleMemberPrice;
        if (!food.status) {
          food.status = this.data.standard[0].status;
        }
        item.isdiscount = food.status;
      }else{
        item.isdiscount = food.isdiscount;

        var foodcode = item.foodCode
        var data = {
          resId: this.data.resId,
          foodCode: foodcode
        };
        //var init = util.initPay(data);
        var url = app.globalData.serverAddress + "foodRule/getFoodRuleList";
        appUtil.httpGet(url, data, function (rsp) {//规格
          // console.log('规格菜');
          // console.log(rsp);
          if (rsp.returnStatus) {
            item.foodRuleMemberPrice = rsp.value[0].foodRuleMemberPrice;
            that.data.takeawayCarts.forEach(function(val,key){
              if(val.foodCode==item.foodCode){
                that.data.takeawayCarts[key] = item;
              }
            })
            that.calculatorCounts();
          }
        });
      }
      

      item.price = food.price;
      item.practies = practies;
      if (pickType == 1) {
        takeawayCarts.push(item);
      } else {
        hallCarts.push(item);
      }
    } else {
      if (pickType == 1) {
        var item = takeawayCarts[index];
        item.foodCount = item.foodCount + 1;
        takeawayCarts[index] = item;
      } else {
        var item = hallCarts[index];
        item.foodCount = item.foodCount + 1;
        hallCarts[index] = item;
      }
    }
    this.setData({ takeawayCarts: takeawayCarts, hallCarts: hallCarts });
    this.calculatorCounts();
  },
  removeToCarts: function (data) {//移除购物车 菜品结构,点餐类型  0堂食1快餐2外卖
    var that = this;
    data = data.currentTarget.dataset;
    var food = data.food;
    var pickType = parseInt(data.picktype);
    var takeawayCarts = this.data.takeawayCarts;
    var hallCarts = this.data.hallCarts;
    if (pickType == 1) {
      for (var i = 0; i < takeawayCarts.length; i++) {
        var item = takeawayCarts[i];
        if (item.foodCode == food.foodCode && item.guigeName == food.guigeName) {
          // console.log(item.foodCount);
          item.foodCount = item.foodCount - 1;
          if (parseFloat(item.foodCount) <= 0) {
            takeawayCarts.splice(i, 1);
          } else {
            takeawayCarts[i] = item;
          }
          break;
        }

      }
    } else {
      for (var i = 0; i < hallCarts.length; i++) {
        var item = hallCarts[i];
        if (item.foodCode == food.foodCode && item.guigeName == food.guigeName) {
          item.foodCount = item.foodCount - 1;
          if (parseFloat(item.foodCount) <= 0) {
            hallCarts.splice(i, 1);
          } else {
            hallCarts[i] = item;
          }
          break;
        }

      }
    }
    that.setData({ takeawayCarts: takeawayCarts, hallCarts: hallCarts });
    that.calculatorCounts();
  },
  isInCart: function (food, pickType) {//返回索引
    var index = -1;
    if (food.foodType > 0 && food.foodType < 3) index = -1;//套餐不允许一菜多分
    if (pickType == 1) {
      var takeawayCarts = this.data.takeawayCarts;
      for (var i = 0; i < takeawayCarts.length; i++) {
        var item = takeawayCarts[i];
        if (item.foodCode === food.foodCode) {
          if(item.price == food.price){
            index = i; break; 
          }
        }
      }
    } else {
      var hallCarts = this.data.hallCarts;
      for (var i = 0; i < hallCarts.length; i++) {
        var item = hallCarts[i];
        if (item.foodCode === food.foodCode) {
           if(item.price == food.price){
             index = i; break; 
           }
        }
      }
    }
    return index;
  },
  onShow: function () {
    var that = this;
    if (!that.data.hasHide) return;
    that.setData({ hasHide: false });
    // that.loadCardList();
    if (app.globalData.clrCar) {
      that.data.takeawayCarts.forEach(function (val, key) {
        val.foodCount == 0;
      });
      that.data.takeawayCarts.splice(0);
      that.setData({
        takeawayCount: 0
      });
      that.data.hallCarts.forEach(function (val, key) {
        val.foodCount == 0;
      });
      that.data.hallCarts.splice(0);
      that.setData({
        hallCount: 0
      });
      that.calculatorCounts();
      app.globalData.clrCar = false;
    }
  },
  onHide: function () {
    var that = this;
    that.setData({ hasHide: true });
  },
  // 清空购物车
  clearCar: function (e) {
    var that = this;
    // console.log('确定要清除购物车吗');
    // console.log(that.data.takeawayCarts);
    // console.log(e.currentTarget.dataset.content);
    var content = e.currentTarget.dataset.content;
    wx.showModal({
      title: '提示',
      content: '确定要清除购物车吗',
      success: function (res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          if (content == 2) {
            that.data.takeawayCarts.forEach(function (val, key) {
              val.foodCount == 0;
            });
            that.data.takeawayCarts.splice(0);
            that.setData({
              takeawayCount: 0
            });
          } else if (content == 0) {
            that.data.hallCarts.forEach(function (val, key) {
              val.foodCount == 0;
            });
            that.data.hallCarts.splice(0);
            that.setData({
              hallCount: 0
            });
          }
          that.calculatorCounts();
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },
  hasCard: function (e) {
    var type = e.target.dataset.type;
    // console.log(e.target.dataset.type);
    var that = this;
    if (type == 0) {
      if (that.data.hallCount == 0) {
        wx.showToast({
          title: '你还没点餐,请点餐',
          icon: 'success',
          duration: 2000
        })
      } else {
        
          wx.navigateTo({
            url: '/pages/canteen/order/order?consumerId=' + that.data.consumerId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
            success: function (res) {
              // console.log('跳到订单页面');
            }
          })
      }
    } else if (type == 2) {

      if (that.data.takeawayCount == 0) {
        wx.showToast({
          title: '还没点餐,请点餐',
          icon: 'success',
          duration: 2000
        })
      } else {
        if (that.data.deliveryAmount > that.data.takeawayAmount) {
          wx.showToast({
            title: '还未达到起送金额',
            icon: 'success',
            duration: 2000
          })
        } else {
          if (app.globalData.resDetailData && app.globalData.resDetailData!="undefind"){
            wx.navigateTo({
              url: '/pages/waimai/order/order',
              success: function (res) {
                // console.log('跳到订单页面');
              }
            })
          }else{
            var url = app.globalData.serverAddress + 'microcode/getMemberCardList';
            var data = { openId: app.globalData.openId };
            appUtil.httpRequest(url, data, function (rsp) {
              if (rsp.returnStatus) {
                app.globalData.resDetailData = rsp.value;
                wx.navigateTo({
                  url: '/pages/waimai/order/order',
                  success: function (res) {
                    // console.log('跳到订单页面');
                  }
                })
              }
            })
          }
        }
      }
    }
  },
  chooseSpec: function (e) {
    var that = this;
    that.setData({
      userCellId: 0,//规格
      userCell0: 0,//做法
      userCell1: 0,
      userCell2: 0,
      practicesCode: []
    });
    var foodcode = e.currentTarget.dataset.arr.foodCode
    // console.log('弹出规格');
    // console.log(e);
    
    var data = {
      resId: that.data.resId,
      foodCode: foodcode
    };
    //var init = util.initPay(data);
    var url = app.globalData.serverAddress + "foodRule/getFoodRuleList";
    appUtil.httpGet(url, data, function (rsp) {//规格
      // console.log('规格菜');
      // console.log(rsp);
      if (rsp.returnStatus) {
        that.setData({
          moduleActiveMe: 'moduleActiveMe',
          standard: rsp.value,
          guigeFood: e.currentTarget.dataset.arr,
          pickType: e.currentTarget.dataset.key,
        });
        if (rsp.value.length > 1) {
          that.setData({
            ruleCode: rsp.value[0].ruleCode
          });
        } else {
          that.setData({
            ruleCode: ""
          });
        }
      }
    });
    var practiceVal = [];
    var url = app.globalData.serverAddress + "foodPractices/getFoodPracticesList";
    var data = {
      resId: that.data.resId,
      foodCode: foodcode
    };
    // console.log(data);
    appUtil.httpGet(url, data, function (rsp) {//口味
      // console.log('做法');
      // console.log(rsp);
      if (rsp.returnStatus) {
        rsp.value.forEach(function (val, key) {
          if (val.foodPracticesList) {
            practiceVal.push(val);
            that.data.practicesCode.push(val.foodPracticesList[0].practicesCode);//默认第一个为选中的做法
            that.setData({
              practiceVal: practiceVal,
              practicesCode: that.data.practicesCode//默认做法
            });
          } else {
            // console.log('没有做法');
            // that.setData({
            //   practiceVal: [],
            //   practicesCode: []
            // });
          }
        });
      }
    });
  },
  isguiGe: function (e) {
    var that = this;
    //console.log(e);
    that.data.guigeFood.price = e.target.dataset.item.price;
    that.data.guigeFood.guigeName = e.target.dataset.item.name;
    that.data.guigeFood.status = e.target.dataset.item.status;
    that.data.guigeFood.foodRuleMemberPrice = e.target.dataset.item.foodRuleMemberPrice;
    //var p = e.target.dataset.item.price;
    //console.log(p);
    that.setData({
      userCellId: e.target.dataset.index,
      ruleCode: e.target.dataset.item.ruleCode,
      guigeFood: that.data.guigeFood//默认规格
    })
  },
  tagChoose: function (e) {//做法选择
    var that = this
    // console.log(e);
    var practies = e.target.dataset.practies;
    var practicesCode = that.data.practicesCode;
    if (e.currentTarget.dataset.number == 0) {
      that.setData({
        userCell0: e.target.dataset.index
      });
      if (practicesCode[0]) {
        practicesCode[0] = practies;
      }
    } else if (e.currentTarget.dataset.number == 1) {
      that.setData({
        userCell1: e.target.dataset.index
      });
      if (practicesCode[1]) {
        practicesCode[1] = practies;
      }
    } else if (e.currentTarget.dataset.number == 2) {
      that.setData({
        userCell2: e.target.dataset.index
      });
      if (practicesCode[2]) {
        practicesCode[2] = practies;
      }
    } else if (e.currentTarget.dataset.number == 3) {
      that.setData({
        userCell3: e.target.dataset.index
      });
      if (practicesCode[3]) {
        practicesCode[3] = practies;
      }
    }
    practicesCode = that.arrayRemove(practicesCode);//去重
    that.setData({
      practicesCode: practicesCode
    })
  },
  arrayRemove: function (that) {
    var h = {};    //定义一个hash表  
    var arr = [];  //定义一个临时数组  
    for (var i = 0; i < that.length; i++) {    //循环遍历当前数组  
      if (!h[that[i]]) {
        //存入hash表  
        h[that[i]] = true;
        //把当前数组元素存入到临时数组中  
        arr.push(that[i]);
      }
    }
    return arr;
  },
  confirm: function (e) {
    var that = this;
    that.setData({
      moduleActiveMe: ''
    });
    that.addToCarts(e);
    // console.log('添加购物车');
  },
  clickClose: function () {
    var that = this;
    that.setData({
      moduleActiveMe: ''
    });
  },
  noPlus:function(){
    wx.showToast({
      title: '当前处于歇业状态',
      icon: 'success',
      duration: 800
    })
  },
  onShareAppMessage: function () {//分享页面
    var that = this;
    return {
      title: 'V卡汇',
      path: '/pages/init/init?resId=' + that.data.resId,
      success: function (res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '分享失败',
          icon: 'success',
          duration: 2000
        })
      }
    }
  }
})
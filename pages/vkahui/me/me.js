var appUtil = require('../../../utils/appUtil.js');
var app = getApp();
Page({
  data: {
    wxInfo: {},
    meInfo: {},
    userInfo: {
      memberCardCount: 0,
      memberIntegral: 0,
      memberCouponCount: 0
    },
    shouye: true,
    dingdan: false,
    wo: true
  },
  onLoad: function (options) {
    var that = this;
    that.setData({ wxInfo: app.globalData.userInfo });
    var url = app.globalData.serverAddress + "microcode/getMemberCardList";
    var data = {
      openId: app.globalData.openId
    };
    // console.log(data);
    appUtil.httpRequest(url, data, function (rsp) {
      // console.log(rsp.value);
      if (rsp.returnStatus) {
        that.setData({memberCardCount:rsp.value.length});
      }
    });
  },
  tab: function (e) {
    var that = this;
    console.log('tab-me');
    var id = e.currentTarget.dataset.id;
    // console.log(id);
    if (id == "shouye") {
      wx.redirectTo({
        url: '/pages/init/init',
      })
    } else if (id == "dingdan") {
      wx.redirectTo({
        url: '/pages/order/index/index',
      })
    }
  }
})
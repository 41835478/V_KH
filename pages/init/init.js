var appUtil = require('../../utils/appUtil.js');
var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    module: '',
    shouye: false,
    dingdan: false,
    wo: false
  },
  onLoad: function (options) {
    //options = {};
     //options.resId = "000000005673d86e015677bbc51d0102";//简约派id
     //options.tableCode = "1c0302581b104623848d1e0acaddcc4f";
     //options.tableName = "A1";
    //options.resId = "0000000055dd15670155ddd056ef0121";//洪记01id
    //options.tableCode = "7cd5d5c6a57643ae9a9fb87a514c3ce9";
    //options.tableName = "A1";
    var that = this;
    var rid,flag = false;
    if (options.q) {
      flag = true;
      console.log("1--------------" + flag)
      var src = decodeURIComponent(options.q);
      var rid = src.match(/id=(\S*)/)[1];
      
    }else{
      app.globalData.tableCode = options.tableCode;
      app.globalData.tableName = options.tableName;
      that.setData(options);
    }
    wx.login({
      success: function (res) {
        console.log("1--------------"+res.code)
        if (res.code) {
          var url = app.globalData.serverAddress + "microcode/getOpenId";
          var data = { jsCode: res.code };
          appUtil.httpRequest(url, data, function (rsp) {
            console.log("2------------"+rsp.returnStatus);
            if (rsp.returnStatus) {
              var openId = rsp.value.openId;
              var token = rsp.value.token;
              //var openId = "oEewJ0Ug0Wfd0CCC1iL1mRq6_2kg";
              app.globalData.openId = openId;
              app.globalData.token = token;
              that.loadCardList();
              wx.getUserInfo({
                success: function (res) {
                  console.log("2------------成功");
                  var data;
                  var userInfo = res.userInfo;
                  app.globalData.userInfo = userInfo;
                  var meLogo = userInfo.avatarUrl;
                  var nickName = userInfo.nickName
                  app.globalData.meLogo = meLogo;//报存用户头像及昵称
                  app.globalData.nickName = nickName;
                  //
                  console.log("3----------" + rid);
                  if (flag) {
                    data = { id: rid };
                    var url = app.globalData.serverAddress + "/qrtable/getQRcodeTable";
                    appUtil.httpRequest(url, data, function (rspa) {
                      if (rspa.returnStatus) {
                        console.log("8----------" + rspa.value.tableCode);
                        data.resId = rspa.value.resId;
                        that.setData({type:rspa.value.type, resId: rspa.value.resId, tableName: rspa.value.tableName, tableCode: rspa.value.tableCode});
                        app.globalData.tableCode = rspa.value.tableCode;
                        app.globalData.tableName = rspa.value.tableName;
                        console.log("6----------" +that.data.resId);
                      }
                    })
                  }
                  
                  //检查是否首次登录
                  var url = app.globalData.serverAddress + "microcode/checkIsFirstUse";
                  var times = setInterval(function(){
                    data = {
                      openId: app.globalData.openId,
                      nikeName: userInfo.nickName,
                      sex: userInfo.gender,
                      headImgUrl: userInfo.avatarUrl,
                      resId: that.data.resId
                    };
                    if (!that.data.resId) return;
                    appUtil.httpRequest(url, data, function (rsp) {
                      clearTimeout(times);
                      // console.log(rsp);
                      if (rsp.returnStatus) {//首次登录
                        that.setData({
                          module: 'moduleActive'
                        });
                      } else {//不是首次登陆(扫码进来，直接跳转到点餐业)
                        //that.uploadWechatUser(options);
                        // if (that.data.resId) {
                        //   wx.navigateTo({
                        //     url: "/pages/canteen/index/index?resId=" + that.data.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                        //   })
                        // }
                        console.log("5-----------over"+that.data.type);
                        if (that.data.resId && that.data.type==0) {
                          console.log("6------------成功" + that.data.tableCode);
                          wx.navigateTo({
                            url: "/pages/canteen/index/index?resId=" + that.data.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                          })
                        } else if(that.data.resId && that.data.type == 1){
                          wx.navigateTo({
                            url: "/pages/canteen/index/index?resId=" + that.data.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName + "&currentTab=2",
                          })
                        }
                      }
                    });
                  },1000)
                  
                  
                }
              });
            } else {
              // console.log(rsp.message);
              console.log("7-------------");
            }
          });
        } else {
          //进入获取用户信息失败页面
        } 
      }
    });
  },
  uploadWechatUser: function (options) {
    var that = this;
    var url = app.globalData.serverAddress + "microcode/bindMemberCard";
    var data = { 
      openId: app.globalData.openId,
      resId: options.resId,
      type: 0
    };
    appUtil.httpRequest(url, data, function (rsp) {
      // console.log(rsp);
      that.loadCardList();
      if (rsp.returnStatus) { }
    });
  },
  loadCardList: function () {
    var that = this;
    var url = app.globalData.serverAddress + 'microcode/getMemberCardList';
    var data = { openId: app.globalData.openId };
    appUtil.httpRequest(url, data, function (rsp) {
      console.log("5---------" + rsp.returnStatus + "+++++" + app.globalData.openId)
      if (rsp.returnStatus) {
        app.globalData.resDetailData = rsp.value;
       // var memberBlance = parseFloat(rsp.value.memberBalance).toFixed(2);
        var vkahuiData = rsp.value;
        //折扣百分比转化 
        vkahuiData.forEach(function (val, key) {
          //百分比
          if (val.memberTypeDiscount == undefined || val.memberTypeDiscount == 0 || val.memberTypeDiscount == null) {
            vkahuiData[key].memberTypeDiscount = 0;
          } else {
            vkahuiData[key].memberTypeDiscount = val.memberTypeDiscount / 10;
          }
          vkahuiData[key].memberBalance = parseFloat(vkahuiData[key].memberBalance).toFixed(2);
          //店铺Logo
          val.resLogo = app.globalData.serverAddressImg + val.resLogo;
          const ctx = wx.createCanvasContext(vkahuiData[key].resId);
          var i = 0;
          while (i < 375) {
            ctx.arc(6 + i, 5, 3, 0, 2 * Math.PI);
            ctx.setFillStyle('#ffffff');
            ctx.fill();
            i += 14;
          }
          ctx.draw();
          console.log("7--------------");
          if (val.resId == that.data.resId) {
            console.log('带餐厅的ID进来');
            val.tableCode = app.globalData.tableCode;
            val.tableName = app.globalData.tableName;
          }
        });
        that.setData({
          vkahuiData: vkahuiData
        });
      } else {
        that.setData({
          vkahuiData: []
        });
      }
    });
  },
  onShow: function () {
    if (!this.data.hasHide) return;
    this.setData({ hasHide: false });
    if (app.globalData.isBindPhone){
      this.setData({
        module: 'module'
      });
    }
    this.loadCardList();
  },
  onHide: function () {
    this.setData({ hasHide: true });
  },
  tab: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    if (id == "dingdan") {
      that.setData({
        shouye: true,
        dingdan: true,
        wo: false
      });
      wx.redirectTo({
        url: '/pages/order/index/index',
      });
    } else if (id == "wo") {
      that.setData({
        shouye: true,
        dingdan: false,
        wo: true
      });
      wx.redirectTo({
        url: '/pages/vkahui/me/me',
      });
    }
  },
  //提示绑定手机部分
  module: function (res) {
    var that = this;
    // console.log(res);
    that.setData({
      module: 'moduleActive'
    });
  },
  close: function (res) {//点击直接使用，跳转到点餐业
    var that = this;
    var options = that.data;
   // that.uploadWechatUser(options);
    that.loadCardList();
    that.setData({
      module: ''
    });
    if (that.data.resId) {
      wx.navigateTo({
        url: "/pages/canteen/index/index?resId=" + that.data.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
      })
    }
  },
  phone: function () {
    var that = this;
    var options = that.data;
    wx.navigateTo({
      url: "/pages/vkahui/phone-add/phone-add?resId=" + options.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
      success: function (res) {
        // console.log('跳转到绑定手机页面')
      }
    })
  },
  onShareAppMessage: function () {//分享页面
    return {
      title: 'V卡汇',
      path: '/pages/init/init?resId=' + "000000005673d86e015677bbc51d0102",//简约派id
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
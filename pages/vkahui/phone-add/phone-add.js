var utilMd5 = require('../../../utils/md5.js');
var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    clock: '',
  },
  onLoad: function (options) {
    var that = this;
    console.log(options);
    that.setData(options);
  },
  formSubmit: function (e) {
    var that = this;
    var mobile = e.detail.value.mobile;
    if (!(/^1[34578]\d{9}$/.test(mobile))) {
      that.setData({ phone: true })
      return;
    } else {
      that.setData({ phone: false })
    }
    var data = { "mobile": mobile, msgTemp: "SMS_DEFAULT_CONTENT" };
    //var init = util.initPay(data);
    var url = app.globalData.serverAddress + "sms/getSmsCode";
    
    appUtil.httpGet(url, data, function (rsp) {
      console.log(rsp);
      that.setData({ cookies: rsp.value });
      if (rsp.returnStatus) {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 2000
        });
        var total_micro_second = 60 * 1000;
        that.time(total_micro_second);
      } else {
        wx.showToast({
          title: "网络异常,请稍后重试",
          duration: 2000
        });
      }
    });
  },
  time: function (total_micro_second) {
    var that = this;
    // 渲染倒计时时钟
    that.setData({
      clock: that.date_format(total_micro_second)
    });

    if (total_micro_second <= 0) {
      that.setData({
        clock: ""
      });
      return;
    }
    setTimeout(function () {
      // 放在最后--
      total_micro_second -= 10;
      that.time(total_micro_second);
    }, 10)
  },
  date_format: function (micro_second) {
    var that = this;
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = Math.floor(second / 3600);
    // 分钟位
    var min = that.zero(Math.floor((second - hr * 3600) / 60));
    // 秒位
    var sec = that.zero((second - hr * 3600 - min * 60));// 

    return sec;
  },
  zero: function (num) {// 位数不足补零
    return num < 10 ? "0" + num : num
  },
  queSubmit: function (e) {
    var that = this;

    var url = app.globalData.serverAddress + "microcode/checkIsFirstUse";
    var data = {
      openId: app.globalData.openId,
      resId: app.globalData.resId
    };
    appUtil.httpRequest(url, data, function (rsp) {
      if (!rsp.returnStatus) {//已绑定手机号
        wx.showToast({
          title: '已绑定手机号',
          duration: 2000
        });
        return;
      }else{
        var value = e.detail.value;
        var mobile = value.mobile;
        if (!mobile) {
          wx.showToast({
            title: '请输入手机号码',
            duration: 2000
          });
          return;
        }
        var code = value.code;
        // console.log(code);
        if (!code) {
          that.setData({ yanzhengma: true });
          return;
        } else {
          that.setData({ yanzhengma: false })
        }
        //var url = app.globalData.serverAddress + "microcode/bindWechatUser";
        var data = { "openId": app.globalData.openId, type: 1, "mobile": mobile, "code": code, "resId": that.data.resId };
        // var data = { "openId": "oEewJ0bK9-TZHG21YXkVlaP_oaAw", type: 1, "mobile": mobile, "code": code, "resId": "0000000055dd15670155ddd056ef0121" };
        //var init = util.initPay(data);
        var url = app.globalData.serverAddress + "microcode/bindWechatUser";
        // console.log(data);
        appUtil.httpRequest(url, data, function (rsp) {
          // console.log(rsp)
          if (rsp.returnStatus) {
            app.globalData.isBindPhone = true;
            wx.showToast({
              title: '完成绑定',
              duration: 2000,
              success: function () {
                app.globalData.bindPhonenumber = true;
                wx.redirectTo({
                  url: "/pages/canteen/index/index?resId=" + that.data.resId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                })
              }
            });
          } else {
            wx.showToast({
              title: rsp.message,
              duration: 2000
            });
          }
        });
      }
    });
    
  }
})
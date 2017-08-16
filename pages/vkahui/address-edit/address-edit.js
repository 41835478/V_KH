var appUtil = require('../../../utils/appUtil.js');
var dateUtil = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {},
  formSubmit: function (e) {
    var that = this;
    that.setData({
      address: e.detail.value,
      detail: e.detail.value.address_detail
    });
    var address = {
      openId: app.globalData.openId,
      nikeName: that.data.address.username,
      sex: that.data.address.radio,
      mobile: that.data.address.phone_number,
      address: that.data.address.address
    }
    // console.log('添加收货地址');
    // console.log(address);
    if (that.data.gaiAddress) {//修改地址
      var data = {
        name: that.data.address.username,
        sex: that.data.address.radio,
        mobile: that.data.address.phone_number,
        address: that.data.address.address,
        id: that.data.id
      }
      if (data.name == "") {
        wx.showToast({
          title: "姓名不能为空",
          icon: 'success',
          duration: 2000
        })
      } else {
        if (!(/^1[34578]\d{9}$/.test(data.mobile))) {
          wx.showToast({
            title: "输入的手机号码格式有误，请重新输入",
            icon: 'success',
            duration: 2000
          })
        } else {
          if (data.address == "") {
            wx.showToast({
              title: "地址不能为空",
              icon: 'success',
              duration: 2000
            })
          } else {
            var url = app.globalData.serverAddress + 'consigneeAddress/updateConsigneeAddress';//修改收货地址
            appUtil.httpRequest(url, data, function (rsp) {
              if (rsp.returnStatus) {
                wx.showToast({
                  title: "修改收获地址成功",
                  icon: 'success',
                  duration: 2000,
                  success: function () {
                    // console.log("111111111111111111111111111111111111");
                    if (that.data.isWaimai != undefined) {
                      var addressId = that.data.id;
                      var url = app.globalData.serverAddress + 'microcode/setDefaultAddress';
                      var data = { openId: app.globalData.openId, addressId: addressId };
                      appUtil.httpRequest(url, data, function (rsp) {
                        // console.log(rsp);
                        if (rsp.returnStatus) {
                          wx.navigateBack({delta:1});
                        } else {

                        }
                      });
                    } else {
                      wx.redirectTo({
                        url: "../address/address",
                      })
                    }
                  }
                })
              }
            });
          }
        }
      }
    } else {//增加收货地址
      if (address.nikeName == "") {
        wx.showToast({
          title: "姓名不能为空",
          icon: 'success',
          duration: 2000
        })
      } else {
        if (!(/^1[34578]\d{9}$/.test(address.mobile))) {
          wx.showToast({
            title: "输入的手机号码格式有误，请重新输入",
            icon: 'success',
            duration: 2000
          })
        } else {
          if (address.address == "") {
            wx.showToast({
              title: "地址不能为空",
              icon: 'success',
              duration: 2000
            })
          } else {
            var url = app.globalData.serverAddress + 'microcode/addAddress';
            appUtil.httpRequest(url, address, function (rsp) {
              if (rsp.returnStatus) {
                wx.showToast({
                  title: "添加收获地址成功",
                  icon: 'success',
                  duration: 2000,
                  success: function () {
                    if (that.data.isWaimai) {
                      var addressId = rsp.value;
                      var url = app.globalData.serverAddress + 'microcode/setDefaultAddress';
                      var data = { openId: app.globalData.openId, addressId: addressId };
                      appUtil.httpRequest(url, data, function (rsp) {
                        if (rsp.returnStatus) {
                          wx.redirectTo({
                            url: '/pages/waimai/order/order',
                          })
                        } else {

                        }
                      });


                    } else {
                      wx.redirectTo({
                        url: "../address/address",
                      })
                    }
                  }
                })
              }
            });
          }
        }
      }
    }
  },
  onLoad: function (options) {
    var that = this;
    that.setData(options);
    // console.log("xiugai");
    that.setData({ isWaimai: options.isWaimai });
    // console.log(options);
    if (that.data.gaiAddress) {
      that.setData({
        username: that.data.name,
        sex: that.data.sex,
        phone_number: that.data.mobile,
        addRess: that.data.address,
      });
      if (that.data.sex == 1) {
        that.setData({ check: true });
      }
    }
  }
})
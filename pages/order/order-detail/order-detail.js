var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        module: ''
    },
    onLoad: function (options) {
        var that = this;
        // console.log(options);
        that.setData(options);
        // 获取店铺信息
        var url = app.globalData.serverAddress + 'microcode/getResDetail';
        var data = { resId: that.data.resId };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            if (rsp.returnStatus) {
                that.setData({ res: rsp.value });
            } else {
                wx.showToast({
                    title: "网络异常,请稍后重试",
                    duration: 2000
                });
            }
        });
        that.loadData();
        that.setData({
            redirectUrl: util.requestUrlMerge("/pages/order/order-pay/order-pay", options),
            serverAddressImg: app.globalData.serverAddressImg
        });
    },
    loadData: function () {
        var that = this;
        var url = app.globalData.serverAddress + "microcode/getOrderDetail";
        var data = { resId: that.data.resId, consumerId: that.data.consumerId };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            if (rsp.returnStatus) {
                that.setData({ orderDetailData: rsp.value });
                
            } else {
                wx.showToast({
                    title: "网络异常,请稍后重试",
                    duration: 2000
                });
            }
        });
    },
    isFirst: function () {
        var that = this;
        var url = app.globalData.serverAddress + 'microcode/checkOrderHasWaiConfirm';
        var data = { consumerId: that.data.consumerId };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            if (rsp.returnStatus) {
                wx.redirectTo({
                    url: that.data.redirectUrl,
                    success: function (res) {
                        // console.log('堂食去支付');
                    }
                })
            } else {
                wx.showToast({
                    title: "网络异常,请稍后重试",
                    duration: 2000
                });
            }
        });
    },
    module: function (res) {
        var that = this;
        // console.log(res);
        var moduleActive = res.currentTarget.dataset.moduleActive;
        if (moduleActive == 'moduleActive') {
            that.setData({
                module: ''
            });
        } else {
            that.setData({
                module: 'moduleActive'
            });
        }
    },
    close: function (res) {
        var that = this;
        // console.log('关闭弹窗');
        // console.log(res);
        that.setData({
            module: ''
        });
        // console.log(that.data.module);
    }
})
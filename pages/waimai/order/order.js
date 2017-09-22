//获取应用实例
var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp()
Page({
    data: {
        peisong: 0,
        canhe: 0,
        DefaultAddress: false,
        note: ""
    },
    onLoad: function (options) {
        var that = this;
        that.setData({
            consumerData: app.globalData.takeawayCarts,
            amount: app.globalData.takeawayAmount,
            count: app.globalData.takeawayCount
        });

        var url = app.globalData.serverAddress + "microcode/loadDefaultAddress";//获取默认收获地址
        var data = {openId: app.globalData.openId};
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            if (rsp.returnStatus) {//有默认地址
                that.setData({
                    loadDefault: rsp.value
                });
                // console.log(that.data.loadDefault);
            } else {//没有默认地址
                that.setData({
                    DefaultAddress: true,
                });
            }
        });
        // console.log(that.data.consumerData);
        app.globalData.resDetailData.forEach(function (val, key) {
            if (val.resId == app.globalData.resId) {
                that.setData({discount: val.memberTypeDiscount})
            }
        });
        if (that.data.discount == null || that.data.discount == undefined || that.data.discount == '无') {
            that.setData({discount: 0});
        }


        // console.log(that.data.discount);
        //查询餐厅服务费
        var url = app.globalData.serverAddress + "microcode/getResDetail";
        var data = {resId: app.globalData.resId};
        appUtil.httpRequest(url, data, function (rsp) {
            if (rsp.returnStatus) {
                // console.log(rsp);
                var waimai = rsp.value.takeoutBusinessRules;
                if (waimai.distributionCostType == 0) {//为0时配送费为0
                    that.setData({
                        peisong: 0
                    });
                } else {
                    if (waimai.fullFreeAmount) {
                        if (that.data.amount >= waimai.fullFreeAmount) {
                            that.setData({
                                peisong: 0
                            });
                        } else {
                            that.setData({
                                peisong: waimai.distributionFee
                            });
                        }
                    } else {
                        that.setData({
                            peisong: waimai.distributionFee
                        });
                    }

                }

                function money(num) {
                    return parseFloat(num).toFixed(2);
                }

                //计算总价
                var newAmout = 0;
                var consumerArr = that.data.consumerData;
                for (let val of consumerArr) {
                    val.singleProductTotal = parseFloat(val.price * val.foodCount).toFixed(2);
                    if (val.isdiscount == 0) {
                        newAmout += val.price * val.foodCount;
                    } else if (val.isdiscount == 1) {
                        if (parseFloat(that.data.discount) == 0) {
                            newAmout += val.price * val.foodCount;
                        } else {
                            newAmout += val.price * val.foodCount * (that.data.discount / 10);
                        }

                    } else {
                        app.globalData.resDetailData.forEach(function (ival, ikey) {
                            if (ival.resId == app.globalData.resId) {
                                if (ival.memberType && ival.memberType != "undefind") {
                                    val.foodRuleMemberPrice.forEach(function (jval, jkey) {
                                        if (ival.memberType == jval.memberType) {
                                            newAmout += jval.memberPrice * val.foodCount;
                                        }
                                    })
                                } else {
                                    newAmout += val.price * val.foodCount;
                                }
                            }
                        })
                    }
                    that.setData({newAmout: newAmout})
                }
                let packingCharge = money(waimai.packingCharge) || 0,
                    peisong = money(that.data.peisong) || 0,
                    _amount = money(that.data.amount) || 0;
                newAmout = money(that.data.newAmout) || 0;
                that.setData({
                    consumerData: consumerArr,
                    canhe: packingCharge,
                    zongjine: money(newAmout + peisong + packingCharge),
                    youhui: parseFloat(_amount - newAmout).toFixed(2),

                });
            } else {
                console.log('店铺详情模块失败');
            }
        })
    },
    bindChange: function (e) {
        var that = this;
        that.setData({note: e.detail.value})
        //inputContent[e.currentTarget.id] = e.detail.value;
    },
    submitOrder: function (res) {
        var that = this;
        var url = app.globalData.serverAddress + "microcode/commitOrder";
        var data = {
            resId: app.globalData.resId,
            openId: app.globalData.openId,
            type: "2",//"0堂食1快餐2外卖
            //fNumber: that.data.diningNumber,
            addressId: that.data.loadDefault.id,
            orderFoodVosJson: JSON.stringify(that.data.consumerData),
            distributionFee: that.data.peisong,
            packingCharge: that.data.canhe,
            note: that.data.note
        };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            var consumerId = rsp.value.id;
            wx.redirectTo({
                url: "/pages/order/order-pay/order-pay?consumerId=" + consumerId + "&resId=" + app.globalData.resId,
                success: function (res) {
                    // console.log('跳转到支付页面');
                }
            })
        })

    }
})

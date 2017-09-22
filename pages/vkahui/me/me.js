var appUtil = require('../../../utils/appUtil.js');
const apiService = require('../../../utils/ApiService');
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
        that.setData({
            wxInfo: app.globalData.userInfo,
            resId: app.globalData.resId,
            tableCode: app.globalData.tableCode,
            tableName: app.globalData.tableName
        });
        that.setData({
            isBindMobile: app.globalData.isBindMobile
        });
        // console.log(data);
        apiService.getMemberCardList({openId: app.globalData.openId}, function (rsp) {
            // console.log(rsp.value);
            if (rsp.returnStatus) {
                that.setData({memberCardCount: rsp.value.length});
            }
        });
    },
    onShow(){
        app.checkBindMobile({openId: app.globalData.openId});
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
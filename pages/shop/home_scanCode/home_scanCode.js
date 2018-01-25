const app = getApp(),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');

const appPage = {
    data: {
        resId: '',
        JumpUrl: '',
        options: {},
        orderType: 3,
    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        let that = this;
        try {
            if (options) {
                Object.assign(that.data.options, options);
                console.warn(`初始化${that.data.text}`, options);
            } else {
                throw {message: '初始化options为空'};
            }
        } catch (e) {
            console.warn(e, options);
        }
        that.loadCb();
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options;
        that.data.resId = options.resId;
        that.data.orderType = Number(options.orderType) || 3;
        that.data.objId = app.globalData.objId;
    },
    /**
     * 扫一扫
     */
    bindScanCode() {
        let that = this,
            resId = that.data.resId,
            orderType = that.data.orderType,
            objId = that.data.objId;
        wx.scanCode({
            success: (data) => {
                let QR_codeTable = that.utilPage_isQRcode(data.result, resId);
                QR_codeTable.then(
                    (res) => {
                        if (res.status && utilCommon.isEmptyValue(res.value)) {
                            ApiService.checkHasWaitPayConsumer({
                                objId,
                                tableCode: res.value.tableCode,
                                resId
                            }, (rsp) => {
                                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                    util.go('/pages/order/order-detail/order-detail', {
                                        type: 'blank',
                                        data: {
                                            resId,
                                            tableCode: res.value.tableCode,
                                            consumerId: rsp.value.consumerId
                                        }
                                    });
                                } else if (2001 === rsp.code) {
                                    util.go('/pages/shop/order/order', {
                                        type: 'blank',
                                        data: {
                                            orderType,
                                            resId,
                                            tableCode: res.value.tableCode,
                                            tableName: res.value.tableName,
                                        }
                                    })
                                } else {
                                    util.failToast(rsp.message)
                                }
                            });
                        } else {
                            that.showToast(res.message);
                        }
                    },
                    (res) => {
                        that.showToast(res.message);
                    })
            }
        })
    },
    /**
     * 返回
     */
    bindGoBack() {
        util.go(-1);
    }
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, {
    utilPage_isQRcode: app.utilPage.utilPage_isQRcode,//获取二维码桌台
}));
var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
const apiService = require('../../../utils/ApiService'),
    queryString = require('../../../utils/queryString'),
    utilCommon = require('../../../utils/utilCommon'),
    app = getApp();
Page({
    data: {
        module: '',
        addDishUrl: '',//加菜按钮地址
        redirectUrl: '',//支付按钮地址
        serverAddressImg: app.globalData.serverAddressImg,
        progressBar: [
            {
                name: '待支付',
                status: true,
            },
            {
                name: '等待商家确认',
                status: false,
            }
        ],//进度条
        orderStatusName: ''
    },
    onLoad: function (options) {
        var that = this;
        console.log('options.status__________________', options.status);
        options.status = Number(options.status) || 3;
        that.setData(options);
        if (options.resId && options.resId.length > 0) {
            // 获取店铺信息
            apiService.getResDetail({resId: options.resId}, function (rsp) {
                that.setData({res: rsp.value});
            });
            that.loadData();
            that.setData({
                redirectUrl: "/pages/order/order-pay/order-pay?" + queryString.stringify(options)
            });
        }
    },
    loadData: function () {
        var that = this;
        apiService.getOrderDetail({resId: that.data.resId, consumerId: that.data.consumerId}, function (rsp) {
            let orderDetailData = rsp.value,
                stringify = queryString.stringify({
                    resId: that.data.resId,
                    consumerId: orderDetailData.consumerId,
                    tableCode: that.data.tableCode,
                    fNumber: orderDetailData.fNumber || 1,
                    tableName: orderDetailData.title
                });
            orderDetailData.status = that.data.status || orderDetailData.status;
            orderDetailData.mealNumber = orderDetailData.consumerNo.substring(orderDetailData.consumerNo.length - 5);
            that.setProgressBar(orderDetailData);
            let addDishUrl = '/pages/shop/order/order?' + stringify;
            that.setData({orderDetailData, addDishUrl});
        });
    },
    /**
     * 设置精度条
     */
    setProgressBar(data) {
        if (!utilCommon.isNumberOfNaN(data.status)) {
            return;
        }
        let progressBar = [], orderStatusName = this.data.orderStatusName;
        switch (data.status) {
            case 3:
                orderStatusName = '待支付';
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '等待商家确认',
                        status: false
                    }
                ];
                break;
            case 5:
                orderStatusName = '已完成';
                if (Number(data.consumerType) === 1 || Number(data.consumerType) === 2) {
                    orderStatusName = '等待接单';
                }
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '等待商家确认',
                        status: true
                    }
                ];
                break;
            case 8:
                orderStatusName = '已取消';
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '等待商家确认',
                        status: false
                    }
                ];
                break;
            case 11:
                orderStatusName = '已接单';
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '等待商家确认',
                        status: true
                    },
                    {
                        name: '已接单',
                        status: true
                    }
                ];
                break;
            case 12:
                orderStatusName = '已拒单';
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '等待商家确认',
                        status: true
                    },
                    {
                        name: '已拒单',
                        status: true
                    }
                ];
                break;
        }
        this.setData({
            progressBar, orderStatusName
        });
    },
    isFirst: function () {
        var that = this;
        var url = app.globalData.serverAddress + 'microcode/checkOrderHasWaiConfirm';
        var data = {consumerId: that.data.consumerId};
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
});
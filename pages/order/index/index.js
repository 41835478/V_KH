const app = getApp(),
    util = require('../../../utils/util'),
    config = require('../../../utils/config'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        isShow: false,
        options: {},
        module: '',
        hasMoreData: false,
        imageServer: config.imageUrl,//图片服务器地址
        isFirst: true,
        isHide: false,
        orderList: [],
        shouye: true,
        dingdan: true,
        wo: false,

        pageNum: 1,
        pageSize: 10,
        shopInfoList: {},//店铺信息列表
        statusStr: app.globalData.statusStr,
        statusBtn: {
            3: [
                {
                    class: 'azm-btn-red',
                    name: '去支付',
                    jumpType: 'pay',
                    type: 100
                },
                {
                    class: '',
                    name: '去加菜',
                    jumpType: 'addDish',
                    type: 0
                }
            ],
            11: [
                {
                    class: '',
                    name: '再来一单',
                    jumpType: 'addDish',
                    type: 100
                }
            ]
        }
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
    onShow: function () {
        var that = this;
        if (that.data.isShow) {
            that.onPullDownRefresh();
        }
    },
    onReady: function () {
        // 页面渲染完成
        this.setData({
            isShow: true
        })
    },
    onHide: function () {
        var that = this;
        that.setData({
            isShow: true
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.data.pageNum = 1;
        this.loadData(function () {
            wx.stopPullDownRefresh();
        });
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.hasMoreData) {
            if (that.data.orderList[that.data.orderList.length - 1].length >= that.data.pageSize) {
                that.data.pageNum++;
            }
            that.loadData((bol) => {
                if (!bol) {
                    that.data.pageNum--;
                }
            });
        }
    }
};
const methods = {
    loadCb: function () {
        var that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
        );
    },
    loadData(cb) {
        let that = this,
            objId = that.data.objId,
            flag = false;
        ApiService.getOrderList(
            {
                objId,
                "pageNum": that.data.pageNum,
                "pageSize": that.data.pageSize
            },
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let orderList = rsp.value;
                    if (that.data.pageNum == 1) {
                        that.setData({[`orderList[0]`]: orderList});
                    } else {
                        that.setData({
                            [`orderList[${that.data.pageNum - 1}]`]: orderList
                        });
                    }
                    flag = true;
                }
            },
            () => {
                if (that.data.orderList.length < that.data.pageSize) {
                    that.setData({hasMoreData: true})
                } else {
                    that.setData({hasMoreData: false})
                }
                cb && cb(flag)
            }
        );
    },
    jumpBtn(e) {
        let that = this,
            type = e.currentTarget.dataset.type,
            orderType = e.currentTarget.dataset.ordertype,
            value = e.currentTarget.dataset.value;
        switch (type) {
            case 0:
                that.pay(value, orderType, type);
                break;
            case 1:
                that.addDish(value, orderType, type);
                break;
            case 2:
                that.addDish(value, orderType, type);
                break;
        }

    },
    /**
     * 去支付
     * @param e
     */
    pay: function (value) {
        util.go('/pages/order/order-detail/order-detail', {
            data: {
                resId: value.resId,
                consumerId: value.consumerId
            }
        });
    },
    /**
     * 加菜
     * @param e
     */
    addDish(value, orderType, type) {
        let that = this,
            isOrderType = 0,
            consumerId = value.consumerId;
        ApiService.getResDetail(
            {resId: value.resId, config: {isLoading: true}},
            (rsp) => {
                if (2000 == rsp.code && rsp.value && rsp.value.resId === value.resId) {
                    let resDetailDto = rsp.value;
                    if (orderType == 1) {
                        isOrderType = 1;
                    } else {
                        isOrderType = that.utilPage_getOrderType(resDetailDto.restaurantBusinessRules).isOrderType;
                    }
                    if (2 == type && 3 == isOrderType) {
                        util.go('/pages/shop/home_scanCode/home_scanCode', {
                            data: {
                                resId: value.resId,
                                orderType: isOrderType
                            }
                        });
                    } else {
                        util.go('/pages/shop/order/order', {
                            data: {
                                resId: value.resId,
                                orderType,
                                consumerId,
                                tableCode: value.tableCode,
                                tableName: value.Title,
                                fNumber: value.fNumber
                            }
                        });
                    }
                }
            },
        );
    },
    /**
     * 跳转订单详情
     * @param e
     */
    goOrderDetail(e) {
        let value = e.currentTarget.dataset.value;
        util.go('/pages/order/order-detail/order-detail', {
            data: {
                resId: value.resId,
                consumerId: value.consumerId,
                tableCode: value.tableCode,
                tableName: value.tableName
            }
        })
    }
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
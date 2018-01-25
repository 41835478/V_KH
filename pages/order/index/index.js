const app = getApp(),
    util = require('../../../utils/util'),
    config = require('../../../utils/config'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService'),
    {Tab} = require('../../../lib/zanui/index');
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
        tab: {
            list: [
                {
                    id: '1',
                    title: '堂食/外卖'
                },
                {
                    id: '2',
                    title: '预订'
                }
            ],
            selectedId: 1,
            height: 45
        },
        pageNum: 1,
        pageSize: 10,
        booking: {
            pageNum: 1,
            pageSize: 10,
            hasMoreData: false,
            list: []
        },
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
            this.setOnePageData();
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
        }, true);
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this,
            booking = that.data.booking,
            bookingList = booking.list,
            bookingSize = booking.pageSize,
            selectedId = +that.data.tab.selectedId,
            orderList = that.data.orderList,
            pageSize = that.data.pageSize;
        if (that.data.hasMoreData) {
            if (selectedId === 1 && orderList[orderList.length - 1].length >= pageSize)
                that.data.pageNum++;
            else if (selectedId === 2 && bookingList[bookingList.length - 1].length >= bookingSize)
                that.data.booking.pageNum++;
            that.loadData();
        }
    }
};
const methods = {
    loadCb: function () {
        var that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
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
    loadData(cb, bol) {
        let that = this,
            objId = that.data.objId,
            selectedId = that.data.tab.selectedId,
            arr = [],
            p = null;
        !bol && util.showLoading('加载中...');
        that.setData({
            orderLoading: true
        });
        if (selectedId == 1) {
            p = that.getOrderList();
        } else if (selectedId == 2) {
            p = that.getReserveList();
        } else {
            let p1 = that.getOrderList();
            let p2 = that.getReserveList();
            p = Promise.all([p1, p2])
        }
        p.finally(
            rsp => {
                !bol && wx.hideLoading();
                cb && cb();
            }
        )
    },
    getOrderList() {
        let that = this,
            objId = that.data.objId,
            data = {};
        const p = ApiService.getOrderList(
            {
                objId,
                pageNum: that.data.pageNum,
                pageSize: that.data.pageSize
            }
        ).then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let orderList = rsp.value;
                    if (that.data.pageNum == 1) {
                        that.setData({
                            [`orderList`]: [orderList]
                        });
                    } else {
                        that.setData({
                            [`orderList[${that.data.pageNum - 1}]`]: orderList
                        });
                    }
                } else {
                    that.data.pageNum--;
                }
            },
            rsp => {
                that.data.pageNum--;
            }
        );
        p.finally(
            () => {
                let orderList = that.data.orderList,
                    pageNum = that.data.pageNum,
                    pageSize = that.data.pageSize;
                data.orderLoading = false;
                data.NoOrder = false;
                if (orderList.length === 0 || (orderList.length === 1 && orderList[0].length === 0)) {
                    data.NoOrder = true
                } else if (orderList.length > 0 && orderList[pageNum - 1].length > 0 && orderList[pageNum - 1].length <= pageSize) {
                    data.hasMoreData = true;
                } else {
                    data.hasMoreData = false
                }
                that.setData(data)
            }
        );
        return p;
    },
    getReserveList() {
        let that = this,
            objId = that.data.objId,
            booking = that.data.booking,
            data = {};
        const p = ApiService.getReserveList({
            objId,
            "pageNum": booking.pageNum,
            "pageSize": booking.pageSize
        }).then(
            rsp => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let list = rsp.value;
                    if (booking.pageNum == 1) {
                        that.setData({
                            [`booking.list`]: [list]
                        });
                    } else {
                        that.setData({
                            [`booking.list[${booking.pageNum - 1}]`]: list
                        });
                    }
                }
            }
        );
        p.finally(
            () => {
                let booking = that.data.booking,
                    bookingList = booking.list,
                    pageNum = booking.pageNum,
                    pageSize = booking.pageSize;
                data.orderLoading = false;
                data.NoOrder = false;
                if (bookingList.length === 0 || (bookingList.length === 1 && bookingList[0].length === 0)) {
                    data.NoOrder = true
                } else if (bookingList.length > 0 && bookingList[pageNum - 1].length > 0 && bookingList[pageNum - 1].length <= pageSize) {
                    data.hasMoreData = true;
                } else {
                    data.hasMoreData = false
                }
                that.setData(data)
            }
        );
        return p
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
                if (2000 === rsp.code && rsp.value && rsp.value.resId === value.resId) {
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
    },
    /**
     * 跳转预订订单详情
     * @param e
     */
    goBookingOrder(e) {
        console.log(e);
        let value = e.currentTarget.dataset.value;
        util.go('/pages/order/bookingOrder/index', {
            data: {
                resId: value.resId,
                consumerId: value.id
            }
        })
    },
    setOnePageData(bol) {
        this.data.pageNum = 1;
        this.data.booking.pageNum = 1;
        this.loadData(null, bol);
    }
};
const events = {
    handleZanTabChange(e) {
        var componentId = e.componentId;
        var selectedId = e.selectedId;
        // wx.pageScrollTo({
        //     scrollTop: 0,
        //     duration: 300
        // });
        this.setData({
            [`${componentId}.selectedId`]: selectedId
        });
        this.setOnePageData(true);
    },
};
Object.assign(appPage, methods, events, Tab);
Page(Object.assign(appPage, app.utilPage));
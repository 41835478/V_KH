const app = getApp(),
    ApiService = require('../../../utils/ApiService'),
    util = require('../../../utils/util'),
    config = require('../../../utils/config'),
    utilCommon = require('../../../utils/utilCommon');

const ORDER_JSON = {
    "orderFoodList": [],
    "orderCreateTime": "",
    "name": "",
    "orderStatus": "",
    "id": ""
};

const appPage = {
    data: {
        text: 'Page bookingOrder',
        module: '',
        options: {},
        imageServer: config.imageUrl,
        orderType: 0,// 0：堂食 1：自助取餐 2：外卖 3餐后付款 4预订订单
        shopInfo: {},// 店铺信息
        currentDate: new Date(),// 订单刷新时间
        orderMealData: {},
        orderFoodShow: true,
        consumerData: {},// 订单信息
        status: null,// 0未处理，1已支付，2接受，3拒绝 ，4用户取消,5已完成(代表已开台)
        payDeposit: 0,// 支付定金 0 不支付 1支付
        business_rule_info: {},// 预订订单营业规则
        memberCardDto: null,// 会员卡信息
        isMemberCardDto: null,// 是否为会员
        paymentMethod: null,// 支付方式
        progressBar: [
            {
                name: '待支付',
                status: true
            },
            {
                name: '订单已关闭',
                status: false
            }
        ],// 进度条
        orderStatus: {
            name: '待支付',
            iconName: 'icon-time'
        },
        foodBtnList: [],
        Timer_1: null,
        statusStr: app.globalData.statusStr,
        isSubmitOrder: true,// 是否去支付
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        new app.ToastPannel();//初始自定义toast
        new app.PickerView();//初始自定义弹窗
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
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        // 页面渲染完成
        this.setData({
            isShow: true
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.warn(`${this.data.text}页面显示`);
        var that = this;
        if (that.data.isShow) {
            that.loadData();
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        console.warn(`${this.data.text}页面隐藏`);
        var that = this;
        that.setData({isHide: true});
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.warn(`${this.data.text}页面卸载`);
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.loadData({}, function () {
            wx.stopPullDownRefresh();
        }, true);
    },
    // /**
    //  * 页面相关事件处理函数--监听用户下拉动作
    //  */
    // onPullDownRefresh: function () {
    //
    // },
    //
    // /**
    //  * 页面上拉触底事件的处理函数
    //  */
    // onReachBottom: function () {
    //
    // },
    //
    // /**
    //  * 用户点击右上角分享
    //  */
    // onShareAppMessage: function () {
    //
    // }
};
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options,
            orderType = options.orderType,
            resId = options.resId,
            consumerId = options.consumerId,
            data = {resId, orderType, consumerId};
        options.status = 1;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    if (resId && resId.length > 0) {
                        // 获取店铺信息
                        ApiService.getResDetail(
                            {resId}
                        ).then(
                            (rsp) => {
                                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                    data.shopInfo = rsp.value;
                                }
                            }
                        ).finally(() => {
                            that.loadData(data);
                        });
                    } else {
                        that.showToast('店铺信息获取失败');
                        that.loadData(data);
                    }
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            }
        );
    },
    loadData(data = {}, cb, bol) {
        let that = this,
            resId = that.data.resId || data.resId,
            objId = that.data.objId,
            consumerId = that.data.consumerId || data.consumerId,
            flag = false;
        if (!bol) {
            util.showLoading('加载中...');
        }
        that.data.Timer_1 && clearTimeout(that.data.Timer_1);
        ApiService.getReserveDetail({id: consumerId}).then(
            (res) => {
                console.warn(1);
                if (2000 === res.code && utilCommon.isEmptyValue(res.value)) {
                    that.data.currentDate = new Date();
                    let consumerData = res.value,
                        timeOutPayReserve = null,//待支付 剩余时间
                        notProcessedReserve = null,//接拒单 超时剩余时间
                        preOrder = false;
                    data.consumerData = res.value;
                    if (consumerData.orderFoodList && consumerData.orderFoodList.length > 0) {
                        preOrder = true;
                        data[`orderMealData.preOrder`] = true;
                        data[`orderMealData.orderFood`] = consumerData.orderFoodList;
                    }
                    if (consumerData.reserveBusinessRules) {
                        timeOutPayReserve = consumerData.reserveDto.timeOutPayReserve;
                        notProcessedReserve = consumerData.reserveDto.notProcessedReserve;
                        data.business_rule_info = consumerData.reserveBusinessRules || {}
                    }
                    // status: 0,// 0未处理，1接受，2拒绝 ，3用户取消,4已完成(代表已开台)
                    // payDeposit: 0,// 支付定金 0 不支付 1 支付
                    if (consumerData.reserveDto) {
                        data.status = +consumerData.reserveDto.status;
                    }
                    if (0 === data.status && !consumerData.reserveLogList && preOrder) {
                        data.status = 101;//待支付
                    }
                    if (data.status === 101) {
                        flag = true;
                        if (timeOutPayReserve && timeOutPayReserve > 0) {
                            data.timeOutPayCountdown = new util.Countdown(that, {
                                time: timeOutPayReserve,
                                type: 'mm:ss',
                                text: 'timeOutPayCountdown',
                                onEnd() {
                                    that.loadData();
                                }
                            });
                        }
                        ApiService.checkMember(
                            {resId, objId}
                        ).then(
                            (rsp) => {
                                if (2000 === rsp.code && rsp.value && 1 === rsp.value.isBindMobile && rsp.value.member) {
                                    data.memberCardDto = rsp.value.member;
                                    if (data.memberCardDto && data.memberCardDto.availableBalance > 0) {
                                        data.isMemberCardDto = true
                                    }
                                } else {
                                    data.memberCardDto = {};
                                    data.isMemberCardDto = false
                                }
                            }
                        ).finally(() => {
                            flag = false;
                            loadDatafinally()
                        })
                    } else {
                        flag = false;
                        if (data.status === 0) {
                            if (notProcessedReserve && notProcessedReserve > 0) {
                                data.notProcessedCountdown = new util.Countdown(that, {
                                    time: notProcessedReserve,
                                    type: 'mm:ss',
                                    text: 'notProcessedCountdown',
                                    onEnd() {
                                        that.loadData();
                                    }
                                });
                            }
                        }

                    }
                } else {
                    data.status = 0;
                }
            }
        ).finally(loadDatafinally);

        function loadDatafinally() {
            if (!flag) {
                if (!bol) {
                    setTimeout(() => {
                        wx.hideLoading();
                    }, 1000)
                }
                cb && cb();
                that.setData(data);
            }
        }
    },
    /**
     * 会员卡支付
     * @param params
     */
    memberPay(params) {
        let that = this,
            memberCardDto = that.data.memberCardDto;
        util.go('/pages/order/member-pay/member-pay', {
            data: {
                amount: params.price,
                consumerId: params.consumerId,
                mobile: memberCardDto.mobile,
                resId: that.data.resId,
                orderType: 4
            }
        })
    },
    /**
     * 微信支付
     * @param params
     */
    weChatPay(params) {
        let that = this,
            objId = that.data.objId,
            orderNo = params.consumerId,
            orderMoney = parseInt(params.price * 100),
            subject = '微信预订点餐',// 商品名称
            body = '微信预订点餐',
            flag = false,
            consumerId = orderNo,
            resId = that.data.resId;
        ApiService.wxPayForReserve(
            {
                reserveId: orderNo, orderMoney, subject, body, objId, resId, config: {isLoading: true}
            }
        ).then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let value = rsp.value, wxPay = value.woi;
                    flag = true;
                    wx.requestPayment({
                        'timeStamp': wxPay.timestamp,
                        'nonceStr': wxPay.noncestr,
                        'package': 'prepay_id=' + wxPay.prepayid,//之前的
                        'signType': 'MD5',
                        'paySign': value.paySign,
                        'appid': wxPay.appid,
                        'total_fee': orderMoney,
                        objId,
                        success(res) {
                            that.finishPay();
                            util.showToast({
                                title: '微信支付成功',
                                success() {
                                    that.loadData()
                                }
                            });
                        },
                        fail(res) {
                            util.failToast({
                                title: '微信支付失败',
                                success() {
                                    that.loadData()
                                }
                            });
                        },
                        complete(res) {
                            if ('requestPayment:cancel' === res.errMsg) {
                                util.failToast({
                                    title: '微信支付已取消',
                                    success() {
                                        that.loadData()
                                    }
                                });
                            }
                        }
                    });
                }
            }).finally(
            () => {
                if (!flag) {
                    util.failToast({
                        title: '微信支付失败',
                        success() {
                            that.loadData()
                        }
                    });
                }
            }
        );
    },
    submitOrder(e) {
        console.log(e);
        let that = this,
            dataset = e.detail.target.dataset,
            formId = e.detail.formId,
            value = e.detail.value,
            paymentMethod = that.data.paymentMethod,
            business_rule_info = that.data.business_rule_info,
            consumerId = that.data.consumerId,
            type = dataset.type;
        if (type === 'confirm') {//支付定金
            if (paymentMethod === 'weChat') {
                that.weChatPay({
                    consumerId,
                    price: business_rule_info.depositAmount
                });
            } else if (paymentMethod === 'member') {
                that.memberPay({
                    consumerId,
                    price: business_rule_info.depositAmount
                });
            } else {
                that.showToast('请选择在线支付方式');
            }
        } else if (type === 'cancel') {//取消预约
            wx.showModal({
                title: '温馨提示',
                content: '是否取消当前预订订单',
                success: res => {
                    if (res.confirm) {
                        ApiService.updateReserve({
                            id: consumerId,
                            status: 3,
                            config: {
                                isLoading: true
                            }
                        }).then(
                            res => {

                            }
                        ).finally(
                            res => {
                                that.loadData();
                            }
                        )
                    }
                }
            });
        }
    }
};
const events = {
    bindTapHide() {
        this.setData({
            orderFoodShow: !this.data.orderFoodShow
        })
    },
    bindChange(e) {
        var dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = e.detail.value;
        this.setData({
            [`orderMealData.${componentId}`]: value
        });
    },
    bindRadioGroup(e) {
        console.log(e);
        let dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = e.detail.value;
        this.setData({
            [`${componentId}`]: value
        });
    },
    bindOpenBookingTrack() {
        let that = this,
            consumerId = that.data.consumerId,
            resId = that.data.resId;
        ApiService.getReserveProcessList({reserveId: consumerId, resId, config: {isLoading: true}}).then(
            rsp => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let OrderTracking = rsp.value;
                    that.azm_pickerView_show({
                        title: '订单跟踪',
                        type: 'orderTracking',
                        cancelText: '关闭',
                        cancelColor: '#f74b7b',
                        isAnimated: true,
                        data: {
                            value: OrderTracking,
                            orderType: 4
                        },
                        success(rsp) {
                            console.log(rsp);
                        },
                        fail(rsp) {
                            console.log(rsp);
                        },
                        complete(rsp) {
                            if (rsp.cancel) {

                            }
                        }
                    });
                }
            }
        )
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
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
        module: '',
        options: {},
        orderType: 0,//0：堂食 1：自助取餐 2：外卖 3餐后付款
        isOrderType: 0,//0：堂食 1：自助取餐 2：外卖 3餐后付款
        shopInfo: {},//店铺信息
        consumerData: {},//订单信息
        memberCardDto: null,//会员卡信息
        isMemberCardDto: null,//是否为会员
        paymentMethod: null,//支付方式
        progressBar: [
            {
                name: '待支付',
                status: true
            },
            {
                name: '订单已关闭',
                status: false
            }
        ],//进度条
        imageServer: config.imageUrl,
        orderStatus: {
            name: '待支付',
            iconName: 'icon-time'
        },
        foodBtnList: [],
        countdownTime: null,
        statusStr: app.globalData.statusStr,
        isSubmitOrder: true,//是否去支付
    },
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
    onShow() {
        var that = this;
        if (that.data.isShow) {
            that.loadData();
        }
    },
    onReady() {
        // 页面渲染完成
        this.setData({
            isShow: true
        })
    },
    onHide() {
        var that = this;
        that.setData({isHide: true});
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.loadData(function () {
            wx.stopPullDownRefresh();
        }, true);
    }
};
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options;
        options.status = 1;
        that.setData({resId: options.resId});
        that.data.consumerId = options.consumerId;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    if (options.resId && options.resId.length > 0) {
                        // 获取店铺信息
                        ApiService.getResDetail(
                            {resId: that.data.resId},
                            (rsp) => {
                                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                    that.data.shopInfo = rsp.value;
                                }
                            },
                            () => {
                                that.loadData();
                            }
                        );
                    }
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            }
        );
    },
    loadData(cb, bol) {
        let that = this,
            resId = that.data.resId,
            objId = that.data.objId,
            consumerId = that.data.consumerId,
            memberCardDtoData = {},
            OrderDetailData = {},
            flag = false;
        that.data.currentDate = new Date();
        ApiService.getOrderDetail(
            {objId, resId, consumerId, config: {isLoading: !bol}},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let consumerData = rsp.value, orderList = [];
                    // consumerData.status = that.data.status || consumerData.status;
                    consumerData.mealNumber = consumerData.consumerNo.substring(consumerData.consumerNo.length - 5);
                    consumerData.totalPrice = util.money(consumerData.totalPrice);//总价
                    consumerData.discountPrice = util.money(consumerData.discountPrice);//折扣
                    consumerData.actualPrice = util.money(consumerData.actualPrice);//实付
                    if (consumerData.orderJson && utilCommon.isString(consumerData.orderJson)) {
                        consumerData.orderJson = JSON.parse(consumerData.orderJson);
                    }
                    that.setOrderType(consumerData);
                    OrderDetailData = {consumerData, status: consumerData.status};
                    flag = true;
                    that.setData({consumerData})
                }
            },
            () => {
                if (OrderDetailData.status == 3) {
                    // 获取会员卡信息
                    ApiService.checkMember(
                        {
                            resId, objId
                        },
                        (rsp) => {
                            if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                memberCardDtoData.memberCardDto = rsp.value.member;
                                app.globalData.memberCardDtos[resId] = that.data.memberCardDto;
                            }
                        },
                        (err) => {
                            if (utilCommon.isEmptyValue(memberCardDtoData.memberCardDto)) {
                                memberCardDtoData.isMemberCardDto = true
                            } else {
                                memberCardDtoData.isMemberCardDto = false
                            }
                            that.setData(Object.assign(memberCardDtoData, OrderDetailData));
                            cb && cb(false)
                        }
                    );
                } else {
                    that.setData(Object.assign(memberCardDtoData, OrderDetailData));
                    cb && cb(false)
                }
            }
        );
    },
    /**
     * 设置精度条
     */
    setProgressBar(data) {
        //3待支付  4反结账  5已完成  6退款中（申请退款）7已退款 8 取消订单 11商家接单 12拒单 13拒单成功退款失败
        let that = this;
        if (!utilCommon.isNumberOfNaN(data.status)) {
            return;
        }
        let foodBtnList = [
                {
                    name: '再来一单',
                    color: 'primary',
                    type: 2
                }
            ],
            isOrderType = that.data.isOrderType;

        let progressBar = this.data.progressBar,
            orderStatus = this.data.orderStatus;
        switch (data.status) {
            case 3:
                foodBtnList = [];
                if (isOrderType == 3) {
                    foodBtnList.push({
                        name: '叫号买单',
                        color: 'primary',
                        type: 3
                    });
                } else {
                    foodBtnList.push({
                        name: '立即支付',
                        color: 'primary',
                        type: 0
                    });
                }
                if (data.consumerType == 0 && !data.dinnerType) {
                    foodBtnList.push({
                        name: '立即加菜',
                        color: 'white',
                        type: 1
                    })
                }
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 4:
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 5:
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: true
                    }
                ];
                break;
            case 8:
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单已关闭',
                        status: true
                    }
                ];
                if (3 == isOrderType) {
                    progressBar = [
                        {
                            name: '待接单',
                            status: true
                        },
                        {
                            name: '待支付',
                            status: true
                        },
                        {
                            name: '订单已关闭',
                            status: true
                        }
                    ];
                }
                break;
            case 11:
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: true
                    }
                ];
                break;
            case 12:
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单已关闭',
                        status: true
                    }
                ];
                break;
        }

        if (isOrderType === 3) {
            progressBar[0].name = '用餐中';
        }

        this.setData({
            progressBar, orderStatus, foodBtnList
        });
    },
    /**
     * 去支付弹窗
     * @param e
     */
    pickerViewPayment(e) {
        let that = this,
            consumerData = that.data.consumerData;
        that.azm_pickerView_show({
            title: '支付方式',
            type: 'pickerViewPayment',
            isAnimated: true,
            data: {
                actualPrice: consumerData.actualPrice,
                memberCardDto: that.data.memberCardDto,
                isMemberCardDto: utilCommon.isEmptyObject(that.data.memberCardDto)
            },
            success(res) {
                console.log(res);
                if (res.confirm) {
                    if ('payment' === res.select) {//去支付
                        that.memberPay(consumerData)
                    } else if ('weChat' === res.select) { //微信支付
                        that.weChatPay(consumerData)
                    } else if ('recharge' === res.select) {//充值
                        wx.showModal({
                            content: '您的会员卡余额不足，请联系商家充值',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (rsp) {

                            }
                        });
                    } else if ('apply' === res.select) {//申请
                        util.go('/pages/vkahui/memberApplication/memberApplication', {
                            data: {
                                resId: that.data.resId,
                                resName: consumerData.resName,
                                resLogo: consumerData.resLogo
                            }
                        })
                    }
                }
            },
            fail(rsp) {
                console.log(rsp);
            },
            complete(rsp) {
                if (rsp.cancel) {

                }
            }
        });
    },
    /**
     * 点击按钮
     * @param e
     */
    goPay(e) {
        let type = e.target.dataset.type,
            that = this,
            consumerData = that.data.consumerData,
            objId = that.data.objId,
            resId = that.data.resId,
            orderType = that.data.isOrderType;
        type = Number(type);
        switch (type) {
            case 0:
                let timeDiff = new Date() - that.data.currentDate;
                if (timeDiff > 60 * 1000) {
                    wx.showModal({
                        content: '停留当前页面时间过长，请重新刷新订单。',
                        showCancel: false,
                        confirmText: '刷新',
                        success: res => {
                            if (res.confirm) {
                                that.loadData();
                                wx.pageScrollTo({
                                    scrollTop: 0
                                })
                            }
                        }
                    })
                } else {
                    ApiService.checkMember(
                        {resId, objId, config: {isLoading: true}},
                        (rsp) => {
                            if (2000 === rsp.code && rsp.value && 1 === rsp.value.isBindMobile && utilCommon.isEmptyValue(rsp.value.member)) {
                                that.data.memberCardDto = rsp.value.member;
                            }
                        },
                        (err) => {
                            that.pickerViewPayment()
                        }
                    );
                }
                break;
            case 1:
                that.data.countdownTime && that.data.countdownTime.clear();
                util.go('/pages/shop/order/order', {
                    data: {
                        resId: that.data.resId,
                        consumerId: consumerData.consumerId,
                        tableCode: consumerData.tableCode,
                        fNumber: consumerData.fNumber || 1,
                        tableName: consumerData.title,
                        orderType
                    }
                });
                break;
            case 2:
                if (3 == orderType) {
                    util.go('/pages/shop/home_scanCode/home_scanCode', {
                        data: {
                            resId: that.data.resId,
                            orderType
                        }
                    });
                } else {
                    util.go('/pages/shop/order/order', {
                        data: {
                            resId: that.data.resId,
                            orderType
                        }
                    });
                }
                break;
            case 3://买单
                if (that.data.azm_countdown && that.data.azm_countdown.time > 0) {
                    wx.showModal({
                        title: '温馨提示',
                        content: '呼叫服务已成功,请' + that.data.azm_countdown.countdownTime + '后重试',
                        showCancel: false,
                        confirmText: '知道了',
                        success: function (rsp) {

                        }
                    });
                    return;
                }
                that.data.azm_countdown && that.data.azm_countdown.clear();
                let flag = false;
                new util.Countdown(that, {
                    time: 5 * 60 * 1000,
                    type: 'mm:ss'
                });
                ApiService.callAttendant({
                    consumerId: consumerData.consumerId,
                    resId: that.data.resId
                }, function (res) {
                    if (2000 == res.code) {
                        wx.showModal({
                            title: '温馨提示',
                            content: '呼叫服务成功',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (rsp) {

                            }
                        });
                        flag = true;
                    }
                }, () => {
                    if (!flag) {
                        failShowModal();
                    }
                });

            function failShowModal() {
                that.data.countdownTime && that.data.countdownTime.clear();
                that.setData({
                    clock: null
                });
                wx.showModal({
                    title: '温馨提示',
                    content: '呼叫服务失败',
                    showCancel: false,
                    confirmText: '知道了',
                    success: function (rsp) {

                    }
                });
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
        that.data.isSubmitOrder = true;
        util.go('/pages/order/member-pay/member-pay', {
            data: {
                amount: params.actualPrice,
                consumerId: params.consumerId,
                resId: that.data.resId,
                mobile: memberCardDto.mobile
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
            orderMoney = parseInt(params.actualPrice * 100),
            subject = '微信点餐',// 商品名称
            body = '微信点餐',
            flag = false,
            consumerId = orderNo,
            resId = that.data.resId;
        ApiService.wxPayForH5(
            {
                orderNo, orderMoney, subject, body, objId, resId, config: {isLoading: true}
            },
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
                                util.failToast(
                                    {
                                        title: '微信支付已取消',
                                        success() {
                                            that.loadData()
                                        }
                                    }
                                );
                            }
                        }
                    });
                }
            },
            () => {
                that.data.isSubmitOrder = true;
                if (!flag) {
                    util.failToast({
                        title: '微信支付失败',
                        success() {
                            that.loadData()
                        }
                    });
                }
            });
    },
    /**
     * 完成微信支付
     */
    finishPay() {
        let that = this,
            objId = that.data.objId,
            data = {
                consumerId: that.data.consumerId,
                resId: that.data.resId,
                type: 0,
                objId,
            };
        ApiService.finishPay(data);
    },
    openModuleMeal() {
        this.setData({
            moduleMeal: 'moduleMeal'
        });
    },
    closeModuleMeal() {
        var that = this;
        that.setData({
            moduleMeal: ''
        });
    },
    /**
     * 设置就餐模式
     * @param data
     */
    setOrderType(data) {
        let that = this,
            orderType = 0,
            shopInfo = that.data.shopInfo,
            isOrderType = 0;
        if (data.consumerType == 2) {
            orderType = 1;
            isOrderType = 1;
        } else if (data.consumerType == 0) {
            isOrderType = that.utilPage_getOrderType(shopInfo.restaurantBusinessRules).isOrderType;
            if (data.payType == 0 && data.dinnerType == 1) {
                orderType = 2
            } else if (data.payType == 1) {
                orderType = 3
            }
        }

        if (orderType != 3) {
            that.data.paymentTime && this.data.paymentTime.clear();
            if (data.countdownLongTime > 0) {
                that.data.paymentTime = new util.Countdown(that, {
                    time: data.countdownLongTime,
                    type: 'mm:ss',
                    text: 'paymentTime',
                    onEnd() {
                        that.loadData();
                    }
                })
            }
            if (5 == data.status) {
                that.data.ordersTime && this.data.ordersTime.clear();
                if (data.refusalLongTime > 0) {
                    that.data.ordersTime = new util.Countdown(that, {
                        time: data.countdownLongTime,
                        type: 'mm:ss',
                        text: 'ordersTime',
                        onEnd() {
                            that.loadData();
                        }
                    })
                }
            }
        }

        this.setData({orderType, isOrderType})
        that.setProgressBar(data);
    },
    /**
     * 打开订单跟踪
     */
    openOrderTracking() {
        let that = this,
            resId = that.data.resId,
            consumerData = that.data.consumerData,
            OrderTracking = [], flag = false;
        ApiService.getOrderProcessList(
            {
                resId, consumerId: consumerData.consumerId, config: {
                    isLoading: true
                }
            },
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    flag = true;
                    OrderTracking = rsp.value;
                    that.azm_pickerView_show({
                        title: '订单跟踪',
                        type: 'orderTracking',
                        cancelText: '关闭',
                        cancelColor: '#f74b7b',
                        isAnimated: true,
                        data: {
                            value: OrderTracking
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
            },
            (rsp) => {
                if (!rsp.status || !flag)
                    that.showToast('没有订单跟踪记录')
            }
        );
    }
};
const events = {
    bindOpenShopList(e) {
        let that = this,
            consumerData = that.data.consumerData,
            index = e.currentTarget.dataset.index;
        // console.log(e);
        that.setData({
            [`consumerData.orderJson[${index}].selected`]: !consumerData.orderJson[index].selected
        })
    },
    bindRadioGroup() {
        let that = this;
        this.loadData(
            () => {
                let memberCardDto = that.data.memberCardDto,
                    consumerData = that.data.consumerData,
                    isMemberCardDto = that.data.isMemberCardDto;
                if (isMemberCardDto) {
                    if (memberCardDto.availableBalance < consumerData.actualPrice) {
                        that.setData({
                            paymentMethod: 'weChat'
                        })
                    }
                } else {
                    that.setData({
                        paymentMethod: 'weChat'
                    })
                }
            }
        )
    },
    submitOrder(e) {
        if (!this.data.isSubmitOrder) {
            return;
        }
        let that = this,
            formId = e.detail.formId,
            value = e.detail.value,
            resId = that.data.resId,
            consumerData = that.data.consumerData,
            objId = that.data.objId,
            data = {resId, objId};
        that.data.isSubmitOrder = false;
        data.config = {
            isLoading: true
        };
        let paymentMethod = value.paymentMethod;
        if ('weChat' === paymentMethod) {
            that.weChatPay(consumerData)
        } else if ('member' === paymentMethod) {
            that.memberPay(consumerData)
        } else {
            that.showToast('请选择支付方式');
            that.data.isSubmitOrder = true
        }
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
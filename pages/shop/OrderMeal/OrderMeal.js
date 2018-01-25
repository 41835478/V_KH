// pages/shop/OrderMeal/OrderMeal.js
const app = getApp(),
    config = require('../../../utils/config'),
    pageConfig = require('./config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    azmStepper = require('../../../template/stepper/index'),
    ApiService = require('../../../utils/ApiService');

const appPage = {
    /**
     * 页面的初始数据
     */
    data: {
        text: "Page orderMeal",
        pageConfig,
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        isAnimated: false,
        isCommitOrder: false,//是否提交了订单
        options: {},
        orderType: 0,
        isShareCurrentPage: 1,//是否分享首页
        imageServer: config.imageUrl,//图片服务器地址
        numOfConsumer: {
            stepper: 4,
            min: 1,
            max: 100,
            disabled: 1
        },
        orderFoodShow: true,//预点菜信息
        memberCardDto: null,//会员卡信息
        paymentMethod: false,//支付方式
        shopInfo: null,//店铺信息
        orderMealData: {},//提交表单信息
        business_rule_info: {},//预订营业规则信息
        consumerInfo: {},// 订单信息
        leadTime: 60,//只能预定当前时间之后time
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        new app.ModulePopup();//初始自定义弹窗
        new app.PickerView();//初始pickerView
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
    onReady: function () {
        this.setData({
            isShow: true
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.warn(`${this.data.text}页面显示`);
        if (this.data.isShow) this.loadData();
        if (this.data.isShow && this.data.isCommitOrder) {
            try {
                this.bookingOrder({resId: this.data.resId, consumerId: this.data.consumerInfo.consumerId})
            } catch (e) {
                util.go('/pages/shop/order/order', {
                    type: 'tab'
                })
            }
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.warn(`${this.data.text}页面隐藏`);
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.warn(`${this.data.text}页面卸载`);
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
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    if (that.options.isSaveData != 1) {
                        app.globalData.orderMealData = {
                            source: 1,
                            sex: 1,
                            numOfConsumer: that.data.numOfConsumer ? that.data.numOfConsumer.stepper : 4,
                            preOrder: false
                        };
                    } else {
                    }
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );
    },
    loadData() {
        let that = this,
            options = that.options,
            resId = options.resId,
            objId = that.data.objId,
            orderMealData = app.globalData.orderMealData,
            orderType = options.orderType,
            data = {
                resId,
                orderType,
                orderMealData
            };
        // 获取店铺信息
        that.utilPage_getResDetail(options.resId)
            .then(
                () => {
                    let shopInfo = that.data.shopInfo;
                },
                (err) => {
                    if (1 === err.code)
                        that.showToast('获取店铺信息失败,请重试');
                }
            );
        const p1 = ApiService.checkMember(
            {resId, objId}).then(
            (rsp) => {
                if (2000 === rsp.code && rsp.value && 1 === rsp.value.isBindMobile && rsp.value.member) {
                    data.memberCardDto = rsp.value.member;
                    let orderMealData = data.orderMealData;
                    if (!orderMealData.name) {
                        data.orderMealData.name = data.memberCardDto.name
                    }
                    if (!orderMealData.mobile) {
                        data.orderMealData.mobile = data.memberCardDto.mobile
                    }
                    if (data.memberCardDto && data.memberCardDto.availableBalance > 0) {
                        data.isMemberCardDto = true
                    }
                } else {
                    data.memberCardDto = {};
                    data.isMemberCardDto = false
                }
            },
            (err) => {

            }
        );
        const p2 = ApiService.getReserveBusinessRules({resId}).then(
            (res) => {
                if (2000 === res.code && utilCommon.isEmptyValue(res.value)) {
                    data.business_rule_info = res.value;
                    data.leadTime = res.value.leadTime;
                }
            }
        );
        const p = Promise.all([p1, p2]);
        p.finally(() => {
            that.setData(data);
        })
    },
    routerGo(e) {
        console.log(e);
        let that = this,
            resId = that.data.resId,
            orderType = that.data.orderType,
            dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = dataset.value || '';
        try {
            if (componentId) {
                that.setData(
                    {
                        [`${componentId}`]: value
                    }
                );
            }
            console.log(value, dataset.value, '________routerGo_________');
            if (value && util.regExpUtil.isDateTime(value)) {
                value = +util.getDate(value)
            }
            console.log(value, dataset.value, '________routerGo_________');
            util.go(dataset.link, {
                data: {
                    value,
                    resId, orderType,
                    leadTime: that.data.leadTime
                }
            })
        } catch (err) {
            console.log('调用routerGo函数错误');
        }
        that.saveData()
    },
    saveData() {
        util.extend(true, app.globalData.orderMealData, this.data.orderMealData);
    },
    goOrder() {
        let orderType = this.data.orderType,
            resId = this.data.resId;
        this.saveData();
        if (orderType == 4 && resId) {
            util.go('/pages/shop/order/order', {
                type: 'blank',
                data: {
                    orderType,
                    resId
                }
            });
        } else {
            this.showToast('提交数据失败')
        }
    },
    orderSubmit(e) {
        console.log(e);
        let dataset = e.detail.target.dataset,
            type = dataset.type,
            formId = e.detail.formId;
        if (type === 'goOrder') {
            this.goOrder(formId);
        } else if (type === 'booking' || type === 'deposit') {
            this.submit(e)
        }
    },
    submit(e) {
        let that = this,
            orderMealData = that.data.orderMealData,
            objId = that.data.objId,
            resId = that.data.resId,
            paymentMethod = that.data.paymentMethod,
            memberCardDto = that.data.memberCardDto,
            formId = e.detail.formId,
            business_rule_info = that.data.business_rule_info;
        if (business_rule_info.status == 1) {
            if (!util.trim(orderMealData.areaCode)) {
                that.showToast('您没有选择预定桌位哦~')
            } else if (!util.regExpUtil.isDateTime(orderMealData.reserveTime)) {
                that.showToast('您没有选择预定桌位哦~')
            } else if (!util.trim(orderMealData.name)) {
                that.showToast('您没有填写预定人姓名哦~')
            } else if (!util.trim(orderMealData.mobile)) {
                that.showToast('您填写的预定人手机为空哦~')
            } else if (!util.regExpUtil.isPhone(orderMealData.mobile)) {
                that.showToast('您填写的预定人手机格式不正确~')
            } else if (business_rule_info.isPreOrder == 1 && orderMealData.preOrder === true && !paymentMethod) {
                that.showToast('请选择支付方式哦~')
            } else {
                let data = {
                    objId,
                    resId,
                    source: 1,
                    reserveTime: +util.getDate(orderMealData.reserveTime),
                    numOfConsumer: orderMealData.numOfConsumer,
                    tableCode: orderMealData.tableCode || '',
                    mobile: orderMealData.mobile,
                    name: orderMealData.name,
                    sex: orderMealData.sex,
                    areaCode: orderMealData.areaCode,
                    note: orderMealData.note || '',
                    preOrder: orderMealData.preOrder ? 1 : 0,
                };
                if (orderMealData.preOrder === true && utilCommon.isEmptyObject(orderMealData.orderFood) && orderMealData.orderFood.list) {
                    let orderFood = orderMealData.orderFood.list,
                        consumerDataList = [];
                    for (let i = 0; i < orderFood.length; i++) {
                        consumerDataList[i] = {};
                        consumerDataList[i].foodCount = orderFood[i].info.count;
                        consumerDataList[i].foodCode = orderFood[i].foodCode;
                        consumerDataList[i].isdiscount = orderFood[i].isdiscount;
                        consumerDataList[i].ruleCode = orderFood[i].ruleCode;
                        consumerDataList[i].foodType = orderFood[i].foodType;
                        consumerDataList[i].practies = [];
                        if (orderFood[i].practices && orderFood[i].practices.length > 0) {
                            for (let j = 0; j < orderFood[i].practices.length; j++) {
                                if (orderFood[i].practices[j] && orderFood[i].practices[j].length > 0) {
                                    consumerDataList[i].practies.push(orderFood[i].practices[j]);
                                }
                            }
                        }
                        consumerDataList[i].foodPackages = [];
                        if (orderFood[i].foodPackages && orderFood[i].foodPackages.length > 0) {
                            consumerDataList[i].foodPackages = orderFood[i].foodPackages;
                        }
                    }
                    data.orderFoodJson = JSON.stringify(consumerDataList);
                }
                data.config = {
                    isLoading: true
                };
                if (formId && 'the formId is a mock one' !== formId) {
                    /**
                     * 模板消息推送
                     */
                    data.formId = formId;
                }
                ApiService.insertReserve(data).then(
                    rsp => {
                        // amount=50&consumerId=4c07ff5bb750405c8e49fa788d47d2a4&resId=000000005c2536d5015c2e169199061f&isGoOrderPage=2
                        if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                            let consumerId = rsp.value.id;
                            that.data.isCommitOrder = true;
                            that.data.consumerInfo = {
                                consumerId,
                                price: business_rule_info.depositAmount
                            };
                            if (business_rule_info.isPreOrder == 1 && 'weChat' === paymentMethod) {// 微信支付
                                that.weChatPay(that.data.consumerInfo);
                            } else if (business_rule_info.isPreOrder == 1 && 'member' === paymentMethod) {// 会员卡支付
                                that.memberPay(that.data.consumerInfo);
                            } else {
                                that.bookingOrder({consumerId, resId});
                            }
                        } else if (rsp.code === 4003) {
                            that.showToast(rsp.message);
                        } else {
                            that.showToast('订单提交失败');
                        }
                    }
                )
            }
        }
        else {
            that.showToast('当前店铺已经不可预定了哦~')
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
                isGoOrderPage: 1,
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
                                    that.bookingOrder({consumerId, resId});
                                }
                            });
                        },
                        fail(res) {
                            util.failToast({
                                title: '微信支付失败',
                                success() {
                                    that.bookingOrder({consumerId, resId});
                                }
                            });
                        },
                        complete(res) {
                            if ('requestPayment:cancel' === res.errMsg) {
                                util.failToast({
                                    title: '微信支付已取消',
                                    success() {
                                        that.bookingOrder({consumerId, resId});
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
                            that.bookingOrder({consumerId, resId});
                        }
                    });
                }
            }
        );
    },
    /**
     * 跳转预订订单详情
     * @param data
     */
    bookingOrder(data) {
        util.go('/pages/order/bookingOrder/index', {
            type: 'goOrder',
            data,
        })
    }
};
const events = {
    azm_stepper_change(e) {
        var componentId = e.componentId;
        var stepper = e.stepper;
        if (componentId === 'numOfConsumer') {
            this.data.orderMealData.numOfConsumer = stepper;
        }
        this.setData({
            [`${componentId}.stepper`]: stepper
        });
    },
    bindChange(e) {
        var dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = e.detail.value;
        this.setData({
            [`orderMealData.${componentId}`]: value
        });
    },
    bindTapHide() {
        this.setData({
            orderFoodShow: !this.data.orderFoodShow
        })
    },
    bindRadioGroup(e) {
        console.log(e);
        let dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = e.detail.value;
        this.setData({
            [`${componentId}`]: value
        });
    }
};
Object.assign(appPage, methods, events, azmStepper);
Page(Object.assign(appPage, app.utilPage));
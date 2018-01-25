const app = getApp(),
    ApiService = require('../../../utils/ApiService'),
    utilCommon = require('../../../utils/utilCommon'),
    util = require('../../../utils/util.js');
const appPage = {
    data: {
        text: 'member-pay',
        isShow: false,
        orderType: 0,
        isCodeText: true,
        options: {},
        amount: null,
        consumerId: null,
        resId: null,
        mobile: null,
    },
    // amount=22&consumerId=5334ff8e1b734d82a9e77a3be6f1f8ab&resId=000000005c2536d5015c2e169199061f
    // amount=50&consumerId=603b5a5f3c47460eb655fda26b04b2b4&mobile=18102805878&resId=000000005c2536d5015c2e169199061f&isGoOrderPage=2
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
    /**
     * 页面渲染完成
     */
    onReady: function () {
        this.data.isShow = true;
    },
    onShow(options) {

    },
    onHide() {
        // 页面隐藏
        this.data.countdown && this.data.countdown.clear();
        this.data.clockCodeCountdown && this.data.clockCodeCountdown.clear();
    },
    onUnload() {
        // 关闭页面
        this.data.clockCodeCountdown && this.data.clockCodeCountdown.clear();
    }
};
const methods = {
    loadCb() {
        let that = this;
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
            (err) => {

            }
        );
    },
    loadData() {
        let that = this,
            options = that.data.options,
            resId = options.resId,
            amount = options.amount,
            isGoOrderPage = +options.isGoOrderPage,
            orderType = +options.orderType,
            mobile = options.mobile,
            consumerId = options.consumerId;
        that.setData({resId, consumerId, amount, isGoOrderPage, mobile, orderType})
    },
    /**
     * 发送验证码
     */
    getCode: function () {
        var that = this,
            consumerId = that.data.consumerId,
            objId = that.data.objId,
            isGoOrderPage = that.data.isGoOrderPage,
            orderType = that.data.orderType,
            data = {
                resId: that.data.resId,
                objId,
                msgTemp: "SMS_XIAOFEICODE_CONTENT"
            },
            flag = false;
        if (orderType === 4) {
            data.reserveId = consumerId;
        } else {
            data.consumerId = consumerId;
        }
        ApiService.getSmsCodeByConn(data).then(SmsCodeCallback);

        function SmsCodeCallback(rsp) {
            if (2000 === rsp.code) {
                util.showToast('验证码已发送');
                that.data.clockCodeCountdown = new util.Countdown(that, {
                    time: 60 * 1000,
                    type: 'ss',
                    text: 'clockCode',
                    onEnd() {

                    }
                });
                flag = true;
            }
        }
    },
    inputCodeText(e) {
        // console.log('输入的验证码');
        this.data.codeText = e.detail.value;
    },
    /**
     * 会员卡支付 验证码弹窗
     * @param e
     */
    confirmCode(e) {
        if (!this.data.isCodeText) {
            return;
        }
        let that = this,
            objId = that.data.objId,
            amount = that.data.amount,
            consumerId = that.data.consumerId,
            isGoOrderPage = that.data.isGoOrderPage,
            orderType = that.data.orderType,
            resId = that.data.resId,
            isCodeText = false,
            code = e.detail.value.codeText,
            formId = e.detail.formId;
        let data = {
            code,
            objId,
            msgTemp: "SMS_XIAOFEICODE_CONTENT"
        };
        if (!code || !util.trim(code) || code.length === 0) {
            util.failToast('验证码不能为空');
            that.setData({codeText: ''});
            return;
        } else if (code.length < 6) {
            util.failToast('验证码少于6位');
            return;
        } else {
            that.data.isCodeText = false;
            util.showLoading('加载中');
            ApiService.checkSmsCodeByOpenId(data,
                (res) => {
                    if (2000 == res.code) {
                        isCodeText = true;
                        that.data.isCodeText = false;
                        let data = {
                            objId,
                            resId,
                            formId
                        };
                        if (orderType === 4) {// 预订订单会员卡支付
                            Object.assign(data, {
                                amount,
                                id: consumerId,
                                code: code
                            });
                            ApiService.memberPayReserve(data).then(
                                rsp => {
                                    that.memberCardPayCallback(rsp, formId);
                                }
                            ).finally(() => {
                                that.data.isCodeText = true;
                            })
                        } else {// 会员卡支付
                            Object.assign(data, {
                                amount,
                                consumerId,
                                code: code
                            });
                            ApiService.memberCardPay(data).then(
                                rsp => {
                                    that.memberCardPayCallback(rsp, formId);
                                }
                            ).finally(() => {
                                that.data.isCodeText = true;
                            })
                        }
                    }
                },
                (rsp) => {
                    if (!isCodeText) {
                        that.data.isCodeText = true;
                    }
                    // that.setData({codeText: ''});
                    if (!rsp.status)
                        util.failToast('验证码已过期');
                }
            );
        }
    },
    memberCardPayCallback(rsp, formId) {
        let that = this,
            isGoOrderPage = that.data.isGoOrderPage,
            objId = that.data.objId,
            orderType = that.data.orderType,
            consumerId = that.data.consumerId,
            resId = that.data.resId;
        if (2000 === rsp.code) {
            util.showToast({
                title: "会员卡支付成功",
                success() {
                    // 发送模板消息
                    if (formId && 'the formId is a mock one' !== formId) {
                        ApiService.sendMiniWxTemplateMsg({
                            objId,
                            resId,
                            formId,
                            consumerId
                        });
                    }
                    if (isGoOrderPage === 1) {
                        if (orderType === 4) {
                            that.bookingOrder({resId, consumerId})
                        } else {
                            that.goOrderDetail({resId, consumerId})
                        }
                    } else {
                        util.go('-1');
                    }
                }
            });
        } else {
            util.failToast('会员卡支付失败');
        }
    },
    goOrderDetail(data) {
        util.go('/pages/order/order-detail/order-detail', {
            type: 'goOrder',
            data
        })
    },
    bookingOrder(data) {
        util.go('/pages/order/bookingOrder/index', {
            type: 'goOrder',
            data
        })
    },
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));





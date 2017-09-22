var utilMd5 = require('../../../utils/md5.js');
var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();

// 使用function初始化array，相比var initSubMenuDisplay = [] 既避免的引用复制的，同时方式更灵活，将来可以是多种方式实现，个数也不定的
function initSubMenuDisplay() {
    return ['hidden', 'hidden', 'hidden'];
}

//定义初始化数据，用于运行时保存
var initSubMenuHighLight = [
    ['', '', '', '', ''],
    ['', ''],
    ['', '', '']
];
Page({
    data: {
        subMenuDisplay: initSubMenuDisplay(),
        subMenuHighLight: initSubMenuHighLight,
        animationData: ['', '', ''],
        clock: '',
        clockCode: '',
        paymentTime: 15 * 60 * 1000,
        hasMOney: false,
        module: '',
        message: '',
        isCheckSmsCodeByOpenId: true
    },
    onLoad: function (options) {
        var that = this;
        // console.log('支付页面');
        // console.log(options);
        that.setData(options);

    },
    onShow(options) {
        this.setLoad();
    },
    setLoad(options) {
        var that = this;
        var url = app.globalData.serverAddress + 'microcode/getOrderDetail';
        var data = {consumerId: that.data.consumerId, resId: that.data.resId};
        // console.log(data);
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log('订单详情')
            // console.log(rsp);
            that.setData({dingdan: rsp.value});
            if (rsp.returnStatus) {
                that.setData({orderFood: rsp.value});
                if (rsp.value.consumerType == 0) {
                    that.setData({menu: "堂食"});
                } else if (rsp.value.consumerType == 1) {
                    that.setData({menu: "快餐"});
                    var systemTime = that.getNowFormatDate();
                    // console.log(systemTime);
                    var xiadanTime = rsp.value.createTime.replace(new RegExp("-", "gm"), "/");
                    var xiadanHaoMiao = (new Date(xiadanTime)).getTime(); //得到毫秒数
                    // console.log(xiadanHaoMiao);
                    var timeLag = systemTime - xiadanHaoMiao;
                    var total_micro_second = that.data.paymentTime - timeLag;
                    if (timeLag < 15 * 60 * 1000) {
                        that.time(total_micro_second);
                    } else {
                        total_micro_second = 0;
                        that.setData({
                            clock: "订单已取消"
                        })
                    }
                } else {
                    that.setData({menu: "外卖"});
                    var systemTime = that.getNowFormatDate();
                    // console.log(systemTime);
                    var xiadanTime = rsp.value.createTime.replace(new RegExp("-", "gm"), "/");
                    var xiadanHaoMiao = (new Date(xiadanTime)).getTime(); //得到毫秒数
                    // console.log(xiadanHaoMiao);
                    var timeLag = systemTime - xiadanHaoMiao;
                    var total_micro_second = that.data.paymentTime - timeLag;
                    if (timeLag < 15 * 60 * 1000) {
                        that.time(total_micro_second);
                    } else {
                        total_micro_second = 0;
                        that.setData({
                            clock: "订单已取消"
                        })
                    }
                }
                // that.paymentClick();
                var url = app.globalData.serverAddress + 'microcode/getMemberCardList';//获取会员卡余额
                var data = {openId: app.globalData.openId, resId: that.data.resId};
                appUtil.httpRequest(url, data, function (rsp) {
                    if (rsp.returnStatus) {
                        // console.log('会员卡余额');
                        // console.log(rsp);
                        rsp.value.forEach(function (val, key) {
                            if (val.resId == that.data.resId) {
                                // console.log(that.data.orderFood);

                                var memberBalance = parseFloat(val.memberBalance).toFixed(2);
                                that.setData({
                                    memberBalance: memberBalance,
                                    resName: val.resName
                                });
                                if (that.data.orderFood.actualPrice > memberBalance) {
                                    that.setData({
                                        hasMOney: true
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                wx.showToast({
                    title: rsp.message,
                    duration: 2000
                });
            }
        });
    },
    paymentClick: function (e) {
        var that = this;
        let payment = 'huiyuan';
        if (e) {
            payment = e.detail.value;
        }
        that.setData({payment: payment});
        if (payment == 'huiyuan') {
            var url = app.globalData.serverAddress + "microcode/checkIsFirstUse";
            var data = {
                openId: app.globalData.openId,
                resId: that.data.resId
            };
            appUtil.httpRequest(url, data, function (rsp) {
                if (rsp.code == 4003) {//未绑定手机号
                    app.globalData.bindPhonenumber = false;
                    that.setData({
                        module: 'moduleActive',
                        bindPhonenumber: false
                    });
                } else {
                    app.globalData.bindPhonenumber = true;
                    that.setData({
                        bindPhonenumber: true
                    })
                }
            });
        }
    },
    startPay: function () {
        var that = this;
        var payment = that.data.payment;
        if (payment == undefined || payment == "") {
            wx.showToast({
                title: "请选择支付方式",
                duration: 2000
            });
        } else {
            if (payment == 'weixin') {
                var date = String(util.formatTime1(new Date()));
                var orderNo = that.data.consumerId;
                // var orderMoney = parseInt(1);
                var orderMoney = parseInt(that.data.orderFood.actualPrice * 100);
                // var subject = resDetailData.resName;// 商品名称
                // var body = resDetailData.resName + '微信点餐';//
                var subject = '微信点餐';// 商品名称
                var body = '微信点餐';//
                var openid = app.globalData.openId;
                var resId = that.data.resId;
                var params = {orderNo, orderMoney, subject, body, openid, resId};
                //var init = util.initPay(params);
                // console.log(init);
                // var url = 'https://vip.zhenler.com/api/wxpay/wxPayForH5?' + init;
                // var url = 'https://vip.zhenler.com/api/wxpay/wxPayForMini?' + init;
                // var url ='http://119.23.132.192/zhenler-server/api/wxpay/wxPayForMini?' + init;

                // var url = app.globalData.serverAddress + "wxpay/wxPayForMini?" + init;
                var url = app.globalData.serverAddress + "wxpay/wxPayForH5";
                appUtil.httpGet(url, params, function (rsp) {
                    // console.log('12132132132132132');
                    // console.log(rsp);
                    if (rsp.returnStatus) {
                        var value = rsp.value;
                        var wxPay = value.woi;
                        wx.requestPayment({
                            'timeStamp': wxPay.timestamp,
                            'nonceStr': wxPay.noncestr,
                            'package': 'prepay_id=' + wxPay.prepayid,//之前的
                            'signType': 'MD5',
                            'paySign': value.paySign,
                            'appid': wxPay.appid,
                            'total_fee': orderMoney,
                            'openid': app.globalData.openId,
                            'success': function (res) {
                                // console.log(res);
                                that.finishPay();
                            },
                            'fail': function (res) {
                                console.log(res);
                                wx.redirectTo({
                                    url: '../order-detail/order-detail?resId=' + that.data.resId + "&consumerId=" + that.data.consumerId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                                    success: function (res) {
                                        // console.log('微信支付取消');
                                    }
                                })
                            }
                        });
                    } else {
                        console.log('微信支付失败');
                        console.log(rsp);
                        wx.showToast({
                            title: "微信支付失败",
                            duration: 3000
                        });
                    }
                });
            } else if (payment == 'huiyuan') {
                // 会员卡支付
                // console.log('会员卡支付');
                if (!that.data.bindPhonenumber) {
                    wx.showToast({
                        title: "请先绑定会员",
                        duration: 2000
                    });
                } else if (that.data.orderFood.actualPrice <= that.data.memberBalance) {
                    // console.log('有余额');
                    // console.log(app.globalData.code);
                    if (app.globalData.bindPhonenumber == false) {
                        that.setData({
                            module: 'moduleActive'
                        });
                    } else {
                        that.setData({
                            message: 'moduleActiveMe'
                        });
                    }
                } else {
                    wx.showToast({
                        title: "会员卡余额不足，请前往收银台充值",
                        duration: 2000
                    });
                }
            }
        }
    },
    finishPay: function () {//完成支付
        app.globalData.clrCar = true;
        var that = this;
        var url = app.globalData.serverAddress + 'microcode/finishPay';
        var data = {
            consumerId: that.data.consumerId,
            resId: app.globalData.resId,
            type: 0,
            openId: app.globalData.openId,
        };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp)
            if (rsp.returnStatus) {
                wx.redirectTo({
                    url: '../order-detail/order-detail?resId=' + app.globalData.resId + "&consumerId=" + that.data.consumerId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                    success: function (res) {
                        // console.log('微信支付成功');
                    },
                })
            } else {
                wx.showToast({
                    title: rsp.message,
                    duration: 2000
                });
            }
        });
    },
    tapMainMenu: function (e) {
        var that = this;
        //		获取当前显示的一级菜单标识
        var index = parseInt(e.currentTarget.dataset.index);
        // 生成数组，全为hidden的，只对当前的进行显示
        var newSubMenuDisplay = initSubMenuDisplay();
        //		如果目前是显示则隐藏，反之亦反之。同时要隐藏其他的菜单
        if (that.data.subMenuDisplay[index] == 'hidden') {
            newSubMenuDisplay[index] = 'show';
        } else {
            newSubMenuDisplay[index] = 'hidden';
        }
        // 设置为新的数组
        that.setData({
            subMenuDisplay: newSubMenuDisplay
        });
        // 设置动画
        that.animation(index);
        // console.log(this.data.subMenuDisplay);
    },
    tapSubMenu: function (e) {
        var that = this;
        // 隐藏菜单
        that.setData({
            subMenuDisplay: initSubMenuDisplay()
        });
    },
    animation: function (index) {
        var that = this;
        // 定义一个动画
        var animation = wx.createAnimation({
            duration: 1500,
            timingFunction: 'linear',
        })
        // 是显示还是隐藏
        var flag = that.data.subMenuDisplay[index] == 'show' ? 1 : -1;
        // 使之Y轴平移
        animation.translateY(flag * (initSubMenuHighLight[index].length)).step();
        // 导出到数据，绑定给view属性
        var animationStr = animation.export();
        // 原来的数据
        var animationData = that.data.animationData;
        animationData[index] = animationStr;
        that.setData({
            animationData: animationData
        });
    },
    hide: function (e) {
        var that = this;
        // console.log('隐藏菜单');
        // console.log(that.data.subMenuDisplay[0]);
        if (that.data.subMenuDisplay[0] == "show") {
            that.data.subMenuDisplay[0] = "hidden";
            that.setData({
                subMenuDisplay: that.data.subMenuDisplay
            });
            // console.log(that.data.subMenuDisplay[0]);
        }
    },
    time: function (total_micro_second) {
        var that = this;
        // 渲染倒计时时钟
        that.setData({
            clock: that.date_format(total_micro_second)
        });

        if (total_micro_second <= 0) {
            that.setData({
                clock: "订单已取消"
            });
            // timeout则跳出递归
            return;
        }
        setTimeout(function () {
            // 放在最后--
            total_micro_second -= 10;
            that.time(total_micro_second);
        }, 10)
    },
    date_format: function (micro_second) {
        var that = this;
        // 秒数
        var second = Math.floor(micro_second / 1000);
        // 小时位
        var hr = Math.floor(second / 3600);
        // 分钟位
        var min = that.zero(Math.floor((second - hr * 3600) / 60));
        // 秒位
        var sec = that.zero((second - hr * 3600 - min * 60));//

        return min + ":" + sec;
    },
    zero: function (num) {// 位数不足补零
        return num < 10 ? "0" + num : num
    },
    getNowFormatDate: function () {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        currentdate = currentdate.replace(new RegExp("-", "gm"), "/");
        var timeHaoMiao = (new Date(currentdate)).getTime(); //得到毫秒数
        return timeHaoMiao;
    },
    binding: function () {
        var that = this;
        that.setData({
            module: ''
        });
    },
    timeCode: function (total_micro_second) {
        var that = this;
        // 渲染倒计时时钟
        that.setData({
            clockCode: that.date_formatCode(total_micro_second)
        });

        if (total_micro_second <= 0) {
            that.setData({
                clockCode: ""
            });
            return;
        }
        setTimeout(function () {
            // 放在最后--
            total_micro_second -= 10;
            that.timeCode(total_micro_second);
        }, 10)
    },
    date_formatCode: function (micro_second) {
        var that = this;
        // 秒数
        var second = Math.floor(micro_second / 1000);
        // 小时位
        var hr = Math.floor(second / 3600);
        // 分钟位
        var min = that.zero(Math.floor((second - hr * 3600) / 60));
        // 秒位
        var sec = that.zero((second - hr * 3600 - min * 60));//

        return sec;
    },
    goBinding: function () {
        var that = this;
        wx.navigateTo({
            url: "/pages/vkahui/phone-add/phone-add?verification=true&resId=" + that.data.resId + "&consumerId=" + that.data.consumerId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName
        });
        this.binding();
    },
    getCode: function () {
        var that = this;

        var data = {
            resId: that.data.resId,
            consumerId: that.data.dingdan.consumerId,
            openId: app.globalData.openId,
            msgTemp: "SMS_XIAOFEICODE_CONTENT"
        };
        //var init = util.initPay(data);
        var url = app.globalData.serverAddress + "sms/getSmsCodeByConn";//根据openId获取验证码
        // console.log(data);
        appUtil.httpGet(url, data, function (rsp) {
            // console.log(rsp);
            that.setData({cookies: rsp.value});
            if (rsp.returnStatus) {
                wx.showToast({
                    title: '验证码已发送',
                    icon: 'success',
                    duration: 2000
                });
                var total_micro_second = 60 * 1000;
                that.timeCode(total_micro_second);
            } else {
                wx.showToast({
                    title: "网络异常,请稍后重试",
                    image: '/images/icon/fail.png',
                    duration: 2000
                });
            }
        });
    },
    codeText: function (e) {
        // console.log('输入的验证码');
        this.data.codeText = e.detail.value;
    },
    confirmCode: function () {
        var that = this;
        // console.log(that.data.codeText);

        var data = {
            code: that.data.codeText,
            openId: app.globalData.openId,
            msgTemp: "SMS_XIAOFEICODE_CONTENT"
        };
        if (!that.data.isCheckSmsCodeByOpenId) return;
        that.setData({
            isCheckSmsCodeByOpenId: false
        });
        var url = app.globalData.serverAddress + "sms/checkSmsCodeByOpenId";

        function resFlag() {
            that.setData({
                isCheckSmsCodeByOpenId: true
            })
        }

        appUtil.httpGet(url, data, function (res) {
            if (res.returnStatus) {
                var url = app.globalData.serverAddress + "microcode/memberCardPay";
                var data = {
                    openId: app.globalData.openId,
                    amount: that.data.orderFood.actualPrice,
                    consumerId: that.data.consumerId,
                    resId: that.data.resId,
                    code: that.data.codeText
                };
                appUtil.httpRequest(url, data, function (res) {
                    if (res.returnStatus) {
                        app.globalData.clrCar = true;
                        wx.showToast({
                            title: "会员卡支付成功",
                            duration: 6500,
                            success: function (res) {
                                wx.redirectTo({
                                    url: '../order-detail/order-detail?resId=' + that.data.resId + "&consumerId=" + that.data.consumerId + "&tableCode=" + that.data.tableCode + "&tableName=" + that.data.tableName,
                                    success: function (res) {
                                        // console.log('会员卡支付成功');
                                        // console.log(res);
                                        that.setData({
                                            message: ''
                                        });
                                    }
                                })
                            }
                        });
                    } else {
                        wx.showToast({
                            title: "会员卡支付失败",
                            duration: 3000
                        });
                    }
                    resFlag();
                });
            } else {
                wx.showToast({
                    title: res.message,
                    duration: 3000
                });
                resFlag();
            }
        });
    }
});





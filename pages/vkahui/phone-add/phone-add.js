var utilMd5 = require('../../../utils/md5.js');
var appUtil = require('../../../utils/appUtil.js');
const apiService = require('../../../utils/ApiService');
const RegExpUtil = require('../../../utils/RegExpUtil');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        clock: '',
        isPhone: false,
        isVerificationCode: false,
        phone: false,
        phoneStr: '您的手机号码格式输入有误，请重新输入'
    },
    onLoad: function (options) {
        var that = this;
        options.jumpUrl = decodeURIComponent(options.jumpUrl || '');
        that.setData(options);
    },
    formSubmit: function (e) {
        var that = this;
        var mobile = e.detail.value.mobile;
        let value = e.detail.value;
        if (mobile) {
            if (!RegExpUtil.isPhone(mobile)) {
                this.setData({
                    phone: true,
                    isPhone: false,
                })
            } else {
                this.setData({
                    isPhone: true,
                    phone: false
                })
            }
        }
        if (!RegExpUtil.isPhone(mobile)) {
            util.showToast('手机号码格式不正确');
        } else {
            apiService.getSmsCode(
                {"mobile": mobile, msgTemp: "SMS_DEFAULT_CONTENT"},
                function (rsp) {
                    console.log(rsp);
                    that.setData({cookies: rsp.value});
                    wx.showToast({
                        title: '验证码已发送',
                        icon: 'success',
                        duration: 2000
                    });
                    let total_micro_second = 60 * 1000;
                    new util.Countdown(total_micro_second, 'ss').countdown(that, 'clock');
                });
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
                clock: ""
            });
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

        return sec;
    },
    zero: function (num) {// 位数不足补零
        return num < 10 ? "0" + num : num
    },
    queSubmit: function (e) {
        var that = this,
            code = e.detail.value.code,
            mobile = e.detail.value.mobile;
        var data = {
            openId: app.globalData.openId,
            resId: that.data.resId
        };
        if (!code || code.length === 0) {
            util.showToast('验证码为空');
            return;
        } else if (code.length !== 6) {
            util.showToast('验证码位数不足');
            return;
        }
        if (this.data.isPhone) {
            let apiName = 'checkBindMobile';
            if (data.resId && data.resId.length > 0) {
                apiName = 'checkMemberBindMobile';
            }
            app[apiName](data, function (rsp) {
                if (rsp.code == 2000) {//已绑定手机号
                    util.showToast('已绑定手机号');
                    return;
                } else if (rsp.code == 4003) {
                    let data = {
                        "openId": app.globalData.openId,
                        type: 1,
                        "mobile": mobile,
                        "code": code,
                        "resId": that.data.resId
                    };
                    apiService.bindWechatUser(data, function () {
                        if (that.data.jumpUrl && RegExpUtil.isPath(that.data.jumpUrl)) {
                            util.go(that.data.jumpUrl, {
                                type: 'blank'
                            })
                        } else {
                            util.go(-1);
                        }
                    });
                } else {
                    util.showToast(rsp.message);
                }
            });
        } else {
            util.showToast('手机号码格式不正确');
        }
    },
    bindPhoneBlurEvent(e) {
        let value = e.detail.value;
        if (value) {
            if (!RegExpUtil.isPhone(value)) {
                this.setData({
                    phone: true,
                    isPhone: false,
                })
            } else {
                this.setData({
                    isPhone: true,
                    phone: false
                })
            }
        }
    }
});
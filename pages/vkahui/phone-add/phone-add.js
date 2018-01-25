const app = getApp(),
    ApiService = require('../../../utils/ApiService'),
    RegExpUtil = require('../../../utils/RegExpUtil'),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon');
const appPage = {
    data: {
        isShow: false,
        options: {},
        clock: '',
        phoneStr: '您的手机号码格式输入有误，请重新输入',
        mobile: '',
        code: '',
        isCode: true,
        isMobile: true,
        isSubmit: false,
        focus: false,
        jumpUrl: null
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
    /**
     * 页面渲染完成
     */
    onReady() {
        this.setData({
            isShow: true
        });
    },
    /**
     * 页面显示
     * @param options 为页面跳转所带来的参数
     */
    onShow(options) {
        console.warn(`${this.data.text}页面显示`);
    },
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面关闭
    }
};
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );
    },
    formSubmit: function (e) {
        let that = this,
            mobile = this.data.mobile;
        if (this.data.isMobile && util.trim(mobile)) {
            ApiService.getSmsCode(
                {"mobile": mobile, msgTemp: "SMS_DEFAULT_CONTENT"},
                function (rsp) {
                    if (2000 === rsp.code) {
                        util.showToast('验证码已发送');
                        that.setData({focus: true});
                        new util.Countdown(that, {
                            time: 60 * 1000,
                            type: 'ss',
                            text: 'clockCode',
                            onEnd() {

                            }
                        });
                    }
                },
                (rsp) => {
                    if (!rsp.status) {
                        util.failToast('验证码发送失败');
                    }
                });
        } else {
            if (!mobile) {
                util.failToast('手机号码为空');
            } else if (!RegExpUtil.isPhone(mobile)) {
                util.failToast('手机格式错误');
            }
        }

    },
    queSubmit: function (e) {
        let that = this,
            code = e.detail.value.code,
            mobile = e.detail.value.mobile;
        if (!code || util.trim(code).length === 0) {
            util.failToast('验证码为空');
            return;
        } else if (code.length !== 6) {
            util.failToast('验证码位数不足');
            return;
        }
        if (this.data.isSubmit) {
            let data = {
                "objId": app.globalData.objId,
                "mobile": mobile,
                "code": code
            };
            ApiService.bindMobile(data, function (rsp) {
                if (2000 === rsp.code) {
                    if (that.data.jumpUrl && RegExpUtil.isPath(that.data.jumpUrl)) {
                        util.go(that.data.jumpUrl, {
                            type: 'blank'
                        })
                    } else {
                        util.go(-1);
                    }
                } else if (/^300/i.test(rsp.code)) {
                }
            });
        } else {
            util.failToast('手机格式错误');
        }
    },
    bindInput(e) {
        let value = e.detail.value,
            type = e.currentTarget.dataset.type;
        this.data[type] = value;
        this.setSubmit();
    },
    setSubmit() {
        if (this.data.mobile && RegExpUtil.isPhone(this.data.mobile)) {
            this.setData({isMobile: true});
        } else {
            this.setData({isMobile: false});
        }

        if (this.data.code && this.data.code.length === 6) {
            this.setData({isCode: true});
        } else {
            this.setData({isCode: false});
        }

        if (this.data.isCode && this.data.isMobile) {
            this.setData({isSubmit: true});
        } else {
            this.setData({isSubmit: false});
        }
    }
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
const app = getApp(),
    ApiService = require('../../../utils/ApiService'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon');
const appPage = {
    data: {
        isShow: false,
        userInfo: {},//用户信息
        meInfo: {},
        options: {},
        memberCardCount: 0,
        shouye: true,
        dingdan: false,
        wo: true,
        isBindMobile: false
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
    onReady: function () {
        // 页面渲染完成
        this.data.isShow = true;
    },
    onShow() {
        // 页面显示
        if (this.data.isShow) {
            this.loadData();
        }
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
    loadData(cb) {
        let that = this, flag = false, objId = that.data.objId;
        ApiService.getMemberCardList(
            {objId},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {

                }
            },
            (rsp) => {
                if (utilCommon.isEmptyValue(rsp.value)) {
                    that.setData({memberCardCount: rsp.value.length});
                } else {
                    that.setData({memberCardCount: 0});
                }
            }
        );
        ApiService.getCommonUserInfo(
            {objId},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value) && utilCommon.isEmptyValue(rsp.value.commonUser)) {
                    flag = true;
                }
            },
            true,
            (rsp) => {
                if (flag) {
                    let commonUser = rsp.value.commonUser;
                    commonUser.mobile = commonUser.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                    let userInf = app.globalData.userInfo;
                    that.setData({
                        isBindMobile: true,
                        userInfo: Object.assign(userInf, commonUser)
                    });
                } else {
                    that.setData({
                        isBindMobile: false,
                        userInfo: app.globalData.userInfo
                    });
                }
            }
        )
    }
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
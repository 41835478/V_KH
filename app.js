const config = require('./utils/config'),
    utilPage = require('./utils/utilPage'),
    authorize = require('./utils/authorize');
import {ToastPannel} from './template/toast/toast';//加载toast模板
import {ModulePopup} from './template/module/index';//加载模态弹窗模板
import {PickerView} from './template/picker-view/picker-view';//加载PickerView模板

let Global_APP = {
    objId: null,
    token: null,
};
config.version = '3.4.1222';
App({
    globalData: {
        objId: null,
        token: null,
        userInfo: {},
        loginRequestPromise: null,//登入请求
        shopCarts: {},//本地购物车
        memberCardDtos: {},//会员卡信息
        resDetailDtos: {},//店铺信息
        statusStr: {
            3: {
                str: '待支付',
                statusStr: '待支付'
            },
            4: {
                str: '待支付',
                statusStr: '反结账'
            },
            5: {
                str: '待接单',
                statusStr: '待接单'
            },
            6: {
                str: '退款中',
                statusStr: '退款中'
            },
            7: {
                str: '已退款',
                statusStr: '已退款'
            },
            8: {
                str: '已取消',
                statusStr: '订单已取消'
            },
            11: {
                str: '已完成',
                statusStr: '商家已接单'
            },
            12: {
                str: '已完成',
                statusStr: '商家已拒单'
            },
            13: {
                str: '已完成',
                statusStr: '拒单成功退款失败'
            }
        }
    },
    utilPage,
    ToastPannel,
    ModulePopup,
    PickerView,
    /**
     * 生命周期函数--监听小程序初始化
     * @param options
     */
    onLaunch: function () {
        console.warn('版本号：' + config.version);
    },
    /**
     * 生命周期函数--监听小程序显示
     * @param options
     */
    onShow: function (options) {
        let that = this;
        console.warn(Global_APP.objId, '___objId___');
        if (!Global_APP.objId) {
            try {
                console.warn(Global_APP.objId, '进入________objId');
                that.setLoginRequestPromise();
                that.getShopCartsStorage();
            } catch (err) {
                console.warn('App onShow方法报错', err);
            }
        }
    },
    /**
     * 生命周期函数--监听小程序隐藏
     * @param options
     */
    onHide: function (options) {
        console.warn('监听小程序隐藏', options);
        if ('userInfo' === wx.getStorageSync('authorizeUserInfo')) {
            wx.setStorageSync('authorizeUserInfo', '');
        }
    },
    /**
     * 错误监听函数
     * @param msg
     */
    onError: function (msg) {
        // console.warn('错误监听函数', msg);
    },
    getShopCartsStorage() {
        let that = this;
        try {
            let shopCartsStorage = wx.getStorageSync('shopCarts'),
                serverAddress = wx.getStorageSync('serverAddress'),
                time = wx.getStorageSync('shopCartsTimeStamp'),
                flag1 = shopCartsStorage && serverAddress && serverAddress === config.host,
                flag2 = +new Date() - time <= (60 * 1000);
            if (true) {
                // that.globalData.shopCarts = JSON.parse(shopCartsStorage);
                that.globalData.shopCarts = {};
            } else {
                wx.setStorageSync('serverAddress', config.host);
                that.setShopCartsStorage();
            }
        } catch (err) {
            console.warn('App getShopCartsStorage方法报错', err);
        }
    },
    setShopCartsStorage() {
        let _this = this;
        wx.setStorageSync('shopCartsTimeStamp', new Date().getTime());
        wx.setStorageSync('shopCarts', JSON.stringify(_this.globalData.shopCarts));
    },

    setLoginRequestPromise() {
        let that = this;
        let loginRequestPromise = new Promise(function (resolve, reject) {
            that.getOpenIdLogin().then(
                (rsp) => {
                    if (2000 == rsp.code) {
                        resolve(rsp);
                    } else {
                        reject()
                    }
                },
                () => {
                    reject()
                }
            );
        });
        that.globalData.loginRequestPromise = loginRequestPromise;
        return loginRequestPromise;
    },
    getLoginRequestPromise() {
        return this.globalData.loginRequestPromise;
    },
    getToken() {
        console.log('获取的token：', this.globalData.token);
        return this.globalData.token;
    },
    /**
     * 获取用户信息
     * @param cb
     */
    getUserInfo(resolve) {
        let _this = this;
        wx.checkSession({
            success: function (rsp) {
                getUserInfo()
            },
            fail: function (rsp) {
                //登录态过期
                wx.login({
                    success() {
                        getUserInfo();
                    }
                })
            }
        });

        function getUserInfo() {
            wx.getUserInfo({
                success: function (rsp) {
                    _this.globalData.userInfo = rsp.userInfo;
                    resolve();
                },
                fail(rsp) {
                    let info = wx.getStorageSync('isOpenAuthorizeUserInfo');
                    if (1 !== info) {
                        wx.setStorageSync('isOpenAuthorizeUserInfo', 1);
                        authorize.userInfo(true)
                            .then(
                                getUserInfo,
                                () => {
                                    wx.showModal({
                                        title: '温馨提示',
                                        content: '请打开微信用户权限，避免获取用户信息失败导致应用操作问题',
                                        confirmText: '不再提醒',
                                        cancelText: '知道了',
                                        cancelColor: '#f74b7b',
                                        success: function (rsp) {
                                            if (rsp.confirm) {
                                                wx.setStorageSync('isOpenAuthorizeUserInfo', 1);
                                            } else if (rsp.cancel) {
                                                wx.setStorageSync('isOpenAuthorizeUserInfo', 0);
                                            }

                                        }
                                    });
                                    resolve();
                                });
                    } else {
                        resolve();
                    }
                }
            })
        }
    },
    /**
     * 请求登入
     * @param cb
     */
    getOpenIdLogin() {
        let that = this;
        return new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    console.log('保存code', res);
                    const apiService = require('./utils/ApiService');
                    wx.setStorageSync('code', res.code);
                    let objId = wx.getStorageSync('objId');
                    /**
                     * 获取用户信息
                     */
                    that.getUserInfo(() => {
                        let userInfo = that.globalData.userInfo;
                        apiService.newCheckIsFirstUse(
                            {
                                jsCode: res.code,
                                objId,
                                nikeName: userInfo.nickName,
                                sex: userInfo.gender,
                                headImgUrl: userInfo.avatarUrl
                            },
                            (rsp) => {
                                console.warn('获取objId', rsp.value.objId);
                                that.globalData.objId = rsp.value.objId;
                                Global_APP.objId = rsp.value.objId;
                                that.globalData.token = rsp.value.token;
                                Global_APP.token = rsp.value.token;
                                that.globalData.isBindMobile = rsp.value.isBindMobile;
                                wx.setStorageSync('objId', rsp.value.objId);
                                wx.setStorageSync('token', rsp.value.token);
                                resolve(rsp);
                            },
                            () => {
                                reject()
                            }
                        );
                    });
                },
                fail() {
                    reject();
                }
            });
        });
    }
});
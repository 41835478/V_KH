const Amap = require('./utils/amap');
const queryString = require('./utils/queryString');
const util = require('./utils/util');
const httpConfig = require('./utils/httpConfig');
const utilPage = require('./utils/utilPage');
const authorize = require('./utils/authorize');
import {ToastPannel} from './template/toast/toast';

const GlobaData = {
    rid: null,
    resId: null,
    openId: null,
    token: null,
    userVerification: {},
    userInfo: {},
    userOrderInfo: {},//用户订单信息
    session_key: '',
    memberCardDto: null,//会员卡信息
    memberCardDtoObj: {},//会员卡信息
    resDetailData: null,//店铺详情
    takeawayCarts: [],//外卖购物车
    takeawayAmount: 0,  //外卖菜品总价
    takeawayCount: 0,//外卖菜品总量
    hallCarts: [],//堂食购物车
    hallAmount: 0,//堂食菜品总价
    hallCount: 0, //堂食菜品总量
    loginRequestPromise: null,//登入请求
    shopCarts: {},
    serverAddress: httpConfig.api + '/',
    serverAddressImg: 'http://f.zhenler.com',
};

App({
    globalData: {},
    utilPage,
    ToastPannel,//toast弹框
    Amap,//高德地图sdk
    authorize,//微信小程序权限
    /**
     * 生命周期函数--监听小程序初始化
     * @param options
     */
    onLaunch: function (options) {
        util.extend(true, this.globalData, GlobaData);
        let _this = this;
        _this.dateformater = require('./utils/formateDate');
        /**
         * 获取rid
         */
        if (options) {
            let rid = _this.getQrcodeRid(options.query);
            console.log('app.js获取rid', rid);
        }
        console.log('版本号：' + httpConfig.version);
        // // 打开权限
        // authorize.open();
        /**
         * 初始化登入并获取openId与token并设置Promise
         */
        // _this.setLoginRequestPromise();
        _this.getShopCartsStorage();
    },
    /**
     * 生命周期函数--监听小程序显示
     * @param options
     */
    onShow: function (options) {
        console.log(options, '__________________openId________________loginRequestPromise');
        console.log(this.globalData.openId, '__________________openId________________loginRequestPromise');
        if (!this.globalData.openId) {
            console.log(this.globalData.loginRequestPromise, '进入_____________________________________loginRequestPromise');
            this.setLoginRequestPromise();
        }
        this.globalData.shopCarts = {};
        wx.setStorageSync('shopCarts', JSON.stringify(this.globalData.shopCarts));
    },
    /**
     * 生命周期函数--监听小程序隐藏
     * @param options
     */
    onHide: function (options) {
        // console.log('监听小程序隐藏', options);
    },
    /**
     * 错误监听函数
     * @param msg
     */
    onError: function (msg) {
        // console.log('错误监听函数', msg);
    },
    getShopCartsStorage() {
        let _this = this,
            shopCartsStorage = wx.getStorageSync('shopCarts'),
            serverAddress = wx.getStorageSync('serverAddress'),
            time = wx.getStorageSync('shopCartsTimeStamp'),
            flag = shopCartsStorage && serverAddress && serverAddress === httpConfig.api;
        _this.globalData.shopCarts = {};
        flag = false;
        if (flag) {
            _this.globalData.shopCarts = JSON.parse(shopCartsStorage);
        } else {
            wx.setStorageSync('serverAddress', httpConfig.api);
            wx.setStorageSync('shopCarts', JSON.stringify(_this.globalData.shopCarts));
        }
    },
    setShopCartsStorage() {
        let _this = this;
        wx.setStorageSync('shopCartsTimeStamp', new Date().getTime());
        wx.setStorageSync('shopCarts', JSON.stringify(_this.globalData.shopCarts));
    },
    /**
     * 获取用户信息
     * @param cb
     */
    getUserInfo: function (cb, reject) {
        let _this = this;
        wx.checkSession({
            success: function (res) {
                getUserInfo()
            },
            fail: function (res) {
                //登录态过期
                _this.requestLogin().then(getUserInfo);
            }
        });

        function getUserInfo() {
            if (_this.globalData.userInfo && !util.isEmptyObject(_this.globalData.userInfo)) {
                let userInfo = _this.globalData.userInfo;
                _this.globalData.meLogo = userInfo.meLogo;//报存用户头像及昵称
                _this.globalData.nickName = userInfo.nickName;
                typeof cb == "function" && cb(_this.globalData.userInfo)
            } else {
                //调用登录接口
                wx.getUserInfo({
                    success: function (res) {
                        let userInfo = res.userInfo;
                        _this.globalData.userInfo = userInfo;
                        _this.globalData.meLogo = userInfo.meLogo;//用户头像
                        _this.globalData.nickName = userInfo.nickName;//用户昵称
                        typeof cb == "function" && cb(_this.globalData.userInfo)
                    },
                    fail(res) {
                        authorize.userInfo(true).then(getUserInfo, function () {
                            wx.showModal({
                                title: '温馨提示',
                                content: '请打开微信用户权限，避免获取用户信息失败导致应用操作问题',
                                showCancel: false,
                                confirmText: '知道了',
                                success: function (rsp) {
                                    typeof cb == "function" && cb()
                                }
                            });
                        });
                    }
                })
            }
        }
    },
    /**
     * 请求登入
     * @param cb
     */
    requestLogin(cb) {
        let _this = this,
            openId = wx.getStorageSync('openId'),
            token = wx.getStorageSync('token');
        return new Promise(function (resolve, reject) {
            wx.login({
                success(res) {
                    console.log('保存code', res);
                    const apiService = require('./utils/ApiService');
                    wx.setStorageSync('code', res.code);
                    apiService.getOpenId(
                        {
                            jsCode: res.code,
                            openId
                        },
                        (rsp) => {
                            _this.globalData.openId = rsp.value.openId;
                            _this.globalData.token = rsp.value.token;
                            wx.setStorageSync('openId', rsp.value.openId);
                            wx.setStorageSync('token', rsp.value.token);
                            resolve(rsp);
                        },
                        () => {
                            reject()
                        });
                },
                fail() {
                    reject();
                }
            });
        });

    },
    setLoginRequestPromise() {
        let _this = this;
        let loginRequestPromise = new Promise(function (resolve, reject) {
            _this.requestLogin().then((res) => {
                if (res.returnStatus) {
                    let flag = true;
                    /**
                     * 获取用户信息
                     */
                    _this.getUserInfo(function () {
                        resolve(res)
                    });
                } else {
                    reject()
                }
            }, () => {
                reject()
            });
        });
        this.globalData.loginRequestPromise = loginRequestPromise;
        return loginRequestPromise;
    },
    getLoginRequestPromise() {
        return this.globalData.loginRequestPromise;
    },
    /**
     * 获取二维码扫描登入
     * @param options
     */
    getQrcodeRid(query) {
        if (!query || util.isEmptyObject(query)) return;
        // query.q = 'http://vip.zhenler.com/H5/qrcode.html?id=75b0e01375334f5da81c2b883835b716';
        if (query.q && query.q.length > 0) {
            this.globalData.rid = queryString.parse(query.q).id || null;
            return this.globalData.rid;
        }
    },
    /**
     * 获取用户点餐ID
     */
    getResId(resolve, reject) {
        let apiService = require('./utils/ApiService'),
            _this = this;
        if (_this.globalData.rid && _this.globalData.rid.length > 0) {
            apiService.getQRcodeTable({id: _this.globalData.rid}, function (res) {
                if (!res.value || util.isEmptyObject(res.value)) {
                    util.showToast('无效的二维码');
                    reject && reject();
                    _this.globalData.rid = null;
                    return;
                }
                let resId = res.value.resId;
                if (!resId && resId.length === 0) {
                    _this.globalData.rid = null;
                    util.showToast('扫描二维码不正确');
                    reject && reject();
                    return;
                }
                _this.globalData.resId = resId;
                _this.globalData.userVerification = {
                    type: res.value.type || '',
                    resId: res.value.resId || '',
                    tableName: res.value.tableName || '',
                    tableCode: res.value.tableCode || ''
                };
                _this.globalData.tableCode = res.value.tableCode || '';
                _this.globalData.tableName = res.value.tableName || '';
                resolve && resolve(res)
            })
        }
    },
    getToken() {
        console.log('获取的token：', this.globalData.token);
        return this.globalData.token;
    },
    checkIsFirstUse(data, cb) {
        let apiService = require('./utils/ApiService'),
            _this = this;
        apiService.checkIsFirstUse(data, function (res) {
            if (res.code == 4003) {
                _this.globalData.isBindMobile = false;
            } else {
                _this.globalData.isBindMobile = true;
            }
            cb && cb(res)
        });
    },
    /**
     * 是否绑定手机（用户）
     * @param data
     * @param cb
     */
    checkBindMobile(data, cb) {
        let apiService = require('./utils/ApiService');
        apiService.checkBindMobile(data, function (res) {
            cb && cb(res)
        });
    },
    /**
     * 是否绑定手机（店铺）
     * @param data
     * @param cb
     */
    checkMemberBindMobile(data, cb) {
        let apiService = require('./utils/ApiService'),
            _this = this;
        apiService.checkMemberBindMobile(data, function (res) {
            cb && cb(res)
        });
    }
});
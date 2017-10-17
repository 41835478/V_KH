const queryString = require('./utils/queryString');
const util = require('./utils/util');
const httpConfig = require('./utils/httpConfig');
const utilPage = require('./utils/utilPage');
import {ToastPannel} from './template/toast/toast';

App({
    globalData: {
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
        // baseUrl:"https://b.zhenler.com",
        // baseUrl:"http://192.168.134.169/zhenler-server",
        serverAddress: httpConfig.api + '/',
        serverAddressImg: 'http://f.zhenler.com',
    },
    /**
     * 生命周期函数--监听小程序初始化
     * @param options
     */
    onLaunch: function (options) {
        let _this = this;
        _this.dateformater = require('./utils/formateDate');
        /**
         * 获取rid
         */
        let rid = _this.getQrcodeRid(options.query);
        console.log('app.js获取rid', rid);
        /**
         * 初始化登入并获取openId与token并设置Promise
         */
        _this.setLoginRequestPromise();
        _this.getShopCartsStorage();
    },
    utilPage,
    ToastPannel,//toast弹框
    /**
     * 生命周期函数--监听小程序显示
     * @param options
     */
    onShow: function (options) {
        // console.log('监听小程序显示', options);
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
        let _this = this, shopCartsStorage = wx.getStorageSync('shopCarts'),
            serverAddress = wx.getStorageSync('serverAddress'),
            time = wx.getStorageSync('shopCartsTimeStamp'),
            flag = shopCartsStorage && serverAddress && serverAddress === httpConfig.api;
        flag = false;
        if (flag) {
            _this.globalData.shopCarts = JSON.parse(shopCartsStorage);
        } else {
            wx.setStorageSync('serverAddress', httpConfig.api);
            wx.setStorageSync('shopCarts', JSON.stringify(_this.globalData.shopCarts));
        }
    },
    setShopCartsStorage() {
        wx.setStorageSync('shopCartsTimeStamp', new Date().getTime());
        wx.setStorageSync('shopCarts', JSON.stringify(this.globalData.shopCarts));
    },
    /**
     * 获取用户信息
     * @param cb
     */
    getUserInfo: function (cb) {
        let _this = this;
        wx.checkSession({
            success: function (res) {
                //session 未过期，并且在本生命周期一直有效
                console.log('未过期，并且在本生命周期一直有效', res);
                getUserInfo()
            },
            fail: function (res) {
                //登录态过期
                console.log('登录态过期', res);
                _this.requestLogin(getUserInfo);
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
        wx.login({
            success: function (res) {
                console.log('保存code', res);
                const apiService = require('./utils/ApiService');
                wx.setStorageSync('code', res.code);

                apiService.getOpenId(
                    {
                        jsCode: res.code,
                        openId,
                        token
                    },
                    (rsp) => {
                        _this.globalData.openId = rsp.value.openId;
                        _this.globalData.token = rsp.value.token;
                        wx.setStorageSync('openId', rsp.value.openId);
                        wx.setStorageSync('token', rsp.value.token);
                        cb && cb(rsp);
                    });
            }
        });
    },
    setLoginRequestPromise() {
        let _this = this;
        let loginRequestPromise = new Promise(function (resolve, reject) {
            _this.requestLogin(function (res) {
                if (res.returnStatus) {
                    let flag = true;
                    /**
                     * 获取用户信息
                     */
                    _this.getUserInfo();
                    // if (rid && rid.length > 0) {
                    //     _this.getResId(function (rsp) {
                    //         if (res.value && res.value.resId) {
                    //             wx.navigateTo({
                    //                 url: '/pages/shop/home/home?resId=' + rsp.value.resId
                    //             })
                    //         }
                    //         resolve(res)
                    //     });
                    // }else {
                    //
                    // }
                    resolve(res)
                } else {
                    reject(res)
                }
            });
        });
        this.globalData.loginRequestPromise = loginRequestPromise;
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
    getResId(cb) {
        let apiService = require('./utils/ApiService'),
            _this = this;
        if (_this.globalData.rid && _this.globalData.rid.length > 0) {
            apiService.getQRcodeTable({id: _this.globalData.rid}, function (res) {
                if (!res.value || util.isEmptyObject(res.value)) {
                    util.showToast('无效的二维码');
                    _this.globalData.rid = null;
                    return;
                }
                let resId = res.value.resId;
                if (!resId && resId.length === 0) {
                    _this.globalData.rid = null;
                    util.showToast('扫描会员卡二维码不正确');
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
                cb && cb(res)
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
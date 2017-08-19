const queryString = require('./utils/queryString');
const util = require('./utils/util');
App({
    globalData: {
        rid: null,
        resId: null,
        openId: null,
        token: null,
        userVerification: {},
        userInfo: {},
        session_key: '',
        resDetailData: null,//会员卡列表
        takeawayCarts: [],//外卖购物车
        takeawayAmount: 0,  //外卖菜品总价
        takeawayCount: 0,//外卖菜品总量
        hallCarts: [],//堂食购物车
        hallAmount: 0,//堂食菜品总价
        hallCount: 0, //堂食菜品总量
        loginRequest: null,//登入请求
        // baseUrl:"https://b.zhenler.com",
        // baseUrl:"http://192.168.134.169/zhenler-server",
        serverAddress: 'https://vip.zhenler.com/api/',
        //serverAddress: 'http://192.168.134.254:8080/zhenler-server/api/',
        //serverAddress: 'http://192.168.134.253:8080/zhenler-server/api/',
        serverAddressImg: 'http://f.zhenler.com',
    },
    /**
     * 生命周期函数--监听小程序初始化
     * @param options
     */
    onLaunch: function (options) {
        // console.log(options, 'init');
        // var url = 'http%3A%2F%2Fvip.zhenler.com%2FH5%2Fqrcode.html%3Fid%3D75b0e01375334f5da81c2b883835b716';

        //调用API从本地缓存中获取数据
        // let logs = wx.getStorageSync('logs') || [];
        // console.log('监听小程序初始化', options);
        // console.log('监听小程序初始化', this.globalData);
        // logs.unshift(Date.now());
        // wx.setStorageSync('logs', logs);
        let _this = this;
        /**
         * 获取rid
         */
        let rid = _this.getQrcodeRid(options.query);
        /**
         * 初始化登入并获取openId与token
         */
        this.requestLogin();
        /**
         * 获取用户信息
         */
        this.getUserInfo();
    },
    /**
     * 生命周期函数--监听小程序显示
     * @param options
     */
    onShow: function (options) {
        console.log('监听小程序显示', options);
    },
    /**
     * 生命周期函数--监听小程序隐藏
     * @param options
     */
    onHide: function (options) {
        console.log('监听小程序显示', options);
    },
    /**
     * 错误监听函数
     * @param msg
     */
    onError: function (msg) {
        console.log('错误监听函数', msg)
    },
    /**
     * 获取用户信息
     * @param cb
     */
    getUserInfo: function (cb) {
        var _this = this;
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
                        _this.globalData.meLogo = userInfo.meLogo;//报存用户头像及昵称
                        _this.globalData.nickName = userInfo.nickName;
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
        let _this = this;
        wx.login({
            success: function (res) {
                console.log('保存code', res);
                const apiService = require('./utils/ApiService');
                wx.setStorageSync('code', res.code);
                const requestTask = apiService.getOpenId({jsCode: res.code}, function (rsp) {
                    _this.globalData.openId = rsp.value.openId;
                    _this.globalData.token = rsp.value.token;
                    wx.setStorageSync('openId', rsp.value.openId);
                    wx.setStorageSync('token', rsp.value.token);
                    cb && cb(rsp);
                });
                _this.globalData.loginRequest = requestTask;
                return requestTask;
            }
        });
    },
    /**
     * 获取二维码扫描登入
     * @param options
     */
    getQrcodeRid(query) {
        console.log(query);
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
        apiService.getQRcodeTable({id: _this.globalData.rid}, function (res) {
            console.log("getQRcodeTable----------", res);
            _this.globalData.userVerification = {
                type: res.value.type,
                resId: res.value.resId,
                tableName: res.value.tableName,
                tableCode: res.value.tableCode
            };
            _this.globalData.tableCode = res.value.tableCode;
            _this.globalData.tableName = res.value.tableName;
            cb && cb(res)
        })
    },
    getToken() {
        console.log('获取的token：', this.globalData.token);
        return this.globalData.token;
    }
});
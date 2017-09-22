let $http = require('./httpRequest'),
    httpConfig = require('./httpConfig'),
    serverAddress = httpConfig.api;
module.exports = {
    url: serverAddress,
    token: null,
    api: {
        /**
         * 获取openid  API
         */
        getOpenId: {
            path: '/microcode/getOpenId',
            query: {}
        },
        /**
         * 获取会员拉列表  API
         */
        getMemberCardList: {
            path: '/microcode/getMemberCardList',
            query: {}
        },
        /**
         * 二维码获取列表
         */
        getQRcodeTable: {
            path: '/qrtable/getQRcodeTable',
            query: {}
        },
        /**
         * 新增用户会员列表
         */
        checkIsFirstUse: {
            path: '/microcode/checkIsFirstUse',
            query: {}
        },
        /**
         * 获取是否绑定手机号
         */
        checkBindMobile: {
            path: '/microcode/checkBindMobile',
            query: {}
        },
        checkMemberBindMobile: {
            path: '/microcode/checkMemberBindMobile',
            query: {}
        },
        /**
         * 获取点餐列表
         */
        getFoodList: {
            path: '/food/getFoodList',
            query: {}
        },
        /**
         * 获取规格列表
         */
        getFoodRuleList: {
            path: '/foodRule/getFoodRuleList',
            query: {}
        },
        /**
         * 获取口味列表
         */
        getFoodPracticesList: {
            path: '/foodPractices/getFoodPracticesList',
            query: {}
        },
        /**
         * 获取点餐店铺列表
         */
        getResDetail: {
            path: '/microcode/getResDetail',
            query: {}
        },
        /**
         * 绑定手机
         */
        bindWechatUser: {
            path: '/microcode/bindWechatUser',
            query: {}
        },
        /**
         * 获取收货地址
         */
        loadDefaultAddress: {
            path: '/microcode/loadDefaultAddress',
            query: {}
        }
    },
    getToken() {
        const app = getApp();
        console.log('initPay', app);
        return app.getToken();
        // if (app && app.globalData && app.globalData.token) {
        //     return app.globalData.token;
        // } else {
        //     return wx.getStorageSync('token');
        // }
    },
    /**
     * 获取openid
     * @param data
     * @param cb
     */
    getOpenId(data, cb) {
        const url = this.url + this.api.getOpenId.path;
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取会员拉列表
     * @param data
     * @param cb
     */
    getMemberCardList(data, cb) {
        const url = this.url + this.api.getMemberCardList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        });
        return http;
    },
    /**
     * 查询二维码
     * @param data
     * @param cb
     * @returns {*}
     */
    getQRcodeTable(data, cb) {
        const url = this.url + this.api.getQRcodeTable.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        });
        return http;
    },
    /**
     * 添加会员卡
     * @param data
     * @param cb
     * @returns {*}
     */
    checkIsFirstUse(data, cb) {
        const url = this.url + this.api.checkIsFirstUse.path;
        data.token = this.getToken();
        // console.log('checkIsFirstUse接口调用', data.token, url);
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
    checkBindMobile(data, cb) {
        const url = this.url + this.api.checkBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
    checkMemberBindMobile(data, cb) {
        const url = this.url + this.api.checkMemberBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
    getFoodList(data, cb) {
        const url = this.url + this.api.getFoodList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取规格列表
     */
    getFoodRuleList(data, cb) {
        const url = this.url + this.api.getFoodRuleList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取规格列表
     */
    getFoodPracticesList(data, cb) {
        const url = this.url + this.api.getFoodPracticesList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取点餐店铺列表
     */
    getResDetail(data, cb) {
        const url = this.url + this.api.getResDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取点餐店铺列表
     */
    bindWechatUser(data, cb) {
        const url = this.url + this.api.bindWechatUser.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取收货地址
     */
    loadDefaultAddress(data, cb) {
        const url = this.url + this.api.loadDefaultAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    }
};
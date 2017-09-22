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
        },
        /**
         * 获取店铺首页信息
         */
        getMainInfo: {
            path: '/microcode/getMainInfo',
            query: {}
        },
        /**
         * 获取店铺banner
         */
        getCommonBannerList: {
            path: '/banner/getCommonBannerList ',
            query: {}
        },
        /**
         * 获取桌位列表
         */
        findTableDtoList: {
            path: '/table/findTableDtoList',
            query: {}
        },
        /**
         * 提交订单
         */
        commitOrder: {
            path: '/microcode/commitOrder',
            query: {}
        },
        /**
         * 获取订单详情
         */
        getOrderDetail: {
            path: '/microcode/getOrderDetail',
            query: {}
        },
        /**
         * 检查是否存在未结账的消费者
         */
        checkHasWaitPayConsumer: {
            path: '/microcode/checkHasWaitPayConsumer',
            query: {}
        },
        /**
         *
         */
        checkSmsCodeByOpenId: {
            path: '/sms/checkSmsCodeByOpenId',
            query: {}
        },
        /**
         *
         */
        memberCardPay: {
            path: '/microcode/memberCardPay',
            query: {}
        },
        /**
         * 获取验证码
         */
        getSmsCode: {
            path: '/sms/getSmsCode',
            query: {}
        },
        /**
         * 获取订单列表
         */
        getOrderList: {
            path: '/microcode/getOrderList',
            query: {}
        },
        /**
         * 微信支付
         */
        finishPay: {
            path: '/microcode/finishPay',
            query: {}
        },
        /**
         * 微信支付接口
         */
        wxPayForH5: {
            path: '/wxpay/wxPayForH5',
            query: {}
        }
    },
    getToken() {
        const app = getApp();
        if (this.token && this.token.length > 0) {
            return this.token;
        } else {
            return app.getToken();
        }
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
    /**
     * 获取菜品列表
     * @param data
     * @param cb
     * @returns {*}
     */
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
     * 获取口味与做法列表
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
    },
    /**
     * 获取店铺首页信息
     */
    getMainInfo(data, cb) {
        const url = this.url + this.api.getMainInfo.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取店铺banner
     */
    getCommonBannerList(data, cb) {
        const url = this.url + this.api.getCommonBannerList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取桌位列表
     */
    findTableDtoList(data, cb) {
        const url = this.url + this.api.findTableDtoList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 提交订单
     */
    commitOrder(data, cb) {
        const url = this.url + this.api.commitOrder.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取订单详情
     */
    getOrderDetail(data, cb) {
        const url = this.url + this.api.getOrderDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 检查是否存在未结账的消费者
     */
    checkHasWaitPayConsumer(data, cb) {
        const url = this.url + this.api.checkHasWaitPayConsumer.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
    /**
     *
     */
    checkSmsCodeByOpenId(data, cb) {
        const url = this.url + this.api.checkSmsCodeByOpenId.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
    /**
     *
     */
    memberCardPay(data, cb) {
        const url = this.url + this.api.memberCardPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取验证码
     */
    getSmsCode(data, cb) {
        const url = this.url + this.api.getSmsCode.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 获取订单列表
     */
    getOrderList(data, cb) {
        const url = this.url + this.api.getOrderList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 微信支付
     */
    finishPay(data, cb) {
        const url = this.url + this.api.finishPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    },
    /**
     * 微信支付接口
     */
    wxPayForH5(data, cb) {
        const url = this.url + this.api.wxPayForH5.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            // console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        });
        return http;
    }
};
let $http = require('./httpRequest'),
    serverAddress = 'https://vip.zhenler.com/api';
//serverAddress= 'http://192.168.134.254:8080/zhenler-server/api/';
//serverAddress= 'http://192.168.134.253:8080/zhenler-server/api/';
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
        getQRcodeTable: {
            path: '/qrtable/getQRcodeTable',
            query: {}
        },
        checkIsFirstUse: {
            path: '/microcode/checkIsFirstUse',
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
        console.log('checkIsFirstUse接口调用', data.token, url);
        const http = $http.post(url, data, (res) => {
            console.log('checkIsFirstUse接口调用成功', data.token, url);
            cb && cb(res);
        }, true);
        return http;
    },
};
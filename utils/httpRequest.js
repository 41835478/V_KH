"use strict";

const util = require('./util'),
    utilCommon = require('./utilCommon');

class HttpRequest {
    constructor() {
        this.requestTask = []
    }

    request(params, callBack, statusCode) {
        let flag = false,
            data = {},
            url = params.url,
            isLoading = false;//是否显示加载信息
        if (params.data.config && params.data.config.isLoading) {
            isLoading = params.data.config.isLoading;
            delete params.data.config;
        }
        delete params.url;
        params.data.signature = util.getSignature(params.data);
        if (params.method && params.method.toLocaleLowerCase() === 'post') {
            params.header = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
        if (params.flag) {
            url += '?' + util.requestParametersMerge(params.data);
            params.data = null;
        }
        for (let k in params.data) {
            if (!params.data[k] && !utilCommon.isNumberOfNaN(params.data[k])) {
                params.data[k] = '';
            }
        }

        function failCallback(res) {
            let text = '网络连接失败，或服务器错误' + '{' + res.errMsg + '}';
            if (res.statusCode === 404) {
                text = '请求失败'
            } else if (res.statusCode === 500) {
                text = '服务器错误'
            }
            wx.showModal({
                title: '提示',
                content: text,
                showCancel: false,
                confirmText: '请重试',
                success: function (res) {
                    if (res.confirm) {
                        setRequest();
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            });
        }

        function setRequest() {
            if (isLoading) {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                });
            }
            wx.showNavigationBarLoading();
            return wx.request({
                url: url || '',
                data: params.data || {},
                header: params.header || {},
                method: params.method || 'GET',
                success(res) {
                    let code = res.data.returnStatus;
                    if (res.statusCode !== 200) {
                        failCallback(res);
                    }
                    if (!code && !statusCode) {
                        util.showToast(res.data.message);
                    }
                    if (statusCode) {
                        code = true;
                    }
                    if (res.statusCode === 200 && code) {
                        flag = true;
                        data = res.data;
                        console.log(res.data.message, res);
                    }
                },
                fail(res) {
                    // util.showToast(res.errMsg);
                    // util.showToast('网络连接失败，或服务器错误');
                    failCallback(res);
                    console.log("网络连接失败，或服务器错误", res, url);
                },
                complete(res) {
                    wx.hideNavigationBarLoading();
                    wx.hideToast();
                    console.log('请求数据________________________', url, res);
                    if (flag) {
                        callBack && callBack(res.data);
                    }
                }
            });
        }

        const requestTask = setRequest();
        this.requestTask.push(requestTask);
        return requestTask;
    };

    post(url, options, callBack, statusCode) {
        let data = options || {};
        let params = {
            url,
            data,
            method: 'POST'
        };
        return this.request(params, callBack, statusCode);
    };

    get (url, options, callBack, statusCode) {
        let data = options || {};
        let params = {
            url,
            data,
            method: 'GET'
        };
        return this.request(params, callBack, statusCode);
    };

    postParm(url, options, callBack) {
        let data = options || {};
        let params = {
            url,
            data,
            flag: true,
            method: 'POST'
        };
        return this.request(params, callBack);
    };

    /**
     * 终止所有实例中的请求
     */
    abort() {
        for (let v of this.requestTask) {
            v.abort();
        }
    }
}

module.exports = new HttpRequest();
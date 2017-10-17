"use strict";

const util = require('./util'),
    utilCommon = require('./utilCommon');

class HttpRequest {
    constructor() {
        this.requestTask = []
    }

    request(params, resolve) {

        let flag = false,
            data = {},
            url = params.url,
            isLoading = false,
            promise = null,
            reject = null,
            isReturnStatus = false;//是否显示加载信息
        for (let i = 2; i < arguments.length; i++) {
            if (utilCommon.isBoolean(arguments[i])) {
                isReturnStatus = arguments[i];
            }
            if (utilCommon.isFunction(arguments[i])) {
                reject = arguments[i];
            }
        }
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
                        // setRequest();
                    } else if (res.cancel) {

                    }
                }
            });
        }

        function setRequest() {
            promise = null;
            if (isLoading) {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                });
            }
            wx.showNavigationBarLoading();
            console.log('请求数据_____________________', url, params.data);
            wx.request({
                url: url || '',
                data: params.data || {},
                header: params.header || {},
                method: params.method || 'GET',
                success(res) {
                    let returnStatus = res.data.returnStatus;
                    if (res.statusCode !== 200) {
                        // failCallback(res);
                    }
                    if (!returnStatus && !isReturnStatus) {
                        util.showToast(res.data.message);
                    }
                    if (isReturnStatus) {
                        returnStatus = true;
                    }
                    if (res.statusCode === 200) {
                        if (returnStatus) {
                            flag = true;
                            data = res.data;
                        } else {
                            reject && reject(res.data);
                        }
                    }
                },
                fail(res) {
                    // failCallback(res);
                    console.log("网络连接失败，或服务器错误", res, url);
                },
                complete(res) {
                    wx.hideNavigationBarLoading();
                    wx.hideToast();
                    console.log('获取数据________________________', url, res);
                    if (flag) {
                        resolve && resolve(res.data);
                    }
                }
            })
        }

        setRequest();
    };

    post(url, options, resolve, isReturnStatus, reject) {
        let data = options || {};
        let params = {
            url,
            data,
            method: 'POST'
        };
        return this.request(params, resolve, isReturnStatus, reject);
    };

    get(url, options, resolve, isReturnStatus, reject) {
        let data = options || {};
        let params = {
            url,
            data,
            method: 'GET'
        };
        return this.request(params, resolve, isReturnStatus, reject);
    };

    postParm(url, options, resolve, isReturnStatus, reject) {
        let data = options || {};
        let params = {
            url,
            data,
            flag: true,
            method: 'POST'
        };
        return this.request(params, resolve, isReturnStatus, reject);
    };
}

module.exports = new HttpRequest();
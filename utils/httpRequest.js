"use strict";

const util = require('./util'),
    utilCommon = require('./utilCommon');

class HttpRequest {
    constructor() {
        this.requestTask = []
    }

    request(params, resolve) {
        let page = getCurrentPages(),
            retryNum = 0,
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
        console.log('__________请求数据______________', params);
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
            params.data[k] = utilCommon.isFalse(params.data[k]);
            if (!params.data[k] && !utilCommon.isNumberOfNaN(params.data[k])) {
                params.data[k] = '';
            }
        }

        function failCallback(res) {
            retryNum++;
            let text = '网络连接失败，或服务器错误' + '{' + res.errMsg + '}';
            if (res.statusCode === 404) {
                text = '网络连接失败'
            } else if (res.statusCode === 500) {
                text = '服务器错误'
            }
            let confirmText = '知道了';
            // debugger
            // if (retryNum >= 3) {
            //     text += '（已重试' + retryNum + '次,超过重试次数，请检查网络状态并重新打开小程序）';
            // } else {
            //     text += '（已重试' + retryNum + '次）';
            // }
            wx.showModal({
                title: '提示',
                content: text,
                showCancel: false,
                confirmText: confirmText,
                success: function (rsp) {
                    if (rsp.confirm) {
                        if (retryNum < 3) {
                            // setRequest();
                        } else {
                            // failCallback(res);
                        }
                    } else if (rsp.cancel) {

                    }
                }
            });
        }

        let showToast = (message, cb) => {
            if (page.showToast) {
                page.showToast(message);
            } else {
                util.showToast(message);
            }
        };
        if (isLoading) {
            wx.showLoading({
                title: '加载中',
                mask: true,
                success() {
                    setRequest();
                }
            });
        } else {
            setRequest();
        }

        function setRequest() {
            let flag = false;
            promise = null;
            wx.showNavigationBarLoading();
            wx.request({
                url: url || '',
                data: params.data || {},
                header: params.header || {},
                method: params.method || 'GET',
                success(res) {
                    let returnStatus = res.data.returnStatus;
                    if (isReturnStatus) {
                        returnStatus = true;
                    }
                    if (res.statusCode === 200 && returnStatus) {
                        flag = true;
                    }
                },
                fail(res) {

                },
                complete(res) {
                    wx.hideNavigationBarLoading();
                    wx.hideToast();
                    console.log('__________获取数据______________', url, res);
                    if (!res.statusCode || res.statusCode !== 200) {
                        failCallback(res);
                    } else {
                        if (!flag && !isReturnStatus) {
                            showToast(res.data.message)
                        }
                        if (flag) {
                            resolve && resolve(res.data);
                        } else {
                            reject && reject(res.data);
                        }
                    }

                }
            })
        }
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
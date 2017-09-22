"use strict";

const util = require('./util');

class HttpRequest {
    constructor() {
        this.requestTask = []
    }

    request(params, callBack, statusCode) {
        let flag = false,
            data = {},
            url = params.url;
        delete params.url;
        wx.showNavigationBarLoading();
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
            if (k == 'consumerId') {
                debugger
            }
            if (!params.data[k] && params.data[k] !== 0) {
                params.data[k] = '';
            }
        }
        const requestTask = wx.request({
            url: url || '',
            data: params.data || {},
            header: params.header || {},
            method: params.method || 'GET',
            success(res) {
                console.log(res.data.message, res);
                let code = res.data.returnStatus;
                if (statusCode) {
                    code = true;
                }
                if (res.statusCode === 200 && code) {
                    flag = true;
                    data = res.data;
                } else {
                    util.showToast(res.data.message);
                }
            },
            fail(res) {
                // util.showToast(res.errMsg);
                util.showToast('网络连接失败，或服务器错误');
                console.log("网络连接失败，或服务器错误", res);
            },
            complete(res) {
                wx.hideNavigationBarLoading();
                if (flag) {
                    callBack && callBack(res.data);
                }
            }
        });
        this.requestTask.push(requestTask);
        return requestTask;
    };

    post(url, data, callBack, statusCode) {
        let params = {
            url,
            data,
            method: 'POST'
        };
        return this.request(params, callBack, statusCode);
    };

    get (url, data, callBack) {
        let params = {
            url,
            data,
            method: 'GET'
        };
        return this.request(params, callBack);
    };

    postParm(url, data, callBack) {
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